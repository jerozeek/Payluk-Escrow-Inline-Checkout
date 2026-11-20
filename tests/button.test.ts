import { afterEach, describe, expect, it, vi } from 'vitest';

// Just enough DOM for mountCheckoutButton; the suite runs in plain node.
function fakeElement(tag: string): any {
    const attrs: Record<string, string> = {};
    const listeners: Record<string, () => unknown> = {};
    const el: any = {
        tag, children: [] as any[], textContent: '', innerHTML: '', className: '', type: '', parent: null,
        setAttribute: (k: string, v: string) => { attrs[k] = v; },
        getAttribute: (k: string) => attrs[k] ?? null,
        removeAttribute: (k: string) => { delete attrs[k]; },
        addEventListener: (name: string, fn: () => unknown) => { listeners[name] = fn; },
        click: () => listeners.click?.(),
        append: (...kids: any[]) => kids.forEach((k) => el.appendChild(k)),
        appendChild: (k: any) => { k.parent = el; el.children.push(k); return k; },
        remove: () => { el.parent.children = el.parent.children.filter((c: any) => c !== el); }
    };
    return el;
}

function installDom() {
    const head = fakeElement('head');
    const host = fakeElement('div');
    (globalThis as any).document = {
        head,
        createElement: fakeElement,
        getElementById: (id: string) => head.children.find((c: any) => c.id === id) ?? null,
        querySelector: (sel: string) => (sel === '#pay' ? host : null)
    };
    return { head, host };
}

const input = { paymentToken: 'PY_1', reference: 'ref_1', redirectUrl: 'https://shop.test/done' };

afterEach(() => {
    delete (globalThis as any).document;
    delete (globalThis as any).window;
    vi.restoreAllMocks();
    vi.resetModules();
});

describe('mountCheckoutButton', () => {
    it('renders a branded button once, opens checkout on click and ignores clicks while busy', async () => {
        const { head, host } = installDom();
        const widget = vi.fn();
        (globalThis as any).window = { EscrowCheckout: widget };
        let release!: () => void;
        globalThis.fetch = vi.fn(() => new Promise<Response>((resolve) => {
            release = () => resolve(new Response(JSON.stringify({ session: 'sess_1' }), { status: 200 }));
        })) as typeof fetch;

        const { initEscrowCheckout, mountCheckoutButton } = await import('../src/index');
        initEscrowCheckout({ publicKey: 'pk_test_1' });
        mountCheckoutButton('#pay', { ...input, theme: 'white' });
        mountCheckoutButton(host, input);

        expect(head.children.filter((c: any) => c.id === 'payluk-btn-style')).toHaveLength(1);
        const [button] = host.children;
        expect(button.className).toBe('payluk-btn payluk-btn--white');
        expect(button.innerHTML).toMatch(/class="payluk-icon".*class="payluk-lock"/);
        expect(button.children[0].textContent).toBe('Pay with Payluk');

        const first = button.click();
        expect(button.getAttribute('aria-busy')).toBe('true');
        await button.click(); // second click while the session is being created
        await vi.waitFor(() => expect(release).toBeTypeOf('function'));
        release();
        await first;

        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        expect(widget).toHaveBeenCalledWith(expect.objectContaining({ session: 'sess_1', publicKey: 'pk_test_1' }));
        expect(button.getAttribute('aria-busy')).toBeNull();
    });

    it('reports failures to onError and the unmount function removes the button', async () => {
        const { host } = installDom();
        (globalThis as any).window = { EscrowCheckout: vi.fn() };
        globalThis.fetch = vi.fn(async () => new Response('{"message":"bad token"}', { status: 400 })) as typeof fetch;

        const { initEscrowCheckout, mountCheckoutButton } = await import('../src/index');
        initEscrowCheckout({ publicKey: 'pk_test_1' });
        const onError = vi.fn();
        const unmount = mountCheckoutButton('#pay', { ...input, onError });

        await host.children[0].click();
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'SESSION_CREATE', message: 'bad token' }));

        unmount();
        expect(host.children).toHaveLength(0);
    });

    it('throws INVALID_INPUT when the target does not exist', async () => {
        installDom();
        const { mountCheckoutButton } = await import('../src/index');
        expect(() => mountCheckoutButton('#missing', input)).toThrow(expect.objectContaining({ code: 'INVALID_INPUT' }));
    });
});
