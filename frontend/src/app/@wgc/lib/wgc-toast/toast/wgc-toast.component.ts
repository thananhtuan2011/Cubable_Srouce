import {
	Component, Input, ViewEncapsulation,
	Output, EventEmitter, ChangeDetectionStrategy,
	OnChanges, SimpleChanges, HostBinding
} from '@angular/core';

import { CoerceBoolean, ContrastPipe } from '@core';

export type WGCIToastType = 'default' | 'info' | 'success' | 'warning' | 'danger';
export type WGCIToastPosition = 'top' | 'bottom';

export interface WGCIToastConfig {
	icon?: string;
	color?: string;
	textColor?: string;
	duration?: number;
	canClose?: boolean;
	translate?: boolean;
	type?: WGCIToastType;
	position?: WGCIToastPosition;
	translateParams?: ObjectType;
	buttons?: WGCIToastButton[];
}

export interface WGCIToastButton {
	label: string;
	onClicked: () => void;
}

@Component({
	selector		: 'wgc-toast',
	templateUrl		: './wgc-toast.pug',
	styleUrls		: [ './wgc-toast.scss' ],
	host			: { class: 'wgc-toast' },
	providers		: [ ContrastPipe ],
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCToastComponent implements OnChanges {

	@HostBinding( 'style.--toast-color' )
	get styleColor(): string { return this.color; }

	@HostBinding( 'style.--toast-text-color' )
	get styleTextColor(): string { return this.textColor; }

	@HostBinding( 'class.wgc-toast-info' )
	get classInfo(): boolean { return this.type === 'info'; }

	@HostBinding( 'class.wgc-toast-success' )
	get classSuccess(): boolean { return this.type === 'success'; }

	@HostBinding( 'class.wgc-toast-warning' )
	get classWarning(): boolean { return this.type === 'warning'; }

	@HostBinding( 'class.wgc-toast-danger' )
	get classDanger(): boolean { return this.type === 'danger'; }

	@HostBinding( 'class.wgc-toast--has-description' )
	get classHasDescription(): boolean { return !!this.description?.length; }

	@Input() public title: string;
	@Input() public description: string;
	@Input() public icon: string;
	@Input() public color: string;
	@Input() public textColor: string;
	@Input() public buttons: WGCIToastButton[];
	@Input() @CoerceBoolean() public canClose: boolean;
	@Input() @CoerceBoolean() public translate: boolean;
	@Input() public translateParams: ObjectType;
	@Input() public type: WGCIToastType;

	@Output() public closed: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

	private _icons: ObjectType<string> = { info: 'info', success: 'checkbox', warning: 'warning', danger: 'warning' };
	private _bkTextColor: string;

	get iconName(): string { return this.icon || this._icons[ this.type ]; }

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
