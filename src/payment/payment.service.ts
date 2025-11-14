import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY') || '',
      { apiVersion: '2025-10-29.clover' },
    );
  }

  // 1. Create Stripe Checkout Session
  async createCheckout(dto: CreatePaymentDto) {
    const { orderId, userId, totalAmount } = dto;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: 'test@example.com', // make dynamic later
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: totalAmount * 100,
            product_data: { name: 'Order Payment' },
          },
          quantity: 1,
        },
      ],
      success_url: `${this.configService.get('FRONTEND_URL')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/payment-cancel`,
    });

    await this.paymentModel.create({
      userId,
      orderId,
      totalAmount,
      status: PaymentStatus.IN_PROCESS,
      sessionId: session.id,
    });

    return { url: session.url };
  }

  // 2. Webhook Handler
  async handleWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      await this.paymentModel.findOneAndUpdate(
        { sessionId: session.id },
        {
          status: PaymentStatus.COMPLETED,
          paymentIntentId: session.payment_intent as string,
          paymentMethod: session.payment_method_types?.[0] ?? 'card',
        },
      );
    }
  }
}
