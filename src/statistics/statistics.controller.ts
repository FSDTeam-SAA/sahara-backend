import { Controller, Get, Res } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import type { Response } from 'express';
import { sendResponse } from '../common/utils/sendResponse';

@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('dashboard')
    async getDashboardStats(@Res() res: Response) {
        const stats = await this.statisticsService.getDashboardStats();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: stats,
        });
    }

    @Get('monthly-revenue')
    async getMonthlyRevenue(@Res() res: Response) {
        const revenue = await this.statisticsService.getMonthlyRevenue();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Monthly revenue data retrieved successfully',
            data: revenue,
        });
    }
}
