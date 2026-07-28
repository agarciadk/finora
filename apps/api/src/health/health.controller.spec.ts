import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  HealthIndicatorResult,
  TerminusModule,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthCheckService: HealthCheckService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [HealthController],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
    healthCheckService = app.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
  });

  describe('check', () => {
    it('should return the health check result', async () => {
      const result: HealthIndicatorResult = { memory_heap: { status: 'up' } };
      jest.spyOn(healthCheckService, 'check').mockResolvedValue({
        status: 'ok',
        info: result,
        error: {},
        details: result,
      });

      await expect(healthController.check()).resolves.toEqual({
        status: 'ok',
        info: result,
        error: {},
        details: result,
      });
    });
  });
});
