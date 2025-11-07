import { Injectable } from "@nestjs/common";
import { StatusService } from "../status/status.service";

@Injectable()
export class AppService {
  constructor(private statusService: StatusService) {}

  getHealth() {
    return {
      status: "ok",
      service: "core-api",
      timestamp: new Date().toISOString()
    };
  }

  async getStatus() {
    return this.statusService.checkAll();
  }
}
