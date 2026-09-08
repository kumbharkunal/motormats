import { bigint, char, datetime, timestamp } from 'drizzle-orm/mysql-core';

export const primaryId = () => bigint({ mode: 'number', unsigned: true }).autoincrement();
export const publicId = () => char({ length: 26 });
export const foreignId = () => bigint({ mode: 'number', unsigned: true });
export const paise = () => bigint({ mode: 'number', unsigned: true });

// DATETIME rather than TIMESTAMP: TIMESTAMP caps at 2038, coupon expiries can exceed that.
export const dateTime = () => datetime({ mode: 'date' });

// No fractional seconds — drizzle-kit emits ON UPDATE without matching precision, MySQL rejects timestamp(3).
export const createdAt = () => timestamp({ mode: 'date' }).notNull().defaultNow();

export const updatedAt = () =>
  timestamp({ mode: 'date' }).notNull().defaultNow().onUpdateNow();

export const timestamps = () => ({
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
