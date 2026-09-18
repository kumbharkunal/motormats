/**
 * A UUID that exists outside a secure context.
 *
 * `crypto.randomUUID` is gated on a secure context, which `http://` on a LAN
 * address or a plain-http tunnel is not — so on every device the site is tested
 * from over the network the function is simply absent, and calling it throws
 * `crypto.randomUUID is not a function`. Checkout called it to mint the
 * idempotency key, so placing an order died at that line and the reader got the
 * error page.
 *
 * `crypto.getRandomValues` has no such gate and is available everywhere the app
 * runs, so the v4 layout is assembled from it by hand: set the version nibble to
 * 4 and the variant bits to 10, then format. The output is a real random v4 —
 * this is a portability shim, not a weaker id.
 *
 * `Math.random` is deliberately *not* a fallback. An idempotency key that
 * collides is an order that silently does not get placed, and there is no
 * environment the storefront runs in that has neither API.
 */
export function randomUUID(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Version 4, and the RFC 4122 variant.
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;

  const hex: string[] = [];
  for (const byte of bytes) hex.push(byte.toString(16).padStart(2, '0'));

  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}
