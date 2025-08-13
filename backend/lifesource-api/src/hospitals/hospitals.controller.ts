import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HospitalsService } from './hospitals.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';

@ApiTags('hospitals')
@Controller('hospitals')
export class HospitalsController {
  constructor(private hospitals: HospitalsService) {}

  @Get()
  async list() {
    return this.hospitals.list();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() body: any) {
    return this.hospitals.create(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/verify')
  async verify(@Param('id') id: string) {
    return this.hospitals.verify(id);
  }
}
