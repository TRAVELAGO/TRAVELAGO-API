import { PaymentMethod } from '@constants/payment-method';
import { PaymentStatus } from '@constants/payment-status';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  paymentMethod: PaymentMethod;

  @ApiProperty()
  status: PaymentStatus;

  @ApiProperty()
  paymentDate: Date;

  @ApiProperty()
  transactionCode: string;
}
