import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  //Define um limite maior e arquivos JSON já que as imagens pode ser grandes.
  app.use(bodyParser.json({ limit: '10mb' })) // Ajuste conforme necessário
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

  await app.listen(3000)
}
bootstrap()
