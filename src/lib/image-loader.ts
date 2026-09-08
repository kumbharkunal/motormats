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
