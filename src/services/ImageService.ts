import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { randomBytes } from 'crypto'

import { ApiService } from './ApiService'
import { Measurement } from 'src/entities/Measurement'

@Injectable()
export class ImageService {
  constructor(private readonly api: ApiService) {}
  //Transforma a imagem em Base64 para um JPG e envia para o ApiService
  async processImage(measure: Measurement): Promise<Measurement> {
    const base64Data = measure.image.replace(/^data:image\/\w+;base64,/, '')

    const buffer = Buffer.from(base64Data, 'base64')

    const imageName = (await this.generateRandomString(16)) + '.jpg'
    const filePath = path.join('src/utils/temp/', imageName)
    fs.writeFileSync(filePath, buffer)

    console.log(filePath)
    return this.api.sendImageForGemini(measure, filePath)
  }
  //Deleta a imagem criada em JPG da pasta utils/temp
  async deleteImage(filePath: string) {
    try {
      fs.unlinkSync(filePath)
      console.log(`Imagem deletada com sucesso: ${filePath}`)
    } catch (error) {
      console.error(`Erro ao deletar a imagem: ${error}`)
      throw new Error('Erro ao deletar a imagem')
    }
  }
  //Gera um código que serve de nome temporário para o arquivo de imagem
  async generateRandomString(length) {
    return randomBytes(length).toString('hex').slice(0, length)
  }
}
