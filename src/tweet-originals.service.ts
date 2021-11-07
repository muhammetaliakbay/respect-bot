import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { TwitterApi, UserV1 } from "twitter-api-v2";
import { Repository } from "typeorm";
import { TweetEntity } from "./tweet.entity";
import { TWITTER_USER_V1 } from "./constants";

const originalRegex = /^[@#][\w_-]+$/

@Injectable()
export class TweetOriginalsService {
    constructor(
        @InjectRepository(TweetEntity)
        readonly tweetRepository: Repository<TweetEntity>,
        readonly client: TwitterApi,
        @Inject(TWITTER_USER_V1)
        readonly user: UserV1,
    ) {
    }

    private busy = false
    @Cron(CronExpression.EVERY_5_SECONDS)
    async process() {
        if (this.busy) {
            return
        }
        this.busy = true

        try {
            const newTweets = await this.tweetRepository.find({
                where: {
                    originals: null,
                },
                take: 10,
                relations: ['medias'],
            })

            tweetLoop: for (const newTweet of newTweets) {
                const originals = new Set<string>()
                for (const media of newTweet.medias) {
                    if (media.ocrWords == null) {
                        continue tweetLoop
                    }
                    for (const {text: text, confidence} of media.ocrWords) {
                        if (confidence > 0.80 && originalRegex.test(text)) {
                            originals.add(text)
                        }
                    }
                }

                const originalsArray = [...originals]
                await this.tweetRepository.update(newTweet.id, {
                    originals: originalsArray,
                })

                await this.client.v1.reply(
                    originalsArray.join(' '),
                    newTweet.id,
                )

                if (newTweet.reporter_id != null) {
                    await this.client.v1.reply(
                        ';) ' + originalsArray.join(' '),
                        newTweet.reporter_id,
                    )
                    await this.client.v2.like(
                        this.user.id_str,
                        newTweet.reporter_id,
                    )
                }
            }

        } finally {
            this.busy = false
        }
    }
}
