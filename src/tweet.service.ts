import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule"
import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { MediaObjectV2, TweetV2, TwitterApiv2 } from "twitter-api-v2";
import { EntityManager, In, Repository, Transaction, TransactionManager } from "typeorm";
import { ConfigProvider } from "./config.provider";
import { MediaType, TweetMediaEntity } from "./tweet-media.entity";
import { TweetEntity } from "./tweet.entity";

interface TweetAndMedias {
    tweet: TweetV2,
    medias: MediaObjectV2[],
}

@Injectable()
export class TweetService {
    constructor(
        readonly client: TwitterApiv2,
        readonly config: ConfigProvider,
        @InjectRepository(TweetEntity)
        readonly tweetRepository: Repository<TweetEntity>,
        @InjectEntityManager()
        readonly entityManager: EntityManager,
    ) {
    }
    
    private async reports(): Promise<{
        reportedTweets: TweetV2[],
        reporterIds: {[reportedId: string]: string},
    }> {
        const {data: {data: reporterTweets, includes: {tweets: includedTweets = []} = {}}} = (
            await this.client.search(`#${this.config.hashTag}`, {
                max_results: 100,
                "expansions": [
                    "referenced_tweets.id",
                    "attachments.media_keys",
                ],
                "tweet.fields": [
                    "attachments",
                    "source",
                ],
                "media.fields": [
                    "preview_image_url",
                    "type",
                    "url",
                    "media_key",
                ],
            })
        )

        const reporterIds: {[reportedId: string]: string} = {}

        const reportedIds = new Set<string>()
        for (const reporterTweet of reporterTweets) {
            const replieds = reporterTweet.referenced_tweets?.filter(
                ref => ref.type === 'replied_to'
            ) ?? []
            for (const replied of replieds) {
                reportedIds.add(replied.id)
                reporterIds[replied.id] = reporterTweet.id
            }
        }
        
        const reportedTweets: TweetV2[] = []
        for (const reportedId of reportedIds) {
            const reportedTweet = includedTweets.find(
                tweet => tweet.id === reportedId
            )
            if (reportedTweet != undefined) {
                reportedTweets.push(reportedTweet)
            }
        }

        return {
            reportedTweets,
            reporterIds,
        }
    }

    private async newReports(): Promise<{
        newReportedTweets: TweetV2[],
        reporterIds: {[reportedId: string]: string},
    }> {
        const {
            reportedTweets,
            reporterIds,
        } = await this.reports()
        const existingTweets = await this.tweetRepository.find({
            where: {
                id: In(reportedTweets.map(tweet => tweet.id)),
            },
            select: ['id']
        })
        const newReportedTweets = reportedTweets.filter(
            tweet => !existingTweets.some(
                entity => entity.id === tweet.id
            )
        )
        return {
            newReportedTweets,
            reporterIds,
        }
    }

    private async tweetsAndMedias(ids: string[]): Promise<TweetAndMedias[]> {
        if (ids.length === 0) {
            return []
        }

        const {data: tweets, includes: {media: medias = []} = {}} = await this.client.tweets(
            ids, {
                "tweet.fields": [
                    "id",
                    "attachments",
                    "text",
                    "source",
                    "author_id",
                ],
                "media.fields": [
                    "url",
                    "type",
                    "preview_image_url",
                    "media_key",
                ],
                expansions: [
                    "attachments.media_keys",
                ],
            }
        )
        return tweets.map(
            tweet => {
                return {
                    tweet,
                    medias: medias.filter(
                        media => tweet.attachments?.media_keys?.includes(media.media_key)
                    ),
                }
            }
        )
    }

    private busy = false
    @Cron(CronExpression.EVERY_30_SECONDS)
    async process() {
        if (this.busy) {
            return
        }
        this.busy = true

        try {
            const {
                newReportedTweets,
                reporterIds,
            } = await this.newReports()
            const newReportedIds = newReportedTweets.map(tweet => tweet.id)
            const newReportsAndMedias = await this.tweetsAndMedias(newReportedIds)
            
            for (const {tweet, medias} of newReportsAndMedias) {
                const tweetEntity = new TweetEntity()
                tweetEntity.id = tweet.id
                tweetEntity.author_id = tweet.author_id
                tweetEntity.source = tweet.source
                tweetEntity.text = tweet.text
                if (reporterIds[tweet.id] != undefined) {
                    tweetEntity.reporter_id = reporterIds[tweet.id]
                }

                const mediaEntities = medias.filter(
                    media => media.type === MediaType.Photo,
                ).map(
                    media => {
                        const mediaEntity = new TweetMediaEntity()
                        mediaEntity.media_key = media.media_key
                        mediaEntity.type = media.type as MediaType
                        mediaEntity.url = media.url
                        mediaEntity.tweet = tweetEntity
                        return mediaEntity
                    }
                )
                tweetEntity.medias = mediaEntities

                await this.entityManager.transaction(
                    async tx => {
                        await tx.insert(TweetEntity, tweetEntity)
                        await tx.insert(TweetMediaEntity, mediaEntities)
                    }
                )
            }
        } finally {
            this.busy = false
        }
    }
}
