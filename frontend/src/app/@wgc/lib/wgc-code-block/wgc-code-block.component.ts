import {
	Component, ViewEncapsulation, Input,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';

import { CoerceBoolean } from '@core';

@Component({
	selector		: 'wgc-code-block, [wgcCodeBlock]',
	templateUrl		: './wgc-code-block.pug',
	styleUrls		: [ './wgc-code-block.scss' ],
	host			: { class: 'wgc-code-block' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCodeBlockComponent {

	@HostBinding( 'class.wgc-code-block--multiline' )
	get classMultiline(): boolean { return this.multiline; }

	@Input() @CoerceBoolean() public multiline: boolean;

}
