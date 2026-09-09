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
