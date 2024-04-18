export interface VNPayQuery {
  vnp_Version: string;
  vnp_Command: 'pay';
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_BankCode?: string;
  vnp_CreateDate: string;
  vnp_CurrCode: 'VND';
  vnp_IpAddr: string;
  vnp_Locale: 'vn' | 'en';
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_ReturnUrl: string;
  vnp_ExpireDate: string;
  vnp_TxnRef: string;
  vnp_SecureHash?: string;
}
