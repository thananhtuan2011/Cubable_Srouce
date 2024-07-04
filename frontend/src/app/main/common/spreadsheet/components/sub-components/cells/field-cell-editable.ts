import {
	Directive,
	EventEmitter,
	HostBinding,
	HostListener,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import _ from 'lodash';

import {
	CoerceBoolean
} from '@core';

import {
	CUBTooltipRef,
	CUBTooltipService
} from '@cub/material/tooltip';

import {
	FieldValidationErrors,
	FieldValidationKey
} from '@main/common/field/objects';

import {
	FieldCellTouchable
} from './field-cell-touchable';

@Directive()
export class FieldCellEditable<T = any>
	extends FieldCellTouchable<T>
	implements OnChanges, OnDestroy {

	@Input() @CoerceBoolean() public readonly: boolean;

	@Output() public dataEdited: EventEmitter<T>
		= new EventEmitter<T>();
	@Output() public dataValidated: EventEmitter<FieldValidationErrors | null>
		= new EventEmitter<FieldValidationErrors | null>();

	@HostBinding( 'class.field-cell-editable' )
	protected readonly hostClass: boolean = true;
	protected readonly tooltipService: CUBTooltipService
		= inject( CUBTooltipService );

	protected isInvalid: boolean;

	private readonly _translateService: TranslateService
		= inject( TranslateService );

	private _dataBk: T;
	private _isDataEdited: boolean;
	private _tooltipRef: CUBTooltipRef;

	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.data ) {
			return;
		}

		this._dataBk
			= _.cloneDeep( this.data );
	}

	ngOnDestroy() {
		this._markDataEdited();
	}

	@HostListener( 'window:beforeunload', [ '$event' ] )
	protected onBeforeUnload( e: BeforeUnloadEvent ) {
		this._markDataEdited(
			() => e.preventDefault()
		);
	}

	@HostListener( 'document:keydown.esc' )
	protected onKeydownEsc() {
		if ( !this.isInvalid ) {
			return;
		}

		this.revert();
	}

	protected override onDetach() {
		super.onDetach();

		if ( this.isInvalid ) {
			this.revert();
			return;
		}

		this._markDataEdited();
	}

	protected onSave() {}

	protected onRevert() {}

	protected onValidate(
		_errors: FieldValidationErrors | null
	) {}

	protected save( data: T = this.data ) {
		if (
			this.field.compareData(
				this._dataBk,
				this.data
					= _.isStrictEmpty( data )
						? null
						: data
			)
		) {
			return;
		}

		this.cdRef.markForCheck();

		this.validate();

		if ( this.isInvalid ) {
			return;
		}

		this._isDataEdited = true;

		this.onSave();
	}

	protected revert(
		data: T = _.cloneDeep( this._dataBk )
	) {
		this.data = data;

		this.onRevert();

		this.markAsValid();
	}

	protected validate(
		data: T = this.data
	): FieldValidationErrors | null {
		const errors: FieldValidationErrors | null
			= this.field.validate( data );

		this.onValidate?.( errors );

		errors === null
			? this.markAsValid()
			: this.markAsInvalid( errors );

		return errors;
	}

	protected markAsValid() {
		if ( !this.isInvalid ) {
			return;
		}

		this.isInvalid = false;

		this.dataValidated.emit( null );

		this._tooltipRef?.close();
	}

	protected markAsInvalid(
		errors?: FieldValidationErrors
	) {
		if ( this.isInvalid ) {
			return;
		}

		this.isInvalid = true;

		this.dataValidated.emit( errors );

		this.throwError( errors );
	}

	protected throwError(
		errors: FieldValidationErrors
	) {
		for ( const key in errors ) {
			if ( !errors.hasOwnProperty( key ) ) {
				continue;
			}

			switch ( key ) {
				case FieldValidationKey.Required:
					this._openErrorTooltip(
						this
						._translateService
						.instant( 'SPREADSHEET.MESSAGE.REQUIRED' )
					);
					break;
				case FieldValidationKey.Pattern:
					this._openErrorTooltip(
						this
						._translateService
						.instant( 'SPREADSHEET.MESSAGE.PATTERN' )
					);
					break;
				case FieldValidationKey.Min:
					this._openErrorTooltip( 'Min' );
					break;
				case FieldValidationKey.Max:
					this._openErrorTooltip( 'Max' );
					break;
				case FieldValidationKey.Other:
					this._openErrorTooltip( 'Other' );
					break;
			}
		}
	}

	private _markDataEdited( cb?: Function ) {
		if ( !this._isDataEdited ) {
			return;
		}

		cb?.();

		this._isDataEdited = false;

		this.dataEdited.emit( this.data );

		this._dataBk
			= _.cloneDeep( this.data );
	}

	private _openErrorTooltip( message: string ) {
		if ( this._tooltipRef?.isOpened ) {
			return;
		}

		this._tooltipRef
			= this.tooltipService.open(
				this.elementRef,
				message,
				undefined,
				{
					position: 'start-above',
					type: 'error',
					disableClose: true,
				}
			);
	}

}
