import type { Request } from 'express';

export type AuthenticatedUser = {
  id: string;
  email: string;
  sessionId: string;
  /** Unix seconds (JWT `exp` claim) when the current access token expires. */
  exp: number;
};

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };
