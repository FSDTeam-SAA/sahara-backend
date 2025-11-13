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

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(dto);
  }

  @Get()
  getAll() {
    return this.orderService.getAllOrders();
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: string) {
    return this.orderService.getOrdersByUser(userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.orderService.updateOrderStatus(id, dto);
  }

  @Delete(':id')
  deleteOrder(@Param('id') id: string) {
    return this.orderService.deleteOrder(id);
  }
}
