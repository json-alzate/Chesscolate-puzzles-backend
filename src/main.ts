import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.enableCors({
    origin: ['https://chesscolate.com', 'https://www.chesscolate.com', 'https://localhost'],
  });

  await app.listen(process.env.PORT || 3000);
  // const url = await app.getUrl();
  // console.log(`Aplicación corriendo en: ${url}`);
}
bootstrap();
