import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	ViewChild,
	EventEmitter,
	inject
} from '@angular/core';
import {
	ULID
} from 'ulidx';

import {
	Unsubscriber
} from '@core';

import {
	WorkflowService
} from '../../../../../services';

import {
	LogicalOperator
} from '../../common/conditional/constant';
import {
	SingleOption,
	SingleCondition,
	SingleConditionalComponent
} from '../../common/conditional';

import {
	RowCreatedSetting
} from '../interfaces';

import {
	TriggerBase
} from './trigger-base';

@Unsubscriber()
@Component({
	selector: 'row-created',
	templateUrl: '../templates/row-created.pug',
	styleUrls: [ '../styles/row-created.scss' ],
	host: { class: 'row-created' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowCreatedComponent
	extends TriggerBase {

	@ViewChild( 'conditionalComp' )
	public conditionalComp: SingleConditionalComponent;

	@Input() public settings: RowCreatedSetting;

	@Output() public settingsChange: EventEmitter<RowCreatedSetting>
		= new EventEmitter<RowCreatedSetting>();

	private readonly _workflowService: WorkflowService
		= inject( WorkflowService );

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	protected onBoardIDChange( boardID: ULID ) {
		if ( boardID === this.settings?.boardID ) return;

		this.settings = {
			boardID,
		} as RowCreatedSetting;

		this.settingsChange.emit( this.settings );
		this._workflowService.boardIDChanged$.next();
	}

	/**
	 * @param {SingleOption[]} options
	 * @return {void}
	 */
	protected onFilterOptionsChange(
		options: SingleOption[]
	) {
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
		this.settings.filter ||= {};

		this.settings.filter.conditions = conditions;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onConditionalChange() {
		this.settingsChange.emit( this.settings );
	}

}
