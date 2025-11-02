import { Module } from "@nestjs/common";
import { MediaController } from "./media/media.controller";
import { MediaService } from "./media/media.service";

@Module({
  controllers: [MediaController],
  providers: [MediaService]
})
export class MediaModule {}
