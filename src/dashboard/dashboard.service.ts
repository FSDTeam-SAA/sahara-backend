import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoryInfo, StoryInfoDocument } from '../story/storyInfo.schema';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from '../payment/payment.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(StoryInfo.name)
    private storyInfoModel: Model<StoryInfoDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
  ) {}

  /**
   * Get monthly usage analytics based on StoryInfo creation
   * Returns data for the last 12 months
   */
  async getUsageAnalytics(): Promise<{
    success: boolean;
    data: Array<{ year: number; month: number; count: number; label: string }>;
    message: string;
  }> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const usageData = await this.storyInfoModel.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          label: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    '',
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
                  ],
                  '$_id.month',
                ],
              },
              ' ',
              { $toString: '$_id.year' },
            ],
          },
        },
      },
    ]);

    return {
      success: true,
      data: usageData as Array<{
        year: number;
        month: number;
        count: number;
        label: string;
      }>,
      message: 'Usage analytics retrieved successfully',
    };
  }

  /**
   * Get monthly revenue trend based on completed payments
   * Returns data for the last 12 months
   */
  async getRevenueTrend(): Promise<{
    success: boolean;
    data: Array<{
      year: number;
      month: number;
      totalRevenue: number;
      transactionCount: number;
      label: string;
    }>;
    message: string;
  }> {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const revenueData = await this.paymentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveMonthsAgo },
          status: PaymentStatus.COMPLETED,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRevenue: { $sum: '$totalAmount' },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalRevenue: 1,
          transactionCount: 1,
          label: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    '',
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
                  ],
                  '$_id.month',
                ],
              },
              ' ',
              { $toString: '$_id.year' },
            ],
          },
        },
      },
    ]);

    return {
      success: true,
      data: revenueData as Array<{
        year: number;
        month: number;
        totalRevenue: number;
        transactionCount: number;
        label: string;
      }>,
      message: 'Revenue trend retrieved successfully',
    };
  }

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats() {
    const [usageAnalytics, revenueTrend] = await Promise.all([
      this.getUsageAnalytics(),
      this.getRevenueTrend(),
    ]);

    // Calculate totals
    const totalUsage = usageAnalytics.data.reduce(
      (sum: number, item: { count: number }) => sum + item.count,
      0,
    );
    const totalRevenue = revenueTrend.data.reduce(
      (sum: number, item: { totalRevenue: number }) => sum + item.totalRevenue,
      0,
    );
    const totalTransactions = revenueTrend.data.reduce(
      (sum: number, item: { transactionCount: number }) =>
        sum + item.transactionCount,
      0,
    );

    return {
      success: true,
      data: {
        usageAnalytics: usageAnalytics.data,
        revenueTrend: revenueTrend.data,
        summary: {
          totalUsage,
          totalRevenue,
          totalTransactions,
        },
      },
      message: 'Dashboard statistics retrieved successfully',
    };
  }
}
