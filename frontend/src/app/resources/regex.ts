import { REGEXP as _REGEXP } from 'angular-core';

// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const REGEXP = {
	..._REGEXP,
	IP_ADDRESS: /\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}\b/,
} as const;
