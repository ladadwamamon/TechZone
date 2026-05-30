import "express";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        username: string;
        fullName: string;
        role: string;
      };
      customer?: {
        id: string;
        email: string;
        fullName: string;
      };
    }
  }
}

export {};
