import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	ViewChild,
	OnInit,
	EventEmitter,
	inject
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
	WorkflowService
} from '../../../../../services';

import {
	LogicalOperator
} from '../../common/conditional/constant';
import {
	GroupCondition,
	GroupConditionalComponent,
	GroupOption
} from '../../common/conditional';

import {
	ValueChangedSetting
} from '../interfaces';
import {
	RowTriggerType,
	ValueChangedFieldType
} from '../resources';

import {
	TriggerBase
} from './trigger-base';

type FieldDataInfo = {
	name: string;
	value: ValueChangedFieldType;
};

function setFieldDataInfo(
	value: ValueChangedFieldType,
	name: string
): FieldDataInfo {
	return {
		value,
		name,
	};
}

@Unsubscriber()
@Component({
	selector: 'value-changed',
	templateUrl: '../templates/value-changed.pug',
	styleUrls: [ '../styles/value-changed.scss' ],
	host: { class: 'value-changed' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueChangedComponent
	extends TriggerBase
	implements OnInit {

	@ViewChild( 'groupConditionalComp' )
	public groupConditionalComp: GroupConditionalComponent;

	@Input() public settings: ValueChangedSetting;

	@Output() public settingsChange: EventEmitter<ValueChangedSetting>
		= new EventEmitter<ValueChangedSetting>();

	protected readonly FIELD_DATA_TYPE_INFO: ReadonlySet<FieldDataInfo>
		= new Set([
			setFieldDataInfo(
				ValueChangedFieldType.ANY,
				'FIELD_ANY'
			),
			setFieldDataInfo(
				ValueChangedFieldType.SPECIFIC_FIELD,
				'SPECIFIC_FIELD'
			),
		]);
	protected readonly FIELD_DATA_TYPE: typeof ValueChangedFieldType
		= ValueChangedFieldType;
	protected readonly typeControl: FormControl
		= new FormControl( undefined );

	private readonly _workflowService: WorkflowService
		= inject( WorkflowService );

	ngOnInit() {
		if (
			!this.isEntry
			&& this.settings
			&& this.settings.boardID
			&& !this.settings.field
		) {
			this.settings.field = {
				type: ValueChangedFieldType.ANY,
			};

			this.settingsChange.emit( this.settings );
		}
	}

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	protected onBoardIDChange( boardID: ULID ) {
		if ( boardID === this.settings.boardID ) return;

		this.settings = {
			boardID,
			row: {
				type: RowTriggerType.ANY,
			},
			field: {
				type: ValueChangedFieldType.ANY,
			},
		} as ValueChangedSetting;

		this.settingsChange.emit( this.settings );
		this._workflowService.boardIDChanged$.next();

		super.openRowPicker();
	}

	/**
	 * @return {void}
	 */
	protected onRowChange() {
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {ValueChangedFieldType} type
	 * @return {void}
	 */
	protected onFieldDataTypeChange(
		type: ValueChangedFieldType
	) {
		if ( this.settings.field.type === type ) return;

		this.settings.field = {
			type,
		};

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {GroupOption[]} options
	 * @return {void}
	 */
	protected onFilterOptionsChange(
		options: GroupOption[]
	) {
		this.settings.field.filter ||= {};

		this.settings.field.filter.options = options;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {LogicalOperator} logicalOperator
	 * @return {void}
	 */
	protected onLogicalOperatorChange(
		logicalOperator: LogicalOperator
	) {
		this.settings.field.filter ||= {};

		this.settings.field.filter.logicalOperator = logicalOperator;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {string} logicalOperator
	 * @return {void}
	 */
	protected onLogicalExpressionChange(
		logicalExpression: string
	) {
		this.settings.field.filter ||= {};

		this.settings.field.filter.logicalExpression = logicalExpression;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {GroupCondition} conditions
	 * @return {void}
	 */
	protected onConditionFilterChange(
		conditions: GroupCondition
	) {
		this.settings.field.filter ||= {};

		this.settings.field.filter.conditions = conditions;

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onConditionalChange() {
		this.settingsChange.emit( this.settings );
	}

}
