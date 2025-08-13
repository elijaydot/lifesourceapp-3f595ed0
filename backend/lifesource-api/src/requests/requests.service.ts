import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request, RequestDocument } from './request.schema';

@Injectable()
export class RequestsService {
  constructor(@InjectModel(Request.name) private model: Model<RequestDocument>) {}

  create(data: Partial<Request>) {
    return this.model.create(data);
  }

  forRecipient(recipientId: string) {
    return this.model.find({ recipientId }).sort({ createdAt: -1 });
  }

  pendingForHospital(hospitalId: string) {
    return this.model.find({ hospitalId, status: 'pending' }).sort({ createdAt: -1 });
  }
}
