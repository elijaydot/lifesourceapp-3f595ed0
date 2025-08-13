import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Post('broadcast-test')
  test() {
    return this.svc.broadcast('Test notification');
  }
}
