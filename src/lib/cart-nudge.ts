import { toast } from 'sonner';

import type { AppDispatch } from '@/store';
import { cartNudgeTriggered } from '@/store/slices/ui-slice';

/** A confirmation, not an interruption. */
const ADDED_MS = 1000;

/**
 * Toast + header pulse when a line is added — shared by quick-add and PDP.
 *
 * **A second, and no controls.** This is an acknowledgement of something the
 * reader just did deliberately, not news they have to act on, so it gets the
 * shortest useful life rather than the 4.5s an error needs. That rules out the
 * "View cart" action and the close button that used to ride along with it —
 * neither is reachable inside a second, and a button that vanishes before it can
 * be pressed is worse than no button. The cart badge in the header pulses on the
 * same dispatch and stays there, which is the durable way back.
 */
export function nudgeCartAdded(
  dispatch: AppDispatch,
  productName: string,
  quantity = 1,
) {
  dispatch(cartNudgeTriggered());
  toast.success(quantity > 1 ? `${quantity} added to cart` : 'Added to cart', {
    description: productName,
    duration: ADDED_MS,
    closeButton: false,
  });
}
