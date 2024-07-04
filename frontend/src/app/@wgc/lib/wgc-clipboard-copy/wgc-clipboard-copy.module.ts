import { NgModule } from '@angular/core';

import { CoreModule } from '@core';

import { WGCTooltipModule } from '../wgc-tooltip';

import { WGCClipboardCopyDirective } from './wgc-clipboard-copy.directive';

@NgModule({
	imports: [
		CoreModule,

		WGCTooltipModule,
	],
	exports		: [ WGCClipboardCopyDirective ],
	declarations: [ WGCClipboardCopyDirective ],
	providers	: [],
})
export class WGCClipboardCopyModule {}
