export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const assertCondition = (condition: boolean, message: string, statusCode = 400) => {
  if (!condition) {
    throw new AppError(message, statusCode);
  }
};

