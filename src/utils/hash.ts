import * as crypto from 'crypto';

export const generateSha512Hash = (input, secretKey) => {
  return crypto.createHmac('sha512', secretKey).update(input).digest('hex');
};
