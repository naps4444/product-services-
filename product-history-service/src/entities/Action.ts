import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Action {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  product_id!: number;

  @Column()
  shop_id!: number;

  @Column()
  quantity_changed!: number;

  @Column()
  action_type!: string; // Match database schema

  @Column({ type: 'text' })
  details!: string; // Match database schema

  @Column({ type: 'timestamp' })
  date!: Date; // Match database schema
}
