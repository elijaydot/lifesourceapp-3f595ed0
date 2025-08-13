import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestsService } from './requests.service';

@ApiTags('requests')
@Controller('requests')
export class RequestsController {
  constructor(private svc: RequestsService) {}

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Get('recipient')
  mine(@Query('recipientId') recipientId: string) {
    return this.svc.forRecipient(recipientId);
  }

  @Get('hospital')
  hospitalPending(@Query('hospitalId') hospitalId: string) {
    return this.svc.pendingForHospital(hospitalId);
  }
}
