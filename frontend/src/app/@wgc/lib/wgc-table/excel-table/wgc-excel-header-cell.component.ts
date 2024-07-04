import {
	Component, Input, ViewEncapsulation,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';

import { CoerceBoolean } from '@core';

@Component({
	selector		: 'th[wgcExcelHeaderCell], td[wgcExcelHeaderCell]',
	templateUrl		: './wgc-excel-header-cell.pug',
	styleUrls		: [ './wgc-excel-header-cell.scss' ],
	host			: { class: 'wgc-excel-header-cell' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCExcelHeaderCellComponent {

	@HostBinding( 'style.width' )
	get styleWidth(): string { return this.width; }

	@HostBinding( 'style.minWidth' )
	get styleMinWidth(): string { return this.width; }

	@HostBinding( 'style.height' )
	get styleHeight(): string { return this.height; }

	@HostBinding( 'style.minHeight' )
	get styleMinHeight(): string { return this.height; }

	@HostBinding( 'class.wgc-excel-header-cell--required' )
	get classRequired(): boolean { return this.required; }

	@Input() @CoerceBoolean() public required: boolean;

	public width: string;
	public height: string;

	/**
	 * @param {ResizeEvent} event
	 * @return {void}
	 */
	public onResizing( event: ResizeEvent ) {
		const width: number = event.rectangle.width;
		const height: number = event.rectangle.height;

		this.width = `${width > 200 ? width : 200}px`;
		this.height = `${height > 40 ? height : 40}px`;
	}

}
