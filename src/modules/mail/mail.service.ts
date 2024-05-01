import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Booking } from '@modules/booking/booking.entity';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { Payment } from '@modules/payment/payment.entity';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBookingSuccessMail(
    user: JwtPayloadType,
    booking: Booking,
  ): Promise<void> {
    this.mailerService.sendMail({
      to: user?.email,
      subject: 'Booking information',
      template: './booking-success',
      context: {
        userName: user.fullName,
        dateFrom: booking.dateFrom,
        dateTo: booking.dateTo,
        roomName: booking.room.name,
        hotelName: booking.room.hotel.name,
        paymentAmount: booking?.totalAmount,
        totalDiscount: booking?.totalDiscount,
        totalAmount: booking?.totalAmount + booking?.totalDiscount,
        paymentUrl: booking.paymentUrl,
      },
    });
  }

  async sendPaymentSuccessMail(
    booking: Booking,
    payment: Payment,
  ): Promise<void> {
    this.mailerService.sendMail({
      to: booking?.user?.email,
      subject: 'Payment successfully',
      template: './payment-success',
      context: {
        userName: booking?.user?.fullName,
        roomName: booking?.room?.name,
        hotelName: booking?.room?.hotel?.name,
        paymentAmount: booking?.totalAmount,
        amountPaid: payment.amount,
      },
    });
  }
}
