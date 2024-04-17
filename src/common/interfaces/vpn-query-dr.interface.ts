export interface VNPayQueryDR {
  vnp_RequestId: string;
  vnp_Version: string;
  vnp_Command: 'querydr';
  vnp_TmnCode: string;
  vnp_TxnRef: string;
  vnp_OrderInfo: string;
  vnp_TransactionNo?: number;
  vnp_TransactionDate: string;
  vnp_CreateDate: string;
  vnp_IpAddr: string;
  vnp_SecureHash?: string;
}
