// The "Pay with Payluk" button look, shared by mountCheckoutButton and the React button.
// The icon path is the Payluk mark from app/web/public/svg/icon.svg.

export type CheckoutButtonTheme = 'purple' | 'white';

export const PAYLUK_ICON_PATH =
    'M19.3485 0.199997L20.5984 0.439968L21.8083 0.779938L22.9882 1.19992L24.1181 1.69988L25.208 2.28983L26.2479 2.94978L27.2279 3.67973L28.1578 4.47966L29.0177 5.34959L29.8276 6.27951L30.5576 7.25944L31.2175 8.29937L31.7975 9.38928L32.3075 10.5192L32.7274 11.6991L33.0674 12.909L33.3074 14.1589L33.4574 15.4388L33.5074 16.7487L33.4574 18.0586L33.3074 19.3385L33.0674 20.5884L32.7274 21.8083L32.3075 22.9782L31.7975 24.1181L31.2175 25.198L30.5576 26.238L29.8276 27.2279L29.0177 28.1478L28.1578 29.0177L27.2279 29.8177L26.2479 30.5576L25.208 31.2176L24.1181 31.7975L22.9882 32.3075L21.8083 32.7274L20.5984 33.0574L19.3485 33.3074L18.0586 33.4474L16.7587 33.4974L15.4488 33.4474L14.1689 33.3074L12.919 33.0574L11.6991 32.7274L11.2391 32.5574V41.0568L11.1391 41.0068L10.3392 40.5168L9.53924 40.0269L8.74931 39.5169L7.97937 38.9969L7.20943 38.457L6.44949 37.917L5.69955 37.3471L4.9696 36.7771L4.23966 36.1872L3.52972 35.5872L2.81977 34.9673L2.12982 34.3473L1.43987 33.7074L0.769929 33.0574L0.109992 32.3875L0.00999372 32.2875V16.8987L0 16.7487L0.0499839 15.4388L0.199981 14.1589L0.449962 12.909L0.779938 11.6991L1.1999 10.5192L1.70986 9.38928L2.28981 8.29937L2.94977 7.25944L3.6897 6.27951L4.48964 5.34959L5.34957 4.47966L6.27951 3.67973L7.26942 2.94978L8.29934 2.28983L9.38926 1.69988L10.5292 1.19992L11.6991 0.779938L12.919 0.439968L14.1689 0.199997L15.4488 0.0500144L16.7587 0L18.0586 0.0500144L19.3485 0.199997ZM14.2389 12.0091L13.3989 13.249L13.099 14.7689L13.3989 16.2887L14.2389 17.5186L15.2688 18.2186V22.6482L15.3388 22.9682L15.5188 23.2382L15.7888 23.4182L16.1087 23.4882H17.5486L17.8586 23.4282L18.1086 23.2582L18.2786 22.9982L18.3386 22.6882V18.3886L18.5085 18.3586L19.7485 17.5186L20.5884 16.2887L20.8884 14.7689L20.5884 13.249L19.7485 12.0091L18.5085 11.1791L16.9987 10.8692L15.4788 11.1791L14.2389 12.0091Z';

export const PAYLUK_ICON_SVG =
    `<svg class="payluk-icon" viewBox="0 0 34 42" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="${PAYLUK_ICON_PATH}"/></svg>`;

export const LOCK_ICON_PATH = 'M8 11V7a4 4 0 0 1 8 0v4M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z';

export const LOCK_ICON_SVG =
    `<svg class="payluk-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="${LOCK_ICON_PATH}"/></svg>`;

export const CHECKOUT_BUTTON_CSS = `
.payluk-btn{all:unset;box-sizing:border-box;position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-width:220px;height:44px;padding:0 20px;border-radius:6px;background:#4b0082;color:#fff;font:600 15px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;letter-spacing:.01em;white-space:nowrap;cursor:pointer;box-shadow:0 1px 1px rgba(0,0,0,.08),0 2px 6px rgba(75,0,130,.24);transition:background-color .15s,box-shadow .15s,transform .05s;-webkit-tap-highlight-color:transparent}
.payluk-btn:hover{background:#3b0066}
.payluk-btn:active{transform:translateY(1px)}
.payluk-btn:focus-visible{box-shadow:0 0 0 2px #fff,0 0 0 4px #4b0082}
.payluk-btn--white{background:#fff;color:#4b0082;box-shadow:inset 0 0 0 1px #dcd3e6,0 1px 2px rgba(0,0,0,.06)}
.payluk-btn--white:hover{background:#f7f2fc}
.payluk-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.payluk-btn svg{display:block;flex:none;width:auto}
.payluk-btn .payluk-icon{height:20px}
.payluk-btn .payluk-lock{height:14px;opacity:.85}
.payluk-btn[aria-busy=true]{cursor:progress;opacity:1}
.payluk-btn[aria-busy=true]>*{visibility:hidden}
.payluk-btn[aria-busy=true]::after{content:"";position:absolute;width:18px;height:18px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;animation:payluk-spin .7s linear infinite}
@keyframes payluk-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.payluk-btn{transition:none}.payluk-btn[aria-busy=true]::after{animation-duration:2s}}
`;

export function checkoutButtonClass(theme?: CheckoutButtonTheme, extra?: string): string {
    return ['payluk-btn', theme === 'white' && 'payluk-btn--white', extra].filter(Boolean).join(' ');
}

/** Adds the button stylesheet to the page once. */
export function injectCheckoutButtonStyles(doc: Document = document): void {
    if (doc.getElementById('payluk-btn-style')) return;
    const style = doc.createElement('style');
    style.id = 'payluk-btn-style';
    style.textContent = CHECKOUT_BUTTON_CSS;
    doc.head.appendChild(style);
}
