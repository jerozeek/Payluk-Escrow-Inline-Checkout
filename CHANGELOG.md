# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-11-20

### Added
- "Pay with Payluk" branded button: Payluk icon, lock icon, `purple` / `white` themes, loading spinner.
- `mountCheckoutButton(target, options)` for non-React pages; `PaylukIcon`, `LockIcon`, `CHECKOUT_BUTTON_CSS`, `injectCheckoutButtonStyles` exports.
- `EscrowCheckoutButton` props `theme` and `label`.

### Changed
- `EscrowCheckoutButton` now renders the branded button by default (was an unstyled "Pay" button). `className` is added on top of the `.payluk-btn` styles; `children` still replaces the content.

## [0.3.0] - 2026-03-31

### Added
- **Multi-Escrow Payments**: Support for paying multiple escrows in a single checkout session
  - `paymentToken` now accepts both `string` and `string[]` types
  - Added comprehensive validation for array inputs (non-empty arrays, valid string elements)
  - Updated `PayInput` interface with backward-compatible changes
  - Updated `EscrowCheckoutButtonProps` to support array of payment tokens
  - All escrows must belong to the same merchant
  - Individual processing for each escrow with aggregated total display
  - Unique references generated for multi-payments (e.g., `REF_1`, `REF_2`, `REF_3`)

### Changed
- Enhanced input validation to handle both single and multiple payment tokens
- Updated error messages to reflect new validation rules
- Improved TypeScript type definitions with JSDoc comments for `paymentToken` parameter
- Documentation now includes comprehensive multi-escrow usage examples for both vanilla JS/TS and React

### Added Tests
- Test cases for empty array validation
- Test cases for arrays with empty/whitespace strings
- Test cases for valid array of payment tokens
- Verification of correct API payload format for multi-escrow requests

### Migration Guide
The update is fully backward compatible. Existing implementations using a single `paymentToken` string will continue to work without any changes.

To use multi-escrow payments:

**Vanilla JS/TS:**
```ts
await pay({
  paymentToken: ['TOKEN_1', 'TOKEN_2', 'TOKEN_3'], // Array instead of string
  reference: '<REFERENCE_ID>',
  redirectUrl: 'https://your-app.example.com/checkout/complete',
  customerId: '<CUSTOMER_ID>', // Required for merchant escrows
  // ... other options
});
```

**React:**
```tsx
<EscrowCheckoutButton
  paymentToken={['TOKEN_1', 'TOKEN_2', 'TOKEN_3']} // Array instead of string
  reference="<REFERENCE_ID>"
  redirectUrl="https://your-app.example.com/checkout/complete"
  customerId="<CUSTOMER_ID>"
/>
```

## [0.2.6] - 2025-12-06

### Added
- **Customer Vaulting Support**: Introduced optional `customerId` parameter for merchants using customer vaulting/tokenization
  - Added `customerId` field to `PayInput` interface in core SDK
  - Added `customerId` prop to `EscrowCheckoutButton` React component
  - Enables secure storage and reuse of customer payment methods (debit cards) for future transactions
  - Fully backward compatible - parameter is optional and only required for merchants with customer vaulting enabled

### Changed
- Updated documentation with `customerId` usage examples across vanilla JS/TS and React implementations
- Enhanced API reference to clarify customer vaulting use cases

### Migration Guide
If you're a merchant with customer vaulting enabled, you can now pass a `customerId` when initiating checkout:

```ts
await pay({
  paymentToken: '<PAYMENT_TOKEN>',
  reference: '<REFERENCE_ID>',
  redirectUrl: 'https://your-app.example.com/checkout/complete',
  customerId: '<CUSTOMER_ID>', // New optional parameter
  // ... other options
});
```

For React:
```tsx
<EscrowCheckoutButton
  paymentToken="<PAYMENT_TOKEN>"
  reference="<REFERENCE_ID>"
  redirectUrl="https://your-app.example.com/checkout/complete"
  customerId="<CUSTOMER_ID>" // New optional prop
/>
```

## [0.2.5] - 2025-12-06

### Changed
- Refined README usage examples

## [0.2.4] - 2025-12-06

### Changed
- Refined React usage examples in README

## [0.2.3] - 2025-12-06

### Changed
- Refined SDK usage examples in README

## [0.2.2] - 2025-12-06

### Added
- Added prepublish script for automated builds

## [0.2.1] - 2025-12-06

### Added
- Initial README with comprehensive SDK usage instructions

## [0.2.0] - 2025-12-06

### Added
- Initial release of payluk-escrow-inline-checkout SDK
- Core escrow checkout functionality
- React hooks and components
- TypeScript support
- Zero-configuration script loading