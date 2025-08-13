import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type HospitalDocument = HydratedDocument<Hospital>;

@Schema({ timestamps: true })
export class Hospital {
  @Prop({ required: true })
  name: string;

  @Prop()
  address?: string;

  @Prop({ type: { type: String, default: 'Point' } })
  locationType?: string;

  @Prop({ type: [Number], index: '2dsphere', default: undefined })
  coordinates?: number[]; // [lng, lat]

  @Prop({ default: false })
  verified: boolean;

  @Prop()
  contactPhone?: string;

  @Prop({ type: SchemaTypes.Number, default: 0 })
  dailyCapacity?: number;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
