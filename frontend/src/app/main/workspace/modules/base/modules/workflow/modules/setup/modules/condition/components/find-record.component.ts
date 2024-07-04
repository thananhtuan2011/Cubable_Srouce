import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild
} from '@angular/core';
import {
	ULID
} from 'ulidx';

import {
	Unsubscriber
} from '@core';

import {
	SelectBoardComponent
} from '../../common/select-board/select-board.component';
import {
	SingleCondition,
	SingleOption
} from '../../common/conditional';
import {
	LogicalOperator
} from '../../common/conditional/constant';

import {
	FindRecordSetting
} from '../interfaces';

import {
	ConditionBase
} from './condition-base';

@Unsubscriber()
@Component({
	selector: 'find-record',
	templateUrl: '../templates/find-record.pug',
	styleUrls: [ '../styles/find-record.scss' ],
	host: { class: 'find-record' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FindRecordComponent
	extends ConditionBase {

	@ViewChild( SelectBoardComponent )
	public selectBoardComp: SelectBoardComponent;

	@Input() public baseID: ULID;
	@Input() public settings: FindRecordSetting;

	@Output() public settingsChange: EventEmitter<FindRecordSetting>
		= new EventEmitter<FindRecordSetting>();

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	protected onBoardIDChange( boardID: ULID ) {
		if ( boardID === this.settings.boardID ) return;

		this.settings = {
			boardID,
		} as FindRecordSetting;

		this.settingsChange.emit( this.settings );
	}

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
		this.settings ||= {} as FindRecordSetting;
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
		this.settings ||= {} as FindRecordSetting;
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
		this.settings ||= {} as FindRecordSetting;
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
		this.settings ||= {} as FindRecordSetting;
		this.settings.filter ||= {};

		this.settings.filter.conditions = conditions;

		this.settingsChange.emit( this.settings );
	}

}
