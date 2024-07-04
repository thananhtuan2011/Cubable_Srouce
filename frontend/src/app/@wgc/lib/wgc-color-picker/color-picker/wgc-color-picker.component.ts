import {
	Component, Input, ViewEncapsulation,
	Output, EventEmitter, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';
import _ from 'lodash';

import { COLOR } from '@resources';
import { DefaultValue } from '@core';

export type WGCIColorPickerMode = 'default' | 'inline';
export type WGCIColorPickerPosition = 'above' | 'below';
export type WGCIColorPickerEmptyMode = 'color' | 'background';

@Component({
	selector		: 'wgc-color-picker',
	templateUrl		: './wgc-color-picker.pug',
	styleUrls		: [ './wgc-color-picker.scss' ],
	host			: { class: 'wgc-color-picker' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCColorPickerComponent {

	@HostBinding( 'class.wgc-color-picker--inline' )
	get classInline(): boolean { return this.mode === 'inline'; }

	@Input() public pickedColor: string;
	@Input() @DefaultValue() public mode: WGCIColorPickerMode = 'default';
	@Input() @DefaultValue() public emptyMode: WGCIColorPickerEmptyMode = 'color';

	@Output() public picked: EventEmitter<string> = new EventEmitter<string>();
	@Output() public pickedColorChange: EventEmitter<string> = new EventEmitter<string>();

	public close: ( event?: Event ) => void;
	public onPicked: ( color: string ) => void;
	public selectedTabIndex: number = 0;
	public isPickOther: boolean;
	public pickedColorObj: ObjectType = {
		hex: '#000000',
		rgb: { r: 0, g: 0, b: 0, a: 1 },
		hsl: { h: 0, s: 0, l: 0, a: 1 },
	};
	public colors: string[] = [ null, ...COLOR.OTHERS ];

	get colorCode(): string {
		switch ( this.selectedTabIndex ) {
			case 0:
				return this.pickedColorObj?.hex;
			case 1:
				return _.join([
					this.pickedColorObj?.rgb?.r,
					this.pickedColorObj?.rgb?.g,
					this.pickedColorObj?.rgb?.b,
				], ', ' );
			case 2:
				return _.join([
					Math.ceil( this.pickedColorObj?.hsl?.h ),
					Math.ceil( this.pickedColorObj?.hsl?.s * 100 ) + '%',
					Math.ceil( this.pickedColorObj?.hsl?.l * 100 ) + '%',
				], ', ' );
		}
	}

	/**
	 * @param {string} color
	 * @return {void}
	 */
	public pick( color: string ) {
		this.isPickOther = false;
		this.pickedColor = this.pickedColorObj.hex = color;

		this.picked.emit( this.pickedColor );
		this.pickedColorChange.emit( this.pickedColor );
		_.isFunction( this.onPicked ) && this.onPicked( this.pickedColor );
	}

}
