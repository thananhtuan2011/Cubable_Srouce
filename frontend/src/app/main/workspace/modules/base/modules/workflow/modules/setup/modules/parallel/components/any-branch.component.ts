import {
	ChangeDetectionStrategy,
	Component,
	SimpleChanges,
	OnChanges,
	Input,
	EventEmitter,
	Output
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';
import {
	Unsubscriber
} from '@core';

import {
	LogicalOperator
} from '../../common/conditional/constant';
import {
	SingleCondition,
	SingleOption
} from '../../common/conditional';
import {
	AnyBranchSetting
} from '../interfaces';
import {
	ParallelBase
} from './parallel-base';

@Unsubscriber()
@Component({
	selector: 'any-branch',
	templateUrl: '../templates/any-branch.pug',
	styleUrls: [ '../styles/any-branch.scss' ],
	host: { class: 'any-branch' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnyBranchComponent
	extends ParallelBase
	implements OnChanges {

	@Input() public baseID: ULID;
	@Input() public settings: AnyBranchSetting;

	@Output() public settingsChange: EventEmitter<AnyBranchSetting>
		= new EventEmitter<AnyBranchSetting>();

	protected conditional: boolean;

	ngOnChanges(changes: SimpleChanges): void {
		if ( changes?.settings ) {
			if(
				!_.isStrictEmpty( this.settings?.filter )
			) {
				this.conditional = true;
			}
		}
	}

	/**
	 * @return {boolean}
	 */
	protected onSettingChanged() {
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onChangeCondition(
		condition: boolean
	) {
		this.conditional = condition;

		if( !condition ) this.settings.filter = null;

		this.settingsChange.emit( this.settings );
	}


	/**
	 * @param {SingleOption[]} options
	 * @return {void}
	 */
	protected onFilterOptionsChange(
		options: SingleOption[]
	) {
		this.settings ||= {} as AnyBranchSetting;
		this.settings.filter ||= {};

		this.settings.filter.options = options;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {LogicalOperator} operator
	 * @return {void}
	 */

	protected onLogicalOperatorChange(
		logicalOperator: LogicalOperator
	) {
		this.settings ||= {} as AnyBranchSetting;
		this.settings.filter ||= {};

		this.settings.filter.logicalOperator = logicalOperator;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {string} logicalOperator
	 * @return {void}
	 */
	protected onLogicalExpressionChange(
		logicalExpression: string
	) {
		this.settings ||= {} as AnyBranchSetting;
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
		this.settings ||= {} as AnyBranchSetting;
		this.settings.filter ||= {};

		this.settings.filter.conditions = conditions;

		this.settingsChange.emit( this.settings );
	}
}
