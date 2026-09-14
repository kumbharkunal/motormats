const SHOW_ANNOUNCEMENTS = false;

const MESSAGES = [
  '15% off your first order with code DRIVE15',
  'Free shipping on orders over ₹2,999',
  'Precision-cut for your exact model',
] as const;

export function AnnouncementMarquee() {
  if (!SHOW_ANNOUNCEMENTS) return null;

  return (
    <div
      role="region"
      aria-label="Announcements"
      className="relative z-50 flex h-7 shrink-0 items-center overflow-hidden bg-accent text-white"
    >
      <div className="flex w-max animate-[marquee-scroll_38s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:justify-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1 || undefined}>
            {MESSAGES.map((message) => (
              <span
                key={message}
                className="mx-8 text-[0.6875rem] font-semibold tracking-[0.12em] whitespace-nowrap uppercase"
              >
                {message}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
