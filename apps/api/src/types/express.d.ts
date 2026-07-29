declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: string;
        type: "ADMIN" | "PENSIONER";
        role?: string;
      };
    }
  }
}

export {};
