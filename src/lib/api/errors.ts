export const ERROR_CODES = {
  // Auth
  UNAUTHENTICATED: 'Please sign in to continue.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  FORBIDDEN: "You don't have access to this.",
  OTP_INVALID: 'That code is incorrect or has expired. Please request a new one.',

  // Input
  VALIDATION_FAILED: 'Please check the highlighted fields and try again.',
  NOT_FOUND: "We couldn't find what you were looking for.",
  CONFLICT: 'That change conflicts with the current state. Please refresh and try again.',

  // Commerce
  CART_ITEM_UNAVAILABLE: 'Unable to add this product to your cart. Please try again.',
  OUT_OF_STOCK: 'This item just went out of stock.',
  INSUFFICIENT_STOCK: 'We no longer have enough of this item in stock.',
  COUPON_INVALID: 'That coupon code is not valid.',
  COUPON_EXPIRED: 'That coupon has expired.',
  COUPON_NOT_APPLICABLE: "That coupon doesn't apply to the items in your cart.",
  COUPON_ALREADY_USED: 'You have already used this coupon.',
  CART_EMPTY: 'Your cart is empty.',
  PRICE_CHANGED: 'Prices in your cart have changed. Please review and try again.',

  // Payment
  PAYMENT_FAILED: 'Your payment could not be completed. You have not been charged.',
  PAYMENT_VERIFICATION_FAILED: 'We could not verify this payment. Please contact support.',
  ORDER_ALREADY_PAID: 'This order has already been paid.',

  // Infrastructure
  RATE_LIMITED: 'Too many attempts. Please wait a moment and try again.',
  INTERNAL: 'Something went wrong on our end. Please try again.',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

const STATUS_BY_CODE: Partial<Record<ErrorCode, number>> = {
  UNAUTHENTICATED: 401,
  SESSION_EXPIRED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_FAILED: 422,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly fieldErrors: Record<string, string[]> | undefined;
  readonly detail: unknown;

  constructor(
    code: ErrorCode,
    options: { fieldErrors?: Record<string, string[]>; detail?: unknown; status?: number } = {},
  ) {
    super(ERROR_CODES[code]);
    this.name = 'AppError';
    this.code = code;
    this.status = options.status ?? STATUS_BY_CODE[code] ?? 400;
    this.fieldErrors = options.fieldErrors;
    this.detail = options.detail;
  }

  get userMessage(): string {
    return ERROR_CODES[this.code];
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
