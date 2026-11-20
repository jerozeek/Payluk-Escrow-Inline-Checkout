import React, { useCallback } from 'react';
import { useEscrowCheckout } from './useEscrowCheckout';
import {
    CHECKOUT_BUTTON_CSS,
    checkoutButtonClass,
    PAYLUK_ICON_PATH,
    type CheckoutButtonTheme
} from '../button';

export interface EscrowCheckoutButtonProps {
    /**
     * Single escrow payment token or array of payment tokens for multi-escrow checkout.
     */
    paymentToken: string | string[];
    reference: string;
    redirectUrl: string;
    /** Replaces the whole icon + text content. */
    children?: React.ReactNode;
    /** Button text after the Payluk icon. Default "Pay with Payluk". */
    label?: string;
    /** 'purple' (default) or 'white' for dark backgrounds. */
    theme?: CheckoutButtonTheme;
    disabled?: boolean;
    className?: string;
    title?: string;

    brand?: string;
    customerId?: string;
    logoUrl?: string;
    callback?: (result: any) => void;
    onClose?: () => void;
    extra?: Record<string, unknown>;
}

export function PaylukIcon() {
    return (
        <svg className="payluk-icon" viewBox="0 0 34 42" fill="currentColor" aria-hidden="true">
            <path d={PAYLUK_ICON_PATH} />
        </svg>
    );
}

/**
 * "Pay with Payluk" button that triggers pay(...) with your provided inputs.
 * The library handles both session creation and widget loading.
 */
export function EscrowCheckoutButton({
                                         paymentToken,
                                         reference,
                                         redirectUrl,
                                         brand,
                                         logoUrl,
                                         callback,
                                         onClose,
                                         extra,
                                         children,
                                         label = 'Pay with Payluk',
                                         theme,
                                         disabled,
                                         className,
                                         title,
                                         customerId
                                     }: EscrowCheckoutButtonProps) {
    const { loading, error, pay } = useEscrowCheckout();

    const handleClick = useCallback(async () => {
        try {
            await pay({
                paymentToken,
                reference,
                redirectUrl,
                brand,
                logoUrl,
                callback,
                onClose,
                extra,
                customerId
            });
        } catch {
            // Error state is already exposed via the hook.
        }
    }, [pay, paymentToken, reference, redirectUrl, brand, logoUrl, callback, onClose, extra, customerId]);

    return (
        <>
            {/* Rendered rather than injected so server-rendered pages are styled on first paint. */}
            <style>{CHECKOUT_BUTTON_CSS}</style>
            <button
                type="button"
                onClick={handleClick}
                disabled={disabled || loading}
                className={checkoutButtonClass(theme, className)}
                aria-busy={loading || undefined}
                title={title ?? (error ? error.message : undefined)}
            >
                {children ?? (
                    <>
                        <PaylukIcon />
                        <span>{label}</span>
                    </>
                )}
            </button>
        </>
    );
}
