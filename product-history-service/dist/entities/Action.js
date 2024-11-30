var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
let Action = class Action {
    id; // Mark as optional if not initialized in the constructor
    action_type;
    product_id;
    shop_id;
    quantity_changed;
    date;
    constructor(action_type, product_id, shop_id, quantity_changed, date) {
        this.action_type = action_type;
        this.product_id = product_id;
        this.shop_id = shop_id;
        this.quantity_changed = quantity_changed;
        this.date = date;
    }
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Action.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Action.prototype, "action_type", void 0);
__decorate([
    Column({ type: 'int' }),
    __metadata("design:type", Number)
], Action.prototype, "product_id", void 0);
__decorate([
    Column({ type: 'int' }),
    __metadata("design:type", Number)
], Action.prototype, "shop_id", void 0);
__decorate([
    Column({ type: 'int' }),
    __metadata("design:type", Number)
], Action.prototype, "quantity_changed", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Action.prototype, "date", void 0);
Action = __decorate([
    Entity(),
    __metadata("design:paramtypes", [String, Number, Number, Number, Date])
], Action);
export { Action };
// Export the Action class only once
export default Action;
