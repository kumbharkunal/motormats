'use client';

import { Children, type ReactNode, useCallback, useRef } from 'react';
import { A11y, EffectCreative, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper/types';
import { Swiper, SwiperSlide } from 'swiper/react';

import { useIsHydrated, useMediaQuery, usePrefersReducedMotion } from '@/hooks/use-media-query';

import 'swiper/css';
import 'swiper/css/effect-creative';

// 0% drift: the outgoing panel stays still — only the incoming panel slides over it.
const PREV_DRIFT = '0%';

const SPEED = 800;

// Accumulated across events: a trackpad sends many small deltas; a mouse notch sends one large one.
const WHEEL_TRAVEL = 40;

// Gap after which accumulated travel is discarded and a new gesture begins.
const GESTURE_GAP = 220;

type ScrollDeckProps = {
  banner?: ReactNode;
  headerOverlay?: ReactNode;
  headerSticky?: ReactNode;
  children: ReactNode;
};

type Direction = 1 | -1;

export function ScrollDeck({ banner, headerOverlay, headerSticky, children }: ScrollDeckProps) {
  const hydrated = useIsHydrated();
  const prefersReducedMotion = usePrefersReducedMotion();
  // 561px was optimistic: the panels only fit their own height from about 640px
  // up, and below that the deck silently clipped the products grid and footer.
  const isTallEnough = useMediaQuery('(min-height: 640px)', true);

  const controller = useRef<WheelController | null>(null);

  const bindDeckEvents = useCallback((swiper: SwiperInstance) => {
    const deck = new WheelController(swiper);
    controller.current = deck;

    swiper.on('transitionStart', markAnimating);
    swiper.on('transitionEnd', (instance) => {
      clearAnimating(instance);
      deck.onTransitionEnd();
      // Start video after transition, not during — a decode stall would eat animation frames.
      syncPanelVideos(instance);
    });

    swiper.el.addEventListener('wheel', deck.handleWheel, { passive: true });
    swiper.on('beforeDestroy', () => {
      swiper.el.removeEventListener('wheel', deck.handleWheel);
      controller.current = null;
    });

    syncPanelVideos(swiper);
  }, []);

  const useDeck = hydrated && !prefersReducedMotion && isTallEnough;

  if (!useDeck) {
    return (
      <div className="flow-shell flex min-h-svh flex-col">
        {banner}
        {headerSticky}
        <main id="main">{children}</main>
      </div>
    );
  }

  const panels = Children.toArray(children);

  return (
    <div className="deck-shell flex h-svh flex-col overflow-hidden">
      {banner}
      <div className="relative min-h-0 flex-1">
        {headerOverlay}
        <main id="main" className="h-full">
          <Swiper
            direction="vertical"
            slidesPerView={1}
            spaceBetween={0}
            speed={SPEED}
            effect="creative"
            creativeEffect={{
              limitProgress: 1,
              prev: { translate: [0, PREV_DRIFT, 0], opacity: 1 },
              next: { translate: [0, '100%', 0], opacity: 1 },
            }}
            keyboard={{ enabled: true, onlyInViewport: true, pageUpDown: true }}
            a11y={{
              enabled: true,
              containerMessage: 'Homepage sections',
              slideRole: 'group',
            }}
            resistanceRatio={0.85}
            threshold={5}
            longSwipesRatio={0.25}
            longSwipesMs={300}
            touchReleaseOnEdges={false}
            modules={[EffectCreative, Keyboard, A11y]}
            onSwiper={bindDeckEvents}
            className="h-full w-full"
          >
            {panels.map((panel, index) => (
              <SwiperSlide key={index} className="overflow-hidden shadow-[var(--shadow-panel)]">
                {panel}
              </SwiperSlide>
            ))}
          </Swiper>
        </main>
      </div>
    </div>
  );
}

class WheelController {
  private readonly swiper: SwiperInstance;
  private travel = 0;
  private reverseTravel = 0;
  private lastWheelAt = 0;
  private moving: Direction | null = null;
  private queued: Direction | null = null;

  constructor(swiper: SwiperInstance) {
    this.swiper = swiper;
  }

  handleWheel = (event: WheelEvent): void => {
    // deltaY === 0 happens on trackpads (sideways drift, flick tail) — ignore it.
    if (event.deltaY === 0) return;

    const now = event.timeStamp;
    if (now - this.lastWheelAt > GESTURE_GAP) this.travel = 0;
    this.lastWheelAt = now;

    const direction: Direction = event.deltaY > 0 ? 1 : -1;

    if (this.moving) {
      if (direction === this.moving) {
        this.reverseTravel = 0;
      } else {
        // Accumulate opposing travel — a few small trackpad deltas on finger-lift must not reverse the deck.
        this.reverseTravel += Math.abs(event.deltaY);
        if (this.reverseTravel >= WHEEL_TRAVEL) this.queued = direction;
      }
      return;
    }

    if (this.travel !== 0 && Math.sign(this.travel) !== direction) this.travel = 0;

    this.travel += event.deltaY;
    if (Math.abs(this.travel) < WHEEL_TRAVEL) return;

    this.travel = 0;
    this.move(direction);
  };

  onTransitionEnd = (): void => {
    this.moving = null;
    this.travel = 0;
    this.reverseTravel = 0;

    const queued = this.queued;
    this.queued = null;
    if (!queued) return;

    // rAF: Swiper zeroes duration at transition end, so moving synchronously would snap.
    requestAnimationFrame(() => {
      if (this.swiper.destroyed) return;
      this.move(queued);
    });
  };

  private move(direction: Direction): void {
    const { swiper } = this;
    if (direction === 1 ? swiper.isEnd : swiper.isBeginning) return;

    this.moving = direction;
    if (direction === 1) swiper.slideNext(SPEED);
    else swiper.slidePrev(SPEED);
  }
}

function markAnimating(swiper: SwiperInstance) {
  swiper.el.classList.add('deck-animating');
  swiper.el.classList.toggle('deck-reversing', swiper.activeIndex < swiper.previousIndex);
}

function clearAnimating(swiper: SwiperInstance) {
  swiper.el.classList.remove('deck-animating', 'deck-reversing');
}

function syncPanelVideos(swiper: SwiperInstance) {
  swiper.slides.forEach((slide, index) => {
    for (const video of Array.from(slide.querySelectorAll('video'))) {
      if (index === swiper.activeIndex) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    }
  });
}
