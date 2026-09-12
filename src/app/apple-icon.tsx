import { ImageResponse } from 'next/og';

/**
 * The iOS home-screen icon.
 *
 * iOS gives the icon no transparency and rounds the corners itself, so this
 * needs a filled ground of its own — `icon.svg` is transparent and would land
 * on whatever black or white iOS decides.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
      }}
    >
      <svg width="96" height="119" viewBox="28 23 92 114" fill="#E10600">
        <path d="M66 23V70L120 122V72L66 23Z" />
        <path d="M28 43V91L76 137V87L28 43Z" />
      </svg>
    </div>,
    size,
  );
}
