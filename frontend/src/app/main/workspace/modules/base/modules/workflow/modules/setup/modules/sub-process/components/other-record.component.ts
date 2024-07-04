import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
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
	OtherRecordSetting,
	SubProcessSetting
} from '../interfaces';
import {
	SubProcessCompleteType
} from '../constant';

import {
	SubProcessBase
} from './sub-process-base';

@Unsubscriber()
@Component({
	selector: 'other-record',
	templateUrl: '../templates/other-record.pug',
	styleUrls: [ '../styles/other-record.scss' ],
	host: { class: 'other-record' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OtherRecordComponent
	extends SubProcessBase {

	@ViewChild( SelectBoardComponent )
	public selectBoardComp: SelectBoardComponent;

	@Input() public baseID: ULID;
	@Input() public settings: SubProcessSetting;

	@Output() public settingsChange: EventEmitter<SubProcessSetting>
		= new EventEmitter<SubProcessSetting>();

	private readonly _workflowService: WorkflowService
		= inject( WorkflowService );

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	protected onBoardIDChange( boardID: ULID ) {
		if (
			boardID === this.settings.boardID
		) return;

		this.settings = {
			boardID,
			complete: {
				type: SubProcessCompleteType.All,
			},
		};

		this.settingsChange.emit( this.settings );
		this._workflowService.boardIDChanged$.next();
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
		this.settings ||= {} as OtherRecordSetting;
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
		this.settings ||= {} as OtherRecordSetting;
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
		this.settings ||= {} as OtherRecordSetting;
		this.settings.filter ||= {};

		this.settings.filter.logicalExpression = logicalExpression;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {SingleSubProcess} conditions
	 * @return {void}
	 */
	protected onConditionFilterChange(
		conditions: SingleCondition
	) {
		this.settings ||= {} as OtherRecordSetting;
		this.settings.filter ||= {};

		this.settings.filter.conditions = conditions;

		this.settingsChange.emit( this.settings );
	}

}
