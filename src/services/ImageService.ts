import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

import { ApiService } from './ApiService'
import { Measurement } from 'src/entities/Measurement'

@Injectable()
export class ImageService {
  constructor(private readonly api: ApiService) {}
  async processImage(measure: Measurement): Promise<Measurement> {
    const base64Data = measure.image.replace(/^data:image\/\w+;base64,/, '')

    const buffer = Buffer.from(base64Data, 'base64')

    const imageName = measure.customerCode + '.jpg'
    const filePath = path.join('src/utils/temp/', imageName)
    fs.writeFileSync(filePath, buffer)

    console.log(filePath)
    return this.api.uploadImage(measure, filePath)
  }
}

//base64Image: string, code: string
