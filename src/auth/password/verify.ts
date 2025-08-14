import * as bcrypt from 'bcrypt';

export const verifyPassword = async (plainText: string, hash: string) => {
  return bcrypt.compare(plainText, hash);
};
