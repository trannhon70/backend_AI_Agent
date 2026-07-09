import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFilesTable1783591233174 implements MigrationInterface {
    name = "CreateFilesTable1783591233174";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "files" (
                "id" SERIAL NOT NULL,
                "url" text,
                "created_at" integer,
                CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "files"`);
    }
}