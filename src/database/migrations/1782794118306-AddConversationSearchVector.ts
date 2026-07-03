import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationSearchVector1782794118306 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Enable extension
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS unaccent;
        `);

        // Add search_vector column
        await queryRunner.query(`
            ALTER TABLE conversations
            ADD COLUMN search_vector tsvector;
        `);

        // Backfill existing data
        await queryRunner.query(`
            UPDATE conversations
            SET search_vector = to_tsvector(
                'simple',
                unaccent(
                    coalesce(full_name, '')
                )
            );
        `);

        // GIN index for Full Text Search
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS conversation_search_idx
            ON conversations
            USING GIN(search_vector);
        `);

        // Trigger function
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION conversation_search_vector_update()
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    to_tsvector(
                        'simple',
                        unaccent(
                            coalesce(NEW.full_name, '')
                        )
                    );

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Trigger
        await queryRunner.query(`
            CREATE TRIGGER conversation_search_trigger
            BEFORE INSERT OR UPDATE OF full_name
            ON conversations
            FOR EACH ROW
            EXECUTE FUNCTION conversation_search_vector_update();
        `);

        // Composite index for cursor pagination
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_conversation_page_updated_at_id
            ON conversations(page_id, updated_at, id );
        `);

        // Composite page_id, updated_at for cursor pagination
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_conversation_page_updated_at
            ON conversations(page_id, updated_at);
        `);

        //lọc theo nhân viên được assigned
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_conversation_assigned_user_updated_at
            ON conversations(assigned_user_id, updated_at);
        `);
        //Partial Index page_id, updated_at, id for cursor pagination with unread_count > 0
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_conversation_unread
            ON conversations(page_id, updated_at, id)
            WHERE unread_count > 0;
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

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_conversation_page_updated_at_id;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_conversation_page_updated_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_conversation_assigned_user_updated_at;
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_conversation_unread;
        `);
    }
}