import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  async rebuildReports() {
    // TODO: implement real analytics aggregation
    return { ok: true };
  }
}
