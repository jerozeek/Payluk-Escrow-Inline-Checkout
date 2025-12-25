export type EscrowWidget = (options: Record<string, unknown>) => void;

export type EscrowCheckoutErrorCode =
    | 'NOT_INITIALIZED'
    | 'BROWSER_ONLY'
    | 'INVALID_INPUT'
    | 'WIDGET_LOAD'
    | 'NETWORK'
    | 'SESSION_CREATE'
    | 'SESSION_RESPONSE';

export class EscrowCheckoutError extends Error {
    code: EscrowCheckoutErrorCode;
    status?: number;
    details?: unknown;

    constructor(message: string, code: EscrowCheckoutErrorCode, options?: { status?: number; details?: unknown }) {
        super(message);
        this.name = 'EscrowCheckoutError';
        this.code = code;
        this.status = options?.status;
        this.details = options?.details;
    }
}

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
    if (!isNonEmptyString(config?.publicKey)) {
        throw new EscrowCheckoutError('initEscrowCheckout(...) requires "publicKey".', 'INVALID_INPUT');
    }
    CONFIG = {
        publicKey: config.publicKey.trim(),
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
        throw new EscrowCheckoutError(
            'Escrow checkout not initialized. Call initEscrowCheckout({ publicKey }) first.',
            'NOT_INITIALIZED'
        );
    }
}

function normalizeError(error: unknown): Error {
    if (error instanceof Error) return error;
    if (typeof error === 'string') return new Error(error);
    return new Error('Unknown error');
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function isSessionResponse(value: unknown): value is SessionResponse {
    if (!value || typeof value !== 'object') return false;
    return 'session' in value;
}

async function parseErrorBody(resp: Response): Promise<{ message?: string; details?: unknown }> {
    const text = await resp.text();
    if (!text) return {};

    try {
        const json = JSON.parse(text) as { message?: unknown };
        const message = typeof json?.message === 'string' ? json.message : undefined;
        return { message, details: json };
    } catch {
        return { message: text, details: text };
    }
}

async function parseJsonResponse(resp: Response): Promise<unknown> {
    try {
        return await resp.json();
    } catch {
        throw new EscrowCheckoutError('Invalid JSON response from session endpoint.', 'SESSION_RESPONSE', {
            status: resp.status
        });
    }
}

/**
 * Internal: load the widget script once and return the global function.
 */
async function loadWidget(): Promise<EscrowWidget> {
    assertConfigured(CONFIG);
    const { scriptUrl, globalName, crossOrigin } = CONFIG;

    if (typeof window === 'undefined') {
        throw new EscrowCheckoutError('EscrowCheckout can only be loaded in the browser.', 'BROWSER_ONLY');
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
            else {
                reject(
                    new EscrowCheckoutError(
                        `Escrow checkout script loaded, but window.${globalName} is not a function.`,
                        'WIDGET_LOAD'
                    )
                );
            }
        };

        script.onerror = () =>
            reject(new EscrowCheckoutError(`Failed to load escrow checkout script: ${scriptUrl}`, 'WIDGET_LOAD'));

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
    const apiBaseUrl = publicKey.startsWith('pk_live_') ? 'https://live.payluk.ng' : 'https://staging.live.payluk.ng';
    let resp: Response;

    try {
        resp = await fetch(`${apiBaseUrl}/v1/checkout/session`, {
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
    } catch (error) {
        const normalized = normalizeError(error);
        throw new EscrowCheckoutError('Network error while creating checkout session.', 'NETWORK', {
            details: normalized.message
        });
    }

    if (!resp.ok) {
        const { message, details } = await parseErrorBody(resp);
        throw new EscrowCheckoutError(message || `Failed to create session (HTTP ${resp.status}).`, 'SESSION_CREATE', {
            status: resp.status,
            details
        });
    }

    const data = await parseJsonResponse(resp);
    if (!isSessionResponse(data)) {
        throw new EscrowCheckoutError('Session response missing "session".', 'SESSION_RESPONSE', {
            status: resp.status,
            details: data
        });
    }

    return data as SessionResponse;
}

/**
 * Public API: create the session and open the widget.
 * Consumers only supply business inputs (no script URL, no API calls).
 */
export async function pay(input: PayInput): Promise<void> {
    if (typeof window === 'undefined') {
        throw new EscrowCheckoutError('pay(...) can only run in the browser.', 'BROWSER_ONLY');
    }

    assertConfigured(CONFIG);
    if (!input || !isNonEmptyString(input.paymentToken)) {
        throw new EscrowCheckoutError('pay(...) requires "paymentToken".', 'INVALID_INPUT');
    }
    if (!isNonEmptyString(input.reference)) {
        throw new EscrowCheckoutError('pay(...) requires "reference".', 'INVALID_INPUT');
    }
    if (!isNonEmptyString(input.redirectUrl)) {
        throw new EscrowCheckoutError('pay(...) requires "redirectUrl".', 'INVALID_INPUT');
    }

    const [{ session }, widget] = await Promise.all([createSession(input), loadWidget()]);

    widget({
        session,
        logoUrl: input.logoUrl,
        brand: input.brand,
        callback: input.callback,
        onClose: input.onClose,
        customerId: input.customerId,
        publicKey: CONFIG.publicKey,
        ...(input.extra ?? {})
    });
}
