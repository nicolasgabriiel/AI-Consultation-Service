import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
// import { MeasurementService } from './services/MeasurementService'
// import { Measurement } from './entities/Measurement'
// import { MeasureType } from './entities/enums/MeasureType'
// import { uploadImage } from './utils/api'

//import { ApiService } from './services/ApiService'
//import { uploadImage } from './services/ApiTest'

// import { ImageService } from './services/ImageService'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)

  // const imageService = app.get<ImageService>(ImageService)

  // imageService.processImage()
}
bootstrap()
