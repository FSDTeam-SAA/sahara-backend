import { Response } from 'express';

interface IApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

export function sendResponse<T>(
  res: Response,
  { statusCode, success, message, data }: IApiResponse<T>,
): void {
  res.status(statusCode).json({
    success,
    message,
    data: data || null,
  });
}
