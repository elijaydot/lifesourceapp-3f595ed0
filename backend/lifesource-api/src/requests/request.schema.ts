import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

export type RequestDocument = HydratedDocument<Request>;

@Schema({ timestamps: true })
export class Request {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  recipientId: string;

  @Prop({ type: String, required: true })
  bloodType: string;

  @Prop({ type: Number, required: true })
  quantity: number; // units

  @Prop({ type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  urgency: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Hospital' })
  hospitalId?: string;

  @Prop({ type: String, enum: ['pending', 'accepted', 'fulfilled', 'cancelled'], default: 'pending' })
  status: string;
}

export const RequestSchema = SchemaFactory.createForClass(Request);
