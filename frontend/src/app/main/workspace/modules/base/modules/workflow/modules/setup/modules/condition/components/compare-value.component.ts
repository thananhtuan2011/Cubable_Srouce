import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter
} from '@angular/core';

import {
	Unsubscriber
} from '@core';

import {
	SingleCondition,
	SingleOption
} from '../../common/conditional';
import {
	LogicalOperator
} from '../../common/conditional/constant';

import {
	CompareValueSetting
} from '../interfaces';

import {
	ConditionBase
} from './condition-base';

@Unsubscriber()
@Component({
	selector: 'compare-value',
	templateUrl: '../templates/compare-value.pug',
	styleUrls: [ '../styles/compare-value.scss' ],
	host: { class: 'compare-value' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompareValueComponent
	extends ConditionBase {

	@Input() public settings: CompareValueSetting;

	@Output() public settingsChange: EventEmitter<CompareValueSetting>
		= new EventEmitter<CompareValueSetting>();

	/**
	 * @return {boolean}
	 */
	protected onSettingChanged() {
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {SingleOption[]} options
	 * @return {void}
	 */
	protected onFilterOptionsChange(
		options: SingleOption[]
	) {
		this.settings ||= {} as CompareValueSetting;
		this.settings.filter ||= {};

		this.settings.filter.options = options;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {LogicalOperator} logicalOperator
	 * @return {void}
	 */
	protected onLogicalOperatorChange(
		logicalOperator: LogicalOperator
	) {
		this.settings ||= {} as CompareValueSetting;
		this.settings.filter ||= {};

		this.settings.filter.logicalOperator = logicalOperator;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {string} logicalExpression
	 * @return {void}
	 */
	protected onLogicalExpressionChange(
		logicalExpression: string
	) {
		this.settings ||= {} as CompareValueSetting;
		this.settings.filter ||= {};

		this.settings.filter.logicalExpression = logicalExpression;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {SingleCondition} conditions
	 * @return {void}
	 */
	protected onConditionFilterChange(
		conditions: SingleCondition
	) {
		this.settings ||= {} as CompareValueSetting;
		this.settings.filter ||= {};

		this.settings.filter.conditions = conditions;

		this.settingsChange.emit( this.settings );
	}

}
