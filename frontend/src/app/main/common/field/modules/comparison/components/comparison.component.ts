import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceBoolean
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';

import {
	DataType,
	Field
} from '../../../interfaces';
import {
	FormulaField,
	LookupField
} from '../../../objects';

import {
	ComparisonOperator
} from '../resources';
import {
	ComparisonDefault,
	ComparisonErrorType,
	EventAdvance,
	ComparisonSource
} from '../interfaces';
import {
	ComparisonBase,
	FormulaComparisonComponent,
	getDefaultOptions
} from '../components';

export type ExcludeFields = {
	fields: Field[];
	errorMessage: string;
	isDisable?: boolean;
};

// const dataTypeEmpty: ReadonlySet<DataType> = new Set([
// 	DataType.Paragraph,
// 	DataType.Link,
// 	DataType.Attachment,
// 	DataType.Lookup,
// ]);

@Component({
	selector: 'comparison',
	templateUrl: '../templates/comparison.pug',
	styleUrls: [ '../styles/comparison.scss' ],
	host: { class: 'comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparisonComponent
implements OnChanges {

	@ViewChild( 'subComparison' )
	public subComparison: ComparisonBase;
	@ViewChild( 'formulaComparison' )
	public formulaComparison: FormulaComparisonComponent;
	@ViewChild( 'comparisonFieldDropdown' )
	private _comparisonFieldDropdown: CUBDropdownComponent;

	@Input() @CoerceArray()
	public fields: Field[];
	@Input() @CoerceBoolean()
	public groupAble: boolean; // TODO change to comparison group
	@Input() public excludeFields: ExcludeFields;
	@Input() public field: Field;
	@Input() public error: ComparisonErrorType;
	@Input() public fieldID: ULID;
	@Input() public operator: ComparisonOperator;
	@Input() public data: any;
	@Input() public advanceOperators: ReadonlySet<ComparisonOperator>;
	@Input() public eventAdvance: EventAdvance[];
	@Input( 'comparisonModule' )
	public source: ComparisonSource;

	@Output() public fieldIDChange: EventEmitter<ULID>
		= new EventEmitter<ULID>();
	@Output() public operatorChange: EventEmitter<ComparisonOperator>
		= new EventEmitter<ComparisonOperator>();
	@Output() public dataChange: EventEmitter<any>
		= new EventEmitter<any>();
	@Output() public fieldChange: EventEmitter<Field>
		= new EventEmitter<Field>();

	@HostBinding( 'class.comparison' )

	protected readonly DATA_TYPE: typeof DataType = DataType;
	protected readonly fieldControl: FormControl
		= new FormControl( undefined );

	protected fieldsMap: Map<ULID, Field>;
	protected availableFields: Field[];
	protected excludeFieldsLK: ObjectType<Field>;

	private _fieldIdBk: ULID;

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.fields?.currentValue ) {
			this.fieldsMap = new Map(
				Object.entries(
					_.keyBy(
						this.fields,
						( field: Field ) => { return field.extra.id; }
					)
				)
			);

			this.availableFields = [ ...this.fields ];
		}

		if ( changes.excludeFields?.currentValue ) {
			const tempFields: Field[] = [];

			this.excludeFieldsLK
				= _.keyBy( this.excludeFields.fields, 'id' );

			_.forEach(
				this.fields,
				( _field: Field ) => {
					if ( _field.dataType === LookupField.dataType ) {
						return;
					}

					if (
						!this.excludeFieldsLK[ ( _field as any ).id ]
						|| ( _field as any ).id === this.fieldID
					) {
						tempFields.push( _field );
					}
				}
			);

			this.availableFields = tempFields;
		}

		if ( changes.fieldID?.currentValue ) {
			this._fieldIdBk = _.cloneDeep( this.fieldID );
		}
	}

	/**
	 * @return {void}
	 */
	public openComparisonField() {
		this._comparisonFieldDropdown?.open();
	}

	/**
	 * @return {void}
	 */
	protected comparisonFieldChange() {
		if ( this.excludeFieldsLK?.[ this._fieldIdBk ] ) {
			this.availableFields
				= _.filter(
					this.availableFields,
					( _field: Field ) =>
						( _field as any ).id !== this._fieldIdBk
				);
		}

		this.operator = null;
		this.data = undefined;
		this.field = {
			...this.fieldsMap.get( this.fieldID ),
			dataType: this.fieldsMap.get( this.fieldID ).dataType,
		};

		this.fieldChange.emit( this.field );
		this.fieldIDChange.emit( this.fieldID );

		if ( this.field.dataType !== DataType.Lookup ) {
			const {
				operator,
				compareType,
				formulaType,
			}: ComparisonDefault
				= getDefaultOptions(
					this.field.dataType
				);

			this.operator = operator;

			if (
				compareType
				|| formulaType
			) {
				this.data ||= {};

				if ( compareType ) {
					this.data.compareType = compareType;
				}

				if ( formulaType ) {
					this.data.formulaType = formulaType;
				}
			}

			setTimeout(
				() => {
					this.field.dataType === FormulaField.dataType
						? this.formulaComparison.openFormulaTypeDropdown()
						: this.subComparison?.openComparisonOperator();
				}
			);

			this._operatorChangeEmit();
			this._dataChangeEmit();
		}
	}

	/**
	 * @return {void}
	 */
	private _operatorChangeEmit() {
		this.operatorChange.emit( this.operator );
	}

	/**
	 * @return {void}
	 */
	private _dataChangeEmit() {
		this.dataChange.emit( this.data );
	}

}
