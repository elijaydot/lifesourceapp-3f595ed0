import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private svc: AppointmentsService) {}

  @Post()
  create(@Body() body: any) {
    return this.svc.create(body);
  }

  @Get('donor')
  donor(@Query('donorId') donorId: string) {
    return this.svc.forDonor(donorId);
  }

  @Get('hospital')
  hospital(@Query('hospitalId') hospitalId: string) {
    return this.svc.forHospital(hospitalId);
  }
}
