import { ulid } from 'ulid';

export function newPublicId(): string {
  return ulid();
}

const ULID_PATTERN = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

export function isPublicId(value: unknown): value is string {
  return typeof value === 'string' && ULID_PATTERN.test(value);
}
