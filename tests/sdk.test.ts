import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const originalWindow = globalThis.window;
const originalFetch = globalThis.fetch;

async function importSdk() {
    return await import('../src/index');
}

function setWindowWithWidget() {
    globalThis.window = { EscrowCheckout: vi.fn() } as unknown as Window & typeof globalThis;
}

async function expectEscrowError(
    fn: () => void | Promise<void>,
    code: string,
    EscrowCheckoutError: new (...args: any[]) => Error
) {
    try {
        await fn();
        throw new Error('Expected error was not thrown.');
    } catch (error) {
        expect(error).toBeInstanceOf(EscrowCheckoutError);
        expect((error as { code?: string }).code).toBe(code);
    }
}

beforeEach(() => {
    vi.resetModules();
});

afterEach(() => {
    globalThis.window = originalWindow as Window & typeof globalThis;
    globalThis.fetch = originalFetch as typeof fetch;
    vi.restoreAllMocks();
});

describe('payluk-escrow-inline-checkout errors', () => {
    it('requires a public key on init', async () => {
        const { initEscrowCheckout, EscrowCheckoutError } = await importSdk();
        expect(() => initEscrowCheckout({ publicKey: ' ' })).toThrow(EscrowCheckoutError);
    });

    it('throws when pay is called before init', async () => {
        const { pay, EscrowCheckoutError } = await importSdk();
        setWindowWithWidget();

        await expectEscrowError(
            () =>
                pay({
                    paymentToken: 'token',
                    reference: 'ref',
                    redirectUrl: 'https://example.com'
                }),
            'NOT_INITIALIZED',
            EscrowCheckoutError
        );
    });

    it('validates required inputs', async () => {
        const { initEscrowCheckout, pay, EscrowCheckoutError } = await importSdk();
        setWindowWithWidget();
        initEscrowCheckout({ publicKey: 'pk_test_123' });

        await expectEscrowError(
            () =>
                pay({
                    paymentToken: '',
                    reference: 'ref',
                    redirectUrl: 'https://example.com'
                }),
            'INVALID_INPUT',
            EscrowCheckoutError
        );
    });

    it('surfaces session creation errors with status', async () => {
        const { initEscrowCheckout, pay, EscrowCheckoutError } = await importSdk();
        setWindowWithWidget();
        initEscrowCheckout({ publicKey: 'pk_test_123' });

        globalThis.fetch = vi.fn(async () => {
            return {
                ok: false,
                status: 400,
                text: async () => JSON.stringify({ message: 'Bad request' })
            } as Response;
        }) as typeof fetch;

        await expectEscrowError(
            () =>
                pay({
                    paymentToken: 'token',
                    reference: 'ref',
                    redirectUrl: 'https://example.com'
                }),
            'SESSION_CREATE',
            EscrowCheckoutError
        );
    });

    it('handles invalid JSON session responses', async () => {
        const { initEscrowCheckout, pay, EscrowCheckoutError } = await importSdk();
        setWindowWithWidget();
        initEscrowCheckout({ publicKey: 'pk_test_123' });

        globalThis.fetch = vi.fn(async () => {
            return {
                ok: true,
                status: 200,
                json: async () => {
                    throw new Error('bad json');
                }
            } as unknown as Response;
        }) as typeof fetch;

        await expectEscrowError(
            () =>
                pay({
                    paymentToken: 'token',
                    reference: 'ref',
                    redirectUrl: 'https://example.com'
                }),
            'SESSION_RESPONSE',
            EscrowCheckoutError
        );
    });
});
