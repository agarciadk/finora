import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getAnalytics(
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
  ) {
    const now = new Date();

    return this.analyticsService.getAnalytics(
      month ?? now.getMonth() + 1,
      year ?? now.getFullYear(),
    );
  }
}
