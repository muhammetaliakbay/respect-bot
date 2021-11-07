import { cpus } from "os"

export class ConfigProvider {
    readonly apiKey = process.env.TWITTER_APP_KEY
    readonly appSecret = process.env.TWITTER_APP_SECRET
    readonly accessToken = process.env.TWITTER_ACCESS_TOKEN
    readonly accessSecret = process.env.TWITTER_ACCESS_SECRET
    readonly hashTag = process.env.TWITTER_HASHTAG
    readonly tesseractInstances = Number(process.env.TESSERACT_INSTANCES ?? cpus().length)
}
