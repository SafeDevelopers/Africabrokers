import { Injectable } from "@nestjs/common";

@Injectable()
export class MediaService {
  getHealth() {
    return {
      status: "ok",
      service: "media-service",
      timestamp: new Date().toISOString()
    };
  }
}
