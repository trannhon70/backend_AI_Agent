

import { Fanpage } from "src/modules/fanpages/entities/fanpage.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("ai_cache")
export class AiCache {
    @PrimaryGeneratedColumn()
    id!: number;

    // SHA256(normalizedPrompt + model + systemPromptVersion)
    @Column({ unique: true, length: 64 })
    hash!: string;

    @Column({ type: "text" })
    prompt!: string;

    @Column({ type: "text", })
    response!: string;

    @Column({ nullable: true, })
    model!: string;

    @Column({ nullable: true, })
    provider!: string;

    @Column({ default: 0, })
    hit_count!: number;

    @Column({ default: 0, })
    input_tokens!: number;

    @Column({ default: 0, })
    output_tokens!: number;

    @Column({ type: 'float', nullable: true })
    created_at!: number | null;
}