import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  donorId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Hospital', required: true })
  hospitalId: string;

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' })
  status: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
