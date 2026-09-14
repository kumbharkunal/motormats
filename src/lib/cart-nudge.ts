import { toast } from 'sonner';

import type { AppDispatch } from '@/store';
import { cartNudgeTriggered } from '@/store/slices/ui-slice';

/** Toast + header pulse when a line is added — shared by quick-add and PDP. */
export function nudgeCartAdded(
  dispatch: AppDispatch,
  productName: string,
  quantity = 1,
) {
  dispatch(cartNudgeTriggered());
  toast.success(quantity > 1 ? `${quantity} added to cart` : 'Added to cart', {
    description: productName,
    action: {
      label: 'View cart',
      onClick: () => {
        window.location.href = '/cart';
      },
    },
  });
}
