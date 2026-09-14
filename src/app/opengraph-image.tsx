import { ImageResponse } from 'next/og';

/**
 * The site-wide social card.
 *
 * Drawn rather than photographed. An AI still would need regenerating every
 * time the wordmark moved, and image models render type badly — the one thing
 * this card is mostly made of. Generated at build time and cached, so it costs
 * nothing per request.
 *
 * A route that wants its own card overrides this by exporting its own; the
 * product pages already supply their photography through `generateMetadata`.
 */
export const alt = 'Motormats — precision-cut custom-fit car mats';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Kept literal, not read from globals.css: satori resolves no custom properties.
const INK = '#101828';
const MUTED = '#475467';
const ACCENT = '#E10600';
const CANVAS = '#F6F7F9';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: CANVAS,
        padding: '96px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <svg width="86" height="106" viewBox="28 23 92 114" fill={ACCENT}>
          <path d="M66 23V70L120 122V72L66 23Z" />
          <path d="M28 43V91L76 137V87L28 43Z" />
        </svg>
        <div
          style={{
            display: 'flex',
            marginLeft: '28px',
            fontSize: '84px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: INK,
          }}
        >
          MOTOR<span style={{ color: ACCENT }}>MATS</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          width: '150px',
          height: '6px',
          background: ACCENT,
          marginTop: '56px',
        }}
      />

      <div
        style={{
          display: 'flex',
          marginTop: '40px',
          fontSize: '40px',
          color: INK,
          lineHeight: 1.3,
        }}
      >
        Precision-cut car mats, made to your exact floorpan.
      </div>

      <div style={{ display: 'flex', marginTop: '20px', fontSize: '28px', color: MUTED }}>
        Free shipping · Custom fit · Anti-skid backing
      </div>
    </div>,
    size,
  );
}
