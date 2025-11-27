import { Module } from '@nestjs/common';
import { ImageController } from './image-genarate.controller';
import { ImageService } from './image-genarate.service';

@Module({
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageGenarateModule {}
