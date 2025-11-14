import { Body, Controller, Post, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Request } from 'express';
// import Stripe from 'stripe';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

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
