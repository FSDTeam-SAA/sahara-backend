import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  // Create Order
  async createOrder(dto: CreateOrderDto) {
    const order = new this.orderModel(dto);
    return await order.save();
  }

  // Get all orders
  async getAllOrders() {
    return await this.orderModel
      .find()
      .populate('userId', 'name email')
      .populate('storyBookId');
  }

  // Get orders by userId
  async getOrdersByUser(userId: string) {
    return await this.orderModel.find({ userId }).populate('storyBookId');
  }

  // Update order status
  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto) {
    const updated = await this.orderModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Order not found');

    return updated;
  }

  // Delete an order
  async deleteOrder(id: string) {
    const deleted = await this.orderModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Order not found');

    return { message: 'Order deleted successfully' };
  }
}
