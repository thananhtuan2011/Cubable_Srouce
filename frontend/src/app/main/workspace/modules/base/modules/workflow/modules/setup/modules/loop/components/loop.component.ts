import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	SimpleChanges,
	OnInit,
	OnChanges
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';
import {
	FormControl
} from '@angular/forms';
import {
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	EventAdvance
} from '@main/common/field/modules/comparison/interfaces';

import {
	eventBlock
} from '../../../../../helpers';
import {
	LogicalOperator
} from '../../common/conditional/constant';
import {
	SingleCondition,
	SingleConditionalComponent,
	SingleOption
} from '../../common/conditional';
import {
	Loop,
	LoopSetting
} from '../interfaces';

@Unsubscriber()
@Component({
	selector: 'loop',
	templateUrl: '../templates/loop.pug',
	styleUrls: [ '../styles/loop.scss' ],
	host: { class: 'loop' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoopComponent
implements OnInit, OnChanges {

	@ViewChild( 'conditionalComp' )
	public conditionalComp: SingleConditionalComponent;

	@Input() public baseID: ULID;
	@Input() public blockSetup: Loop;
	@Input() public settings: LoopSetting;
	@Input() public boardsLk: ObjectType<IBoard>;

	@Output() public settingsChange: EventEmitter<LoopSetting>
		= new EventEmitter<LoopSetting>();

	public readonly maxLoopControl: FormControl
		= new FormControl( undefined );

	protected maxLoop: number;
	protected conditionLoop: boolean;
	protected eventAdvance: EventAdvance[];

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes?.settings ) {
			if (
				this.settings?.maxLoop
			) {
				this.maxLoop
					= this.settings.maxLoop;
			}

			if(
				!_.isStrictEmpty( this.settings?.filter )
			) {
				this.conditionLoop = true;
			}
		}
	}

	ngOnInit() {
		this.eventAdvance
			= eventBlock(
				this.blockSetup,
				this.boardsLk,
				true
			);
	}

	/**
	 * @return {void}
	 */
	protected onMaxLoopChanged() {
		this.settings ||= {} as LoopSetting;
		this.settings.maxLoop ||= null;

		this.settings.maxLoop = +this.maxLoop;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onSettingChanged() {
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {boolean} conditionLoop
	 * @return {void}
	 */
	protected onChangeCondition(
		conditionLoop: boolean
	) {
		this.conditionLoop = conditionLoop;
		if ( !conditionLoop ) this.settings.filter = null;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {SingleOption[]} options
	 * @return {void}
	 */
	protected onFilterOptionsChange(
		options: SingleOption[]
	) {
		this.settings ||= {} as LoopSetting;
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
		this.settings ||= {} as LoopSetting;
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
		this.settings ||= {} as LoopSetting;
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
		this.settings ||= {} as LoopSetting;
		this.settings.filter ||= {};

		this.settings.filter.conditions = conditions;

		this.settingsChange.emit( this.settings );
	}
}
