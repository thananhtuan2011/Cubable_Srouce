import {
	ChangeDetectionStrategy,
	Component,
	QueryList,
	ViewChildren
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	ComparisonDefault,
	ValidateFnType
} from '@main/common/field/modules/comparison/interfaces';
import {
	ComparisonComponent,
	DataValidate,
	getDefaultOptions,
	getValidateFn
} from '@main/common/field/modules/comparison/components';
import {
	Field
} from '@main/common/field/interfaces';
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
	SingleCondition,
	SingleOption
} from './single-conditional.interface';

@Unsubscriber()
@Component({
	selector: 'single-conditional',
	templateUrl: 'single-conditional.pug',
	styleUrls: [ '../conditional-base.scss' ],
	host: { class: 'single-conditional' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleConditionalComponent
	extends ConditionalBase<SingleOption, SingleCondition> {

	@ViewChildren( ComparisonComponent )
	public comparisonComps: QueryList<ComparisonComponent>;

	/**
	 * @param {SingleOption=} option
	 * @return {void}
	 */
	protected filterChanged(
		option?: SingleOption
	) {
		// TODO check có nên emit options riêng, data riêng
		if ( option ) {
			const validate: ValidateFnType
				= getValidateFn( option.field.dataType );

			setTimeout(
				() => {
					option.error
						= {
							...option.error,
							...validate(
								option as DataValidate<any>,
								this.fields,
								undefined,
								undefined,
								this.comparisonModule
							),
						};

					if (
						_.values( option.error )
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
	 * @param {BoardField} field
	 * @return {void}
	 */
	protected addOption( field: Field ) {
		const newOption: SingleOption = {
			field: {
				...field,
				dataType: field.dataType,
			},
			fieldID: field.extra.id,
			order: this.options?.length || 0 + 1,
		} as unknown as SingleOption;

		const {
			operator,
			compareType,
			formulaType,
		}: ComparisonDefault
			= getDefaultOptions(
				field.dataType
			);

		newOption.operator = operator;

		newOption.data ||= {};

		if ( compareType ) {
			newOption.data.compareType = compareType;
		}
		if ( formulaType ) {
			newOption.data.formulaType = formulaType;
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
	 * @return {void}
	 */
	private _parseCondition() {
		if (
			!!this.expressionEditorComp?.checkSyntax()
			&& !this.expressionValue?.length
		) return;

		let conditions: SingleCondition = {};
		const logicalOperatorName: ObjectType<string>
			= _.invert( LogicalOperator );

		if ( this.logicalOperator !== LogicalOperator.CUSTOM ) {
			conditions[
			logicalOperatorName[ this.logicalOperator ]
			.toLowerCase() ]
				= this.options;
		} else {
			conditions
				= processSiblingItems(
					buildMemoDepth(
						this.expressionValue.match(
							new RegExp( /(AND|OR|\(|\)|\d{1,})/g )
						)
					),
					{
						// conditions: this.conditions,
						logicalExpression: this.logicalExpression,
						logicalOperator: this.logicalOperator,
						options: this.options,
					} as any,
					false
				) as SingleCondition;
		}

		this.conditions = conditions;

		this.conditionsChange.emit( this.conditions );
	}

}
