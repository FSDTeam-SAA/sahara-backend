import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'https://sahara-53.vercel.app/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  const port = Number(process.env.PORT) || 5000;
  try {
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (err: unknown) {
    console.error(
      `Failed to listen on port ${port}: ${err instanceof Error ? err.message : String(err)}`,
    );
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'EADDRINUSE'
    ) {
      console.error(
        'Port is already in use. Set PORT env var to another port and try again.',
      );
    }
    process.exit(1);
  }
}
bootstrap();
