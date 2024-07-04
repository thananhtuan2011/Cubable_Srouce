import {
	Component, ViewEncapsulation, ElementRef,
	Input, SimpleChanges, OnChanges,
	HostBinding, ChangeDetectionStrategy
} from '@angular/core';

import { ContrastPipe, DefaultValue, CoerceBoolean, CoerceNumber } from '@core';

@Component({
	selector		: 'wgc-tag',
	templateUrl		: './wgc-tag.pug',
	styleUrls		: [ './wgc-tag.scss' ],
	host			: { class: 'wgc-tag' },
	providers		: [ ContrastPipe ],
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCTagComponent implements OnChanges {

	@HostBinding( 'style.--tag-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--tag-label-color' )
	get styleLabelColor(): string { return this.labelColor; }

	@HostBinding( 'class' )
	get class(): string { return this.color ? 'wgc-' + this.color : undefined; }

	@Input() public label: string;
	@Input() public labelColor: string;
	@Input() public color: string;
	@Input() @DefaultValue() @CoerceBoolean() public truncate: boolean = true;
	@Input() @DefaultValue() @CoerceNumber() public truncateLimitLine: number = 1;

	private _bkLabelColor: string;

	get nativeElement(): HTMLElement {
		return this._elementRef.nativeElement;
	}

	/**
	 * @constructor
	 * @param {ElementRef} _elementRef
	 * @param {ContrastPipe} _contrastPipe
	 */
	constructor( private _elementRef: ElementRef, private _contrastPipe: ContrastPipe ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.labelColor ) this._bkLabelColor = this.labelColor;
		if ( changes.color ) this.labelColor = this._bkLabelColor || this._contrastPipe.transform( this.color );
	}

}
