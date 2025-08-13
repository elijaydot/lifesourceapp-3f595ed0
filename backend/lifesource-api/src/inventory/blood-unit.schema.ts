import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type BloodUnitDocument = HydratedDocument<BloodUnit>;

@Schema({ timestamps: true })
export class BloodUnit {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Hospital', required: true })
  hospitalId: string;

  @Prop({ type: String, required: true })
  bloodType: string;

  @Prop({ type: Number, required: true })
  units: number;

  @Prop({ type: Date, required: true })
  expiry: Date;

  @Prop({ type: String, enum: ['available', 'reserved', 'used', 'expired'], default: 'available' })
  status: string;
}

export const BloodUnitSchema = SchemaFactory.createForClass(BloodUnit);
