import { Body, Get, Param, Post, Controller } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { Payment } from './payment.entity';
import { Roles } from '@decorators/roles.decorator';
import { RoleType } from '@constants/role-type';
import { VerifyPaymentDto } from './dtos/verify-payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Successfully.' })
  @ApiResponse({ status: 404, description: 'Room type not found.' })
  @Roles(RoleType.USER, RoleType.ADMIN)
  async find(@Param('id') roomTypeId: string): Promise<Payment> {
    return this.paymentService.find(roomTypeId);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Successfully.' })
  @Roles(RoleType.USER, RoleType.ADMIN)
  async findAll(): Promise<Payment[]> {
    return this.paymentService.findAll();
  }

  @Post()
  @ApiResponse({ status: 201, description: 'Create payment successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failure.' })
  @Roles(RoleType.USER)
  async verifyPayment(
    @Body() verifyPaymentDto: VerifyPaymentDto,
  ): Promise<any> {
    return this.paymentService.verifyPayment(verifyPaymentDto);
  }
}
