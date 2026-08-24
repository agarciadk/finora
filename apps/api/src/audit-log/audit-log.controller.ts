import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUserService } from '../common/current-user/current-user.service';
import { AuditLogService } from './audit-log.service';
import { FindAuditLogsQueryDto } from './dto/find-audit-logs-query.dto';

@Controller('audit-logs')
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly currentUser: CurrentUserService,
  ) {}

  @Get()
  async findAll(@Query() query: FindAuditLogsQueryDto) {
    const userId = await this.currentUser.getUserId();

    return this.auditLogService.findAllForUser({
      userId,
      page: query.page,
      limit: query.limit,
    });
  }
}
