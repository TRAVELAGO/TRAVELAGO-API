import { ConfigService } from '@nestjs/config';
import { VNPayQuery } from '@interfaces/vpn-pay.interface';
import { generateSha512Hash } from 'src/utils/hash';
import * as QueryString from 'qs';
import { VerifyPaymentDto } from '@modules/payment/dtos/verify-payment.dto';
import { VNPayQueryDR } from '@interfaces/vpn-query-dr.interface';
import { Booking } from '@modules/booking/booking.entity';
import { getVNPDate } from 'src/utils/date';
import { getServerIPAddress } from 'src/utils/network';
import { v4 as uuid } from 'uuid';
import { MAX_PAYMENT_TIME } from '@constants/constants';
import { addMinutes, format } from 'date-fns';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VNPayService {
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('VNP_HASH_SECRET');
  }

  getVNPayUrl = (url: string, queryData: VNPayQuery): string => {
    const signData = QueryString.stringify(queryData, { encode: false });
    const secureHash = generateSha512Hash(
      Buffer.from(signData, 'utf-8'),
      this.secretKey,
    );
    queryData['vnp_SecureHash'] = secureHash;

    return `${url}?${QueryString.stringify(queryData, { encode: false })}`;
  };

  sortVNPayQuery = (obj: any): any => {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }

    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  };

  verifyPaySecureHash = (verifyData: VerifyPaymentDto): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { vnp_SecureHash, vnp_SecureHashType, ...newVerifyData } = verifyData;
    const signData = QueryString.stringify(this.sortVNPayQuery(newVerifyData), {
      encode: false,
    });

    const verifyHash = generateSha512Hash(
      Buffer.from(signData, 'utf-8'),
      this.secretKey,
    );

    return verifyHash === vnp_SecureHash;
  };

  createQueryDR = (
    booking: Booking,
    verifyData: VerifyPaymentDto,
  ): VNPayQueryDR => {
    const vnPayQueryDR: VNPayQueryDR = {
      vnp_RequestId: `${uuid()}`,
      vnp_Version: this.configService.get<string>('VPN_VERSION'),
      vnp_Command: 'querydr',
      vnp_TmnCode: verifyData.vnp_TmnCode,
      vnp_TxnRef: verifyData.vnp_TxnRef,
      vnp_OrderInfo: `Query transaction ${verifyData.vnp_TransactionNo}.`,
      vnp_TransactionNo: verifyData.vnp_TransactionNo,
      vnp_TransactionDate: getVNPDate(booking.createdAt),
      vnp_CreateDate: getVNPDate(new Date()),
      vnp_IpAddr: getServerIPAddress(),
    };

    const vnp_SecureHash = generateSha512Hash(
      Buffer.from(
        `${vnPayQueryDR.vnp_RequestId}|${vnPayQueryDR.vnp_Version}|${vnPayQueryDR.vnp_Command}|${vnPayQueryDR.vnp_TmnCode}|${vnPayQueryDR.vnp_TxnRef}|${vnPayQueryDR.vnp_TransactionDate}|${vnPayQueryDR.vnp_CreateDate}|${vnPayQueryDR.vnp_IpAddr}|${vnPayQueryDR.vnp_OrderInfo}`,
        'utf-8',
      ),
      this.secretKey,
    );

    vnPayQueryDR.vnp_SecureHash = vnp_SecureHash;

    return vnPayQueryDR;
  };

  getPayQueryData = (booking: Booking, ipAddress: string): VNPayQuery => {
    const paymentAmount = booking.totalAmount - booking.totalDiscount;
    const expireTime = addMinutes(booking.createdAt, MAX_PAYMENT_TIME);

    return this.sortVNPayQuery({
      vnp_Version: this.configService.get('VPN_VERSION'),
      vnp_Command: 'pay',
      vnp_TmnCode: this.configService.get('VNP_TMN_CODE'),
      vnp_Amount: paymentAmount * 100,
      vnp_CreateDate: getVNPDate(booking.createdAt),
      vnp_ExpireDate: getVNPDate(expireTime),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: ipAddress,
      vnp_Locale: 'vn', // vn/en
      vnp_OrderInfo: `Vui long thanh toan so tien ${paymentAmount.toLocaleString()} de dat phong ${booking.room.name}. Vui long thanh toan truoc ${format(expireTime, 'H:mm dd/MM/yyyy')}.`,
      vnp_OrderType: '170000', // Code for Hotel & Tourism
      vnp_ReturnUrl: this.configService.get('VNP_RETURN_URL'),
      vnp_TxnRef: booking.id,
    });
  };
}
