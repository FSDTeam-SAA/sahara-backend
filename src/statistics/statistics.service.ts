import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Order, OrderDocument, OrderStatus } from '../order/order.schema';
import { Payment, PaymentDocument, PaymentStatus } from '../payment/payment.schema';
import { StoryInfo, StoryInfoDocument } from '../story/storyInfo.schema';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        @InjectModel(StoryInfo.name) private storyInfoModel: Model<StoryInfoDocument>,
    ) { }

    async getDashboardStats() {
        const now = new Date();
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total counts
        const totalUsers = await this.userModel.countDocuments();
        const totalOrders = await this.orderModel.countDocuments({
            status: OrderStatus.COMPLETED,
        });
        const totalStories = await this.storyInfoModel.countDocuments();

        // Revenue calculation (completed payments only)
        const revenueResult = await this.paymentModel.aggregate([
            { $match: { status: PaymentStatus.COMPLETED } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const totalRevenue = revenueResult[0]?.total || 0;

        // Last month counts
        const lastMonthUsers = await this.userModel.countDocuments({
            createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
        });
        const lastMonthOrders = await this.orderModel.countDocuments({
            status: OrderStatus.COMPLETED,
            createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
        });
        const lastMonthStories = await this.storyInfoModel.countDocuments({
            createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
        });
        const lastMonthRevenueResult = await this.paymentModel.aggregate([
            {
                $match: {
                    status: PaymentStatus.COMPLETED,
                    createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
                },
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const lastMonthRevenue = lastMonthRevenueResult[0]?.total || 0;

        // This month counts
        const thisMonthUsers = await this.userModel.countDocuments({
            createdAt: { $gte: thisMonthStart },
        });
        const thisMonthOrders = await this.orderModel.countDocuments({
            status: OrderStatus.COMPLETED,
            createdAt: { $gte: thisMonthStart },
        });
        const thisMonthStories = await this.storyInfoModel.countDocuments({
            createdAt: { $gte: thisMonthStart },
        });
        const thisMonthRevenueResult = await this.paymentModel.aggregate([
            {
                $match: {
                    status: PaymentStatus.COMPLETED,
                    createdAt: { $gte: thisMonthStart },
                },
            },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);
        const thisMonthRevenue = thisMonthRevenueResult[0]?.total || 0;

        // Calculate percentage changes
        const calculatePercentage = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Number((((current - previous) / previous) * 100).toFixed(2));
        };

        return {
            totalUsers,
            userGrowth: calculatePercentage(thisMonthUsers, lastMonthUsers),
            totalOrders,
            orderGrowth: calculatePercentage(thisMonthOrders, lastMonthOrders),
            totalRevenue,
            revenueGrowth: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            totalStories,
            storyGrowth: calculatePercentage(thisMonthStories, lastMonthStories),
        };
    }

    async getMonthlyRevenue() {
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(currentYear, 0, 1);

        const monthlyData = await this.paymentModel.aggregate([
            {
                $match: {
                    status: PaymentStatus.COMPLETED,
                    createdAt: { $gte: yearStart },
                },
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Create array with all 12 months (fill missing months with 0)
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        const result = monthNames.map((name, index) => {
            const monthData = monthlyData.find((m) => m._id === index + 1);
            return {
                month: name,
                revenue: monthData ? monthData.revenue : 0,
            };
        });

        return result;
    }
}
