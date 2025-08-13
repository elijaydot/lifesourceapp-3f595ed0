import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
export type AppRole = 'admin' | 'hospital' | 'donor' | 'recipient';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: true })
  password: string;

  @Prop({ type: String, enum: ['admin', 'hospital', 'donor', 'recipient'], default: 'recipient' })
  role: AppRole;

  @Prop()
  bloodType?: string;

  @Prop()
  phone?: string;

  @Prop()
  location?: string;

  @Prop()
  lastDonationAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
