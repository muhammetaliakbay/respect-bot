import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TesseractProvider } from "./tesseract.provider";
import { TweetMediaEntity } from "./tweet-media.entity";

@Injectable()
export class TweetMediaService {
    constructor(
        @InjectRepository(TweetMediaEntity)
        readonly tweetMediaRepository: Repository<TweetMediaEntity>,
        readonly tesseract: TesseractProvider,
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
            const tesseract = await this.tesseract.pop()
            if (tesseract == undefined) {
                return
            }

            try {
                const newMedias = await this.tweetMediaRepository.find({
                    where: {
                        ocrWords: null,
                    },
                    take: 10,
                })
    
                for (const newMedia of newMedias) {
                    const result = await tesseract.recognize(newMedia.url)
                    const words = result.data.words.map(
                        word => ({
                            text: word.text,
                            confidence: word.confidence,
                            baseline: word.baseline,
                            bbox: word.bbox,
                            is_numeric: word.is_numeric,
                            in_dictionary: word.in_dictionary,
                            direction: word.direction,
                            language: word.language,
                            is_bold: word.is_bold,
                            is_italic: word.is_italic,
                            is_underlined: word.is_underlined,
                            is_monospace: word.is_monospace,
                            is_serif: word.is_serif,
                            is_smallcaps: word.is_smallcaps,
                            font_size: word.font_size,
                            font_id: word.font_id,
                            font_name: word.font_name,
                        })
                    )
                    await this.tweetMediaRepository.update(newMedia.media_key, {
                        ocrWords: words,
                    })
                }
            } finally {
                this.tesseract.push(tesseract)
            }

        } finally {
            this.busy = false
        }
    }
}
