# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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