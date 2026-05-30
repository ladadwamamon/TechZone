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
    }
  }
}

export {};
