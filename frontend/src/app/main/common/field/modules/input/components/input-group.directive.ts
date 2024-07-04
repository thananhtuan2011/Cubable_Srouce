import {
	AfterContentInit,
	ContentChildren,
	Directive,
	EventEmitter,
	Output,
	QueryList
} from '@angular/core';
import {
	of
} from 'rxjs';
import {
	combineLatestAll,
	startWith,
	takeUntil
} from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	FieldExtra
} from '../../../interfaces';
import {
	FieldValidationErrors
} from '../../../objects';

import {
	FieldInputFactoryDirective
} from './input-factory.directive';
import {
	FieldInput
} from './input';
import {
	FieldInputEditable,
	FieldInputValidateEvent
} from './input-editable';
import {
	FieldInputReadonly
} from './input-readonly';

export type FieldInputGroupData
	= Record<FieldExtra[ 'id' ], any>;
export type FieldInputGroupErrors
	= Record<FieldExtra[ 'id' ], FieldInputValidateEvent>;

@Unsubscriber()
@Directive({
	selector: '[fieldInputGroup]',
	exportAs: 'fieldInputGroup',
})
export class FieldInputGroupDirective implements AfterContentInit {

	@Output() public dataChange:
		EventEmitter<FieldInputGroupData>
		= new EventEmitter<FieldInputGroupData>();
	@Output( 'submit' )
	public submitEE:
		EventEmitter<FieldInputGroupData>
			= new EventEmitter<FieldInputGroupData>();
	@Output( 'validate' )
	public validateEE:
		EventEmitter<FieldInputGroupErrors>
			= new EventEmitter<FieldInputGroupErrors>();

	public invalid: boolean;
	public errors: FieldInputGroupErrors;

	@ContentChildren(
		FieldInput,
		{ descendants: true }
	)
	protected readonly inputComponents:
		QueryList<FieldInput>;
	@ContentChildren(
		FieldInputFactoryDirective,
		{ descendants: true }
	)
	protected readonly inputDirectives:
		QueryList<FieldInputFactoryDirective>;

	protected inputs: FieldInput[] = [];
	protected editableInputs: FieldInputEditable[] = [];
	protected readonlyInputs: FieldInputReadonly[] = [];

	ngAfterContentInit() {
		of(
			this
			.inputComponents
			.changes
			.pipe(
				startWith( this.inputComponents )
			),
			this
			.inputDirectives
			.changes
			.pipe(
				startWith( this.inputDirectives )
			)
		)
		.pipe(
			combineLatestAll(),
			untilCmpDestroyed( this )
		)
		.subscribe((
			[
				inputComponents,
				inputDirectives,
			]: [
				QueryList<FieldInput>,
				QueryList<FieldInputFactoryDirective>
			]
		) => {
			this.inputs = [];
			this.editableInputs = [];
			this.readonlyInputs = [];

			inputComponents.forEach((
				instance: FieldInput
			) => {
				this._addInputToArr( instance );
			});

			inputDirectives.forEach((
				{ componentRef }:
					FieldInputFactoryDirective
			) => {
				this._addInputToArr(
					componentRef.instance
				);
			});

			this.validate( false, false );

			this
			.editableInputs
			.forEach((
				{
					field,
					dataChange,
					validateEE,
				}: FieldInputEditable
			) => {
				dataChange
				.pipe(
					takeUntil(
						this
						.inputComponents
						.changes
					),
					takeUntil(
						this
						.inputDirectives
						.changes
					),
					untilCmpDestroyed( this )
				)
				.subscribe(( data: any ) => {
					this.dataChange.emit({
						[ field.id ]: data,
					});
				});

				validateEE
				.pipe(
					takeUntil(
						this
						.inputComponents
						.changes
					),
					takeUntil(
						this
						.inputDirectives
						.changes
					),
					untilCmpDestroyed( this )
				)
				.subscribe((
					e: FieldInputValidateEvent
				) => {
					let errors: FieldInputGroupErrors
						= { ...this.errors };

					if ( e.errors === null ) {
						delete errors[ field.id ];

						if ( _.isEmpty( errors ) ) {
							errors = null;
						}
					} else {
						errors[ field.id ] = e;
					}

					this.invalid = errors !== null;

					this.validateEE.emit(
						this.errors = errors
					);
				});
			});
		});
	}

	/**
	 * @param {FieldExtra['id']} id
	 * @return {FieldInput}
	 */
	public get(
		id: FieldExtra[ 'id' ]
	): FieldInput {
		return this.inputs.find(
			( { field }: FieldInput ) =>
				field.id === id
		);
	}

	/**
	 * @param {boolean=} emitEvent
	 * @return {FieldInputGroupData}
	 */
	public submit(
		emitEvent: boolean = true
	): FieldInputGroupData {
		if ( this.invalid ) {
			return;
		}

		const groupData: FieldInputGroupData
			= {};

		this.inputs.forEach((
			{ field, data }: FieldInput
		) => {
			groupData[ field.id ] = data;
		});

		if ( emitEvent ) {
			this
			.submitEE
			.emit( groupData );
		}

		return groupData;
	}

	/**
	 * @param {boolean=} emitEvent
	 * @param {boolean=} markAsDirty
	 * @return {FieldInputGroupErrors | null}
	 */
	public validate(
		emitEvent: boolean = true,
		markAsDirty: boolean = true
	): FieldInputGroupErrors | null {
		let errors: FieldInputGroupData = null;

		this
		.editableInputs
		.forEach((
			input: FieldInputEditable
		) => {
			const err: FieldValidationErrors | null
				= input.validate(
					undefined,
					emitEvent,
					markAsDirty
				);

			if ( err !== null ) {
				errors ||= {};

				errors[ input.field.id ] = err;
			}
		});

		this.invalid = errors !== null;

		if ( emitEvent ) {
			this
			.validateEE
			.emit( errors );
		}

		return this.errors = errors;
	}

	/**
	 * @param {boolean=} emitEvent
	 * @return {void}
	 */
	public reset(
		emitEvent: boolean = true
	) {
		this
		.editableInputs
		.forEach((
			input: FieldInputEditable
		) => {
			input.reset(
				undefined,
				emitEvent
			);
		});

		this.validate( false, false );
	}

	/**
	 * @param {FieldInput} input
	 * @return {void}
	 */
	private _addInputToArr(
		input: FieldInput
	) {
		if (
			input
				instanceof
					FieldInputEditable
		) {
			this
			.editableInputs
			.push( input );
		} else if (
			input
				instanceof
					FieldInputReadonly
		) {
			this
			.readonlyInputs
			.push( input );
		}

		this.inputs.push( input );
	}

}
