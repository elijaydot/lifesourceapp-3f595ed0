import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private svc: InventoryService) {}

  @Post()
  add(@Body() body: any) {
    return this.svc.add(body);
  }

  @Get('hospital')
  byHospital(@Query('hospitalId') hospitalId: string) {
    return this.svc.byHospital(hospitalId);
  }
}
