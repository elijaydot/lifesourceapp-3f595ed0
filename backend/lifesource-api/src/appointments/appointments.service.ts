import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';

@Injectable()
export class AppointmentsService {
  constructor(@InjectModel(Appointment.name) private model: Model<AppointmentDocument>) {}

  create(data: Partial<Appointment>) {
    return this.model.create(data);
  }

  forDonor(donorId: string) {
    return this.model.find({ donorId }).sort({ date: -1 });
  }

  forHospital(hospitalId: string) {
    return this.model.find({ hospitalId }).sort({ date: -1 });
  }
}
