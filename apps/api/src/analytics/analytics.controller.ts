import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { GetAnalyticsQueryDto } from './dto/get-analytics-query.dto';
import { AnalyticsEvolutionQueryDto } from './dto/analytics-evolution-query.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get income/expenses/savings-rate trends and the spending-by-category breakdown for a given month',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: Number,
    description: 'Month to analyze (1-12), defaults to the current month',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Year to analyze, defaults to the current year',
  })
  getAnalytics(@Query() query: GetAnalyticsQueryDto) {
    const now = new Date();

    return this.analyticsService.getAnalytics(
      query.month ?? now.getMonth() + 1,
      query.year ?? now.getFullYear(),
    );
  }

  @Get('evolution')
  @ApiOperation({
    summary:
      'Get the income/expenses/savings-rate evolution for the last N months, oldest to newest',
  })
  @ApiQuery({
    name: 'months',
    required: false,
    type: Number,
    description:
      'How many months of history to return, ending in the current month (default 6, max 12)',
  })
  getEvolution(@Query() query: AnalyticsEvolutionQueryDto) {
    return this.analyticsService.getEvolution(query.months);
  }
}
