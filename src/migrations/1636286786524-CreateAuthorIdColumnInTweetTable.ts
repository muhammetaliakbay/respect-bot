import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateAuthorIdColumnInTweetTable1636286786524 implements MigrationInterface {
    name = 'CreateAuthorIdColumnInTweetTable1636286786524'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet" ADD "author_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tweet" DROP COLUMN "author_id"`);
    }

}
