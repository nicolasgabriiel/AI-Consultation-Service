import { GoogleAIFileManager } from '@google/generative-ai/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Injectable } from '@nestjs/common'
import { Measurement } from 'src/entities/Measurement'

@Injectable()
export class ApiService {
  uploadImage = async (measure: Measurement, mediaPath: string): Promise<Measurement> => {
    const fileManager = new GoogleAIFileManager(process.env.API_KEY)
    const uploadResult = await fileManager.uploadFile(`${mediaPath}`, {
      mimeType: 'image/jpeg',
      displayName: 'testimg drawing'
    })
    console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`)

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

    measure.image_url = uploadResult.file.uri
    measure.measure_value = Number(result.response.text())

    measure.internal_file_path = mediaPath

    return measure
  }
}
