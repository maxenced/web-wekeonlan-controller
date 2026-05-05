import { describe, it, expect, vi } from 'vitest';
import { isAuthenticated, isAllowed } from '../../src/auth/middleware.js';
import type { Request, Response, NextFunction } from 'express';

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    isAuthenticated: () => false,
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function mockRes(): Response {
  const res = {
    redirect: vi.fn(),
    status: vi.fn().mockReturnThis(),
    render: vi.fn(),
  } as unknown as Response;
  return res;
}

describe('isAuthenticated', () => {
  it('calls next when user is authenticated', () => {
    const req = mockReq({ isAuthenticated: () => true });
    const res = mockRes();
    const next = vi.fn();
    isAuthenticated(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('redirects to /auth/login when not authenticated', () => {
    const req = mockReq({ isAuthenticated: () => false });
    const res = mockRes();
    const next = vi.fn();
    isAuthenticated(req, res, next);
    expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    expect(next).not.toHaveBeenCalled();
  });
});

describe('isAllowed', () => {
  it('calls next when user email is in allowlist', () => {
    const allowedEmails = ['alice@example.com', 'bob@example.com'];
    const middleware = isAllowed(allowedEmails);
    const req = mockReq({
      isAuthenticated: () => true,
      user: { email: 'alice@example.com' } as any,
    });
    const res = mockRes();
    const next = vi.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('renders denied page when email not in allowlist', () => {
    const allowedEmails = ['alice@example.com'];
    const middleware = isAllowed(allowedEmails);
    const req = mockReq({
      isAuthenticated: () => true,
      user: { email: 'eve@example.com' } as any,
    });
    const res = mockRes();
    const next = vi.fn();
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.render).toHaveBeenCalledWith('denied');
    expect(next).not.toHaveBeenCalled();
  });
});
