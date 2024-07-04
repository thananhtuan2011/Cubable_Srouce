import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
	QueryList,
	ViewChild,
	ViewChildren
} from '@angular/core';
import {
	CdkDragDrop,
	moveItemInArray
} from '@angular/cdk/drag-drop';
import {
	FormBuilder,
	FormControlStatus,
	FormGroup
} from '@angular/forms';
import {
	finalize,
	Subscription
} from 'rxjs';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBConfirmService,
	CUBIConfirmRef
} from '@cub/material/confirm';
import {
	CUBDropdownComponent
} from '@cub/material/dropdown';
import {
	CUBFormFieldInputDirective
} from '@cub/material/form-field';

import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	BoardField,
	FieldsOfBoard,
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	DropdownOption
} from '../../../../interfaces';
import {
	DropdownField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Unsubscriber()
@Component({
	selector: 'dropdown-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'dropdown-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownFieldBuilderComponent
	extends FieldBuilder<DropdownField>
	implements OnInit {

	protected readonly onBeforeToggleFn: () => boolean
		= this.onSelectionModeSwitched.bind( this );
	protected onBeforeChooseReferenceModeFn: () => boolean
		= this.onBeforeChooseReferenceMode.bind( this );
	protected onBeforeChooseManualModeFn: () => boolean
		= this.onBeforeChooseManualMode.bind( this );

	protected isLoading: boolean;
	protected isCopying: boolean;
	protected internalField: DropdownField;
	protected fieldForm: FormGroup;
	protected boardSelected: IBoard;
	protected fieldSelected: BoardField;
	protected refSubscription: Subscription;
	protected boards: IBoard[];
	protected fields: BoardField[];
	protected allFields: ObjectType<{ fields: BoardField[] }>;

	private _internalFieldBk: DropdownField;
	private readonly _fb: FormBuilder
		= inject( FormBuilder );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );

	@ViewChild( 'fieldDropdown' )
	protected readonly fieldDropdown: CUBDropdownComponent;

	@ViewChildren( 'optionNameInput' )
	protected readonly optionNameInputs: QueryList<CUBFormFieldInputDirective>;

	override ngOnInit() {
		super.ngOnInit();

		if ( !_.isStrictEmpty( this.internalField.reference ) ) {
			this._initData();
		}

		this._internalFieldBk = _.cloneDeep( this.internalField );
	}

	/**
	 * @return {Promise}
	 */
	protected onBeforeChooseReferenceMode(): Promise<boolean> {
		return new Promise(( resolve: any ) => {
			if (
				this.internalField?.reference
				|| ( !this.internalField?.options
					|| _.isStrictEmpty( this.internalField.options ) )
			) {
				resolve( true );
				return;
			}

			this._openConfirm( resolve );
		});
	}

	/**
	 * @return {Promise}
	 */
	protected onBeforeChooseManualMode(): Promise<boolean> {
		return new Promise(( resolve: any ) => {
			if (
				( this.internalField?.options
					&& !this.internalField?.reference?.fieldID )
				|| ( !( this.internalField?.reference?.boardID
					|| this.internalField?.reference?.fieldID ) )
			 ) {
				resolve( true );
				return;
			}

			this._openConfirm( resolve );
		});
	}

	/**
	 * @param {CdkDragDrop} event
	 * @return {void}
	 */
	protected onOptionDropped( event: CdkDragDrop<DropdownOption[]> ) {
		moveItemInArray(
			this.internalField.options,
			event.previousIndex,
			event.currentIndex
		);
	}

	/**
	 * @return {void}
	 */
	protected onSelectionModeSwitched(): Promise<boolean> {
		return new Promise(( resolve: any ) => {
			if ( !this.internalField.isMultipleSelect ) {
				resolve( true );
				return;
			}

			const confirmRef: CUBIConfirmRef = this._cubConfirmService.open(
				'FIELD.BUILDER.MESSAGE.LOST_INITIAL_VALUE_CONFIRMATION',
				'FIELD.BUILDER.MESSAGE.WILL_LOST_VALUE',
				{
					warning: true,
					buttonApply: {
						text: 'FIELD.BUILDER.LABEL.CONFIRM',
						type: 'destructive',
					},
					buttonDiscard: 'FIELD.BUILDER.LABEL.CANCEL',
				}
			);

			confirmRef
			.afterClosed()
			.pipe( untilCmpDestroyed( this ) )
			.subscribe(( answer: boolean ) => {
				if ( !answer ) {
					resolve();
					return;
				}

				const initialData: string[]
					= this.initialData?.value?.slice( 0, 1 );
				this._setInitialDate(
					initialData
						? { value: initialData }
						: null
				);

				resolve( true );
			});
		});
	}

	/**
	 * @param {number} currentIdx
	 * @return {void}
	 */
	protected focusNextOption( currentIdx: number ) {
		const optionNameInput: CUBFormFieldInputDirective
			= this.optionNameInputs.get( currentIdx + 1 );

		optionNameInput
			? optionNameInput.focus()
			: this.addOption();
	}

	/**
	 * @return {void}
	 */
	protected manualChecked() {
		this.refSubscription?.unsubscribe();
		this.canSubmit$.next( true );

		delete this.internalField.reference;
		this.boardSelected = null;
		this.fieldSelected = null;

		this.internalField.options
			= this._internalFieldBk?.reference?.fieldID
				? null
				: this._internalFieldBk?.options;

		this._setInitialDate( null );
	}

	/**
	 * @return {void}
	 */
	protected referenceChecked() {
		delete this.internalField.options;

		this.internalField.allowAddSelections = false;

		if ( this.internalField.reference?.boardID ) {
			this.canSubmit$.next(
				!!this.internalField.reference?.boardID
				&& !!this.internalField.reference?.fieldID
			);
			this._checkReferenceForm();
			return;
		}

		if ( this._internalFieldBk?.reference?.boardID ) {
			this.boardSelected = _.find(
				this.boards,
				{ id: this._internalFieldBk.reference.boardID }
			);
			this.fieldSelected = _.find(
				this.fields,
				{ id: this._internalFieldBk.reference.fieldID }
			);
		}

		this.internalField.reference
			= {
				boardID: this.boardSelected?.id || undefined,
				fieldID: this.fieldSelected?.id || undefined,
			};

		this._initData();

		this.canSubmit$.next(
			!!this.internalField.reference?.boardID
			&& !!this.internalField.reference?.fieldID
		);
		this._checkReferenceForm();
		this._setInitialDate( null );
	}

	/**
	 * @return {void}
	 */
	protected onMultipleSelectChanged( checked: boolean ) {
		this.internalField.isMultipleSelect = checked;

		if ( checked === this._internalFieldBk.isMultipleSelect ) {
			this._setInitialDate( this._internalFieldBk.initialData );
		}
	}

	/**
	 * @return {void}
	 */
	protected copyFromOtherField() {
		this.isCopying = true;
		this.boardSelected = this.fieldSelected = null;

		this._initData();
	}

	/**
	 * @return {void}
	 */
	protected copy() {
		this.isCopying = false;

		this.internalField.options = this.internalField.options
			? _.concat(
				this.internalField.options,
				this.fieldSelected.params?.options
			)
			: this.fieldSelected.params?.options;

		this.boardSelected = this.fieldSelected = null;
	}

	/**
	 * @return {void}
	 */
	protected onFieldChanged( event: BoardField ) {
		this.fieldSelected = event;

		if ( !event ) return;

		if (
			this._internalFieldBk?.reference?.fieldID
				!== this.fieldSelected.id
		) {
			this.internalField.initialData = {} as any;
		} else {
			this.internalField.initialData
				= _.pick(
					this._internalFieldBk.initialData,
					[ 'selected', 'value' ]
				);
		}

		this.internalField.reference.fieldID = this.fieldSelected.id;
	}

	/**
	 * @param {boolean=} isCopy
	 * @return {void}
	 */
	protected onBoardChanged( event: IBoard, isCopy?: boolean ) {
		this.boardSelected = event;

		if ( !event ) {
			this.fieldSelected = null;
			return;
		}

		this._getFields();

		if ( !isCopy ) {
			this.internalField.reference.boardID = this.boardSelected.id;
		}

		setTimeout(
			() => this.fieldDropdown.open()
		);
	}

	/**
	 * @return {void}
	 */
	protected addOption() {
		this.internalField.addOption();
	}

	/**
	 * @param {DropdownOption} option
	 * @return {void}
	 */
	protected removeOption( option: DropdownOption ) {
		this.internalField.removeOption( option );

		if (
			this.initialData?.value?.indexOf( option.value ) >= 0
		) {
			_.pull( this.initialData.value, option.value );
			_.remove( this.initialData.selected, { value: option.value } );
			this._setInitialDate( this.initialData );
		}
	}

	/**
	 * @return {void}
	 */
	protected override done() {
		if ( this.internalField.reference ) {
			this.internalField.options = null;
		}

		super.done();
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	protected onTabChange( index: number ) {
		if (
			index !== 1 ||
			!this.internalField.reference?.fieldID
		) return;

		this._boardFieldService
		.getDropdownOptions(
			this.internalField.reference.fieldID,
			true
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( options: DropdownOption[] ) => {
				if (
					this._internalFieldBk?.reference?.fieldID
						!== this.fieldSelected.id
				) {
					this.internalField.options = [];
					this.initialData = [];
				} else {
					this.internalField.options = options;
					this.initialData
						= _.pick(
							this.internalField.initialData,
							[ 'selected', 'value' ]
						);
				};

				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		if ( this.boards ) return;

		this.fieldForm = this._fb.group({
			boardRef: undefined,
			fieldRef: undefined,
		});

		if ( this.internalField.reference ) {
			this.canSubmit$.next(
				!!this.internalField.reference.boardID
				&& !!this.internalField.reference.fieldID
			);
			this._checkReferenceForm();
		}

		this.validateContext();

		this.isLoading = true;
		this.allFields = {};
		this.boards = [];

		this._boardFieldService
		.getDropdownByBase( this.popupContext.context.baseID )
		.pipe(
			finalize( () => {
				this.isLoading = false;

				this.cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( fieldsOfBoards: FieldsOfBoard[] ) => {
				_.forEach( fieldsOfBoards, ( fieldsOfBoard: FieldsOfBoard ) => {
					const fields: BoardField[] = _.filter(
						fieldsOfBoard.fields,
						( field: BoardField ) => {
							return field.id !== this.internalField.id;
						}
					);

					if ( !fields.length ) return;

					this.boards.push(
						{
							id: fieldsOfBoard.id,
							name: fieldsOfBoard.name,
						} as IBoard
					);

					this.allFields[ fieldsOfBoard.id ] = { fields };
				} );

				if ( this.internalField.reference ) {
					this.boardSelected = _.find(
						this.boards,
						{ id: this.internalField.reference.boardID }
					);

					this._getFields();

					this.fieldSelected = _.find(
						this.fields,
						{ id: this.internalField.reference.fieldID }
					);
				}
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _getFields() {
		this.fields
			= this.allFields[ this.boardSelected?.id ]?.fields;
	}

	/**
	 * @param {any} resolve
	 * @return {void}
	 */
	private _openConfirm( resolve: any ) {
		const confirmRef: CUBIConfirmRef = this._cubConfirmService.open(
			'FIELD.BUILDER.MESSAGE.LOST_VALUE_CONFIRMATION',
			'FIELD.BUILDER.MESSAGE.WILL_LOST_VALUE',
			{
				warning: true,
				buttonApply: {
					text: 'FIELD.BUILDER.LABEL.CONFIRM',
					type: 'destructive',
				},
				buttonDiscard: 'FIELD.BUILDER.LABEL.CANCEL',
			}
		);

		confirmRef
		.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( resolve );
	}

	/**
	 * @return {void}
	 */
	private _checkReferenceForm() {
		this.refSubscription = this.fieldForm.statusChanges
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( status: FormControlStatus ) => {
				this.canSubmit$.next( status === 'VALID' );
			},
		});
	}

	/**
	 * @param {any} value
	 * @return {void}
	 */
	private _setInitialDate( value: any ) {
		this.initialData
			= value?.value.length
				? value
				: null;

		super.onInitialDataChanged( this.initialData );
	}

}
