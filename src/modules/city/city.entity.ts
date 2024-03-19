import { Country } from '@modules/country/country.entity';
import { Hotel } from '@modules/hotel/hotel.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';

@Entity()
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  @Index({ fulltext: true })
  name: string;

  @Column({ length: 10 })
  @Index({ unique: true })
  postalCode: string;

  @ManyToOne(() => Country, (country) => country.cities)
  country: Country;

  @OneToMany(() => Hotel, (hotel) => hotel.city)
  hotels: Hotel[];
}
