import { City } from '@modules/city/city.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity()
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  @Index({ fulltext: true })
  name: string;

  @OneToMany(() => City, (city) => city.country)
  cities: City[];
}
