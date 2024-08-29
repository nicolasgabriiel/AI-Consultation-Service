import { GoogleAIFileManager } from '@google/generative-ai/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { HttpService } from '@nestjs/axios'
import { firstValueFrom } from 'rxjs'
import { Injectable } from '@nestjs/common'
import { Measurement } from 'src/entities/Measurement'
import { MeasurementService } from './MeasurementService'

export interface ImageInterface {
  image_url: string
  measure_value: number
  measure_uuid: string
}

@Injectable()
export class ApiService {
  constructor(
    private readonly httpService: HttpService,
    private measureService: MeasurementService
  ) {}
  uploadImage = async (
    measure: Measurement,
    mediaPath: string
  ): Promise<Measurement> => {
    const fileManager = new GoogleAIFileManager(process.env.API_KEY)
    const uploadResult = await fileManager.uploadFile(`${mediaPath}`, {
      mimeType: 'image/jpeg',
      displayName: 'testimg drawing'
    })
    console.log(
      `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`
    )

    const genAI = new GoogleGenerativeAI(process.env.API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent([
      'Regardless of the image, just tell me a numerical value from 10 to 200. Just reponse with numbers',
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType
        }
      }
    ])
    console.log(result.response.text())
    console.log(uploadResult.file.uri)
    console.log(`${uploadResult.file.uri}?key=${process.env.API_KEY}`)

    measure.imageUrl = uploadResult.file.uri
    measure.measureValue = Number(result.response.text())

    return this.requestData(measure)
  }

  requestData = async (measure: Measurement): Promise<Measurement> => {
    const url = `${measure.imageUrl}?key=${process.env.API_KEY}`
    const response = await firstValueFrom(this.httpService.get(url))
    console.log(response.data)

    measure.measureUuid = this.measureService.createUuid()

    return measure
  }
}
