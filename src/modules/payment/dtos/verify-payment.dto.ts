import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly vnp_TmnCode: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsNotEmpty()
  readonly vnp_Amount: number;

  @ApiProperty()
  @IsNotEmpty()
  readonly vnp_BankCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly vnp_BankTranNo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  readonly vnp_CardType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly vnp_PayDate?: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly vnp_OrderInfo: string;

  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  readonly vnp_TransactionNo: number;

  @ApiProperty()
  @IsNotEmpty()
  readonly vnp_ResponseCode: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly vnp_TransactionStatus: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly vnp_TxnRef: string;

  @ApiPropertyOptional()
  @IsOptional()
  readonly vnp_SecureHashType?: 'SHA256' | 'HmacSHA512';

  @ApiProperty()
  @IsNotEmpty()
  readonly vnp_SecureHash: string;
}
