import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { ImageService } from './image-genarate.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('ghibli')
  @UseInterceptors(FileInterceptor('file'))
  async generate(
    @Body('name') name: string,
    @UploadedFile() file?: Multer.File,
  ) {
    const imageUrl = await this.imageService.generateGhibliCharacter(
      name,
      file,
    );
    return { imageUrl };
  }
}
