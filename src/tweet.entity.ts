import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { TweetMediaEntity } from "./tweet-media.entity";

@Entity("tweet")
export class TweetEntity {
    @PrimaryColumn({
        name: 'id',
        type: 'varchar',
    })
    id: string

    @Column({
        name: 'author_id',
        type: 'varchar',
        nullable: true,
    })
    author_id: string

    @Column({
        name: 'source',
        type: 'varchar',
        nullable: false,
    })
    source: string

    @Column({
        name: 'text',
        type: 'varchar',
        nullable: false,
    })
    text: string

    @OneToMany(() => TweetMediaEntity, tweetMedia => tweetMedia.tweet)
    medias: TweetMediaEntity[]

    @Column({
        name: 'originals',
        type: 'varchar',
        array: true,
        nullable: true,
    })
    originals: string[]

    @Column({
        name: 'reporter_id',
        type: 'varchar',
        nullable: true,
    })
    reporter_id: string
}
