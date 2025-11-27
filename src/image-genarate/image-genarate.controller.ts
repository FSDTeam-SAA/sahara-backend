import { Controller, Get, Query } from '@nestjs/common';
import { ImageService } from './image-genarate.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('ghibli')
  async generate(@Query('name') name: string, @Query('file') file?: string) {
    const imageUrl = await this.imageService.generateGhibliCharacter(
      name,
      file,
    );
    return { imageUrl };
  }
}
