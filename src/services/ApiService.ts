import { GoogleAIFileManager } from '@google/generative-ai/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Injectable } from '@nestjs/common'
import { Measurement } from 'src/entities/Measurement'

@Injectable()
export class ApiService {
  //Envia a imagem para ser análisada pelo Gemmini
  async sendImageForGemini(measure: Measurement, mediaPath: string): Promise<Measurement> {
    //Instancia um gerenciador de arquivos e faz upload do arquivo
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY)
    const uploadResult = await fileManager.uploadFile(`${mediaPath}`, {
      mimeType: 'image/jpeg',
      displayName: 'imageForUpload'
    })

    //Instancia a IA passando os dados do arquivo pelo fileData
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent([
      'try to find the value reported on the meter in the image, if you cant see it, return the number 0. Just reponse with numbers',
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType
        }
      }
    ])

    //Inserindo os dados obtidos no objeto
    measure.image_url = uploadResult.file.uri
    measure.measure_value = Number(result.response.text())
    measure.internal_file_path = mediaPath

    return measure
  }
}
