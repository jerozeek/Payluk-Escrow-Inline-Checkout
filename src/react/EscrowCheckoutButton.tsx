import React, { useCallback } from 'react';
import { useEscrowCheckout } from './useEscrowCheckout';

export interface EscrowCheckoutButtonProps {
    paymentToken: string;
    reference: string;
    redirectUrl: string;
    children?: React.ReactNode;
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

/**
 * Button that triggers pay(...) with your provided inputs.
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
                                         children = 'Pay',
                                         disabled,
                                         className,
                                         title,
                                         customerId
                                     }: EscrowCheckoutButtonProps) {
    const { ready, loading, error, pay } = useEscrowCheckout();

    const handleClick = useCallback(async () => {
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
    }, [pay, paymentToken, reference, redirectUrl, brand, logoUrl, callback, onClose, extra, customerId]);

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled || loading || !ready /* ready becomes true after first successful load */}
            className={className}
            aria-disabled={disabled || loading || !ready}
            title={title ?? (error ? error.message : undefined)}
        >
            {children}
        </button>
    );
}