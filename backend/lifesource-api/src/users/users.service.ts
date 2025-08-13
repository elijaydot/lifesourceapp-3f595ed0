import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}

  async create(data: Partial<User>): Promise<User> {
    return this.model.create(data);
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email }).select('+password');
  }

  async findById(id: string) {
    return this.model.findById(id);
  }

  async list(): Promise<User[]> {
    return this.model.find().limit(100);
  }
}
