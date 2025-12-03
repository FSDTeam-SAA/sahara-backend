import { Injectable } from '@nestjs/common';
import { ImageGeneratorUtil } from '../common/utils/image-generator.util';
import cloudinary from '../common/cloudinary';
import type { UploadApiResponse } from 'cloudinary';

type UploadedFile = { buffer?: Buffer; path?: string };

@Injectable()
export class ImageService {
  constructor(private readonly imageUtil: ImageGeneratorUtil) {}
  async generateGhibliCharacter(name: string, file?: UploadedFile) {
    let uploadedImageUrl: string | undefined;
    let characterDescription: string | undefined;

    // If user uploads a reference image
    if (file) {
      // If file.path exists and is a string, use it
      if (typeof file.path === 'string') {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: 'ghibli-characters',
        });
        uploadedImageUrl = upload.secure_url;
      } else if (file.buffer instanceof Buffer) {
        // If multer provided a buffer (memory storage), upload via stream
        const buffer: Buffer = file.buffer;
        const streamUpload = (buffer: Buffer) =>
          new Promise<UploadApiResponse>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: 'ghibli-characters' },
              (error: unknown, result: unknown) => {
                if (error) {
                  let err: Error;
                  if (error instanceof Error) {
                    err = error;
                  } else {
                    let message: string;
                    if (typeof error === 'object') {
                      try {
                        message = JSON.stringify(error);
                      } catch {
                        // Fallback for objects that can't be JSON-stringified; normalize using Object.prototype.toString
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        message = Object.prototype.toString.call(error);
                      }
                    } else if (
                      typeof error === 'string' ||
                      typeof error === 'number' ||
                      typeof error === 'boolean'
                    ) {
                      message = String(error);
                    } else {
                      message = String(
                        Object.prototype.toString.call(error as object),
                      );
                    }
                    err = new Error(message);
                  }
                  return reject(err);
                }
                resolve(result as UploadApiResponse);
              },
            );
            stream.end(buffer);
          });
        const upload = await streamUpload(buffer);
        uploadedImageUrl = upload.secure_url;
      } else {
        throw new TypeError(
          'Uploaded file does not contain a valid path or buffer',
        );
      }

      // Step 2: Analyze the image with Grok Vision to get detailed description
      if (uploadedImageUrl) {
        characterDescription =
          await this.imageUtil.analyzeImageWithVision(uploadedImageUrl);
      }
    }

    // Build prompt with character description from vision analysis
    const prompt = this.imageUtil.cartoonizeCharacterPrompt(
      name,
      characterDescription,
    );

    console.log('prompt', prompt);

    // Generate final Ghibli-style image
    return this.imageUtil.generateImageFromPrompt(prompt);
  }
}
