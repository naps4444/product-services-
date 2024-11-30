import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Action {
  @PrimaryGeneratedColumn()
  id?: number; // Mark as optional if not initialized in the constructor

  @Column({ type: 'varchar', length: 255 })
  action_type: string;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'int' })
  shop_id: number;

  @Column({ type: 'int' })
  quantity_changed: number;

  @CreateDateColumn()
  date: Date;

  constructor(
    action_type: string,
    product_id: number,
    shop_id: number,
    quantity_changed: number,
    date: Date
  ) {
    this.action_type = action_type;
    this.product_id = product_id;
    this.shop_id = shop_id;
    this.quantity_changed = quantity_changed;
    this.date = date;
  }
}

// Export the Action class only once
export default Action;
