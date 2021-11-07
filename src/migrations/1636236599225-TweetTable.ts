import {MigrationInterface, QueryRunner} from "typeorm";

export class TweetTable1636236599225 implements MigrationInterface {
    name = 'TweetTable1636236599225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tweet" ("id" character varying NOT NULL, "source" character varying NOT NULL, "text" character varying NOT NULL, CONSTRAINT "PK_6dbf0db81305f2c096871a585f6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tweet"`);
    }

}
