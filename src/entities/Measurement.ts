import { MeasureType } from './enums/MeasureType'
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Measurement {
  @PrimaryGeneratedColumn()
  id?: number
  @Column({ type: 'text' })
  image: string
  @Column({ type: 'varchar', length: 255 })
  customerCode: string
  @Column({ type: 'timestamp' })
  measureDatetime: Date
  @Column({ type: 'enum', enum: MeasureType })
  measureType: MeasureType
  @Column({ type: 'text', nullable: true })
  imageUrl?: string
  @Column({ type: 'float', nullable: true })
  measureValue?: number
  @Column({ type: 'uuid', nullable: true })
  measureUuid?: string
  @Column({ default: false })
  confirmated: boolean
}
