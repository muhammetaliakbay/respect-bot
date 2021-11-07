import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateOCRColumnInTweetMediaTable1636272780724 implements MigrationInterface {
    name = 'CreateOCRColumnInTweetMediaTable1636272780724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet_media" ADD "ocr" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet_media" DROP COLUMN "ocr"`);
    }

}
