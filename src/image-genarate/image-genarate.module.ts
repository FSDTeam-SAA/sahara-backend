import { Module } from '@nestjs/common';
import { ImageController } from './image-genarate.controller';
import { ImageService } from './image-genarate.service';
import { ImageGeneratorUtil } from '../common/utils/image-generator.util';

@Module({
  controllers: [ImageController],
  providers: [ImageService, ImageGeneratorUtil],
  exports: [ImageGeneratorUtil],
})
export class ImageGenarateModule {}
