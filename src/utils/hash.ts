import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export const generateSha512Hash = (input, secretKey) => {
  return crypto.createHmac('sha512', secretKey).update(input).digest('hex');
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRound = 10;
  const salt = await bcrypt.genSalt(saltRound);
  const hash = await bcrypt.hash(password, salt);

  return hash;
};
