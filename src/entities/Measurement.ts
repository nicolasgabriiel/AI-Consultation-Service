import { MeasureType } from './enums/MeasureType'
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Measurement {
  @PrimaryGeneratedColumn()
  id?: number
  @Column({ type: 'text' })
  image: string
  @Column({ type: 'varchar', length: 255 })
  customer_code: string
  @Column({ type: 'timestamp' })
  measure_datetime: Date
  @Column({ type: 'enum', enum: MeasureType })
  measure_type: MeasureType
  @Column({ type: 'text', nullable: true })
  image_url?: string
  @Column({ type: 'float', nullable: true })
  measure_value?: number
  @Column({ type: 'uuid', nullable: true })
  measure_uuid?: string
  @Column({ default: false })
  has_confirmed: boolean
  internal_file_path?: string
}
