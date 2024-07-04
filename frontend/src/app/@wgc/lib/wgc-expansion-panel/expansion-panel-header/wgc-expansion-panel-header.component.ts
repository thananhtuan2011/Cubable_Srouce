import {
	Component, TemplateRef, ViewChild,
	Input, SimpleChanges, OnChanges,
	ChangeDetectionStrategy
} from '@angular/core';

import { ContrastPipe, CoerceBoolean, CoerceCssPixel, DefaultValue } from '@core';

@Component({
	selector		: 'wgc-expansion-panel-header',
	templateUrl		: './wgc-expansion-panel-header.pug',
	host			: { class: 'wgc-expansion-panel-header' },
	providers		: [ ContrastPipe ],
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCExpansionPanelHeaderComponent implements OnChanges {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

	@Input() public color: string;
	@Input() public textColor: string;
	@Input() @DefaultValue() @CoerceCssPixel() public textFontSize: string = '16px';
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceBoolean() public sticky: boolean;
	@Input() @CoerceBoolean() public stretch: boolean;

	private _bkTextColor: string;

	/**
	 * @constructor
	 * @param {ContrastPipe} _contrastPipe
	 */
	constructor( private _contrastPipe: ContrastPipe ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.textColor ) this._bkTextColor = this.textColor;
		if ( changes.color ) this.textColor = this._bkTextColor || this._contrastPipe.transform( this.color );
	}

}
