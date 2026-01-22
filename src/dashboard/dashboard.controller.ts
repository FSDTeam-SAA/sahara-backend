import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/usage-analytics
   * Returns monthly usage data for line graph
   * Shows how many stories were created each month
   */
  @Get('usage-analytics')
  async getUsageAnalytics() {
    return this.dashboardService.getUsageAnalytics();
  }

  /**
   * GET /dashboard/revenue-trend
   * Returns monthly revenue data for histogram graph
   * Shows revenue from completed payments each month
   */
  @Get('revenue-trend')
  async getRevenueTrend() {
    return this.dashboardService.getRevenueTrend();
  }

  /**
   * GET /dashboard/stats
   * Returns comprehensive dashboard statistics
   * Includes both usage analytics and revenue trend with summary
   */
  @Get('stats')
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }
}
