import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Voucher } from './voucher.entity';
import { Roles } from '@decorators/roles.decorator';
import { RoleType } from '@constants/role-type';
import { SearchVoucherDto } from './dto/search-voucher.dto';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';

@ApiTags('Vouchers')
@Controller('vouchers')
export class VoucherController {
  constructor(private voucherService: VoucherService) {}

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully.' })
  @ApiResponse({ status: 404, description: 'Voucher not found.' })
  async find(@Param('id') voucherId: string): Promise<Voucher> {
    return this.voucherService.find(voucherId);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Successfully.' })
  async findAll(
    @Query() searchVoucherDto: SearchVoucherDto,
  ): Promise<Voucher[]> {
    return this.voucherService.findAll(searchVoucherDto);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Create voucher successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @Roles(RoleType.ADMIN, RoleType.HOTEL)
  async create(
    @GetJwtPayload() user: JwtPayloadType,
    @Body() createVoucherDto: CreateVoucherDto,
  ): Promise<Voucher> {
    return this.voucherService.create(user, createVoucherDto);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update voucher successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @ApiResponse({ status: 404, description: 'Voucher not found.' })
  @Roles(RoleType.ADMIN, RoleType.HOTEL)
  async update(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') voucherId: string,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    return this.voucherService.update(user, voucherId, updateVoucherDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Delete voucher successfully.' })
  @ApiResponse({ status: 404, description: 'Voucher not found.' })
  @Roles(RoleType.ADMIN, RoleType.HOTEL)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('id') voucherId: string,
  ): Promise<void> {
    return await this.voucherService.delete(user, voucherId);
  }
}
