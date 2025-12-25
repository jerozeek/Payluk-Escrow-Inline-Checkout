export type EscrowWidget = (options: Record<string, unknown>) => void;

export interface InitConfig {
    publicKey: string; // publishable key only
    /**
     * Optional overrides for experts. End users don't need to set these.
     */
    scriptUrlOverride?: string;
    globalName?: string; // default 'EscrowCheckout'
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

export interface PayInput {
    paymentToken: string;
    reference: string;
    redirectUrl: string;
    logoUrl?: string;
    brand?: string;
    customerId?: string;
    /**
     * Extra fields supported by the widget.
     */
    extra?: Record<string, unknown>;
    callback?: (result: any) => void;
    onClose?: () => void;
}

export interface SessionResponse {
    session: unknown;
}

const DEFAULT_SCRIPT_URL = 'https://checkout.payluk.ng/escrow-checkout.min.js';
const DEFAULT_GLOBAL_NAME = 'EscrowCheckout';

type ResolvedConfig = Required<Pick<InitConfig, 'publicKey'>> & {
    scriptUrl: string;
    globalName: string;
    crossOrigin: '' | 'anonymous' | 'use-credentials';
};

let CONFIG: ResolvedConfig | null = null;

/**
 * Initialize the library once (e.g., in app bootstrap).
 * Hides script URL and session creation from consumers.
 */
export function initEscrowCheckout(config: InitConfig): void {
    if (!config?.publicKey) throw new Error('initEscrowCheckout: "publicKey" is required.');
    CONFIG = {
        publicKey: config.publicKey,
        scriptUrl: config.scriptUrlOverride || DEFAULT_SCRIPT_URL,
        globalName: config.globalName || DEFAULT_GLOBAL_NAME,
        crossOrigin: config.crossOrigin ?? 'anonymous'
    };
}

/**
 * Narrow a provided config to ResolvedConfig or throw if not initialized.
 */
function assertConfigured(config: ResolvedConfig | null): asserts config is ResolvedConfig {
    if (!config) {
        throw new Error('Escrow checkout not initialized. Call initEscrowCheckout({ apiBaseUrl, publicKey }) first.');
    }
}

/**
 * Internal: load the widget script once and return the global function.
 */
async function loadWidget(): Promise<EscrowWidget> {
    assertConfigured(CONFIG);
    const { scriptUrl, globalName, crossOrigin } = CONFIG;

    if (typeof window === 'undefined') {
        throw new Error('EscrowCheckout can only be loaded in the browser.');
    }

    const win = window as any;
    win.__escrowCheckoutLoader ??= {};

    if (win.__escrowCheckoutLoader[scriptUrl]) {
        return win.__escrowCheckoutLoader[scriptUrl];
    }

    if (typeof win[globalName] === 'function') {
        const fn = win[globalName] as EscrowWidget;
        win.__escrowCheckoutLoader[scriptUrl] = Promise.resolve(fn);
        return fn;
    }

    win.__escrowCheckoutLoader[scriptUrl] = new Promise<EscrowWidget>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        if (crossOrigin) script.crossOrigin = crossOrigin;

        script.onload = () => {
            const fn = win[globalName];
            if (typeof fn === 'function') resolve(fn as EscrowWidget);
            else reject(new Error(`Escrow checkout script loaded, but window.${globalName} is not a function.`));
        };

        script.onerror = () => reject(new Error(`Failed to load escrow checkout script: ${scriptUrl}`));

        document.head.appendChild(script);
    });

    return win.__escrowCheckoutLoader[scriptUrl];
}

/**
 * Internal: create a checkout session by calling your API.
 * This is intentionally inside the lib (user doesn't implement it).
 */
async function createSession(input: PayInput): Promise<SessionResponse> {
    assertConfigured(CONFIG);
    const { publicKey } = CONFIG;
    const apiBaseUrl = publicKey.startsWith("pk_live_") ? 'https://live.payluk.ng' : 'https://staging.live.payluk.ng';

    const resp = await fetch(`${apiBaseUrl}/v1/checkout/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            paymentToken: input.paymentToken,
            redirectUrl: input.redirectUrl,
            reference: input.reference,
            customerId: input.customerId,
            publicKey
        })
    });

    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create session');
    }

    return (await resp.json()) as SessionResponse;
}

/**
 * Public API: create the session and open the widget.
 * Consumers only supply business inputs (no script URL, no API calls).
 */
export async function pay(input: PayInput): Promise<void> {
    if (typeof window === 'undefined') {
        throw new Error('pay(...) can only run in the browser.');
    }

    const [{ session }, widget] = await Promise.all([createSession(input), loadWidget()]);

    widget({
        session,
        logoUrl: input.logoUrl,
        brand: input.brand,
        callback: input.callback,
        onClose: input.onClose,
        customerId: input.customerId,
        ...(input.extra ?? {})
    });
}