import {
	ChangeDetectionStrategy,
	Component,
	ViewChildren,
	QueryList
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	DataType,
	Field
} from '@main/common/field/interfaces';
import {
	ComparisonDefault,
	TComparisonOperator,
	ValidateFnType
} from '@main/common/field/modules/comparison/interfaces';
import {
	ComparisonBase,
	ComparisonComponent,
	getDefaultOptions,
	getValidateFn
} from '@main/common/field/modules/comparison/components';
import {
	ComparisonOperator
} from '@main/common/field/modules/comparison/resources';
import {
	buildMemoDepth,
	processSiblingItems
} from '@main/workspace/modules/base/modules/board/modules/filter/helpers/filter.helper';

import {
	ConditionalBase
} from '../conditional-base';
import {
	LogicalOperator
} from '../constant';

import {
	DestinationOption,
	GroupCondition,
	GroupOption,
	SourceOption
} from './group-conditional.interface';

const ignoreDataType: ReadonlySet<DataType> = new Set([
	DataType.Lookup,
	DataType.Formula,
	DataType.LastModifiedBy,
	DataType.LastModifiedTime,
	DataType.CreatedBy,
	DataType.CreatedTime,
]);

@Unsubscriber()
@Component({
	selector: 'group-conditional',
	templateUrl: 'group-conditional.pug',
	styleUrls: [ '../conditional-base.scss' ],
	host: { class: 'group-conditional' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupConditionalComponent
	extends ConditionalBase<GroupOption, GroupCondition> {

	@ViewChildren( 'sourceComparisonComp' )
	public sourceComparisonComps: QueryList<ComparisonComponent>;
	@ViewChildren( 'destinationComparisonComp' )
	public destinationComparisonComps: QueryList<ComparisonComponent>;

	protected readonly advanceOperators: TComparisonOperator[]
		= [
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.ANY,
				'ANY'
			),
		];

	constructor() {
		super();

		this.ignoreDataType = ignoreDataType;
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	protected addOption(
		field: Field
	) {
		const newOption: GroupOption = {
			field: {
				...field,
				dataType: field.dataType,
			},
			fieldID: field.extra.id,
			order: this.options?.length || 0 + 1,
			source: {},
			destination: {},
		} as unknown as GroupOption;
		const source: SourceOption
			= newOption.source;
		const destination: DestinationOption
			= newOption.destination;

		const {
			operator,
			compareType,
			formulaType,
		}: ComparisonDefault
			= getDefaultOptions(
				field.dataType
			);

		source.operator
			= destination.operator
			= operator;

		source.data ||= {};
		destination.data ||= {};

		if ( compareType ) {
			source.data.compareType = compareType;
			destination.data.compareType = compareType;
		}
		if ( formulaType ) {
			source.data.formulaType = formulaType;
			destination.data.formulaType = formulaType;
		}

		this.options ||= [];

		this.options.push( newOption );

		this.filterOptionsAnnotation ||= [];

		this.filterOptionsAnnotation.push(
			this.filterOptionsAnnotation.length + 1
		);

		if ( this.options.length === 1 ) {
			this.onLogicalOperatorChange( LogicalOperator.AND );
		}

		this.optionsChange.emit( this.options );
	}

	/**
	 * @param {GroupOption=} option
	 * @param {boolean=} isSource
	 * @return {void}
	 */
	protected filterChanged(
		option?: GroupOption,
		isSource?: boolean
	) {
		if ( option ) {
			const validate: ValidateFnType
				= getValidateFn( option.field.dataType );
			const optionData: SourceOption | DestinationOption
				= isSource
					? option.source
					: option.destination;

			setTimeout(
				() => {
					optionData.error
						= {
							...optionData.error,
							...validate(
								{
									...optionData,
									fieldID: option.fieldID,
								},
								this.fields
							),
						};

					if (
						_.values( optionData.error )
						.indexOf( true) >= 0
					) {
						this.conditionalChange.emit();
						return;
					};

					this._parseCondition();
				}
			);
		} else {
			this._parseCondition();
		}
	}

	/**
	 * @param {GroupOption} option
	 * @return {void}
	 */
	protected comparisonFieldChange(
		option: GroupOption
	) {
		option.field = {
			...this.fieldsMap.get( option.fieldID ),
			dataType: this.fieldsMap.get( option.fieldID ).dataType,
		};

		const {
			operator,
			compareType,
			formulaType,
		}: ComparisonDefault
			= getDefaultOptions(
				option.field.dataType
			);

		option.source.operator = operator;
		option.source.data = undefined;

		option.destination.operator = operator;
		option.destination.data = undefined;

		if ( compareType || formulaType ) {
			option.source.data ||= {};
			option.destination.data ||= {};

			if ( compareType ) {
				option.source.data.compareType = compareType;
				option.destination.data.compareType = compareType;
			}

			if ( formulaType ) {
				option.source.data.formulaType = formulaType;
				option.destination.data.formulaType = formulaType;
			}
		}
	}

	/**
	 * @return {void}
	 */
	private _parseCondition() {
		if (
			!!this.expressionEditorComp?.checkSyntax()
			&& !this.expressionValue?.length
		) return;

		let conditions: GroupCondition = {};
		const logicalOperatorName: ObjectType<string>
			= _.invert( LogicalOperator );

		if ( this.logicalOperator !== LogicalOperator.CUSTOM ) {
			conditions[
			logicalOperatorName[ this.logicalOperator ]
			.toLowerCase() ]
				= this.options;
		} else {
			// TODO re-write build conditions function
			conditions
				= processSiblingItems(
					buildMemoDepth(
						this.expressionValue.match( new RegExp( /(AND|OR|\(|\)|\d{1,})/g ) )
					),
					{
						conditions: this.conditions as any,
						logicalExpression: this.logicalExpression,
						logicalOperator: this.logicalOperator,
						options: this.options as any,
					},
					false
				) as GroupCondition;
		}

		this.conditions = conditions;

		this.conditionsChange.emit( this.conditions );
	}

}
