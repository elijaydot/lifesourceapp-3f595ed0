import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BloodUnit, BloodUnitDocument } from './blood-unit.schema';

@Injectable()
export class InventoryService {
  constructor(@InjectModel(BloodUnit.name) private model: Model<BloodUnitDocument>) {}

  add(data: Partial<BloodUnit>) {
    return this.model.create(data);
  }

  byHospital(hospitalId: string) {
    return this.model.find({ hospitalId, status: { $ne: 'expired' } }).sort({ expiry: 1 });
  }
}
