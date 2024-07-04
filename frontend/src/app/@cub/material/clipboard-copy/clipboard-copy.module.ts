import { NgModule } from '@angular/core';

import { CoreModule } from 'angular-core';

import { CUBTooltipModule } from '../tooltip';

import { CUBClipboardCopyDirective } from './clipboard-copy.directive';

@NgModule({
	imports: [
		CoreModule,

		CUBTooltipModule,
	],
	exports: [
		CUBClipboardCopyDirective,
	],
	declarations: [
		CUBClipboardCopyDirective,
	],
	providers: [],
})
export class CUBClipboardCopyModule {}
