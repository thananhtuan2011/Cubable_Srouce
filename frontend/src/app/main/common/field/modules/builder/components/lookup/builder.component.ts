import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	FormBuilder,
	FormControlStatus,
	FormGroup
} from '@angular/forms';
import {
	finalize
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';
import {
	createCUBDate,
	CUBDate,
	CUBMenuComponent
} from '@cub/material';

import {
	CURRENCIES
} from '@main/common/field/resources';
import {
	BoardField,
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	BoardFieldService,
	BoardService
} from '@main/workspace/modules/base/modules/board/services';
import {
	NewOptionType
} from '@main/workspace/modules/base/modules/workflow/modules/setup/modules/common/conditional';
import {
	FilterCondition,
	Option
} from '@main/workspace/modules/base/modules/board/modules/filter/interfaces';
import {
	FieldHelper
} from '@main/common/field/helpers';

import {
	CurrencyField,
	FormulaField,
	LookupField,
	NumberField
} from '../../../../objects';
import {
	DataType,
	DATE_FORMATS,
	Field,
	FormatType,
	IFieldExtra,
	NumberFormat,
	Operator,
	TIME_FORMATS
} from '../../../../interfaces';

import {
	FieldBuilder
} from '../builder';
import {
	EventAdvance,
	ComparisonSource
} from '../../../comparison/interfaces';
import {
	ComparisonOperator
} from '../../../comparison/resources';

type OperatorConfig = {
	value: Operator | number;
	label: string;
};

type FormatTypeConfig = {
	value: FormatType;
	label: string;
};

type SelectedSourceBoardField = {
	id?: ULID;
	name?: string;
};

const CURRENT_DATE: CUBDate
	= createCUBDate();

const FORMAT_TYPE: FormatTypeConfig[] = [
	{
		value: FormatType.Number,
		label: 'FIELD.BUILDER.LABEL.NUMBER',
	},
	{
		value: FormatType.Currency,
		label: 'FIELD.BUILDER.LABEL.CURRENCY',
	},
];

const OPERATORS: OperatorConfig[] = [
	{
		value: Operator.NotApply,
		label: 'FIELD.BUILDER.LABEL.NOT_APPLY',
	},
	{
		value: Operator.CountAll,
		label: 'FIELD.BUILDER.LABEL.COUNT_ALL',
	},
	{
		value: Operator.CountEmpty,
		label: 'FIELD.BUILDER.LABEL.COUNT_EMPTY',
	},
	{
		value: Operator.CountNotEmpty,
		label: 'FIELD.BUILDER.LABEL.COUNT_NOT_EMPTY',
	},
	{
		value: Operator.CountUnique,
		label: 'FIELD.BUILDER.LABEL.COUNT_UNIQUE',
	},
	{
		value: Operator.CountValues,
		label: 'FIELD.BUILDER.LABEL.COUNT_VALUES',
	},
	{
		value: Operator.Sum,
		label: 'FIELD.BUILDER.LABEL.SUM',
	},
	{
		value: Operator.Average,
		label: 'FIELD.BUILDER.LABEL.AVERAGE',
	},
	{
		value: Operator.Max,
		label: 'FIELD.BUILDER.LABEL.MAX',
	},
	{
		value: Operator.Min,
		label: 'FIELD.BUILDER.LABEL.MIN',
	},
	{
		value: Operator.Med,
		label: 'FIELD.BUILDER.LABEL.MED',
	},
	{
		value: Operator.Range,
		label: 'FIELD.BUILDER.LABEL.RANGE',
	},
	{
		value: Operator.CountChecked,
		label: 'FIELD.BUILDER.LABEL.COUNT_CHECKED',
	},
	{
		value: Operator.CountUnchecked,
		label: 'FIELD.BUILDER.LABEL.COUNT_UN_CHECKED',
	},
	{
		value: Operator.DayRange,
		label: 'FIELD.BUILDER.LABEL.DAY_RANGE',
	},
	{
		value: Operator.MonthRange,
		label: 'FIELD.BUILDER.LABEL.MONTH_RANGE',
	},
	{
		value: Operator.EarliestDate,
		label: 'FIELD.BUILDER.LABEL.EARLIEST_DATE',
	},
	{
		value: Operator.LatestDate,
		label: 'FIELD.BUILDER.LABEL.LATEST_DATE',
	},
];

@Unsubscriber()
@Component({
	selector: 'lookup-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'lookup-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LookupFieldBuilderComponent
	extends FieldBuilder<LookupField>
	implements OnInit {

	protected static readonly ALLOW_OPERATOR_DATA_TYPES: DataType[] = [
		FormulaField.dataType,
		NumberField.dataType,
		CurrencyField.dataType,
	];
	protected readonly COMPARISON_SOURCE: typeof ComparisonSource
		= ComparisonSource;
	protected readonly COMPARISON_OPERATOR: typeof ComparisonOperator
		= ComparisonOperator;

	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly CURRENCIES = CURRENCIES;
	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly DATE_FORMATS = DATE_FORMATS;
	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly TIME_FORMATS = TIME_FORMATS;
	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly CURRENT_DATE = CURRENT_DATE;
	// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/typedef
	protected readonly NumberFormat = NumberFormat;
	protected readonly DATA_TYPE: typeof DataType = DataType;
	protected readonly OPERATORS: typeof Operator = Operator;
	protected readonly FORMAT_TYPE: typeof FormatType = FormatType;
	protected readonly NEW_OPTION_TYPE: typeof NewOptionType
		= NewOptionType;

	@ViewChild( 'operatorDropdown' )
	protected operatorDropdown: CUBDropdownComponent;
	@ViewChild( 'sourceFieldMenu' )
	protected sourceFieldMenu: CUBMenuComponent;

	protected isLoaded: boolean;
	protected sourceBoardName: string;
	protected operators: OperatorConfig[] = OPERATORS;
	protected formatType: FormatTypeConfig[] = FORMAT_TYPE;
	protected sourceBoardField: IFieldExtra[];
	protected sourceBoardFieldFiltered: IFieldExtra[];
	protected sourceBoard: IBoard[];
	protected internalField: LookupField;
	protected fieldForm: FormGroup;
	protected selectedSourceBoardField: SelectedSourceBoardField;
	protected eventAdvance: EventAdvance[];

	private _bkOperators: OperatorConfig[];

	private readonly _fb: FormBuilder
		= inject( FormBuilder );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _boardService: BoardService
		= inject( BoardService );
	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();

	/**
	 * @constructor
	 */
	override ngOnInit() {
		if ( this.internalField?.params ) {

		}

		super.ngOnInit();

		this._bkOperators
			= _.cloneDeep( this.operators );

		this.fieldForm = this._fb.group({
			sourceBoardID: undefined,
			sourceFieldID: undefined,
			operator: undefined,
			formatTypeControl: undefined,
			currencyControl: undefined,
			numberFormat: undefined,
			decimalPlaces: undefined,
			dateFormat: undefined,
			timeFormat: undefined,
		});

		this.fieldForm.statusChanges
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( status: FormControlStatus ) => {
				if ( status === 'VALID' ) {
					if ( !this.internalField.lookup?.filter ) return;

					this._checkErrorState();
				}

				if ( status === 'INVALID' ) {
					this.canSubmit$.next( false );
				}
			},
		});

		this._initBoard();
	}

	/**
	 * @param {ULID} sourceBoardID
	 * @return {void}
	 */
	protected onSelectSourceBoard( sourceBoardID: ULID ) {
		if (
			this.internalField.lookup?.sourceBoardID
			=== sourceBoardID
		) return;

		this.operators = [];

		if ( this.internalField.lookup?.filter ) {
			this.internalField.lookup.filter = null;
		}

		if ( this.selectedSourceBoardField ) {
			this.selectedSourceBoardField
				= this.internalField.lookup.operator
				= this.internalField.lookup.sourceFieldID
				= null;
		}

		this.sourceBoardName
			= _.find( this.sourceBoard, { id: sourceBoardID } ).name;

		this.internalField.lookup = {
			...this.internalField?.lookup,
			sourceBoardID,
		};

		this.fieldForm.get( 'operator' ).reset();
		this.fieldForm.get( 'sourceFieldID' ).reset();

		this.getSourceBoardField();
	}

	/**
	 * @return {void}
	 */
	protected getSourceBoardField() {
		if ( !this.internalField.lookup?.sourceBoardID ) return;

		this._boardFieldService
		.get( this.internalField.lookup.sourceBoardID, true )
		.pipe(
			finalize( () => {
				this.isLoaded = true;

				this.cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( fields: BoardField[] ) => {
				_.forEach( _.cloneDeep( fields ), ( f: BoardField ) => {
					if ( f.dataType !== DataType.Lookup ) return;
					if (
						f.params.lookup?.sourceFieldDataType
						!== DataType.Lookup
					) return;

					_.remove( fields, { id: f.id } );
				} );

				this.sourceBoardField = [];

				_.forEach( fields, ( f: BoardField )=> {
					this.sourceBoardField.push(
						this._fieldHelper.createField(
							f as unknown as Field<any>
						)
					);
				} );

				this.eventAdvance = [
					{
						lookupCondition: {
							fieldID: this.internalField?.id,
						},
						name: this.popupContext.context.boardName,
						boardID: this.popupContext.context.boardID,
						icon: 'check',
					},
				];

				if ( this.internalField?.lookup?.sourceFieldID ) {
					const field: Field
						= _.find(
							this.sourceBoardField,
							{
								id: this.internalField.lookup.sourceFieldID,
							}
						);

					if ( field ) {
						this.selectedSourceBoardField = {
							id: field.extra.id,
							name: field.name,
						};

						this._filterOperator( field.dataType );
					}
				}
			},
		});
	}

	/**
	 * @param {Option[]} options
	 * @return {void}
	 */
	protected onOptionsChange(
		options: Option[]
	) {
		this.internalField.lookup.filter
			= {
				...this.internalField.lookup.filter,
				options,
			};

		this._checkErrorState();
	}

	/**
	 * @param {FilterCondition} condition
	 * @return {void}
	 */
	protected onConditionFilterChange(
		condition: FilterCondition
	) {
		this.internalField.lookup.filter.conditions = condition;

		this._checkErrorState();
	}
	/**
	 * @return {void}
	 */
	protected filterChanged() {
		this._checkErrorState();
	}

	/**
	 * @param {FieldExtra} field
	 * @return {void}
	 */
	protected onSelectSourceBoardField( field: IFieldExtra ) {
		if (
			this.internalField.lookup.sourceFieldID
			=== field.id
		) {
			this.sourceFieldMenu.close();

			return;
		}

		this.internalField.lookup = {
			...this.internalField.lookup,
			sourceFieldDataType: field.dataType,
			sourceFieldID: field.id,
			sourceFieldParams: field.params,
		};

		this.selectedSourceBoardField = {
			id: field.id,
			name: field.name,
		};

		this.operators = [];

		if ( this.internalField.lookup?.operator ) {
			this.internalField.lookup.operator
				= this.internalField.lookup.format
				= null;

			this.fieldForm.get( 'operator' ).reset();
		}

		if ( field.dataType !== DataType.Formula ) {
			if ( field.dataType === DataType.Lookup ) {
				this._filterOperator( field.params.lookup.sourceFieldDataType );
			} else {
				this._filterOperator( field.dataType );
			}
		} else {
			this.operators = _.cloneDeep( this._bkOperators );
		}

		this.sourceFieldMenu.close();
		this.operatorDropdown.open();
	}

	/**
	 * @param {Operator} operator
	 * @return {void}
	 */
	protected onSelectOperator( operator: Operator ) {
		if (
			this.internalField.lookup.operator
			=== operator
		) return;

		this.internalField.lookup.operator = operator;

		if ( operator === Operator.NotApply ) {
			this.internalField.lookup.format = null;

			return;
		}

		if (
			(
				this.internalField.lookup.operator
				=== Operator.EarliestDate)
			|| (
				this.internalField.lookup.operator
				=== Operator.LatestDate ) ) {
			this.internalField.lookup = {
				...this.internalField.lookup,
				format: {},
			};
		}
	}

	/**
	 * @param {FormatType} type
	 * @return {void}
	 */
	protected onFormatTypeChange( type: FormatType ) {
		this.internalField.lookup.format ||= {};

		this.internalField.lookup = {
			...this.internalField.lookup,
			format: {
				formatType: type,
			},
		};

		this.cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	private _initBoard() {
		this._boardService
		.get(
			this.popupContext.context.baseID,
			true
		)
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( boards: IBoard[] ) => {
				if ( !boards?.length ) return;

				this.sourceBoard = boards;

				if ( this.internalField?.lookup?.sourceFieldID ) {
					this.sourceBoardName
						= _.find(
							this.sourceBoard,
							{ id: this.internalField.lookup.sourceBoardID }
						).name;

					this.getSourceBoardField();
				} else {
					this.isLoaded = true;
				}
			},
		});
	}

	/**
	 * @param {DataType} dataType
	 * @return {void}
	 */
	private _filterOperator(
		dataType: DataType
	) {
		if (
			dataType === DataType.Text
			|| dataType === DataType.Paragraph
			|| dataType === DataType.Dropdown
			|| dataType === DataType.Email
			|| dataType === DataType.People
			|| dataType === DataType.CreatedBy
			|| dataType === DataType.LastModifiedBy
			|| dataType === DataType.Link
			|| dataType === DataType.Phone
		) {
			this.operators
				= _.filter(
					this._bkOperators,
					( o: OperatorConfig ) => {
						return o.value === Operator.CountAll
						|| o.value === Operator.CountValues
						|| o.value === Operator.CountUnique
						|| o.value === Operator.CountEmpty
						|| o.value === Operator.CountNotEmpty
						|| o.value === Operator.NotApply;
					}
				);
		}

		if (
			dataType === DataType.Number
			|| dataType === DataType.Progress
			|| dataType === DataType.Currency
			|| dataType === DataType.Rating
		) {
			this.operators
				= _.filter(
					this._bkOperators,
					( o: OperatorConfig ) => {
						return o.value === Operator.CountAll
						|| o.value === Operator.CountValues
						|| o.value === Operator.CountUnique
						|| o.value === Operator.CountEmpty
						|| o.value === Operator.CountNotEmpty
						|| o.value === Operator.Sum
						|| o.value === Operator.Average
						|| o.value === Operator.Min
						|| o.value === Operator.Max
						|| o.value === Operator.Med
						|| o.value === Operator.Range
						|| o.value === Operator.NotApply;
					}
				);
		}

		if (
			dataType === DataType.Date
			|| dataType === DataType.LastModifiedTime
			|| dataType === DataType.CreatedTime
		) {
			this.operators
				= _.filter(
					this._bkOperators,
					( o: OperatorConfig ) => {
						return o.value === Operator.CountAll
						|| o.value === Operator.CountValues
						|| o.value === Operator.CountUnique
						|| o.value === Operator.CountEmpty
						|| o.value === Operator.CountNotEmpty
						|| o.value === Operator.DayRange
						|| o.value === Operator.MonthRange
						|| o.value === Operator.EarliestDate
						|| o.value === Operator.LatestDate
						|| o.value === Operator.NotApply;
					}
				);
		}

		if ( dataType === DataType.Checkbox ) {
			this.operators
				= _.filter(
					this._bkOperators,
					( o: OperatorConfig ) => {
						return o.value === Operator.CountAll
						|| o.value === Operator.CountChecked
						|| o.value === Operator.CountUnchecked
						|| o.value === Operator.NotApply;
					}
				);
		}

		if ( dataType === DataType.Attachment ) {
			this.operators
				= _.filter(
					this._bkOperators,
					( o: OperatorConfig ) => {
						return o.value === Operator.CountAll
						|| o.value === Operator.CountEmpty
						|| o.value === Operator.CountNotEmpty
						|| o.value === Operator.NotApply;
					}
				);
		}

		if ( dataType === DataType.Reference ) {
			this.operators
				= _.filter(
					this._bkOperators,
					( o: OperatorConfig ) => {
						return o.value === Operator.CountAll
						|| o.value === Operator.CountValues
						|| o.value === Operator.CountUnique
						|| o.value === Operator.CountEmpty
						|| o.value === Operator.CountNotEmpty
						|| o.value === Operator.NotApply;
					}
				);
		}
	}

	/**
	 * @return {void}
	 */
	private _checkErrorState() {
		if ( this.fieldForm.invalid ) return;

		_.forEach(
			this.internalField.lookup.filter.options,
			( option: Option ) => {
				if ( !option?.error ) {
					this.canSubmit$.next( false );

					return false;
				}

				if (
					!option.error.data
					&& !option.error.field
					&& !option.error.otherField ) {
					this.canSubmit$.next( true );
				} else {
					this.canSubmit$.next( false );

					return false;
				}
			}
		);
	}

}
