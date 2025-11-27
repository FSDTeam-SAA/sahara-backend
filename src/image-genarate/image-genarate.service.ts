import { Injectable } from '@nestjs/common';
import { ImageGeneratorUtil } from '../common/utils/image-generator.util';

@Injectable()
export class ImageService {
  constructor(private readonly imageUtil: ImageGeneratorUtil) {}

  async generateGhibliCharacter(name: string, filename?: string) {
    const prompt = this.imageUtil.cartoonizeCharacterPrompt(name, filename);
    return this.imageUtil.generateImageFromPrompt(prompt);
  }
}
