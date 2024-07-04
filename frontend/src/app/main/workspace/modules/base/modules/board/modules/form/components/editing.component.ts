import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
	inject
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	FormControl
} from '@angular/forms';
import {
	CdkDragDrop,
	transferArrayItem,
	moveItemInArray
} from '@angular/cdk/drag-drop';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceBoolean,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBFilePickerPickedEvent,
	CUBFilePickerService
} from '@cub/material/file-picker';
import {
	CUBScrollBarComponent
} from '@cub/material/scroll-bar';
import {
	CUBBasicButtonComponent
} from '@cub/material/button';
import {
	CUBFormFieldInputDirective
} from '@cub/material';

import {
	IError
} from '@error/interfaces';

import {
	Field
} from '@main/common/field/objects';
import {
	FieldBuilderService
} from '@main/common/field/modules/builder/services';
import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	DataType
} from '@main/common/field/interfaces';
import {
	DataValidate,
	getDefaultOptions,
	getValidateFn
} from '@main/common/field/modules/comparison/components';
import {
	ComparisonDefault,
	ValidateFnType
} from '@main/common/field/modules/comparison/interfaces';

import {
	NewOptionType,
	SingleConditionalComponent,
	singleConditionalValidate
} from '../../../../workflow/modules/setup/modules/common/conditional';
import {
	BoardField,
	BoardFieldUpdate
} from '../../../interfaces';
import {
	BoardFieldService
} from '../../../services';

import {
	LogicalOperator
} from '../../filter/resources';
import {
	Filter,
	FilterCondition,
	Option
} from '../../filter/interfaces';
import {
	FormView
} from '../../view/modules/form-view/interfaces';

import {
	BoardForm,
	BoardFormField
} from '../interfaces';

import {
	BoardFieldExtend
} from './sidebar.component';

@Unsubscriber()
@Component({
	selector		: 'editing',
	templateUrl		: '../templates/editing.pug',
	styleUrls		: [ '../styles/editing.scss' ],
	host			: { class: 'editing' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class EditingComponent
implements OnInit, AfterViewInit, OnChanges {

	@ViewChild( 'fieldElement' )
	protected fieldElement: ElementRef;
	@ViewChild( 'submitTextInput' )
	protected submitTextInput: ElementRef;
	@ViewChild( 'fieldSetting' )
	protected fieldSettingElement: ElementRef;
	@ViewChild( 'fieldDropArea' )
	protected fieldDropArea: ElementRef;
	@ViewChild( 'fieldSettingsScrollBar' )
	public fieldSettingsScrollBar: CUBScrollBarComponent;
	@ViewChild( 'desInput' )
	public desInput: CUBFormFieldInputDirective;
	@ViewChild( 'conditionalComp' )
	public conditionalComp: SingleConditionalComponent;

	@Input() public form: BoardForm;
	@Input() public formView: FormView;
	@Input() public fields: BoardField[];
	@Input() public showAddedFieldID: ULID;
	@Input() @CoerceBoolean() public isValid: boolean;

	@Output() public formChange: EventEmitter<BoardForm>
		= new EventEmitter<BoardForm>();
	@Output() public formFieldChange: EventEmitter<BoardFormField>
		= new EventEmitter<BoardFormField>();
	@Output() public fieldChange: EventEmitter<BoardField>
		= new EventEmitter<BoardField>();
	@Output() public isValidChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	protected readonly LOGICAL_OPERATOR: typeof LogicalOperator
		= LogicalOperator;
	protected readonly DATA_TYPE: typeof DataType
		= DataType;
	protected readonly NEW_OPTION_TYPE: typeof NewOptionType
		= NewOptionType;

	protected isTitleFocus: boolean;
	protected isDescriptionFocus: boolean;
	protected isSubmitTextEdit: boolean;
	protected hasRecaptcha: boolean;
	protected noneResetFocusedFieldID: boolean;
	protected isDragging: boolean;
	protected fieldWidth: number;
	protected formHeight: number;
	protected removedFields: BoardFormField[];
	protected fieldOfNewOption: Field;
	protected availableFields: Field[];
	protected excludeFields: Field[];
	protected dataForm: FormGroup;
	protected fieldsLK: ObjectType<BoardField>;
	protected focusingFieldID: ULID;
	protected submitTextFormControl: FormControl
		= new FormControl( undefined );
	protected formViewName: string = '';

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _fb: FormBuilder
		= inject( FormBuilder );
	private readonly _filePickerService: CUBFilePickerService
		= inject( CUBFilePickerService );
	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _fieldBuilderService: FieldBuilderService
		= inject( FieldBuilderService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();

	private _fieldsBackup: BoardField[];

	// Expression editors
	protected filterOptionsAnnotation: number[];

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.fields?.currentValue ) {
			this._fieldsBackup = _.clone( this.fields );
			this.fieldsLK = _.keyBy( this.fields, 'id' );
		}

		if ( changes.form?.currentValue ) {
			this._initFormControl();

			if (
				!this.hasRecaptcha
				&& this.form?.hasRecaptcha
			) {
				this._scrollToBottom();
			}

			this.hasRecaptcha = this.form.hasRecaptcha;

			this._checkRemovedFields();
		}

		if ( changes.showAddedFieldID?.currentValue ) {
			setTimeout(() => {
				this.focusFormField(
					this.showAddedFieldID,
					_.findIndex(
						this.form.fields,
						{ id: this.showAddedFieldID }
					)
				);
				this._scrollToBottom();
			});
		}
	}

	ngOnInit() {
		this.formViewName = this.formView.name;
		this.dataForm = this._fb.group({
			title: undefined,
			description: undefined,
		});

		if ( this.form ) this._initFormControl();
	}

	ngAfterViewInit() {
		this._getNewSize();
	}

	@HostListener('window:resize', ['$event'])
	protected onResize( _event: Event ) {
		this._getNewSize();
	}

	@HostListener( 'document:click', [ '$event' ] )
	protected onClick( event: Event ) {
		if ( !this._elementRef ) return;

		const itemClicked: Element
			= this._elementRef
			.nativeElement
			.querySelector(
				`[data-item-id='${this.focusingFieldID}']`
			);

		if ( itemClicked?.contains( event.target as HTMLElement ) ) return;

		if ( this.noneResetFocusedFieldID ) {
			this.noneResetFocusedFieldID = false;
		} else {
			if ( this.focusingFieldID ) {
				const focusingField: BoardFormField
					= _.find(
						this.form.fields,
						{ id: this.focusingFieldID }
					);

				this.checkFormValid();
				this.formFieldChange.emit( focusingField );
			}

			this.focusingFieldID = null;
			this.isDragging = false;
		}
	}

	@HostListener( 'document:mousedown', [ '$event' ] )
	protected onMouseDown( event: Event ) {
		if ( document.querySelector( '.cdk-overlay-container' )
		?.contains( event.target as HTMLElement ) ) {
			this.noneResetFocusedFieldID = true;
		};
	}


	/**
	 * @param {string} event
	 * @return {void}
	 */
	protected onFormTitleChange( event: string ) {
		if ( event === '' ) {
			this.formViewName = event;
		}
		this.form.title = event;

		this.checkFormValid();
		this.formChange.emit( this.form );
	}

	/**
	 * @param {ULID} fieldID
	 * @param {number} index
	 * @param {BoardFormField=} field
	 * @return {void}
	 */
	protected focusFormField(
		fieldID: ULID,
		index: number,
		field?: BoardFormField
	) {
		this.focusingFieldID = fieldID;

		setTimeout(
			() => {
				this._checkFieldsErrorState( index );

				singleConditionalValidate(
					field?.filter?.options,
					true,
					this.conditionalComp
				);
			}
		);
	}

	/**
	 * @param {boolean} isAvatar
	 * @return {void}
	 */
	protected alterImage( isAvatar: boolean ) {
		this._filePickerService.pick(
			{
				onPicked: this._onFilePicked.bind( this, isAvatar ),
			},
			{
				restoreFocus: this._elementRef,
			}
		);

		this.checkFormValid();
		this.formChange.emit( this.form );
	}

	/**
	 * @param {boolean} _isAvatar
	 * @return {void}
	 */
	protected editImage( _isAvatar: boolean ) {}

	/**
	 * @param {CdkDragDrop} event
	 * @return {void}
	 */
	protected onFieldDrop( event: CdkDragDrop<BoardFieldExtend[]> ) {
		this.isDragging = false;

		if ( event.previousContainer === event.container ) {
			moveItemInArray(
				event.container.data,
				event.previousIndex,
				event.currentIndex
			);

			const smallerIndex: number
				= event.currentIndex < event.previousIndex
					? event.currentIndex
					: event.previousIndex;

			this._checkFieldsErrorState( smallerIndex );
		} else {
			this.form.fields ||= [];

			const fields: BoardFieldExtend[]
				= event.previousContainer.data;
			let addedFieldsCount: number = 0;

			for ( const field of fields ) {
				if ( field.id === event.item.data.id ) break;

				if ( field.isAdded ) addedFieldsCount++;
			}

			const previousIndex: number
				= event.previousIndex + addedFieldsCount;

			const allAvailableFields: BoardFormField[]
				= this._convertToBoardFormField( fields );

			transferArrayItem(
				allAvailableFields,
				this.form.fields,
				previousIndex,
				event.currentIndex
			);

			this.checkFormValid();
			this.formChange.emit( this.form );
			this._checkFieldsErrorState( event.currentIndex );
		}

	}

	/**
	 * @param {BoardFormField} field
	 * @param {CUBBasicButtonComponent} element
	 * @return {void}
	 */
	protected editField(
		field: BoardFormField,
		element: CUBBasicButtonComponent
	) {
		const boardField: BoardField
			= _.find( this.fields, { id: field.id } );

		this._fieldBuilderService.build(
			this._fieldHelper.createField( boardField ),
			element.elementRef.nativeElement,
			undefined,
			undefined,
			this.onFieldEdited.bind( this ),
			undefined,
			{
				position: 'below',
			}
		);

		this.checkFormValid();
		this.formFieldChange.emit( field );
	}

	/**
	 * @return {void}
	 */
	protected editSubmitButton() {
		this.isSubmitTextEdit = true;

		setTimeout(
			() => this.submitTextInput.nativeElement.focus()
		);

		this.checkFormValid();
		this.formChange.emit( this.form );
	}

	/**
	 * @param {BoardFormField} f
	 * @param {number} removedIndex
	 * @return {void}
	 */
	protected removeField( f: BoardFormField ) {
		this.removedFields ||= [];
		this.removedFields.push( f );

		_.remove(
			this.form.fields,
			( _field: BoardFormField ) => _field.id === f.id
		);

		setTimeout(
			() => {
				this._checkFieldsErrorState( 0 );
			}
		);

		this.checkFormValid();
		this.formChange.emit( this.form );
	}

	/**
	 * @param {BoardFormField} field
	 * @param {number} index
	 * @return {void}
	 */
	protected filterChanged( field: BoardFormField, index: number ) {
		if ( field.filter.options ) {
			this._checkErrorState( index );
		}

		this.checkFormValid();
		this.formFieldChange.emit( field );
	}

	/**
	 * @param {BoardFormField} field
	 * @param {FilterCondition} condition
	 * @param {number} index
	 * @return {void}
	 */
	protected onConditionFilterChange(
		field: BoardFormField,
		condition: FilterCondition,
		index: number
	) {
		field.filter.conditions = condition;

		this._checkErrorState( index );
		this.checkFormValid();
		this.formFieldChange.emit( field );
	}

	/**
	 * @param {BoardFormField} field
	 * @param {LogicalOperator} operator
	 * @param {number} index
	 * @return {void}
	 */
	protected onLogicalOperatorChange(
		field: BoardFormField,
		operator: LogicalOperator,
		index: number
	) {
		field.filter.logicalOperator = operator;

		this._checkErrorState( index );
		this.checkFormValid();
		this.formFieldChange.emit( field );
	}

	/**
	 * @param {BoardFormField} field
	 * @param {string} logicalExpression
	 * @param {number} index
	 * @return {void}
	 */
	protected onLogicalExpressionChange(
		field: BoardFormField,
		logicalExpression: string,
		index: number
	) {
		field.filter.logicalExpression = logicalExpression;

		this._checkErrorState( index );
		this.checkFormValid();
		this.formFieldChange.emit( field );
	}

	/**
	 * @param {Column} field
	 * @param {Field} field
	 * @return {void}
	 */
	protected onFieldEdited( field: Field ) {
		const fieldIndex: number
			= _.findIndex( this.fields, { id: field.id } );
		let specificField: BoardField
			= this.fields[ fieldIndex ];
		const formFieldIndex: number
			= _.findIndex( this.form.fields, { id: field.id } );
		let specificFormField: BoardFormField
			= this.form.fields[ formFieldIndex ];
		const updateData: BoardFieldUpdate = {
			name: field.name,
			isRequired: field.isRequired,
			description: field.description || '',
			params: field.toJson()?.params,
			initialData: field.initialData,
		};

		this._boardFieldService
		.update( field.id, updateData )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( _res: BoardField ) => {

				specificField
					= {
						...specificField,
						...field,
					};
				specificField.params = updateData.params;

				this.fieldChange.emit( specificField );
				this.fields[ fieldIndex ]
					= specificField;
				this._fieldsBackup = _.cloneDeep( this.fields );
				this.fieldsLK = _.keyBy( this.fields, 'id' );

				specificFormField
					= {
						...specificFormField,
						...{
							customFieldName: field.name,
							descriptionField: field.description,
						},
					};

				this.checkFormValid();
				this.formFieldChange.emit( specificFormField );

				this.form.fields[ formFieldIndex ]
					= specificFormField;
				this.form = { ...this.form };
			},
			error: ( _err: IError ) => {
				this.fields = _.cloneDeep( this._fieldsBackup );

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {BoardFormField} field
	 * @param {number} index
	 * @return {void}
	 */
	protected changeConditionSwitch( field: BoardFormField, index: number ) {
		if ( field.hasConditions ) {
			this.addCondition( field );
		} else {
			field.filter = null;
		}

		setTimeout(
			() => this._checkFieldsErrorState( index )
		);
	}

	/**
	 * @param {BoardFormField} formfield
	 * @return {void}
	 */
	protected addCondition( formfield: BoardFormField ) {
		if ( _.isStrictEmpty( formfield.filter?.options ) ) {
			formfield.filter = {
				options: [],
				logicalOperator: LogicalOperator.AND,
			} as Filter;
		}

		const newBoardFieldIndex: number
			= _.findIndex( this.form.fields, { id: formfield.id } );
		const newBoardField: BoardField
			= this.fieldsLK[ this.form.fields[ newBoardFieldIndex - 1 ].id ];
		const newField: Field
			= this._fieldHelper.createField( newBoardField );
		const newOption: Option = {
			fieldID: newField.extra.id,
			order: formfield.filter.options?.length + 1,
			field: {
				...newField,
				dataType: newField.dataType,
			},
		} as Option;

		const {
			operator,
			compareType,
			formulaType,
		}: ComparisonDefault
			= getDefaultOptions(
				newField.dataType
			);

		newOption.operator = operator;

		if ( compareType || formulaType ) {
			newOption.data ||= {};

			if ( compareType ) {
				newOption.data.compareType = compareType;
			}
			if ( formulaType ) {
				newOption.data.formulaType = formulaType;
			}
		}

		formfield.filter.options.push( newOption );

		this.filterOptionsAnnotation ||= [];

		this.filterOptionsAnnotation.push(
			this.filterOptionsAnnotation.length + 1
		);
	}

	/**
	 * @param {BoardFormField} field
	 * @param {Option[]} options
	 * @param {number} index
	 * @return {void}
	 */
	protected onOptionsChange(
		field: BoardFormField,
		options: Option[],
		index: number
	) {
		field.filter = { ...field.filter, options };

		this.filterChanged( field, index );
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	protected setFieldOfNewOption( index: number ) {
		this.fieldOfNewOption
			= this._fieldHelper.createField(
				this.fieldsLK[ this.form.fields[ index - 1 ].id ]
			);
	}

	/**
	 * @return {void}
	 */
	protected focusDescription() {
		this.isDescriptionFocus = true;

		setTimeout(
			() => this.desInput.focus()
		);
	}

	/**
	 * @return {void}
	 */
	protected checkFormValid() {
		let isValid: boolean = true;

		if (
			!( this.dataForm.controls.title.valid
				&& this.dataForm.controls.description.valid )
		) {
			isValid = false;
		}

		if ( this.form.fields.length ) {
			isValid
				= !_.some(
					this.form.fields,
					[ 'isErrorCondition', true ]
				) && isValid;
		}

		this.isValidChange.emit( isValid );
	}

	/**
	 * @param {index} number
	 * @return {void}
	 */
	private _getFilterValue( index: number ) {
		const removedFields: Field[] = [];
		const availableFields: Field[] = [];
		const excludeFields: Field[] = [];

		_.forEach( this.removedFields, ( f: BoardFormField ) => {
			if ( _.find( this.form.fields, { id: f.id } ) ) return;

			const removedField: BoardField
				= this.fieldsLK[ f.id ];

			removedFields.push(
				this._fieldHelper.createField(
					removedField as unknown as Field<any>
				)
			);
		} );

		_.forEach( this.form.fields, ( _field: BoardFormField ) => {
			if ( _field.id === this.form.fields[ index ].id ) return;

			const availableField: BoardField
				= this.fieldsLK[ _field.id ];

			availableFields.push(
				this._fieldHelper.createField(
					availableField as unknown as Field<any>
				)
			);
		} );

		this.availableFields
			= [ ...availableFields, ...removedFields ];

		for (
			let i: number = index + 1;
			i < this.form.fields.length;
			i++
		) {
			const excludeField: BoardField
				= this.fieldsLK[ this.form.fields[ i ].id ];

			excludeFields.push(
				this._fieldHelper.createField(
					excludeField as unknown as Field<any>
				)
			);
		}

		this.excludeFields
			= [ ...excludeFields, ...removedFields ];
	}

	/**
	 * @param {CUBFilePickerPickedEvent} e
	 * @param {boolean} isAvatar
	 * @return {void}
	 */
	private _onFilePicked(
		e: CUBFilePickerPickedEvent,
		isAvatar: boolean
	) {
		if ( isAvatar ) {
			this.form.avatar = e.files[ 0 ].url;
		} else {
			this.form.coverImage = e.files[ 0 ].url;
		}
	}

	/**
	 * @return {void}
	 */
	private _getNewSize() {
		this._getFieldWidth();
		this._getFormHeight();
	}

	/**
	 * @return {void}
	 */
	private _getFieldWidth() {
		if ( !this.fieldElement ) {
			this.fieldWidth
				= this.fieldDropArea.nativeElement?.offsetWidth;

			return;
		};

		this.fieldWidth
			= this.fieldElement.nativeElement?.offsetWidth;
	}

	/**
	 * @return {void}
	 */
	private _getFormHeight() {
		if ( !this._elementRef ) return;

		const form: Element
			= document.getElementById( 'formContent' );

		setTimeout(() => {
			if ( !form ) return;

			this.formHeight
				= form.getBoundingClientRect().height;
		});

	}

	/**
	 * @return {void}
	 */
	private _initFormControl() {
		if ( !this.dataForm ) return;
		_.forEach( this.form.fields, ( f: BoardFormField ) => {
			if ( !this.dataForm.get( f.id + '_required' ) ) {
				this.dataForm.addControl(
					f.id + '_required',
					new FormControl( undefined )
				);

				this.dataForm.addControl(
					f.id + '_question',
					new FormControl( undefined )
				);

				this.dataForm.addControl(
					f.id + '_description',
					new FormControl( undefined )
				);

				this.dataForm.addControl(
					f.id + '_conditionalSwitch',
					new FormControl( undefined )
				);

				this.dataForm.addControl(
					f.id + '_logicalOperator',
					new FormControl( undefined )
				);
			}
		} );
	}

	/**
	 * @param {BoardFieldExtend[]} fields
	 * @return {BoardFormField[]}
	 */
	private _convertToBoardFormField( fields: BoardFieldExtend[] ) {
		return _.map( fields, ( _field: BoardFieldExtend ) => {
			if ( _field.isAdded ) return;

			return {
				id: _field.id,
				isRequired: false,
				isAdded: false,
				descriptionField: _field.description,
				customFieldName: _field.name,
				dataType: _field.dataType,
			};
		} );
	}

	/**
	 * @return {void}
	 */
	private _scrollToBottom() {
		setTimeout(
			() =>
				this.fieldSettingsScrollBar?.scrollTo({
					top: this.fieldSettingsScrollBar.nativeElement
					.scrollHeight - 200,
					behavior: 'smooth',
				}),
			10
		);
	}

	/**
	 * @return {void}
	 */
	private _checkFirstField() {
		const firstField: BoardFormField
			= this.form.fields[ 0 ];

		if ( firstField?.filter ) {
			this.filterChanged( firstField, 0 );
		}
	}

	/**
	 * @param {number} changedIndex
	 * @return {void}
	 */
	private _checkFieldsErrorState( changedIndex: number ) {
		this._checkFirstField();

		_.forEach(
			this.form.fields,
			( _field: BoardFormField, index: number ) => {
				if ( index < changedIndex ) return;

				if ( _field.hasConditions ) {
					this._getFilterValue( index );
					this._checkErrorState( index );

					this._cdRef.markForCheck();
				}
			}
		);

		this.checkFormValid();
		this.formChange.emit( this.form );
	}

	/**
	 * @return {void}
	 */
	private _checkRemovedFields() {
		_.forEach(
			this.removedFields,
			( field: BoardFormField ) => {
				if ( _.find( this.form.fields, { id: field?.id } ) ) {
					_.remove( this.removedFields, { id: field.id } );
				}
			}
		);
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	private _checkErrorState( index: number ) {
		const excludeFieldsLK: ObjectType<Field>
			= _.keyBy( this.excludeFields, 'id' );
		const field: BoardFormField
			= this.form.fields[ index ];
		let isError: boolean;

		_.forEach(
			field.filter?.options,
			( option: Option ) => {
				if (
					excludeFieldsLK[ option.fieldID ]
					|| excludeFieldsLK[ option.data?.fieldID ]
				) {
					isError = true;
				}

				this._checkOptionError( option );

				isError
					= option.error?.data
					|| option.error?.field
					|| option.error?.otherField
					|| isError;
			}
		);

		field.isErrorCondition = isError;
		this.form.fields[ index ] = field;
	}

	/**
	 * @param {BoardFormField} field
	 * @param {Option} option
	 * @return {void}
	 */
	private _checkOptionError(
		option: Option
	) {
		const validate: ValidateFnType
				= getValidateFn( option.field.dataType );

		option.error
			= {
				...option.error,
				...validate(
					option as DataValidate<any>,
					this.fields
				),
			};
	}

}
