import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationSearchVector1782794118306 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // 1. Extension hỗ trợ tìm kiếm tiếng Việt không dấu
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS unaccent;
        `);

        // 2. Cột search_vector
        await queryRunner.query(`
            ALTER TABLE conversations
            ADD COLUMN search_vector tsvector;
        `);

        // 3. Backfill dữ liệu cũ
        await queryRunner.query(`
            UPDATE conversations
            SET search_vector =
                to_tsvector('simple', unaccent(coalesce(full_name,'')));
        `);

        // 4. GIN index cho search
        await queryRunner.query(`
            CREATE INDEX conversation_search_idx
            ON conversations
            USING GIN(search_vector);
        `);

        // 5. Composite index cho pattern where(page_id) + order(updated_at, id)
        //    Đây là index quan trọng nhất cho tốc độ phân trang
        await queryRunner.query(`
            CREATE INDEX idx_conversation_page_updated_id
            ON conversations (page_id, updated_at DESC, id DESC);
        `);

        // 6. Trigger tự cập nhật search_vector
        await queryRunner.query(`
            CREATE FUNCTION conversation_search_vector_update()
            RETURNS trigger AS $$
            BEGIN
                NEW.search_vector :=
                    to_tsvector('simple', unaccent(coalesce(NEW.full_name,'')));
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE TRIGGER conversation_search_trigger
            BEFORE INSERT OR UPDATE
            ON conversations
            FOR EACH ROW
            EXECUTE FUNCTION conversation_search_vector_update();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS conversation_search_trigger ON conversations;`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS conversation_search_vector_update;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_conversation_page_updated_id;`);
        await queryRunner.query(`DROP INDEX IF EXISTS conversation_search_idx;`);
        await queryRunner.query(`ALTER TABLE conversations DROP COLUMN IF EXISTS search_vector;`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS unaccent;`);
    }
}