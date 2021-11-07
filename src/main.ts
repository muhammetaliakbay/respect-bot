import { config as configDotEnv } from "dotenv"
configDotEnv()

import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { TweetService } from "./tweet.service"

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule)
    await app.init()
    app.enableShutdownHooks()

    const tweetService = app.get(TweetService)
    tweetService.process().catch(
        err => console.dir(err, {depth: 10})
    )
}

bootstrap().catch(err => console.error(err))
