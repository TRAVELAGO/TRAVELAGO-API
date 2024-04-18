import { Module } from '@nestjs/common';
import { VoucherController } from './voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { VoucherService } from './voucher.service';
import { JwtStrategy } from '@modules/auth/strategies/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher])],
  controllers: [VoucherController],
  providers: [VoucherService, JwtStrategy],
  exports: [TypeOrmModule],
})
export class VoucherModule {}
