import {
	Component, Input, Output,
	EventEmitter, ViewEncapsulation, HostListener,
	ChangeDetectionStrategy, HostBinding
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { DefaultValue, CoerceBoolean, CoerceNumber } from '@core';

@Component({
	selector		: 'wgc-switch',
	templateUrl		: './wgc-switch.pug',
	styleUrls		: [ './wgc-switch.scss' ],
	host			: { class: 'wgc-switch' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCSwitchComponent {

	@HostBinding( 'attr.tabindex' )
	get attrTabindex(): number { return this.tabindex; }

	@HostBinding( 'style.--switch-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--switch-label-color' )
	get styleLabelColor(): string { return this.labelColor; }

	@HostBinding( 'class.wgc-switch--disabled' )
	get classDisabled(): boolean { return this.disabled || this.disableControl; }

	@HostBinding( 'class.wgc-switch--active' )
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
	get classActive(): boolean { return this.ngModel === true; }

	@HostBinding( 'class' )
	get class(): string { return this.color ? 'wgc-' + this.color : undefined; }

	@Input() public label: string;
	@Input() public color: string;
	@Input() public labelColor: string;
	@Input() @DefaultValue() @CoerceNumber() public tabindex: number = 0;
	@Input() public ngModel: boolean;
	@Input() public disableControl: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() public formControl: FormControl;

	@Output() public ngModelChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	@HostListener( 'click', [ '$event' ] )
	public triggerClick( event: MouseEvent ) {
		if ( this.disabled || this.disableControl || this.readonly ) return;

		event.stopPropagation();
		this.toggle();
	}

	@HostListener( 'keydown.space', [ '$event' ] )
	public triggerKeyDownSpace( event: KeyboardEvent ) {
		if ( this.disabled || this.disableControl || this.readonly ) return;

		event.stopPropagation();
		this.toggle();
	}

	/**
	 * @return {void}
	 */
	public toggle() {
		this.ngModel = !this.ngModel;

		this.ngModelChange.emit( this.ngModel );
	}

}
