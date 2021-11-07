import {MigrationInterface, QueryRunner} from "typeorm";

export class TweetMediaTable1636236638151 implements MigrationInterface {
    name = 'TweetMediaTable1636236638151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tweet_media" ("media_key" character varying NOT NULL, "type" character varying NOT NULL, "url" character varying NOT NULL, "tweet_id" character varying, CONSTRAINT "PK_bb28a00e7c8c8f7582324945d44" PRIMARY KEY ("media_key"))`);
        await queryRunner.query(`ALTER TABLE "tweet_media" ADD CONSTRAINT "FK_ee980eca0c03f81add80fc8774e" FOREIGN KEY ("tweet_id") REFERENCES "tweet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet_media" DROP CONSTRAINT "FK_ee980eca0c03f81add80fc8774e"`);
        await queryRunner.query(`DROP TABLE "tweet_media"`);
    }

}
