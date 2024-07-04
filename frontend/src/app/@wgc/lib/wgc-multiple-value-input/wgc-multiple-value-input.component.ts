import {
	Component, ViewEncapsulation, ChangeDetectionStrategy,
	Input, HostListener, OnInit,
	ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import _ from 'lodash';

import { CoerceBoolean, DefaultValue, Unsubscriber } from '@core';

import { WGCFormFieldInputDirective } from '../wgc-form-field';

interface IValue {
	value: string;
	isInvalid?: boolean;
}

@Unsubscriber()
@Component({
	selector		: 'wgc-multiple-value-input, [wgcMultipleValueInput]',
	templateUrl		: './wgc-multiple-value-input.pug',
	styleUrls		: [ './wgc-multiple-value-input.scss' ],
	host			: { class: 'wgc-multiple-value-input' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCMultipleValueInputComponent implements OnInit {

	@ViewChild( 'multipleValueInput' ) public multipleValueInput: WGCFormFieldInputDirective;
	@ViewChild( 'boxElm' ) public boxElm: ElementRef<any>;

	@Input() public placeholder: string;
	@Input() public errorMessage: string;
	@Input() public errorActionTitle: string;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public autoReset: boolean;
	@Input() @CoerceBoolean() @CoerceBoolean() public autoFocusOn: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public trim: boolean = true;
	@Input() @DefaultValue() public formControl: FormControl = new FormControl(
		undefined,
		[ Validators.maxLength( 255 ) ]
	);

	public isInvalid: boolean;
	public focusing: boolean;
	public value: string;
	public values: IValue[];

	private _formControlClone: FormControl;

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._formControlClone = _.cloneDeep( this.formControl );
	}

	@HostListener( 'keydown', [ '$event' ] )
	public triggerKeyDown( event: KeyboardEvent ) {
		const charCode: number = event.key.charCodeAt( 0 );
		switch ( charCode ) {
			case 32: // Space
				event.preventDefault();
				break;
			case 44: // comma
				this.onSave( true );
				event.preventDefault();
				break;
			case 66: // BackSpace
				if ( this.value || !this.values?.length ) return;

				this.values.splice( this.values.length - 1, 1 );

				this.isInvalid = _.some( this.values, [ 'isInvalid', true ] );
				break;
		}
	}

	@HostListener( 'click', [ '$event' ] )
	public triggerClickInSite( event: Event ) {
		this.boxElm?.nativeElement.contains( event?.target )
			? this.focus()
			: this.focusing = false;
	}

	@HostListener( 'document:click', [ '$event' ] )
	public triggerClickOutSite( event: Event ) {
		if ( this.boxElm?.nativeElement.contains( event?.target ) ) return;

		this.focusing = false;
	}

	/**
	 * @param {boolean} focus
	 * @return {void}
	 */
	public onSave( focus?: boolean ) {
		if ( !this.value ) return;

		if ( !_.includes( _.map( this.values, 'value' ), this.value ) ) {
			this.values ??= [];

			this.values.push({ value: this.value, isInvalid: this.formControl.invalid });
		}

		this.value = null;
		this.isInvalid = _.some( this.values, [ 'isInvalid', true ] );

		focus && this.focus();
	}

	/**
	 * @return {void}
	 */
	public onCancel() {
		this.value = null;
		this.focusing = false;
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	public onRemove( index: number ) {
		setTimeout( () => {
			this.values.splice( index, 1 );

			this.isInvalid = _.some( this.values, [ 'isInvalid', true ] );
		} );
	}

	/**
	 * @param {ClipboardEvent} event
	 * @return {void}
	 */
	public onPasted( event: ClipboardEvent ) {
		const data: string = event.clipboardData.getData( 'text' );

		if ( !data?.length ) return;

		const newData: string[] = _.filter( data.split(/[,\s]/), ( d: string ) => d?.length ) as string[];

		if ( !newData?.length ) return;

		const newValues: IValue[] = [];

		_.forEach( newData, ( _data: string ) => {
			if ( _.includes( _.map( [ ...( this.values || [] ), ...newValues ], 'value' ), _data ) ) return;

			this._formControlClone.setValue( _data );
			this._formControlClone.updateValueAndValidity();
			newValues.push({ value: _data, isInvalid: this._formControlClone.invalid });
			this._formControlClone.reset();
		} );

		if ( !newValues.length ) return;

		this.values ??= [];

		this.values.push( ...newValues );

		this.isInvalid = _.some( this.values, [ 'isInvalid', true ] );
	}

	/**
	 * @return {void}
	 */
	public onRemoveValueInvalid() {
		this.values = _.filter( this.values, { isInvalid: false } );
		this.isInvalid = false;
	}

	/**
	 * @return {void}
	 */
	public focus() {
		setTimeout( () => {
			this.focusing = true;

			this._cdRef.detectChanges();
			this.multipleValueInput?.focus();
		} );
	}

}
