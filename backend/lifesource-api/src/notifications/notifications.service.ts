import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async broadcast(message: string) {
    // TODO: integrate with FCM/OneSignal
    return { ok: true, message };
  }
}
