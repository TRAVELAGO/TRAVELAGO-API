import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Amenity } from './amenity.entity';

@Injectable()
export class AmenityService {
  constructor(
    @InjectRepository(Amenity)
    private readonly amenityRepository: Repository<Amenity>,
  ) {}

  async getAll(): Promise<Amenity[]> {
    return this.amenityRepository.find();
  }

  async seedData(): Promise<void> {
    // Tạo dữ liệu mới
    const amenities = [
      { name: 'Wi-Fi', description: 'Truy cập internet tốc độ cao' },
      { name: 'Bể Bơi', description: 'Bể bơi ngoài trời' },
      {
        name: 'Phòng Tập Gym',
        description: 'Phòng tập gym đầy đủ trang thiết bị',
      },
      { name: 'Nhà Hàng', description: 'Nhà hàng tại chỗ' },
      { name: 'Spa', description: 'Dịch vụ spa thư giãn' },
      { name: 'Giặt Ủi', description: 'Dịch vụ giặt là và là khô' },
      { name: 'Bãi Đậu Xe', description: 'Cơ sở đậu xe an toàn' },
      { name: 'Dịch Vụ Phòng', description: 'Dịch vụ phòng 24/7' },
      { name: 'Lễ Tân', description: 'Dịch vụ lễ tân chuyên nghiệp' },
      {
        name: 'Trung Tâm Kinh Doanh',
        description: 'Trung tâm kinh doanh đầy đủ trang thiết bị',
      },
      { name: 'Phòng Tập Thể Dục', description: 'Phòng tập thể dục hiện đại' },
      {
        name: 'Quán Bar/Lounge',
        description: 'Quán bar và không gian lounge thoải mái',
      },
      { name: 'Phòng Họp', description: 'Không gian họp và sự kiện linh hoạt' },
      {
        name: 'Đưa Đón Sân Bay',
        description: 'Dịch vụ đưa đón sân bay miễn phí',
      },
      {
        name: 'Cho Phép Vật Nuôi',
        description: 'Chỗ ở thân thiện với thú cưng',
      },
      { name: 'Cho Thuê Xe Đạp', description: 'Dịch vụ cho thuê xe đạp' },
      {
        name: 'Sân Chơi Trẻ Em',
        description: 'Sân chơi ngoài trời cho trẻ em',
      },
      { name: 'Sân Tennis', description: 'Sân tennis sẵn có' },
      { name: 'Lớp Học Yoga', description: 'Lớp học yoga và thiền hàng ngày' },
      { name: 'Cửa Hàng Quà Tặng', description: 'Cửa hàng quà tặng tại chỗ' },
      { name: 'Khu Vực BBQ', description: 'Khu vực nướng BBQ' },
      {
        name: 'Khu Vui Chơi Trẻ Em',
        description: 'Khu vui chơi trong nhà cho trẻ em',
      },
      { name: 'Thuê Xe Ô Tô', description: 'Dịch vụ thuê xe ô tô' },
      {
        name: 'Dịch Vụ Massage',
        description: 'Dịch vụ massage và chăm sóc cơ thể',
      },
      { name: 'Máy ATM', description: 'Máy rút tiền tự động' },
      {
        name: 'Khu Nghỉ Dưỡng Golf',
        description: 'Khu nghỉ dưỡng với sân golf',
      },
      {
        name: 'Trạm Phục Vụ Tour',
        description: 'Trạm phục vụ đặt tour du lịch',
      },
      {
        name: 'Nhà Hát/Phòng Triễn Lãm',
        description: 'Nhà hát hoặc phòng triễn lãm nội bộ',
      },
      {
        name: 'Tiệc Nướng Ngoài Trời',
        description: 'Dịch vụ tổ chức tiệc nướng ngoài trời',
      },
    ];

    await this.amenityRepository.save(amenities);
  }
}
