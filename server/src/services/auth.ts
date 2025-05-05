import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { Context } from '../types/context';

const secret = process.env.JWT_SECRET || 'mysecret';
const expiration = '2h';

// Function to sign token
export const signToken = ({ username, email, _id }: { username: string; email: string; _id: string }) => {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

// GraphQL-compatible context function
export const authMiddleware = ({ req }: { req: Request }): Context => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return {};
  }

  try {
    const { data } = jwt.verify(token, secret) as { data: Context['user'] };
    return { user: data };
