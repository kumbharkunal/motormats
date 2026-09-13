'use client';

import { ChevronsLeftRight } from 'lucide-react';
import { useCallback, useId, useRef, useState } from 'react';

import { MotormatsLogo } from '@/components/layout/motormats-logo';
import { cn } from '@/lib/utils';

export type MatZone = 'driver' | 'passenger' | 'rearLeft' | 'rearRight';

const VB = { w: 400, h: 480 };

const WELL: Record<MatZone, { short: string; d: string; cx: number; cy: number }> = {
  passenger: {
    short: 'Passenger',
    d: 'M 76 100 L 178 100 Q 184 168 176 250 L 74 256 Q 66 178 76 100 Z',
    cx: 124,
    cy: 178,
  },
  driver: {
    short: 'Driver',
    d: 'M 222 100 L 324 100 Q 334 178 326 256 L 224 250 Q 216 168 222 100 Z',
    cx: 276,
    cy: 178,
  },
  rearLeft: {
    short: 'Rear L',
    d: 'M 80 266 L 176 262 L 180 370 L 82 376 Q 74 322 80 266 Z',
    cx: 128,
    cy: 320,
  },
  rearRight: {
    short: 'Rear R',
    d: 'M 224 262 L 320 266 Q 328 322 318 376 L 220 370 L 224 262 Z',
    cx: 272,
    cy: 320,
  },
};

const CAR = {
  shadow: `M 200 28 C 270 30 330 48 352 88 L 362 400 Q 200 450 38 400 L 48 88 C 70 48 130 30 200 28 Z`,
  body: `M 200 22
    C 262 24 318 42 346 78
    L 360 122 Q 368 162 364 202
    Q 360 242 364 282
    L 354 382 Q 344 422 306 444
    C 266 464 134 464 94 444
    Q 56 422 46 382
    L 36 282 Q 32 242 36 202
    Q 32 162 40 122
    L 54 78 C 82 42 138 24 200 22 Z`,
  glass: `M 116 44 Q 200 34 284 44 L 274 90 Q 200 80 126 90 Z`,
  floor: `M 88 94 L 312 94 L 322 406 L 78 406 Z`,
  tunnel: `M 186 94 L 214 94 L 224 402 L 176 402 Z`,
  shifter: { x: 196, y: 150, w: 8, h: 22 },
  seatPassenger: `M 86 226 L 180 218 L 174 316 L 80 322 Q 74 270 86 226 Z`,
  seatDriver: `M 220 218 L 314 226 Q 326 270 320 322 L 226 316 L 220 218 Z`,
  seatRearLeft: `M 88 376 L 178 370 L 182 404 L 84 404 Z`,
  seatRearRight: `M 222 370 L 312 376 L 316 404 L 218 404 Z`,
  wheelFL: { cx: 52, cy: 166, rx: 26, ry: 20 },
  wheelFR: { cx: 348, cy: 166, rx: 26, ry: 20 },
  wheelRL: { cx: 52, cy: 366, rx: 26, ry: 20 },
  wheelRR: { cx: 348, cy: 366, rx: 26, ry: 20 },
  steering: { cx: 294, cy: 128, r: 15 },
  dash: `M 94 94 L 306 94 L 300 116 L 100 116 Z`,
  pedals: `M 248 218 L 256 218 L 254 238 L 246 236 Z M 258 224 L 266 225 L 264 244 L 256 242 Z`,
};

const ZONES: MatZone[] = ['passenger', 'driver', 'rearLeft', 'rearRight'];

function CarInterior({ uid }: { uid: string }) {
  const w = CAR;
  return (
    <g aria-hidden>
      <path d={w.shadow} fill="#000" fillOpacity={0.06} transform="translate(0, 6)" />
      <path d={w.body} fill={`url(#${uid}-body)`} stroke="#b8b8b8" strokeWidth="2" />
      {[w.wheelFL, w.wheelFR, w.wheelRL, w.wheelRR].map((wh, i) => (
        <g key={`wh-${i}`}>
          <ellipse cx={wh.cx} cy={wh.cy} rx={wh.rx} ry={wh.ry} fill="#f0f0f0" stroke="#c4c4c4" strokeWidth="1.5" />
          <ellipse cx={wh.cx} cy={wh.cy} rx={wh.rx * 0.55} ry={wh.ry * 0.55} fill="#e5e5e5" stroke="#d4d4d4" strokeWidth="1" />
        </g>
      ))}
      <path d={w.glass} fill={`url(#${uid}-glass)`} stroke="#94a3b8" strokeWidth="1.25" />
      <path d={w.floor} fill={`url(#${uid}-floor)`} stroke="none" />
      <path d={w.dash} fill="#e2e2e2" stroke="#cbd5e1" strokeWidth="1" />
      <path d={w.tunnel} fill="#d8d8d8" stroke="#bdbdbd" strokeWidth="1" />
      <rect x={w.shifter.x} y={w.shifter.y} width={w.shifter.w} height={w.shifter.h} rx={2} fill="#a3a3a3" />
      <path d={w.seatPassenger} fill={`url(#${uid}-seat)`} stroke="#c4c4c4" strokeWidth="1.25" />
      <path d={w.seatDriver} fill={`url(#${uid}-seat)`} stroke="#c4c4c4" strokeWidth="1.25" />
      <path d={w.seatRearLeft} fill={`url(#${uid}-seat)`} stroke="#c4c4c4" strokeWidth="1.25" />
      <path d={w.seatRearRight} fill={`url(#${uid}-seat)`} stroke="#c4c4c4" strokeWidth="1.25" />
      <circle cx={w.steering.cx} cy={w.steering.cy} r={w.steering.r} fill="#fafafa" stroke="#737373" strokeWidth="2.5" />
      <circle cx={w.steering.cx} cy={w.steering.cy} r={4} fill="#525252" />
      <path d={w.pedals} fill="#737373" />
      {ZONES.map((z) => (
        <path key={`carpet-${z}`} d={WELL[z].d} fill={`url(#${uid}-carpet)`} stroke="#c9c9c9" strokeWidth="1" />
      ))}
      <path d="M 88 94 L 88 406 M 312 94 L 312 406" stroke="#d1d5db" strokeWidth="1" fill="none" strokeDasharray="3 4" />
      <path d={w.body} fill="none" stroke="#a3a3a3" strokeWidth="1" opacity={0.5} />
    </g>
  );
}

function GenericMat({ d }: { d: string }) {
  return (
    <path
      d={d}
      fill="#e7e7e7"
      stroke="#a3a3a3"
      strokeWidth="2"
      strokeDasharray="7 5"
      opacity={0.95}
    />
  );
}

function PremiumMat({ d, patternId }: { d: string; patternId: string }) {
  return (
    <path d={d} fill={`url(#${patternId})`} stroke="#E10600" strokeWidth="2.5" />
  );
}

export function MatsFloorCompare({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const trackRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);

  const splitX = (split / 100) * VB.w;

  const setFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const { left, width } = track.getBoundingClientRect();
    setSplit(Math.min(100, Math.max(0, ((clientX - left) / width) * 100)));
  }, []);

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      dragging.current = true;
      trackRef.current?.setPointerCapture(event.pointerId);
      setFromClientX(event.clientX);
    },
    [setFromClientX],
  );

  const moveDrag = useCallback(
    (event: React.PointerEvent) => {
      if (!dragging.current) return;
      event.preventDefault();
      setFromClientX(event.clientX);
    },
    [setFromClientX],
  );

  const endDrag = useCallback((event: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    trackRef.current?.releasePointerCapture(event.pointerId);
  }, []);

  return (
    <div className={cn('mx-auto w-full max-w-5xl', className)}>
      <p className="mb-4 px-1 text-center text-sm text-muted-foreground sm:text-left">
        Drag the handle to compare generic mats (left) with Motormats (right).
      </p>

      <div
        ref={trackRef}
        className={cn(
          'relative cursor-ew-resize overflow-hidden rounded-2xl border border-border bg-white shadow-[0_20px_50px_-24px_rgba(0,0,0,0.15)] touch-none select-none md:rounded-3xl',
          'aspect-[4/5] max-h-[min(72vh,640px)] sm:max-h-none md:aspect-[400/480]',
        )}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          dragging.current = false;
        }}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split)}
        aria-label="Compare generic mats with Motormats premium mats"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setSplit((p) => Math.max(0, p - 3));
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            setSplit((p) => Math.min(100, p + 3));
          }
        }}
      >
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          role="img"
          aria-label="Top-down car floorplan comparing generic and premium mats"
        >
          <defs>
            <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fafafa" />
              <stop offset="100%" stopColor="#f0f0f0" />
            </linearGradient>
            <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dbeafe" stopOpacity={0.85} />
              <stop offset="100%" stopColor="#bfdbfe" stopOpacity={0.5} />
            </linearGradient>
            <pattern id={`${uid}-floor`} width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#efefef" />
              <path d="M0 12 L12 0" stroke="#e5e5e5" strokeWidth="0.5" />
            </pattern>
            <pattern id={`${uid}-carpet`} width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#e4e4e4" />
              <circle cx="2" cy="2" r="0.6" fill="#d4d4d4" />
            </pattern>
            <pattern id={`${uid}-seat`} width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#f3f3f3" />
              <line x1="0" y1="3" x2="6" y2="3" stroke="#e5e5e5" strokeWidth="0.75" />
            </pattern>
            <pattern id={`${uid}-premium`} width="14" height="14" patternUnits="userSpaceOnUse">
              <rect width="14" height="14" fill="#141414" />
              <path d="M0 7 H14" stroke="#2e2e2e" strokeWidth="1.5" />
            </pattern>
            <clipPath id={`${uid}-clip-left`} clipPathUnits="userSpaceOnUse">
              <rect x="0" y="0" width={splitX} height={VB.h} />
            </clipPath>
            <clipPath id={`${uid}-clip-right`} clipPathUnits="userSpaceOnUse">
              <rect x={splitX} y="0" width={VB.w - splitX} height={VB.h} />
            </clipPath>
          </defs>

          <rect width={VB.w} height={VB.h} fill="#ffffff" />

          <CarInterior uid={uid} />

          <g clipPath={`url(#${uid}-clip-left)`}>
            {ZONES.map((z) => (
              <GenericMat key={`g-${z}`} d={WELL[z].d} />
            ))}
          </g>
          <g clipPath={`url(#${uid}-clip-right)`}>
            {ZONES.map((z) => (
              <PremiumMat key={`p-${z}`} d={WELL[z].d} patternId={`${uid}-premium`} />
            ))}
          </g>

          {ZONES.map((id) => (
            <g key={`lbl-${id}`}>
              <rect
                x={WELL[id].cx - 34}
                y={WELL[id].cy - 10}
                width={68}
                height={20}
                rx={10}
                fill="#ffffff"
                fillOpacity={0.88}
              />
              <text
                x={WELL[id].cx}
                y={WELL[id].cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#374151"
                fontSize="11"
                fontWeight={600}
              >
                {WELL[id].short}
              </text>
            </g>
          ))}
        </svg>

        {/* Compare divider — only interactive control */}
        <div
          className="absolute inset-y-0 z-20 w-px bg-neutral-300 shadow-[0_0_0_1px_rgba(255,255,255,0.8)]"
          style={{ left: `${split}%` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-0 z-30 h-full w-12 -translate-x-1/2"
          style={{ left: `${split}%` }}
          aria-hidden
        >
          <div className="absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-md ring-1 ring-black/5 sm:size-12">
            <ChevronsLeftRight strokeWidth={1.75} className="size-4 sm:size-5" />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 bg-gradient-to-t from-white via-white/90 to-transparent px-3 pt-12 pb-3 sm:px-5 sm:pb-4">
          <span className="rounded-full border border-border bg-white/95 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm sm:text-xs">
            Generic mats
          </span>
          <span className="rounded-full border border-border bg-white/95 px-2 py-0.5 shadow-sm sm:px-3">
            <MotormatsLogo size="sm" tone="brand" className="!h-7 w-auto sm:!h-8" />
          </span>
        </div>
      </div>
    </div>
  );
}
