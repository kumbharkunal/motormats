import { z } from 'zod';

// NEXT_PUBLIC_* must be referenced with full static keys — Next inlines them at build time.
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  /**
   * Cloudinary folder holding the hero footage, e.g. "motormats/hero".
   * Optional on purpose: until the videos are uploaded the hero falls back to
   * the files in `public/video`, so a checkout without them still renders.
   */
  NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER: z.string().optional(),
  /**
   * ImageKit endpoint serving the deck photography in `public/`, e.g.
   * "https://ik.imagekit.io/motormats". Optional: unset, `src/lib/image-loader.ts`
   * serves the WebP files from `public/deck` directly.
   */
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.url().optional(),
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER: process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER,
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
  throw new Error(`Invalid public environment configuration: ${missing}. See .env.example.`);
}

export const clientEnv = parsed.data;
export type ClientEnv = typeof clientEnv;
