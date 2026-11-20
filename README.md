# Escrow Checkout JS/TS SDK                                                             

  A lightweight client SDK that initializes your checkout configuration, creates a session, and launches the escrow checkout widget. Includes a React hook for easy integration in React apps.                                   
   
  - Zero manual script tags: the widget script is loaded automatically.                                                                                                                                                          
  - Promise-based API.                                                                                                                                                                                                         
  - First-class TypeScript types.
  - Optional React hook with loading/error state.
  - Multi-escrow support: pay for one or many escrows in a single checkout session.

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
    publicKey: '<YOUR_PUBLISHABLE_KEY>' // publishable key only
  });

  // 2) Trigger a payment flow (e.g., on a button click)
  async function onPayClick() {
    try {
      await pay({
        paymentToken: ['<PAYMENT_TOKEN>'], // always an array — pass one or many
        reference: '<REFERENCE_ID>',
        redirectUrl: 'https://your-app.example.com/checkout/complete',
        logoUrl: 'https://mediacloud.me/media/W8HU9TK245QF528ZULCFSJXX2SBBLT.jpg', // optional
        brand: 'YourBrand', // optional
        customerId: 'YourCustomerId', // optional, only for merchants using customer vaulting
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

  ## Inline Usage

  ```html
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <title>Checkout Demo</title>
  </head>

  <body>
    <h1>Checkout Demo</h1>
    <script src="https://checkout.payluk.ng/escrow-checkout.min.js"></script>
    <button id="pay">Pay via Wallet (Business) or Debit Card (Merchant)</button>
    <script>
      const PUBLISHABLE_KEY = 'pk_live_f1yCEbpo980rDMWUAMH0Ho0NC7gzkqSr'; // Public Key
      let navigated = false;

      async function openEscrowCheckout() {
        const baseUrl = window.EscrowCheckout.baseUrl;
        const resp = await fetch(`${baseUrl}/v1/checkout/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentToken: ['PY_vevIhjtQ3000'], // pass one or many tokens in the array
            reference: 'Reference',
            publicKey: PUBLISHABLE_KEY,
            redirectUrl: 'http://localhost:63342/payluk-inlinejs/thank-you.html',
            customerId: '6933b6353e4615c1cabdd1d9' // Optional: For merchant business only
          }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          return alert(err.message || 'Failed to create session');
        }

        const { session } = await resp.json();

        EscrowCheckout({
          session,
          logoUrl: 'https://mediacloud.me/media/W8HU9TK245QF528ZULCFSJXX2SBBLT.jpg',
          brand: 'Business Name',
          publicKey: PUBLISHABLE_KEY,
          customerId: '6933b6353e4615c1cabdd1d9', // Optional: For merchant business only
          callback: ({ paymentId }) => {
            console.log('Payment token received', paymentId);
            navigated = true;
            const url = `/payluk-inlinejs/thank-you.html?paymentId=${encodeURIComponent(paymentId)}`;
            window.location.replace(url);
          },
          onClose: function () {
            console.log('Checkout closed');
          },
        });
      }

      document.getElementById('pay').addEventListener('click', openEscrowCheckout);
    </script>
  </body>

  </html>
  ```

  ## React Usage

  ```tsx
  import { initEscrowCheckout } from 'payluk-escrow-inline-checkout';

  export default function ClientEscrowInit() {
    useEffect(() => {
      initEscrowCheckout({
        publicKey: 'pk_live_*************************',
      });
    }, []);
    return null;
  }
  ```

  ```tsx
  export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ClientEscrowInit />
          {children}
        </body>
      </html>
    );
  }
  ```

  ```tsx
  import React from 'react';
  import { useEscrowCheckout } from 'payluk-escrow-inline-checkout/react';

  export function CheckoutButton() {
    const { pay } = useEscrowCheckout();

    const handleClick = async () => {
      try {
        await pay({
          paymentToken: ['<PAYMENT_TOKEN>'], // always an array — pass one or many
          reference: '<REFERENCE_ID>',
          redirectUrl: 'https://your-app.example.com/checkout/complete',
          logoUrl: 'https://mediacloud.me/media/W8HU9TK245QF528ZULCFSJXX2SBBLT.jpg',
          brand: 'YourBrand',
          extra: { theme: 'light' },
          customerId: 'YourCustomerId', // optional, only for merchants using customer vaulting
          callback: (result) => console.log(result)
        });
      } catch {
        // error is also exposed via `error` state
      }
    };

    return (
      <button onClick={handleClick}>
        Pay Now
      </button>
    );
  }
  ```

  **Note:** In React apps, call `initEscrowCheckout(...)` once in your app bootstrap (e.g., in the root component or an app initializer). The hook uses that configuration.

  **Important:**
  - Only use publishable keys in the browser. Keep any secret keys on your server.
  - Validate inputs on your backend and return the required session payload.

  ## Pay with Payluk Button

  A ready-made, branded button (Payluk icon, "Pay with Payluk", lock icon, purple or white theme, loading spinner) in the style of Stripe's payment buttons.

  **React**

  ```tsx
  import { EscrowCheckoutButton } from 'payluk-escrow-inline-checkout/react';

  <EscrowCheckoutButton
    paymentToken="<PAYMENT_TOKEN>"
    reference="<REFERENCE_ID>"
    redirectUrl="https://your-app.example.com/checkout/complete"
    theme="purple"          // or "white" for dark backgrounds
    label="Pay with Payluk" // button text
    callback={(result) => console.log(result)}
  />
  ```

  Pass `children` to replace the whole content, or `className` to add your own styles on top of `.payluk-btn`.

  **Vanilla JS/TS**

  ```ts
  import { initEscrowCheckout, mountCheckoutButton } from 'payluk-escrow-inline-checkout';

  initEscrowCheckout({ publicKey: 'pk_live_...' });
  const unmount = mountCheckoutButton('#payluk-button', {
    paymentToken: '<PAYMENT_TOKEN>',
    reference: '<REFERENCE_ID>',
    redirectUrl: 'https://your-app.example.com/checkout/complete',
    theme: 'white',
    onError: (error) => console.error(error)
  });
  ```

  **Plain HTML (no install)**

  ```html
  <script src="https://live.payluk.ng/v1/checkout/button.js" async></script>
  <div data-payluk-button
       data-public-key="pk_live_..."
       data-payment-token="<PAYMENT_TOKEN>"
       data-reference="<REFERENCE_ID>"
       data-redirect-url="https://your-app.example.com/checkout/complete"></div>
  ```

  The element fires `payluk:success`, `payluk:close` and `payluk:error` events. Use `https://staging.live.payluk.ng/v1/checkout/button.js` with test keys.

  ## Multi-Escrow Payments

  `paymentToken` is always an array. Pass a single token to charge for one escrow or several tokens to charge for many in one session.

  ### Requirements

  - All escrows must belong to the same merchant
  - All escrows must be in `PENDING` status
  - If using merchant escrows, a `customerId` is required
  - The total amount from all escrows will be charged in a single transaction
  - Empty arrays or arrays containing empty strings will be rejected

  ### Vanilla JS/TS Example

  ```ts
  import { initEscrowCheckout, pay } from 'payluk-escrow-inline-checkout';

  initEscrowCheckout({
    publicKey: '<YOUR_PUBLISHABLE_KEY>'
  });

  async function onPayMultipleClick() {
    try {
      await pay({
        paymentToken: ['TOKEN_1', 'TOKEN_2', 'TOKEN_3'],
        reference: '<REFERENCE_ID>',
        redirectUrl: 'https://your-app.example.com/checkout/complete',
        logoUrl: 'https://mediacloud.me/media/W8HU9TK245QF528ZULCFSJXX2SBBLT.jpg',
        brand: 'YourBrand',
        customerId: 'customer_123', // Required for merchant escrows
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

  ### React Example

  ```tsx
  import React from 'react';
  import { useEscrowCheckout } from 'payluk-escrow-inline-checkout/react';

  export function MultiEscrowCheckoutButton() {
    const { pay } = useEscrowCheckout();

    const handleClick = async () => {
      try {
        await pay({
          paymentToken: ['TOKEN_1', 'TOKEN_2', 'TOKEN_3'],
          reference: '<REFERENCE_ID>',
          redirectUrl: 'https://your-app.example.com/checkout/complete',
          customerId: 'customer_123',
          callback: (result) => {
            console.log('Payment successful:', result);
          }
        });
      } catch (err) {
        console.error('Payment failed:', err);
      }
    };

    return (
      <button onClick={handleClick}>
        Pay for Multiple Items
      </button>
    );
  }
  ```

  ### How It Works

  1. **Individual Processing**: Each escrow is processed individually with its own payment intent
  2. **Aggregated Total**: The checkout widget displays the total amount from all escrows
  3. **Unique References**: Each escrow gets a unique reference (e.g., `REF_1`, `REF_2`, `REF_3`)
  4. **Single Transaction**: The customer completes one payment for all escrows combined

  ### Response Format

  When more than one escrow is included, the callback receives comma-separated values:

  ```ts
  {
    paymentId: "token1,token2,token3",  // Comma-separated escrow IDs
  }
  ```

  For a single-token array, the values are returned as a single id/reference (no commas).

  ## API

  ### `initEscrowCheckout(config)`

  Initializes the SDK. Must be called before any `pay(...)`.

  **Required:**
  - `publicKey`: `string` — publishable key only

  **Advanced (optional):**
  - `scriptUrlOverride?`: `string` — custom widget script URL
  - `globalName?`: `string` — custom global widget function name
  - `crossOrigin?`: `'' | 'anonymous' | 'use-credentials'` — script tag crossOrigin

  **Example:**

  ```ts
  import { initEscrowCheckout } from 'payluk-escrow-inline-checkout';

  initEscrowCheckout({
    publicKey: '<YOUR_PUBLISHABLE_KEY>'
  });
  ```

  ### `pay(input): Promise<void>`

  Creates a checkout session via your backend and opens the widget.

  **Required:**
  - `paymentToken`: `string[]` — array of one or more payment tokens
  - `reference`: `string`
  - `redirectUrl`: `string`

  **Optional:**
  - `logoUrl?`: `string`
  - `customerId?`: `string` — required for merchant escrows, optional for business escrows
  - `brand?`: `string`
  - `callback?`: `(result: unknown) => void`
  - `onClose?`: `() => void`
  - `extra?`: `Record<string, unknown>` — additional widget configuration

  **Returns:**
  - `Promise<void>` that resolves when the widget is opened (and rejects on errors).

  **Notes:**
  - All tokens in the array must belong to the same merchant
  - The checkout widget displays the aggregated total amount across all tokens
  - Each escrow is processed individually with its own payment intent
  - Empty arrays or arrays containing empty strings will be rejected

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
  - **Not initialized:** Ensure `initEscrowCheckout({ publicKey })` is called before `pay(...)`.
  - **Browser-only:** Do not call `pay(...)` on the server.
  - **Network/API errors:** If the session endpoint fails, `pay(...)` will reject with an `EscrowCheckoutError` that includes a `code`, optional HTTP `status`, and `details`.

  `EscrowCheckoutError` codes:
  - `NOT_INITIALIZED`
  - `BROWSER_ONLY`
  - `INVALID_INPUT`
  - `WIDGET_LOAD`
  - `NETWORK`
  - `SESSION_CREATE`
  - `SESSION_RESPONSE`

  You can import the error class if you want stricter checks in TypeScript:

  ```ts
  import { EscrowCheckoutError } from 'payluk-escrow-inline-checkout';
  ```

  **Example:**

  ```ts
  try {
    await pay({ /* ... */ });
  } catch (err) {
    if (err instanceof EscrowCheckoutError) {
      console.error(err.code, err.status, err.message);
      alert(err.message);
    } else {
      alert('Checkout failed');
    }
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

  Summary of changes:

  - All paymentToken: '<TOKEN>' (string) examples were converted to paymentToken: ['<TOKEN>'] (array of one) in Quick Start, Inline Usage, and React Usage.
  - API spec for pay(input) now declares paymentToken: string[] (no string union).
  - Removed the "Backward Compatible: Single payment tokens (strings) still work exactly as before" line.
  - Reframed the Multi-Escrow section as the standard usage pattern (pass one token or many, both via the array form).
  - Added a clarifying note that single-token arrays return a single id/reference (no commas) so consumers know what to expect.
