import { Body, Controller, Post, Headers, Get, Query, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import type { Request, Response } from 'express';
import { sendResponse } from '../common/utils/sendResponse';
// import Stripe from 'stripe';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) { }

  @Get()
  async getAllPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.findAll(Number(page), Number(limit));
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Payments retrieved successfully',
      data: result,
    });
  }

  @Post('create-checkout')
  createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createCheckout(dto);
  }

  // @Post('webhook')
  // async handleWebhook(
  //   @Req() req: Request,
  //   @Headers('stripe-signature') signature: string,
  // ) {
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  //     apiVersion: '2024-06-20',
  //   });

  //   const event = stripe.webhooks.constructEvent(
  //     req.body,
  //     signature,
  //     process.env.STRIPE_WEBHOOK_SECRET,
  //   );

  //   return this.paymentService.handleWebhook(event);
  // }
}
