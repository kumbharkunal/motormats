/**
 * Business details, as supplied by the client.
 *
 * The single place to edit: the contact page, footer copy, FAQ and the policy
 * pages all read from here, so correcting a value once fixes it everywhere.
 *
 * Values marked UNCONFIRMED have not been given to us and are still guesses.
 * Everything else came directly from the client.
 */
export const BUSINESS = {
  /** Trading name. */
  name: 'Motormats',

  /** Registered legal entity, used on the policy pages. */
  legalName: 'Motormats Pvt. Ltd.',

  /**
   * UNCONFIRMED — the client has not supplied an address yet. This is a guess
   * built from their own domain, so it may not route anywhere. Confirm it or
   * replace it before pointing customers at it.
   */
  email: 'support@motormats.in',

  /** Landline/mobile shown to customers. */
  phoneDisplay: '+91 81132 91083',

  /**
   * Digits only, country code first, no `+` or spaces — `wa.me/<number>` is
   * built from this, so a wrong value sends customers to a stranger.
   */
  whatsappNumber: '918113291083',

  address: {
    line1: 'Jeeya Moti, Outside Jassusar Gate',
    city: 'Bikaner',
    state: 'Rajasthan',
    postalCode: '334001',
    country: 'India',
  },

  /**
   * Google Maps embed for the contact page.
   *
   * APPROXIMATE — currently pinned on Jassusar Gate Park, the landmark the
   * address is given against, not the shopfront itself. Replace with the real
   * pin: Google Maps → the business → Share → Embed a map → copy the `src`.
   */
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d523.5677495716244!2d73.2980365614606!3d28.02050375994992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393fdd5d46f13209%3A0xd05550290986ca1d!2sJassusar%20Gate%20Park!5e0!3m2!1sen!2sin!4v1788810039682!5m2!1sen!2sin',

  /** UNCONFIRMED — support hours have not been supplied. */
  hours: 'Monday to Saturday, 10:00 – 19:00 IST',

  /** These four are asserted elsewhere on the storefront already. */
  freeShippingOverPaise: 299_900,
  warrantyYears: 1,
  /** UNCONFIRMED — return window and dispatch time are not yet confirmed policy. */
  returnWindowDays: 7,
  dispatchDays: '2 – 3 business days',
} as const;

/** Prefilled WhatsApp deep link. */
export const whatsappHref = `https://wa.me/${BUSINESS.whatsappNumber}`;

/** Single-line address, for schema markup and map links. */
export const addressLine = [
  BUSINESS.address.line1,
  BUSINESS.address.city,
  BUSINESS.address.state,
  BUSINESS.address.postalCode,
].join(', ');

/**
 * Built from the address rather than the embed, so "Open in Google Maps" still
 * points at the right place once the pin above is corrected.
 */
export const mapsSearchHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${BUSINESS.name}, ${addressLine}`,
)}`;

/** Last review date shown on the policy pages. */
export const POLICY_UPDATED = '7 September 2026';
