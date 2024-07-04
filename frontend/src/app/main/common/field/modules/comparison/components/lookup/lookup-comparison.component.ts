import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewChild,
	OnChanges,
	SimpleChanges
} from '@angular/core';
import {
	finalize
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	untilCmpDestroyed,
	CoerceArray,
	CoerceBoolean
} from '@core';

import {
	LookupField
} from '@main/common/field/objects';
import {
	DataType,
	Field,
	LookupLink,
	Operator
} from '@main/common/field/interfaces';
import {
	FieldDetail
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	ComparisonBase,
	FormulaComparisonComponent,
	getDefaultOptions
} from '../../components';
import {
	ComparisonDefault,
	TComparisonOperator
} from '../../interfaces';

@Component({
	selector: 'lookup-comparison',
	templateUrl: './lookup-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'lookup-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LookupComparisonComponent
	extends ComparisonBase<any>
	implements OnChanges {

	@ViewChild( 'subComparison' )
	public subComparison: ComparisonBase;
	@ViewChild( 'formulaComparison' )
	public formulaComparison: FormulaComparisonComponent;

	@Input() @CoerceArray()
	public fields: Field[];
	@Input() public field: LookupField;
	@Input() @CoerceBoolean()
	public groupAble: boolean; // TODO change to comparison group

	protected readonly DATA_TYPE: typeof DataType = DataType;
	protected readonly LOOKUP_OPERATOR: typeof Operator = Operator;
	protected readonly comparisonOperators: TComparisonOperator[];

	protected targetField: Field;

	override ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.field ) return;

		this._getFieldDetail( changes );
	}

	/**
	 * @param {SimpleChanges} changes
	 * @return {void}
	 */
	private _getFieldDetail( changes: SimpleChanges ) {
		this.boardFieldService
		.fieldDetail(
			this.field.lookup.sourceFieldID
		)
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( fieldDetail: FieldDetail ) => {
				this.targetField
					= this.fieldHelper.createField( fieldDetail );

				this._initDefaultOption( changes );
			},
		});
	}

	/**
	 * @param {LookupField} field
	 * @return {void}
	 */
	private _getOtherField( field: LookupField ) {
		this.otherFields = [];

		if ( field.lookup.sourceFieldParams?.lookup ) {
			_.forEach( this.fields, ( f: Field ) => {
				this.otherFields.push(
					this._checkOtherField(
						field.extra.id,
						f.extra.params?.lookup?.sourceFieldParams?.lookup,
						field.lookup.sourceFieldParams.lookup,
						f
					)
				);
			} );
		} else {
			_.forEach( this.fields, ( f: Field ) => {
				this.otherFields.push(
					this._checkOtherField(
						field.extra.id,
						f.extra.params?.lookup,
						field.lookup,
						f
					)
				);
			} );
		}

		this.otherFields = _.compact( this.otherFields );
	}

	/**
	 * @param {ULID} fieldID
	 * @param {LookupLink} boardFieldLookup
	 * @param {LookupLink} fieldLookup
	 * @param {Field} boardField
	 * @return {void}
	 */
	private _checkOtherField(
		fieldID: ULID,
		boardFieldLookup: LookupLink,
		fieldLookup: LookupLink,
		boardField: Field
	): Field {
		if (
			boardField.extra.id === fieldID
			|| !boardFieldLookup
		) return;

		if (
			(
				boardFieldLookup.operator
				=== fieldLookup.operator
			)
			&&
			(
				boardFieldLookup.targetDataType
				=== fieldLookup.targetDataType
			)
		) {
			return boardField;
		}
	}

	/**
	 * @param {SimpleChanges} changes
	 * @return {void}
	 */
	private _initDefaultOption( changes: SimpleChanges ) {
		if ( changes?.data?.currentValue?.fieldID ) {
			this.otherFields
				= _.filter(
					this.fields, ( f: Field ) => {
						return f.extra.id
							=== changes.data.currentValue.fieldID;
					} );
		}

		if ( changes.operator?.currentValue ) {
			this.operator = changes.operator.currentValue;

			return;
		}

		const lookup: LookupLink
			= changes.field.currentValue.lookup;

		const dataType: DataType
			= this._assignTargetDataType( lookup );

		const {
			operator,
			compareType,
			formulaType,
		}: ComparisonDefault
			= getDefaultOptions(
				dataType
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

		if (
			lookup.targetDataType === DataType.Formula
			||
			lookup.sourceFieldParams?.lookup?.targetDataType
				=== DataType.Formula
		) {
			setTimeout(
				() => this.formulaComparison.openFormulaTypeDropdown()
			);
		}

		this._getOtherField( changes.field.currentValue );
		super.onOperatorChange();

		setTimeout(
			() => this.subComparison?.openComparisonOperator()
		);
	}

	private _assignTargetDataType(
		lookup: LookupLink
	): DataType {
		let sourceFieldDataType: DataType;

		if ( lookup.operator || lookup.sourceFieldParams?.lookup?.operator ) {
			if (
				(
					lookup.operator === Operator.EarliestDate
					|| lookup.operator === Operator.LatestDate
				)
				||
				(
					lookup.sourceFieldParams?.lookup?.operator
						=== Operator.EarliestDate
					|| lookup.sourceFieldParams?.lookup?.operator
						=== Operator.LatestDate
				)
			) {
				sourceFieldDataType = DataType.Date;
			} else {
				sourceFieldDataType = DataType.Number;
			}
		} else {
			sourceFieldDataType
				= lookup?.sourceFieldParams?.lookup
					? lookup.sourceFieldParams.lookup.targetDataType
					: lookup.targetDataType;
		}

		return sourceFieldDataType;
	}
}
