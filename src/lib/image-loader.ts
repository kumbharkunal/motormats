type LoaderArgs = {
  src: string;
  width: number;
  quality?: number | undefined;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  if (src.startsWith('/') || src.startsWith('data:') || src.startsWith('blob:')) return src;

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

function transforms(width: number, quality?: number): string {
  return ['f_auto', `q_${quality ?? 'auto'}`, `w_${width}`, 'c_limit', 'dpr_auto'].join(',');
}

/**
 * A fixed, absolute delivery URL for an asset id — for `metadata.openGraph` and
 * JSON-LD, where the consumer is a crawler rather than a browser.
 *
 * Those two places cannot use the loader above. It is wired into `next/image`
 * and only ever runs for a rendered element, so a bare public id written
 * straight into metadata stayed a bare public id: Next resolved it against
 * `metadataBase` and published `https://…/motormats/products/sport`, a path
 * that has never existed on our origin because the asset lives on Cloudinary.
 *
 * Returns null when no absolute URL can be built, so a caller omits the field
 * rather than publishing a link that 404s. `dpr_auto` is dropped deliberately:
 * there is no client hint on a crawler's request.
 */
export function cloudinaryImageUrl(assetId: string, width = 1200): string | null {
  if (!assetId) return null;
  if (/^https?:\/\//.test(assetId)) return assetId;
  if (!CLOUD_NAME) return null;

  const publicId = assetId.replace(/^\/+/, '');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width},c_limit/${publicId}`;
}

/**
 * Cloudinary video delivery URL.
 *
 * The hero footage used to be two MP4s committed to `public/` (4.9 MB), served
 * by the Node process itself on the LCP path of the homepage — no CDN, no edge
 * cache, and one fixed encode for every device. `f_auto` lets Cloudinary hand
 * WebM to Chrome and MP4 to Safari from a single upload.
 *
 * Falls back to the local path when the cloud name is unset, so a checkout
 * without Cloudinary credentials still renders.
 */
export function cloudinaryVideoUrl(name: string, fallback: string): string {
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER;
  if (!CLOUD_NAME || !folder) return fallback;
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${folder}/${name}`;
}

/**
 * Whether hero footage is actually hosted, as opposed to falling back to a file
 * in `public/`.
 *
 * The hero runs a still on the light theme: the old footage is graded dark, and
 * a light scrim over dark frames inverts the headline's contrast instead of
 * protecting it. The `<video>` path is kept, but it only renders once the client
 * uploads light-graded footage and sets the folder — so this is the switch, and
 * no rebuild is needed to flip it.
 */
export function hasCloudinaryVideo(): boolean {
  return Boolean(CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_VIDEO_FOLDER);
}
