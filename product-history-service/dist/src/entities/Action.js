"use strict";
const { Entity, Column, PrimaryGeneratedColumn } = require("typeorm");

@Entity()
class Action {
  @PrimaryGeneratedColumn()
  id;

  @Column()
  product_id;

  @Column()
  action;

  @Column()
  details;

  @Column({ type: 'timestamp' })
  timestamp;

  @Column() // Add this column for action_type
  action_type;
}

module.exports = { Action };
