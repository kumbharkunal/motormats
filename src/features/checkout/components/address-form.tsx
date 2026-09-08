'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { createAddressAction } from '@/features/addresses/actions/address-actions';
import { addressInputSchema, INDIAN_STATES, type AddressInput } from '@/features/addresses/schemas';
import { cn } from '@/lib/utils';

/**
 * Address entry.
 *
 * Client validation is for feedback only — the same zod schema runs again on
 * the server, which is what actually protects the data. Server-side field
 * errors are mapped back onto the form so they appear next to the input rather
 * than only as a toast.
 */
export function AddressForm({
  onSaved,
  onCancel,
}: {
  onSaved: (publicId: string) => void;
  onCancel?: (() => void) | undefined;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressInputSchema),
    defaultValues: { state: 'Maharashtra' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await createAddressAction(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          setError(field as keyof AddressInput, { message: messages[0] });
        }
      }
      toast.error(result.message);
      return;
    }

    toast.success('Address saved');
    onSaved(result.data.publicId);
  });

  return (
    <form
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      noValidate className="border-border rounded-2xl border p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName?.message}>
          <input {...register('fullName')} autoComplete="name" className={inputClass} />
        </Field>

        <Field label="Mobile number" error={errors.phone?.message}>
          <input
            {...register('phone')}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            className={inputClass}
          />
        </Field>

        <Field label="Address" error={errors.line1?.message} className="sm:col-span-2">
          <input
            {...register('line1')}
            autoComplete="address-line1"
            placeholder="House, building, street"
            className={inputClass}
          />
        </Field>

        <Field label="Landmark (optional)" error={errors.line2?.message} className="sm:col-span-2">
          <input {...register('line2')} autoComplete="address-line2" className={inputClass} />
        </Field>

        <Field label="City" error={errors.city?.message}>
          <input {...register('city')} autoComplete="address-level2" className={inputClass} />
        </Field>

        <Field label="PIN code" error={errors.postalCode?.message}>
          <input
            {...register('postalCode')}
            inputMode="numeric"
            autoComplete="postal-code"
            className={inputClass}
          />
        </Field>

        <Field label="State" error={errors.state?.message} className="sm:col-span-2">
          <select {...register('state')} autoComplete="address-level1" className={inputClass}>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" isLoading={isSubmitting}>
          Save address
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

const inputClass =
  'border-border bg-surface h-12 w-full rounded-xl border px-4 text-sm focus-visible:border-accent';

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string | undefined;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="text-muted-foreground mb-1.5 block text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      {children}
      {error ? (
        <span role="alert" className="text-danger mt-1.5 block text-xs">
          {error}
        </span>
      ) : null}
    </label>
  );
}
