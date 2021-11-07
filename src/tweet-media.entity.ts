import { Word } from "tesseract.js";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { TweetEntity } from "./tweet.entity";

export enum MediaType {
    Photo = 'photo',
}

@Entity("tweet_media")
export class TweetMediaEntity {
    @PrimaryColumn({
        name: 'media_key',
        type: 'varchar',
    })
    media_key: string

    @Column({
        name: 'type',
        nullable: false,
        enum: MediaType,
    })
    type: MediaType

    @Column({
        name: 'url',
        type: 'varchar',
        nullable: false,
    })
    url: string

    @ManyToOne(() => TweetEntity, tweet => tweet.medias)
    @JoinColumn({
        name: 'tweet_id',
    })
    tweet: TweetEntity

    @Column({
        name: 'ocr',
        type: 'jsonb',
        nullable: true,
    })
    ocrWords: Word[]
}
