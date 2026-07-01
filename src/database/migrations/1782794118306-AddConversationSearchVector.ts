import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationSearchVector1782794118306 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // 1. Enable extension for Vietnamese search improvement
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS unaccent;
        `);

        // 2. Add column
        await queryRunner.query(`
            ALTER TABLE conversations
            ADD COLUMN search_vector tsvector;
        `);

        // 3. Backfill OLD data (IMPORTANT)
        await queryRunner.query(`
            UPDATE conversations
            SET search_vector =
                to_tsvector(
                    'simple',
                    unaccent(
                        coalesce(full_name,'')
                    )
                );
        `);

        // 4. Create GIN index
        await queryRunner.query(`
            CREATE INDEX conversation_search_idx
            ON conversations
            USING GIN(search_vector);
        `);

        // 5. Create function (multi-field ready)
        await queryRunner.query(`
            CREATE FUNCTION conversation_search_vector_update()
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    to_tsvector(
                        'simple',
                        unaccent(
                            coalesce(NEW.full_name,'')
                        )
                    );
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;
        `);

        // 6. Create trigger
        await queryRunner.query(`
            CREATE TRIGGER conversation_search_trigger
            BEFORE INSERT OR UPDATE
            ON conversations
            FOR EACH ROW
            EXECUTE FUNCTION conversation_search_vector_update();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS conversation_search_trigger
            ON conversations;
        `);

        await queryRunner.query(`
            DROP FUNCTION IF EXISTS conversation_search_vector_update;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS conversation_search_idx;
        `);

        await queryRunner.query(`
            ALTER TABLE conversations
            DROP COLUMN IF EXISTS search_vector;
        `);

        await queryRunner.query(`
            DROP EXTENSION IF EXISTS unaccent;
        `);
    }
}