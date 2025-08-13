import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BloodUnit, BloodUnitSchema } from './blood-unit.schema';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: BloodUnit.name, schema: BloodUnitSchema }])],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
