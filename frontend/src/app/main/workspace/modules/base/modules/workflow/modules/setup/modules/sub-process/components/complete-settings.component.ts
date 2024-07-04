import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	OnChanges,
	SimpleChanges
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';

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
	CompleteSetting
} from '../interfaces';
import {
	SubProcessCompleteType
} from '../constant';

import {
	SubProcessBase
} from './sub-process-base';

@Unsubscriber()
@Component({
	selector: 'complete-setting',
	templateUrl: '../templates/complete-setting.pug',
	styleUrls: [ '../styles/complete-setting.scss' ],
	host: { class: 'complete-setting' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteSettingComponent
	extends SubProcessBase
	implements OnChanges {

	@Input() public completeSetting: CompleteSetting;
	@Input() public boardID: ULID;

	@Output() public completeSettingChange: EventEmitter<CompleteSetting>
		= new EventEmitter<CompleteSetting>();

	protected readonly subProcessCompleteType: typeof SubProcessCompleteType
		= SubProcessCompleteType;
	protected readonly completeTypeControl: FormControl
		= new FormControl( undefined );

	protected hasCompleteCondition: boolean;

	ngOnChanges( changes: SimpleChanges ) {
		if (
			!changes.completeSetting?.firstChange
		) {
			this.hasCompleteCondition = false;
		}
		if (
			changes.completeSetting?.currentValue?.filter
		) {
			this.hasCompleteCondition = true;
		}
	}

	/**
	 * @return {boolean}
	 */
	protected onSettingChanged() {
		this.completeSettingChange.emit( this.completeSetting );
	}

	/**
	 * @param {SubProcessCompleteType} e
	 * @return {void}
	 */
	protected onCompleteTypeChange(
		e: SubProcessCompleteType
	) {
		if (
			e === this.completeSetting?.type
		) return;

		this.completeSetting = {
			type: e,
		} as CompleteSetting;
		this.hasCompleteCondition = false;

		this.onSettingChanged();
	}

	/**
	 * @param {boolean} e
	 * @return {void}
	 */
	protected onToggleSetConditionMode(
		e: boolean
	) {
		if (
			!e
		) {
			this.completeSetting.filter = undefined;
		}

		this.hasCompleteCondition = e;

		this.onSettingChanged();
	}

	/**
	 * @param {SingleOption[]} options
	 * @return {void}
	 */
	protected onFilterOptionsChange(
		options: SingleOption[]
	) {
		this.completeSetting ||= {} as CompleteSetting;
		this.completeSetting.filter ||= {};

		this.completeSetting.filter.options = options;

		this.completeSettingChange.emit( this.completeSetting );
	}

	/**
	 * @param {LogicalOperator} logicalOperator
	 * @return {void}
	 */
	protected onLogicalOperatorChange(
		logicalOperator: LogicalOperator
	) {
		this.completeSetting ||= {} as CompleteSetting;
		this.completeSetting.filter ||= {};

		this.completeSetting.filter.logicalOperator = logicalOperator;

		this.completeSettingChange.emit( this.completeSetting );
	}

	/**
	 * @param {string} logicalExpression
	 * @return {void}
	 */
	protected onLogicalExpressionChange(
		logicalExpression: string
	) {
		this.completeSetting ||= {} as CompleteSetting;
		this.completeSetting.filter ||= {};

		this.completeSetting.filter.logicalExpression = logicalExpression;

		this.completeSettingChange.emit( this.completeSetting );
	}

	/**
	 * @param {SingleSubProcess} conditions
	 * @return {void}
	 */
	protected onConditionFilterChange(
		conditions: SingleCondition
	) {
		this.completeSetting ||= {} as CompleteSetting;
		this.completeSetting.filter ||= {};

		this.completeSetting.filter.conditions = conditions;

		this.completeSettingChange.emit( this.completeSetting );
	}

}
