import { RequestLoggingMiddleware } from './request-logging.middleware';

type FinishListener = () => void;

function createResponse(statusCode: number): {
  response: { statusCode: number; on: jest.Mock };
  emitFinish: () => void;
} {
  let finishListener: FinishListener | undefined;
  const response = {
    statusCode,
    on: jest.fn((event: string, listener: FinishListener) => {
      if (event === 'finish') {
        finishListener = listener;
      }
    }),
  };

  return {
    response,
    emitFinish: () => finishListener?.(),
  };
}

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
    logSpy = jest
      .spyOn(
        (middleware as unknown as { logger: { log: (msg: string) => void } })
          .logger,
        'log',
      )
      .mockImplementation(() => undefined);
  });

  it('logs method, path, status code and duration once the response finishes', () => {
    const request = { method: 'GET', originalUrl: '/accounts' };
    const { response, emitFinish } = createResponse(200);
    const next = jest.fn();

    middleware.use(request as never, response as never, next);
    emitFinish();

    expect(next).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(1);
    const [logLine] = logSpy.mock.calls[0] as [string];
    expect(logLine).toMatch(/^GET \/accounts 200 \d+ms$/);
  });

  it('includes the userId when the request is authenticated', () => {
    const request = {
      method: 'POST',
      originalUrl: '/accounts',
      user: { id: 'user-1' },
    };
    const { response, emitFinish } = createResponse(201);
    const next = jest.fn();

    middleware.use(request as never, response as never, next);
    emitFinish();

    const [logLine] = logSpy.mock.calls[0] as [string];
    expect(logLine).toMatch(/^POST \/accounts 201 \d+ms userId=user-1$/);
  });

  it('omits the userId when there is no authenticated user', () => {
    const request = { method: 'GET', originalUrl: '/health' };
    const { response, emitFinish } = createResponse(200);
    const next = jest.fn();

    middleware.use(request as never, response as never, next);
    emitFinish();

    const [logLine] = logSpy.mock.calls[0] as [string];
    expect(logLine).not.toContain('userId=');
  });

  it('logs the final status code even when it reflects an error response', () => {
    const request = { method: 'DELETE', originalUrl: '/accounts/1' };
    const { response, emitFinish } = createResponse(404);
    const next = jest.fn();

    middleware.use(request as never, response as never, next);
    emitFinish();

    const [logLine] = logSpy.mock.calls[0] as [string];
    expect(logLine).toMatch(/^DELETE \/accounts\/1 404 \d+ms$/);
  });
});
