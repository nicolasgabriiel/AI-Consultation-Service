import { MeasureType } from './enums/MeasureType';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Measurement {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text' })
  image: string;
  @Column({ type: 'varchar', length: 255 })
  customerCode: string;
  @Column({ type: 'timestamp' })
  measureDatetime: Date;
  @Column({ type: 'enum', enum: MeasureType })
  measureType: MeasureType;
}
