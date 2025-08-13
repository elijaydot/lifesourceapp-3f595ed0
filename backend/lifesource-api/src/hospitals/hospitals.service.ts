import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './hospital.schema';

@Injectable()
export class HospitalsService {
  constructor(@InjectModel(Hospital.name) private model: Model<HospitalDocument>) {}

  create(data: Partial<Hospital>) {
    return this.model.create(data);
  }

  list() {
    return this.model.find().limit(200);
  }

  verify(id: string) {
    return this.model.findByIdAndUpdate(id, { verified: true }, { new: true });
  }
}
