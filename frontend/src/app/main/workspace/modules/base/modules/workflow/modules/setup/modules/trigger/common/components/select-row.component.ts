import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
	ViewChild
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceArray,
	Unsubscriber
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';

import {
	EventAdvance
} from '@main/common/field/modules/comparison/interfaces';

import {
	LogicalOperator
} from '../../../common/conditional/constant';
import {
	SingleCondition,
	SingleConditionalComponent,
	SingleOption
} from '../../../common/conditional';

import {
	RowTriggerType
} from '../../resources';
import {
	RowTrigger
} from '../../interfaces';

type RowInfo = {
	name: string;
	value: RowTriggerType;
};

const rowsType: ReadonlySet<RowInfo>
	= new Set([
		setRowInfo(
			RowTriggerType.ANY,
			'ANY_ROW'
		),
		setRowInfo(
			RowTriggerType.CONDITION,
			'CONDITIONS_ROW'
		),
	]);

function setRowInfo(
	value: RowTriggerType,
	name: string
): RowInfo {
	return {
		value,
		name,
	};
}

@Unsubscriber()
@Component({
	selector: 'select-row',
	templateUrl: '../templates/select-row.pug',
	styleUrls: [ '../styles/select-row.scss' ],
	host: { class: 'select-row' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectRowComponent {

	@ViewChild( 'rowPicker' )
	public rowPicker: CUBDropdownComponent;
	@ViewChild( 'conditionalComp' )
	public conditionalComp: SingleConditionalComponent;

	@Input() @CoerceArray()
	public eventAdvance: EventAdvance[];
	@Input() public boardID: ULID;
	@Input() public row: RowTrigger;

	@Output() public rowChange: EventEmitter<RowTrigger>
		= new EventEmitter<RowTrigger>();

	public readonly typeControl: FormControl
		= new FormControl( undefined );

	protected readonly ROWS_TYPE: ReadonlySet<RowInfo>
		= rowsType;
	protected readonly ROW_TRIGGER_TYPE: typeof RowTriggerType
		= RowTriggerType;
	protected readonly LOGICAL_OPERATOR: typeof LogicalOperator
		= LogicalOperator;

	/**
	 * @param {RowTriggerType} type
	 * @return {void}
	 */
	protected onRowTypeChange(
		type: RowTriggerType
	) {
		if ( this.row.type === type ) return;

		this.row = {
			type,
		};

		if ( this.row.type === RowTriggerType.CONDITION ) {
			this.row.filter = {
				logicalOperator: LogicalOperator.AND,
			};
		}

		this.rowChange.emit( this.row );
	}

	/**
	 * @param {SingleOption[]} options
	 * @return {void}
	 */
	protected onFilterOptionsChange(
		options: SingleOption[]
	) {
		this.row.filter.options = options;

		this.rowChange.emit( this.row );
	}

	/**
	 * @param {LogicalOperator} operator
	 * @return {void}
	 */
	protected onLogicalOperatorChange(
		operator: LogicalOperator
	) {
		this.row.filter.logicalOperator = operator;

		this.rowChange.emit( this.row );
	}

	/**
	 * @param {string} logicalOperator
	 * @return {void}
	 */
	protected onLogicalExpressionChange(
		logicalExpression: string
	) {
		this.row.filter.logicalExpression = logicalExpression;

		this.rowChange.emit( this.row );
	}

	/**
	 * @param {SingleCondition} condition
	 * @return {void}
	 */
	protected onConditionFilterChange(
		condition: SingleCondition
	) {
		this.row.filter.conditions = condition;

		this.rowChange.emit( this.row );
	}

	/**
	 * @return {void}
	 */
	protected onConditionalChange() {
		this.rowChange.emit( this.row );
	}

}
