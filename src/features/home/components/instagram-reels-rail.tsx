'use client';

import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { HomeReel } from '@/features/home/reels';

function ReelCard({
  reel,
  unmutedId,
  onUnmute,
}: {
  reel: HomeReel;
  unmutedId: string | null;
  onUnmute: (id: string | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const useEmbed = Boolean(reel.embedSrc);

  useEffect(() => {
    if (useEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    const shouldMute = unmutedId !== reel.id;
    video.muted = shouldMute;
    setMuted(shouldMute);
  }, [unmutedId, reel.id, useEmbed]);

  useEffect(() => {
    if (useEmbed) return;
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio >= 0.45) {
          video.muted = unmutedId !== reel.id;
          void video.play().then(() => setPlaying(true)).catch(() => undefined);
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: [0, 0.45, 0.6] },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [useEmbed, unmutedId, reel.id]);

  const togglePlay = useCallback(() => {
    if (useEmbed) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.muted = unmutedId !== reel.id;
      void video.play().then(() => setPlaying(true)).catch(() => undefined);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [unmutedId, reel.id, useEmbed]);

  const toggleMute = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (useEmbed) return;
      const video = videoRef.current;
      if (!video) return;
      if (muted) {
        onUnmute(reel.id);
        video.muted = false;
        setMuted(false);
        if (video.paused) {
          void video.play().then(() => setPlaying(true)).catch(() => undefined);
        }
      } else {
        onUnmute(null);
        video.muted = true;
        setMuted(true);
      }
    },
    [muted, onUnmute, reel.id, useEmbed],
  );

  return (
    <article ref={cardRef} className="flex h-full flex-col">
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-foreground shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)]">
        {useEmbed && reel.embedSrc ? (
          <iframe
            src={reel.embedSrc}
            title={reel.caption}
            className="absolute inset-0 size-full border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            loading="lazy"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 size-full cursor-pointer object-cover"
              poster={reel.poster}
              playsInline
              muted
              loop
              preload="metadata"
              onClick={togglePlay}
            >
              <source src={reel.videoSrc} type="video/mp4" />
            </video>
            {!playing ? (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`Play reel: ${reel.caption}`}
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg">
                  <Play aria-hidden className="ml-0.5 size-6 fill-current" />
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-transparent opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`Pause reel: ${reel.caption}`}
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-white/95 text-foreground shadow-lg">
                  <Pause aria-hidden className="size-6 fill-current" />
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={toggleMute}
              className="absolute bottom-3 left-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={muted ? 'Unmute reel' : 'Mute reel'}
            >
              {muted ? (
                <VolumeX aria-hidden className="size-4" />
              ) : (
                <Volume2 aria-hidden className="size-4" />
              )}
            </button>
          </>
        )}

        {reel.href ? (
          <Link
            href={reel.href}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label="Open on Instagram"
          >
            <span aria-hidden className="text-[0.65rem] font-bold tracking-tight">
              IG
            </span>
          </Link>
        ) : null}
      </div>
      <p className="mt-3 line-clamp-2 text-left text-sm leading-snug text-muted-foreground">{reel.caption}</p>
    </article>
  );
}

export function InstagramReelsRail({ reels }: { reels: HomeReel[] }) {
  const [unmutedId, setUnmutedId] = useState<string | null>(null);

  if (reels.length === 0) return null;

  return (
    <ul
      className="native-scroll -mx-5 mt-12 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto px-5 pb-2 [-ms-overflow-style:none] md:mt-16 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      data-native-scroll
      aria-label="Instagram reels"
    >
      {reels.map((reel) => (
        <li
          key={reel.id}
          className="w-[72%] max-w-[17rem] shrink-0 snap-center sm:w-[42%] md:max-w-[18rem] lg:w-auto lg:max-w-none"
        >
          <ReelCard reel={reel} unmutedId={unmutedId} onUnmute={setUnmutedId} />
        </li>
      ))}
    </ul>
  );
}
