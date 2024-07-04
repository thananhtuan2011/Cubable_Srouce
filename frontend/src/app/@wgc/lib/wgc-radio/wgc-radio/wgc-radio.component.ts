import {
	Component, Input, Output,
	EventEmitter, ViewEncapsulation, HostListener,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';

import { DefaultValue, CoerceBoolean, CoerceCssPixel, CoerceNumber } from '@core';

@Component({
	selector		: 'wgc-radio',
	templateUrl		: './wgc-radio.pug',
	styleUrls		: [ './wgc-radio.scss' ],
	host			: { class: 'wgc-radio' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCRadioComponent {

	@HostBinding( 'style.--radio-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--radio-bg-color' )
	get styleBgColor(): string { return this.bgColor; }

	@HostBinding( 'style.--radio-label-color' )
	get styleLabelColor(): string { return this.labelColor; }

	@HostBinding( 'style.--radio-size' )
	get styleSize(): string { return this.size; }

	@HostBinding( 'class.wgc-radio--checked' )
	get classChecked(): boolean { return this.checked; }

	@HostBinding( 'class.wgc-radio--disabled' )
	get classDisabled(): boolean { return this.disabled; }

	@HostBinding( 'class.wgc-radio--readonly' )
	get classReadonly(): boolean { return this.readonly; }

	@HostBinding( 'attr.tabindex' )
	get attrTabindex(): number { return this.tabindex; }

	@HostBinding( 'class' )
	get class(): string { return this.color ? 'wgc-' + this.color : undefined; }

	@Input() public value: any;
	@Input() public label: string;
	@Input() public color: string;
	@Input() public bgColor: string;
	@Input() public labelColor: string;
	@Input() @CoerceCssPixel() public size: string;
	@Input() @DefaultValue() @CoerceNumber() public tabindex: number = 0;
	@Input() @CoerceBoolean() public checked: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;

	@Output() public checkedChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();

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
	 * @return {void}
	 */
	public toggle() {
		this.checked = !this.checked;

		this.checkedChange.emit( this.checked );
	}

}
