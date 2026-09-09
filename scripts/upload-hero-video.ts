/**
 * Uploads the hero footage to Cloudinary. Run once, by hand.
 *
 *   npx tsx scripts/upload-hero-video.ts
 *
 * Then set NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER to the folder printed at the
 * end, restart the dev server, confirm the hero still plays, and only then
 * delete public/video/*.mp4 — 4.9 MB that CLAUDE.md says should never have been
 * committed in the first place.
 *
 * Uses Cloudinary's REST endpoint directly rather than adding the SDK for one
 * script. Credentials come from the server env, which is already validated.
 */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const FOLDER = 'motormats/hero';

const ASSETS = [
  { file: 'public/video/hero-desktop.mp4', publicId: 'hero-desktop' },
  { file: 'public/video/hero-mobile.mp4', publicId: 'hero-mobile' },
];

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. See .env.example.`);
  return value;
}

/** Cloudinary signs the alphabetically-sorted params with the API secret. */
function sign(params: Record<string, string>, secret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1')
    .update(payload + secret)
    .digest('hex');
}

async function upload(file: string, publicId: string): Promise<string> {
  const cloudName = required('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  const apiKey = required('CLOUDINARY_API_KEY');
  const apiSecret = required('CLOUDINARY_API_SECRET');

  const bytes = await readFile(path.resolve(process.cwd(), file));
  const timestamp = String(Math.floor(Date.now() / 1000));

  const signed = { folder: FOLDER, public_id: publicId, timestamp };
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(bytes)]), path.basename(file));
  form.set('api_key', apiKey);
  form.set('signature', sign(signed, apiSecret));
  for (const [key, value] of Object.entries(signed)) form.set(key, value);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    throw new Error(`${file}: ${response.status} ${await response.text()}`);
  }

  const result = (await response.json()) as { secure_url: string };
  return result.secure_url;
}

async function main(): Promise<void> {
  for (const asset of ASSETS) {
    const mb = ((await readFile(asset.file)).byteLength / 1024 / 1024).toFixed(2);
    process.stdout.write(`uploading ${asset.file} (${mb} MB)… `);
    process.stdout.write(`${await upload(asset.file, asset.publicId)}\n`);
  }

  process.stdout.write(`\nDone. Now set:\n  NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER="${FOLDER}"\n`);
  process.stdout.write('Restart, confirm the hero plays, then delete public/video/*.mp4\n');
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
