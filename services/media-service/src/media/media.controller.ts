import { Controller, Get } from "@nestjs/common";
import { MediaService } from "./media.service";

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get("health")
  getHealth() {
    return this.mediaService.getHealth();
  }
}
