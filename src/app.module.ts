import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm"
import { TwitterApi, TwitterApiv1, TwitterApiv2 } from "twitter-api-v2";
import { ConfigProvider } from "./config.provider";
import { TWITTER_USER_V1 } from "./constants";
import { TesseractProvider } from "./tesseract.provider";
import { TweetMediaEntity } from "./tweet-media.entity";
import { TweetMediaService } from "./tweet-media.service";
import { TweetOriginalsService } from "./tweet-originals.service";
import { TweetEntity } from "./tweet.entity";
import { TweetService } from "./tweet.service";

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: "localhost",
            port: 5432,
            username: "respect_bot",
            database: "respect_bot",
            autoLoadEntities: true,
        }),
        TypeOrmModule.forFeature([
            TweetEntity,
            TweetMediaEntity,
        ])
    ],
    providers: [
        TweetService,
        TweetMediaService,
        TweetOriginalsService,
        ConfigProvider,
        TesseractProvider,
        {
            provide: TwitterApi,
            inject: [ConfigProvider],
            useFactory: (config: ConfigProvider) => (
                new TwitterApi({
                    appKey: config.apiKey,
                    appSecret: config.appSecret,
                    accessToken: config.accessToken,
                    accessSecret: config.accessSecret,
                })
            ),
        },
        {
            provide: TwitterApiv1,
            inject: [TwitterApi],
            useFactory: (api: TwitterApi) => api.v1,
        },
        {
            provide: TwitterApiv2,
            inject: [TwitterApi],
            useFactory: (api: TwitterApi) => api.v2,
        },
        {
            provide: TWITTER_USER_V1,
            inject: [TwitterApiv1],
            useFactory: async (api: TwitterApiv1) => (
                await api.verifyCredentials()
            ),
        },
    ],
})
export class AppModule {

}
