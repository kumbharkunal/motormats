type LoaderArgs = {
  src: string;
  width: number;
  quality?: number | undefined;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * ImageKit serves everything that lives in `public/` (the deck photography).
 * Set `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` to an endpoint whose origin points at
 * this site, e.g. `https://ik.imagekit.io/motormats`. Unset, the files are
 * served straight from `public/` so a local checkout still renders.
 */
const IMAGEKIT_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/\/+$/, '');

/**
 * Whether a local file in `public/` can be resized per breakpoint.
 *
 * Without ImageKit there is no resizer in front of `public/`, so the loader can
 * only hand back the one master file it has. `next/image` detects a loader that
 * ignores `width`, warns, and builds a `srcset` of identical URLs. Call sites
 * pass this to `unoptimized` instead, which is the honest description of what
 * is happening and drops the dead srcset.
 */
export const canResizeLocalImages = Boolean(IMAGEKIT_ENDPOINT);

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;

  // Local public asset: ImageKit when configured, otherwise the raw file.
  if (src.startsWith('/')) {
    if (!IMAGEKIT_ENDPOINT) return src;
    return `${IMAGEKIT_ENDPOINT}${src}?tr=${imagekitTransforms(width, quality)}`;
  }

  if (/^https?:\/\//.test(src)) {
    // Already a Cloudinary delivery URL: inject transforms after /upload/.
    const marker = '/image/upload/';
    const at = src.indexOf(marker);
    if (at === -1) return src;
    const head = src.slice(0, at + marker.length);
    const tail = src.slice(at + marker.length);
    return `${head}${transforms(width, quality)}/${tail}`;
  }

  if (!CLOUD_NAME) return src;

  const publicId = src.replace(/^\/+/, '');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms(width, quality)}/${publicId}`;
}

/**
 * `c-at_max` and no height: ImageKit fits the image inside the requested width
 * and never crops, so a frame built at the file's own ratio shows all of it.
 * No `dpr` parameter — Next calls this loader once per srcset width already.
 */
function imagekitTransforms(width: number, quality?: number): string {
  return [`w-${width}`, `q-${quality ?? 82}`, 'f-auto', 'c-at_max'].join(',');
}

function transforms(width: number, quality?: number): string {
  return ['f_auto', `q_${quality ?? 'auto'}`, `w_${width}`, 'c_limit', 'dpr_auto'].join(',');
}

/** Absolute URL for `metadata.openGraph` and JSON-LD, where the loader cannot run. */
export function cloudinaryImageUrl(assetId: string, width = 1200): string | null {
  if (!assetId) return null;
  if (/^https?:\/\//.test(assetId)) return assetId;

  if (assetId.startsWith('/')) {
    if (!IMAGEKIT_ENDPOINT) return null;
    return `${IMAGEKIT_ENDPOINT}${assetId}?tr=w-${width},q-82,f-auto,c-at_max`;
  }

  if (!CLOUD_NAME) return null;
  const publicId = assetId.replace(/^\/+/, '');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width},c_limit/${publicId}`;
}

/**
 * Cloudinary video delivery URL. Falls back to the local path when the cloud
 * name is unset, so a checkout without credentials still renders.
 */
export function cloudinaryVideoUrl(name: string, fallback: string): string {
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER;
  if (!CLOUD_NAME || !folder) return fallback;
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${folder}/${name}`;
}

/** Whether hero footage is hosted, as opposed to a file in `public/`. */
export function hasCloudinaryVideo(): boolean {
  return Boolean(CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER);
}
