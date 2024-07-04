import {
	Component, Input, Output,
	EventEmitter, ViewEncapsulation, HostListener,
	SimpleChanges, OnChanges, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';

import {
	ContrastPipe, DefaultValue, CoerceBoolean,
	CoerceCssPixel, CoerceNumber
} from '@core';

@Component({
	selector		: 'wgc-checkbox',
	templateUrl		: './wgc-checkbox.pug',
	styleUrls		: [ './wgc-checkbox.scss' ],
	host			: { class: 'wgc-checkbox' },
	providers		: [ ContrastPipe ],
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCheckboxComponent implements OnChanges {

	@HostBinding( 'style.--checkbox-label-color' )
	get styleLabelColor(): string { return this.labelColor; }

	@HostBinding( 'style.--checkbox-icon-color' )
	get styleIconColor(): string { return this.iconColor; }

	@HostBinding( 'style.--checkbox-size' )
	get styleSize(): string { return this.size; }

	@HostBinding( 'class.wgc-checkbox--checked' )
	get classChecked(): boolean { return this.checked; }

	@HostBinding( 'class.wgc-checkbox--readonly' )
	get classReadonly(): boolean { return this.readonly; }

	@HostBinding( 'class.wgc-checkbox--disabled' )
	get classDisabled(): boolean { return this.disabled; }

	@HostBinding( 'attr.tabindex' )
	get attrTabindex(): number { return this.tabindex; }

	@HostBinding( 'class' )
	get class(): string { return this.color ? 'wgc-' + this.color : undefined; }

	@Input() public label: string;
	@Input() public color: string;
	@Input() public labelColor: string;
	@Input() public iconColor: string;
	@Input() @CoerceCssPixel() public size: string;
	@Input() @DefaultValue() @CoerceNumber() public tabindex: number = 0;
	@Input() @CoerceBoolean() public checked: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;

	@Output() public checkedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	private _bkIconColor: string;

	/**
	 * @constructor
	 * @param {ContrastPipe} _contrastPipe
	 */
	constructor( private _contrastPipe: ContrastPipe ) {}

	@HostListener( 'click', [ '$event' ] )
	public triggerClick( event: MouseEvent ) {
		if ( this.disabled || this.readonly ) return;

		event.stopPropagation();
		this.toggle();
	}

	@HostListener( 'keydown.space', [ '$event' ] )
	public triggerKeyDownSpace( event: KeyboardEvent ) {
		if ( this.disabled || this.readonly ) return;

		event.stopPropagation();
		this.toggle();
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.iconColor ) this._bkIconColor = this.iconColor;
		if ( changes.color ) this.iconColor = this._bkIconColor || this._contrastPipe.transform( this.color );
	}

	/**
	 * @return {void}
	 */
	public toggle() {
		this.checked = !this.checked;

		this.checkedChange.emit( this.checked );
	}

}
