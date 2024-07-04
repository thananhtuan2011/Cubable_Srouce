import {
	ChangeDetectorRef,
	Directive,
	HostBinding,
	inject,
	Inject,
	OnInit,
	Optional
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	BehaviorSubject,
	isObservable,
	Observable
} from 'rxjs';
import _ from 'lodash';

import {
	EqualValidators,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUB_POPUP_CONTEXT,
	CUB_POPUP_REF,
	CUBIPopupInstance,
	CUBPopupRef
} from '@cub/material/popup';

import {
	Field
} from '../../../objects';
import {
	FieldList
} from '../../../interfaces';

export type FieldBuilderContext<T = Field> = {
	field: T;
	otherFields?: FieldList;
	context?: ObjectType;
	onDone?: ( field: T ) => void;
	onCancel?: () => void;
};

@Unsubscriber()
@Directive()
export class FieldBuilder<T = Field>
implements OnInit, CUBIPopupInstance {

	@HostBinding( 'class.field-builder' )
	protected readonly hostClass: boolean = true;
	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	protected readonly nameFormControl: FormControl
		= new FormControl(
			undefined,
			[
				EqualValidators.uniqueNameValidator(
					() => _.reject(
						this.otherFields,
						{ id: ( this.internalField as Field )?.id }
					),
					false,
					'name'
				),
			]
		);
	protected readonly descriptionFormControl: FormControl
		= new FormControl( undefined );
	protected readonly canSubmit$: BehaviorSubject<boolean>
		= new BehaviorSubject<boolean>( true );

	protected internalField: T;
	protected initialData: any;
	protected otherFields: FieldList;
	protected isInitialValueValid: boolean = true;

	private _isDone: boolean;

	/**
	 * @constructor
	 * @param {CUBPopupRef} popupRef
	 * @param {FieldBuilderContext} popupContext
	 */
	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected popupContext: FieldBuilderContext<T>
	) {
		this.internalField = _.cloneDeep(
			this.popupContext.field
		);
	}

	ngOnInit() {
		const field: Field = this.internalField as Field;

		this.loadOtherFields();

		if ( _.isStrictEmpty( field.initialData ) ) {
			return;
		}

		this.initialData = _.cloneDeep(
			field.initialData
		);
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	onClosed() {
		this._isDone
			? this.popupContext.onDone?.(
				_.cloneDeep( this.internalField )
			)
			: this.popupContext.onCancel?.();
	}

	/**
	 * @param {any=} initialData
	 * @return {void}
	 */
	protected onInitialDataChanged(
		initialData: any = this.initialData
	) {
		( this.internalField as unknown as Field ).initialData
			= _.isStrictEmpty( initialData )
				? null
				: initialData;
	}

	/**
	 * @param {number} _index
	 * @return {void}
	 */
	protected onTabChange( _index: number ) {}

	/**
	 * @return {void}
	 */
	protected done() {
		this._isDone = true;

		this.popupRef.close();
	}

	/**
	 * @return {void}
	 */
	protected cancel() {
		this._isDone = false;

		this.popupRef.close();
	}

	/**
	 * @return {boolean}
	 */
	protected validateInitialValue(): boolean {
		return this.isInitialValueValid
			= _.isStrictEmpty( this.initialData )
				|| ( this.internalField as Field )
				.validate( this.initialData ) === null;
	}

	/**
	 * @return {void}
	 */
	protected loadOtherFields() {
		if ( !this.popupContext.otherFields ) {
			return;
		}

		const { otherFields }: FieldBuilderContext<T>
			= this.popupContext;

		if ( !isObservable( otherFields ) ) {
			this.otherFields = otherFields;
			return;
		}

		( otherFields as Observable<Field[]> )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(( fields: Field[] ) => {
			this.otherFields = fields;
		});
	}

	/**
	 * @return {void}
	 */
	protected validateContext() {
		if ( _.isStrictEmpty( this.popupContext.context ) ) {
			throw new Error( 'Must have context' );
		}
	}

}
