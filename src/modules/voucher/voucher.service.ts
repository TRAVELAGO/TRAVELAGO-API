import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from './voucher.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { SearchVoucherDto } from './dto/search-voucher.dto';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { isAdmin, isHotel } from 'src/utils/roles';
import { VoucherType } from '@constants/voucher-type';

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
  ) {}

  async find(voucherId: string): Promise<Voucher> {
    const existedVoucher = await this.voucherRepository.findOne({
      where: {
        id: voucherId,
      },
    });

    if (!existedVoucher) {
      throw new NotFoundException('Voucher id does not exist.');
    }

    return existedVoucher;
  }

  async findAll(searchVoucherDto: SearchVoucherDto): Promise<Voucher[]> {
    return await this.voucherRepository.find({
      where: {
        hotel: searchVoucherDto.hotelId && {
          id: searchVoucherDto.hotelId,
        },
      },
    });
  }

  async create(
    user: JwtPayloadType,
    createVoucherDto: CreateVoucherDto,
  ): Promise<Voucher> {
    const { hotelId, ...voucherDto } = createVoucherDto;

    if (isHotel(user) && !hotelId) {
      throw new BadRequestException('Missing hotelId.');
    }

    const newVoucher = await this.voucherRepository.create({
      ...voucherDto,
      hotel: hotelId && {
        id: hotelId,
      },
      createdBy: {
        id: user.id,
      },
      type: isHotel(user)
        ? VoucherType.ONLY_HOTEL
        : hotelId
          ? VoucherType.ONLY_HOTEL
          : VoucherType.ALL,
    });

    return await this.voucherRepository.save(newVoucher);
  }

  async update(
    user: JwtPayloadType,
    voucherId: string,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    const existedVoucher = await this.voucherRepository.findOne({
      where: {
        id: voucherId,
      },
      relations: {
        createdBy: true,
      },
    });

    if (!existedVoucher) {
      throw new NotFoundException('Voucher does not exist.');
    }

    if (!isAdmin(user) && user.id !== existedVoucher.createdBy.id) {
      throw new ForbiddenException();
    }

    this.voucherRepository.merge(existedVoucher, updateVoucherDto);

    return this.voucherRepository.save(existedVoucher);
  }

  async delete(user: JwtPayloadType, voucherId: string): Promise<void> {
    const conditions: any = { id: voucherId };
    if (isHotel(user)) {
      conditions.createdBy = { id: user.id };
    }

    const deletedVoucher = await this.voucherRepository.delete(conditions);

    if (!deletedVoucher.affected) {
      throw new NotFoundException('Voucher not found.');
    }
  }
}
