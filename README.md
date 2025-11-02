# Escrow Checkout JS/TS SDK

A lightweight client SDK that initializes your checkout configuration, creates a session via your API, and launches the escrow checkout widget. Includes a React hook for easy integration in React apps.

- Zero manual script tags: the widget script is loaded automatically.
- Promise-based API.
- First-class TypeScript types.
- Optional React hook with loading/error state.

## Installation

```bash
npm i payluk-escrow-inline-checkout
```

## Quick Start (Vanilla JS/TS)

```ts
// app.ts
import { initEscrowCheckout, pay } from 'payluk-escrow-inline-checkout';

// 1) Initialize once at app startup
initEscrowCheckout({
  apiBaseUrl: 'https://api.example.com', // your backend base URL
  publicKey: '<YOUR_PUBLISHABLE_KEY>' // publishable key only
});

// 2) Trigger a payment flow (e.g., on a button click)
async function onPayClick() {
  try {
    await pay({
      paymentToken: '<PAYMENT_TOKEN_FROM_YOUR_BACKEND_OR_PROVIDER>',
      reference: '<ORDER_OR_REFERENCE_ID>',
      redirectUrl: 'https://your-app.example.com/checkout/complete',
      logoUrl: 'https://your-cdn.example.com/logo.png', // optional
      brand: 'YourBrand', // optional
      extra: { theme: 'dark' }, // optional
      callback: (result) => {
        console.log('Checkout result:', result);
      },
      onClose: () => {
        console.log('Widget closed');
      }
    });
  } catch (err) {
    console.error('Payment failed:', err);
  }
}
```

## React Usage

```tsx
// CheckoutButton.tsx
import React from 'react';
import { useEscrowCheckout } from 'payluk-escrow-inline-checkout/react';

export function CheckoutButton() {
  const { pay, loading, error, ready } = useEscrowCheckout();

  const handleClick = async () => {
    try {
      await pay({
        paymentToken: '<PAYMENT_TOKEN>',
        reference: '<ORDER_OR_REFERENCE_ID>',
        redirectUrl: 'https://your-app.example.com/checkout/complete',
        logoUrl: 'https://your-cdn.example.com/logo.png',
        brand: 'YourBrand',
        extra: { theme: 'light' },
        callback: (result) => console.log(result)
      });
    } catch {
      // error is also exposed via `error` state
    }
  };

  return (
    <button onClick={handleClick} disabled={loading || !ready}>
      {loading ? 'Processing…' : 'Pay now'}
      {!ready && <span>Preparing checkout…</span>}
      {error && <small style={{ color: 'red' }}>{error.message}</small>}
    </button>
  );
}
```

**Note:** In React apps, call `initEscrowCheckout(...)` once in your app bootstrap (e.g., in the root component or an app initializer). The hook uses that configuration.

**Important:**
- Only use publishable keys in the browser. Keep any secret keys on your server.
- Validate inputs on your backend and return the required session payload.

## API

### `initEscrowCheckout(config)`

Initializes the SDK. Must be called before any `pay(...)`.

**Required:**
- `apiBaseUrl`: `string` — your backend base URL (no trailing slash required)
- `publicKey`: `string` — publishable key only

**Advanced (optional):**
- `scriptUrlOverride?`: `string` — custom widget script URL
- `globalName?`: `string` — custom global widget function name
- `crossOrigin?`: `'' | 'anonymous' | 'use-credentials'` — script tag crossOrigin

**Example:**

```ts
import { initEscrowCheckout } from 'payluk-escrow-inline-checkout';

initEscrowCheckout({
  apiBaseUrl: 'https://api.example.com',
  publicKey: '<YOUR_PUBLISHABLE_KEY>',
  // scriptUrlOverride: 'https://cdn.example.com/custom-widget.js',
  // globalName: 'EscrowCheckout',
  // crossOrigin: 'anonymous'
});
```

### `pay(input): Promise<void>`

Creates a checkout session via your backend and opens the widget.

**Required:**
- `paymentToken`: `string`
- `reference`: `string`
- `redirectUrl`: `string`

**Optional:**
- `logoUrl?`: `string`
- `brand?`: `string`
- `extra?`: `Record<string, unknown>`
- `callback?`: `(result: unknown) => void`
- `onClose?`: `() => void`

**Returns:**
- `Promise<void>` that resolves when the widget is opened (and rejects on errors).

### `useEscrowCheckout(): { ready, loading, error, pay }`

React hook that exposes:
- `ready`: `boolean` — becomes true after a successful load/pay attempt
- `loading`: `boolean` — true while pay is running
- `error`: `Error | null` — last error encountered
- `pay`: same function as `pay(...)`

**Import:**

```ts
import { useEscrowCheckout } from 'payluk-escrow-inline-checkout/react';
```

## Framework and SSR Notes

- **Browser-only:** `pay(...)` and the widget require `window`. Avoid calling them during server-side rendering.
- **Initialize on the client:** If using frameworks like Next.js, call `initEscrowCheckout(...)` in a client component or in an effect.
- **Preloading:** The hook marks `ready` after the first successful `pay`. If you need earlier preloading, you can trigger a preparatory flow (depending on your setup).

## Error Handling

Common issues:
- **Not initialized:** Ensure `initEscrowCheckout({ apiBaseUrl, publicKey })` is called before `pay(...)`.
- **Browser-only:** Do not call `pay(...)` on the server.
- **Network/API errors:** If the session endpoint fails, `pay(...)` will reject with the error message from your backend (if any).

**Example:**

```ts
try {
  await pay({ /* ... */ });
} catch (err) {
  alert((err as Error).message);
}
```

## Security

- Use only publishable keys in the client.
- Keep any secret or private keys on your server.
- Validate and authorize requests on your backend before creating sessions.

## Types

This package ships with TypeScript types. No additional type packages are required.

## Contributing

- Install dependencies: `npm install`
- Build: `npm run build`
- Lint/Test: add scripts as needed for your project

## License

MIT (or your chosen license)