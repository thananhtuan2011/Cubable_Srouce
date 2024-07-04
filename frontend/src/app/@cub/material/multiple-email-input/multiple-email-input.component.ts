import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnInit,
	Output,
	ViewChild,
	ViewEncapsulation,
	inject
} from '@angular/core';
import {
	FormControl,
	Validators
} from '@angular/forms';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue,
	REGEXP,
	Unsubscriber
} from '@core';

import {
	CUBFormFieldInputDirective
} from '../form-field';
import {
	CUBValueAccessor,
	CUB_VALUE_ACCESSOR
} from '../value-accessor';

interface IValue {
	value: string;
	isInvalid?: boolean;
}

@Unsubscriber()
@Component({
	selector		: 'cub-multiple-email-input',
	templateUrl		: './multiple-email-input.pug',
	styleUrls		: [ './multiple-email-input.scss' ],
	host			: { class: 'multiple-email-input' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
	providers		: [ CUB_VALUE_ACCESSOR( CUBMultipleEmailInputComponent ) ],
})
export class CUBMultipleEmailInputComponent
	extends CUBValueAccessor
	implements OnInit {

	@ViewChild( 'multipleEmailInput' )
	public multipleEmailInput: CUBFormFieldInputDirective;
	@ViewChild( 'boxElm' )
	public boxElm: ElementRef<any>;

	@Input() public emailsValidation: string[];
	@Input() public placeholder: string;
	@Input() public errorMessage: string;
	@Input() public errorActionTitle: string;
	@Input() @CoerceBoolean()
	public autoReset: boolean;
	@Input() @CoerceBoolean() @CoerceBoolean()
	public autoFocusOn: boolean = true;
	@Input() @DefaultValue()
	public formControl: FormControl
			= new FormControl(
				undefined,
				[
					Validators.maxLength( 255 ),
					Validators.pattern( REGEXP.EMAIL ),
				]
			);

	@Output() public addChange: EventEmitter<string[]>
		= new EventEmitter<string[]>();
	@Output() public removeChange: EventEmitter<string>
		= new EventEmitter<string>();

	public focusing: boolean;
	public valueContent: string;
	public values: IValue[];

	public isInvalid: boolean;

	get emails(): string[] {
		return _.map( this.values, 'value' );
	}

	private _formControlClone: FormControl;
	private _cdRef: ChangeDetectorRef = inject( ChangeDetectorRef );

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._formControlClone = _.cloneDeep( this.formControl );
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
	 * @param {KeyboardEvent} event
	 * @return {void}
	 */
	public triggerKeyDown( event: KeyboardEvent ) {
		if( !event.key ) return;
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
				if ( this.valueContent || !this.values?.length ) return;

				this.removeChange.emit(
					this.values[ this.values.length - 1 ].value
				);
				this.values.splice( this.values.length - 1, 1 );

				this.isInvalid
					= _.some( this.values, [ 'isInvalid', true ] );
				break;
		}
	}

	/**
	 * @param {boolean} focus
	 * @return {void}
	 */
	public onSave( focus?: boolean ) {
		if ( !this.valueContent ) return;

		if ( !_.includes( _.map( this.values, 'value' ), this.valueContent ) ) {
			this.values ??= [];

			const isInvalid: boolean
				= _.includes(this.emailsValidation, this.valueContent)
					? true
					: this.formControl.invalid;

			this.values.push({
				value: this.valueContent,
				isInvalid,
			});

			!this.formControl.invalid
			&& this.addChange.emit([ this.valueContent ]);
		}

		this.valueContent = null;
		this.isInvalid = _.some( this.values, [ 'isInvalid', true ] );

		focus && this.focus();
	}

	/**
	 * @return {void}
	 */
	public onCancel() {
		this.valueContent = null;
		this.focusing = false;
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	public onRemove( index: number ) {
		setTimeout( () => {
			this.removeChange.emit( this.values[ index ]?.value );
			this.values.splice( index, 1 );

			this.isInvalid = _.some( this.values, [ 'isInvalid', true ] );
		} );
	}

	/**
	 * @param {ClipboardEvent} event
	 * @return {void}
	 */
	public onPaste( event: ClipboardEvent ) {
		const data: string = event.clipboardData.getData( 'text' );

		if ( !data?.length ) return;

		const newData: string[]
			= _.filter(
				data.split(/[,\s]/), ( d: string ) => d?.length
			) as string[];

		if ( !newData?.length ) return;

		const newValues: IValue[] = [];

		_.forEach( newData, ( _data: string ) => {
			if (
				_.includes(
					_.map( [ ...( this.values || [] ), ...newValues ], 'value' ),
					_data
				) ) return;

			this._formControlClone.setValue( _data );
			this._formControlClone.updateValueAndValidity();

			newValues.push({
				value: _data,
				isInvalid: this._formControlClone.invalid,
			});

			this._formControlClone.reset();
		} );

		if ( !newValues.length ) return;

		this.values ??= [];

		this.values.push( ...newValues );
		this.addChange.emit(
			_.map(
				_.filter( newValues, { isInvalid: false } ),
				'value'
			)
		);

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

			setTimeout( () => this.multipleEmailInput?.focus() );

			this._cdRef.markForCheck();
		} );
	}

}
