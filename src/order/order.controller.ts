import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<ApiResponse> {
    const order = await this.orderService.createOrder(dto);

    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  @Get()
  async getAll(): Promise<ApiResponse> {
    const orders = await this.orderService.getAllOrders();

    return {
      success: true,
      message: 'Orders fetched successfully',
      data: orders,
    };
  }

  @Get('user/:userId')
  async getByUser(@Param('userId') userId: string): Promise<ApiResponse> {
    const orders = await this.orderService.getOrdersByUser(userId);

    return {
      success: true,
      message: 'User orders fetched successfully',
      data: orders,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<ApiResponse> {
    const updatedOrder = await this.orderService.updateOrderStatus(id, dto);

    return {
      success: true,
      message: 'Order status updated',
      data: updatedOrder,
    };
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string): Promise<ApiResponse> {
    await this.orderService.deleteOrder(id);

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  }
}
