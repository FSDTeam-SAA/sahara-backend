import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from './payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  // 1. Create Stripe Checkout Session
  async createCheckout(dto: CreatePaymentDto) {
    const { orderId, userId, totalAmount } = dto;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: 'test@example.com', // dynamic later
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: totalAmount * 100,
            product_data: {
              name: 'Order Payment',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    });

    // Save payment in DB
    const payment = await this.paymentModel.create({
      userId,
      orderId,
      totalAmount,
      status: PaymentStatus.IN_PROCESS,
      sessionId: session.id,
    });

    return { url: session.url, payment };
  }

  // 2. Verify / capture through Webhook
  async handleWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = session.payment_intent as string;

      await this.paymentModel.findOneAndUpdate(
        { sessionId: session.id },
        {
          status: PaymentStatus.COMPLETED,
          paymentIntentId,
          paymentMethod: session.payment_method_types?.[0] || 'card',
        },
      );
    }

    return { received: true };
  }
}
