import type { Request, Response, NextFunction } from 'express';

export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/login');
  }
}

export function isAllowed(allowedEmails: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const email = (req.user as any)?.email;
    if (email && allowedEmails.includes(email)) {
      next();
    } else {
      res.status(403).render('denied');
    }
  };
}
