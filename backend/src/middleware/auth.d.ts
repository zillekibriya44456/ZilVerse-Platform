import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        role: string;
        email?: string;
        name?: string;
    };
}
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => any;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => any;
//# sourceMappingURL=auth.d.ts.map