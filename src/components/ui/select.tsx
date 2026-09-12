'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/utils';

/** Room the list wants below the field before it gives up and flips above it. */
const PREFERRED_HEIGHT = 288;
const VIEWPORT_MARGIN = 12;
const GAP = 6;
/** How long a typed run stays one search term, matching native select behaviour. */
const TYPEAHEAD_RESET_MS = 700;

type Position = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

/**
 * Listbox select.
 *
 * A native `<select>` hands its popup to the OS: a white list with a blue
 * selected row that no CSS can reach, and on a long list it runs off the bottom
 * of the window. The same reasoning already replaced the cart's quantity
 * `<select>` — see `quantity-stepper.tsx`.
 *
 * Hand-rolled rather than pulling in a select primitive, following the account
 * menu's precedent. What that would buy is the ARIA wiring, roving highlight,
 * typeahead and collision handling below, which are all here.
 *
 * The list renders in a portal and positions itself with `fixed`, so no
 * `overflow` or stacking context on the way up can clip it, and it measures the
 * space around the field on every open, scroll and resize rather than assuming
 * it opens downward.
 */
export function Select({
  value,
  onChange,
  options,
  id,
  placeholder = 'Select…',
  disabled = false,
  invalid = false,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  options: readonly string[];
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<Position | null>(null);

  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ term: '', timer: 0 });
  /**
   * Whether the active row was chosen by keyboard, and so should be dragged
   * into view. Hovering must never do it: a wheel or touch scroll slides rows
   * under a stationary pointer, which fires `pointermove`, and scrolling back
   * to that row would fight the person doing the scrolling.
   */
  const followActive = useRef(false);

  const listId = useId();
  const optionId = (index: number) => `${listId}-option-${index}`;

  const place = useCallback(() => {
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;

    const below = window.innerHeight - rect.bottom - GAP - VIEWPORT_MARGIN;
    const above = rect.top - GAP - VIEWPORT_MARGIN;
    // Flip only when below is genuinely too tight and above is roomier, so the
    // list does not jump sides for a few pixels.
    const dropDown = below >= Math.min(PREFERRED_HEIGHT, above) || below >= above;

    setPosition({
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(140, Math.min(PREFERRED_HEIGHT, dropDown ? below : above)),
      ...(dropDown ? { top: rect.bottom + GAP } : { bottom: window.innerHeight - rect.top + GAP }),
    });
  }, []);

  // Before paint, so the list never shows for a frame in the wrong place.
  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;

    const reposition = () => place();
    // `true` so a scroll inside any ancestor repositions too, not just the page.
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (trigger.current?.contains(target) || list.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, place]);

  // `position` is in the deps because the list only mounts once it has one:
  // on open this runs first with nothing to scroll, then again once it is there.
  useEffect(() => {
    if (!open || activeIndex < 0 || !followActive.current) return;
    const row = document.getElementById(`${listId}-option-${activeIndex}`);
    if (!row) return;
    followActive.current = false;
    row.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, position, listId]);

  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  function openList() {
    if (disabled) return;
    const selected = options.indexOf(value);
    followActive.current = true;
    setActiveIndex(selected >= 0 ? selected : 0);
    setOpen(true);
  }

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }

  function commit(index: number) {
    const next = options[index];
    if (next === undefined) return;
    onChange(next);
    close();
  }

  /** Keyboard movement only — hover uses `setActiveIndex` directly. */
  function moveTo(index: number) {
    if (options.length === 0) return;
    followActive.current = true;
    setActiveIndex(Math.max(0, Math.min(options.length - 1, index)));
  }

  /** Type-to-jump, the one native-select affordance people notice missing. */
  function search(char: string) {
    window.clearTimeout(typeahead.current.timer);
    typeahead.current.term += char.toLowerCase();
    typeahead.current.timer = window.setTimeout(() => {
      typeahead.current.term = '';
    }, TYPEAHEAD_RESET_MS);

    const term = typeahead.current.term;
    const found = options.findIndex((option) => option.toLowerCase().startsWith(term));
    if (found >= 0) moveTo(found);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveTo(activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveTo(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        moveTo(0);
        break;
      case 'End':
        event.preventDefault();
        moveTo(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        // Let focus leave naturally, but do not strand an open list behind it.
        close(false);
        break;
      default:
        if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault();
          search(event.key);
        }
    }
  }

  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 text-left text-sm transition-colors duration-200',
          'focus-visible:border-accent focus-visible:outline-none',
          open && 'border-accent',
          invalid && 'border-danger',
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-border-strong',
          className,
        )}
      >
        <span className={cn('truncate', !value && 'text-subtle-foreground')}>
          {value || placeholder}
        </span>
        <ChevronDown
          aria-hidden
          size={16}
          className={cn(
            'shrink-0 text-muted-foreground transition-motion duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && position
        ? createPortal(
            <ul
              ref={list}
              id={listId}
              role="listbox"
              tabIndex={-1}
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
              onKeyDown={onKeyDown}
              onBlur={(event) => {
                // Only when focus actually leaves the list, not on a row click.
                if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
              }}
              style={{
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
                ...(position.top !== undefined ? { top: position.top } : {}),
                ...(position.bottom !== undefined ? { bottom: position.bottom } : {}),
              }}
              className="fixed z-[150] overflow-y-auto overscroll-contain rounded-xl border border-border-strong bg-surface p-1.5 shadow-raised focus:outline-none"
            >
              {options.map((option, index) => {
                const selected = option === value;
                const active = index === activeIndex;

                return (
                  <li
                    key={option}
                    id={optionId(index)}
                    role="option"
                    aria-selected={selected}
                    onClick={() => commit(index)}
                    onPointerMove={() => setActiveIndex(index)}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 text-sm transition-colors duration-150',
                      active ? 'bg-accent/12 text-foreground' : 'text-foreground/80',
                      selected && 'font-semibold',
                    )}
                  >
                    <span className="truncate">{option}</span>
                    {selected ? (
                      <Check aria-hidden size={15} className="shrink-0 text-accent-text" />
                    ) : null}
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null}
    </>
  );
}
