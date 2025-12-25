import { useCallback, useEffect, useMemo, useState } from 'react';
import { pay as corePay } from '../index';

export interface UseEscrowCheckoutResult {
    ready: boolean;
    loading: boolean;
    error: Error | null;
    pay: typeof corePay;
}

/**
 * React hook that preloads the widget script (implicitly via pay) and exposes pay(...)
 * Since the library abstracts script loading and session creation, the hook is thin.
 */
export function useEscrowCheckout(): UseEscrowCheckoutResult {
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const normalizeError = useCallback((err: unknown): Error => {
        if (err instanceof Error) return err;
        if (typeof err === 'string') return new Error(err);
        return new Error('Unknown error');
    }, []);

    // Lazy mark "ready" after first successful pay or script load attempt.
    // If you want to preload the script earlier, you may trigger a no-op pay with a dry-run endpoint on your side.

    // Provide a stable pay function that reports loading state.
    const pay = useCallback<typeof corePay>(async (input) => {
        setLoading(true);
        try {
            await corePay(input);
            setReady(true);
            setError(null);
        } catch (e) {
            const normalized = normalizeError(e);
            setError(normalized);
            throw normalized;
        } finally {
            setLoading(false);
        }
    }, [normalizeError]);

    // In SSR, mark not loading
    useEffect(() => {
        if (typeof window === 'undefined') {
            setLoading(false);
        }
    }, []);

    return useMemo(() => ({ ready, loading, error, pay }), [ready, loading, error, pay]);
}
