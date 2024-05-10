import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './city.entity';
import { Country } from '@modules/country/country.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) {}

  async getAll(): Promise<City[]> {
    return this.cityRepository.find();
  }

  async seedCities() {
    const cities = [
      { name: 'An Giang', postalCode: '90000' },
      { name: 'Bà Rịa Vũng Tàu', postalCode: '78000' },
      { name: 'Bạc Liêu', postalCode: '97000' },
      { name: 'Bắc Kạn', postalCode: '23000' },
      { name: 'Bắc Giang', postalCode: '26000' },
      { name: 'Bắc Ninh', postalCode: '16000' },
      { name: 'Bến Tre', postalCode: '86000' },
      { name: 'Bình Dương', postalCode: '75000' },
      { name: 'Bình Định', postalCode: '55000' },
      { name: 'Bình Phước', postalCode: '67000' },
      { name: 'Bình Thuận', postalCode: '77000' },
      { name: 'Cà Mau', postalCode: '98000' },
      { name: 'Cao Bằng', postalCode: '21000' },
      { name: 'Cần Thơ', postalCode: '94000' },
      { name: 'Đà Nẵng', postalCode: '50000' },
      { name: 'Điện Biên', postalCode: '32000' },
      { name: 'Đắk Lắk', postalCode: '63000 - 64000' },
      { name: 'Đắk Nông', postalCode: '65000' },
      { name: 'Đồng Nai', postalCode: '76000' },
      { name: 'Đồng Tháp', postalCode: '81000' },
      { name: 'Gia Lai', postalCode: '61000 - 62000' },
      { name: 'Hà Giang', postalCode: '20000' },
      { name: 'Hà Nam', postalCode: '18000' },
      { name: 'Hà Nội', postalCode: '10000 - 14000' },
      { name: 'Hà Tĩnh', postalCode: '45000 - 46000' },
      { name: 'Hải Dương', postalCode: '03000' },
      { name: 'Hải Phòng', postalCode: '04000 - 05000' },
      { name: 'Hậu Giang', postalCode: '95000' },
      { name: 'Hòa Bình', postalCode: '36000' },
      { name: 'TP. Hồ Chí Minh', postalCode: '70000 - 74000' },
      { name: 'Hưng Yên', postalCode: '17000' },
      { name: 'Khánh Hòa', postalCode: '5700033' },
      { name: 'Kiên Giang', postalCode: '91000 - 92000' },
      { name: 'Kon Tum', postalCode: '60000' },
      { name: 'Lai Châu', postalCode: '30000' },
      { name: 'Lạng Sơn', postalCode: '25000' },
      { name: 'Lào Cai', postalCode: '31000' },
      { name: 'Lâm Đồng', postalCode: '66000' },
      { name: 'Long An', postalCode: '82000 - 83000' },
      { name: 'Nam Định', postalCode: '07000' },
      { name: 'Nghệ An', postalCode: '43000 - 44000' },
      { name: 'Ninh Bình', postalCode: '08000' },
      { name: 'Ninh Thuận', postalCode: '59000' },
      { name: 'Phú Thọ', postalCode: '35000' },
      { name: 'Phú Yên', postalCode: '56000' },
      { name: 'Quảng Bình', postalCode: '47000' },
      { name: 'Quảng Nam', postalCode: '51000 - 52000' },
      { name: 'Quảng Ngãi', postalCode: '53000 - 54000' },
      { name: 'Quảng Ninh', postalCode: '01000 - 02000' },
      { name: 'Quảng Trị', postalCode: '48000' },
      { name: 'Sóc Trăng', postalCode: '96000' },
      { name: 'Sơn La', postalCode: '34000' },
      { name: 'Tây Ninh', postalCode: '80000' },
      { name: 'Thái Bình', postalCode: '06000' },
      { name: 'Thái Nguyên', postalCode: '24000' },
      { name: 'Thanh Hoá', postalCode: '40000 - 42000' },
      { name: 'Thừa Thiên Huế', postalCode: '49000' },
      { name: 'Tiền Giang', postalCode: '84000' },
      { name: 'Trà Vinh', postalCode: '87000' },
      { name: 'Tuyên Quang', postalCode: '22000' },
      { name: 'Vĩnh Long', postalCode: '85000' },
      { name: 'Vĩnh Phúc', postalCode: '15000' },
      { name: 'Yên Bái', postalCode: '33000' },
    ];

    const newCountry = await this.countryRepository.save({
      name: 'Việt Nam',
    });

    for (const cityData of cities) {
      const city = new City();
      city.name = cityData.name;
      city.postalCode = cityData.postalCode;
      city.country = newCountry;
      await this.cityRepository.save(city);
    }
  }
}
