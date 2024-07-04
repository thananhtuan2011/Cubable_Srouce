import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
	OnInit,
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
	WorkflowBlock
} from '../../../../../../interfaces';
import {
	WorkflowBlockType
} from '../../../../../../resources';

import {
	SelectBoardComponent
} from '../../../common/select-board/select-board.component';
import {
	LogicalOperator
} from '../../../common/conditional/constant';
import {
	SingleCondition,
	SingleConditionalComponent,
	SingleOption
} from '../../../common/conditional';
import {
	TriggerType
} from '../../../trigger/resources';

import {
	ActionType,
	RowActionType
} from '../../resources';
import {
	RowAction
} from '../../interfaces';

type RowInfo = {
	name: string;
	value: RowActionType;
	addable: boolean;
};

@Unsubscriber()
@Component({
	selector: 'select-row',
	templateUrl: '../templates/select-row.pug',
	styleUrls: [ '../styles/select-row.scss' ],
	host: { class: 'select-row' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectRowComponent
implements OnInit {

	@ViewChild( 'rowTypePicker' )
	public rowTypePicker: CUBDropdownComponent;
	@ViewChild( SelectBoardComponent )
	public selectBoardComp: SelectBoardComponent;
	@ViewChild( 'conditionalComp' )
	public conditionalComp: SingleConditionalComponent;

	@Input() @CoerceArray()
	public eventAdvance: EventAdvance[];
	@Input() public baseID: ULID;
	@Input() public row: RowAction;
	@Input() public blockSetup: WorkflowBlock;

	@Output() public rowChange: EventEmitter<RowAction>
		= new EventEmitter<RowAction>();
	@Output() public loadFields: EventEmitter<void>
		= new EventEmitter<void>();

	public readonly typeControl: FormControl
		= new FormControl( undefined );

	protected readonly ROW_ACTION_TYPE: typeof RowActionType
		= RowActionType;

	protected ROWS_TYPE: ReadonlySet<RowInfo>;

	private _rowActionAddable: Record<RowActionType, boolean>;

	ngOnInit() {
		this._setRowActionAddable();

		this.ROWS_TYPE = new Set([
			this._setRowInfo(
				RowActionType.ROW_FROM_EVENT_BEFORE,
				'ROW_FROM_EVENT_BEFORE'
			),
			this._setRowInfo(
				RowActionType.CONDITION,
				'CONDITIONS_ROW'
			),
		]);
	}

	/**
	 * @param {RowActionType} type
	 * @return {void}
	 */
	protected onRowTypeChange( type: RowActionType ) {
		if ( this.row.type === type ) return;

		this.row = {
			type,
		} as RowAction;

		if ( this.row.type === RowActionType.CONDITION ) {
			this.row.filter = {
				logicalOperator: LogicalOperator.AND,
			};

			setTimeout(
				() => this.selectBoardComp?.boardPicker?.open()
			);
		}

		this.rowChange.emit( this.row );
		this.loadFields.emit();
	}

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	protected onBoardIDChange( boardID: ULID ) {
		if ( this.row.boardID === boardID ) return;

		this.row.boardID = boardID;
		this.row.filter = {
			logicalOperator: LogicalOperator.AND,
		};

		this.rowChange.emit( this.row );
		this.loadFields.emit();
	}

	/**
	 * @param {SingleOption[]} options
	 * @return {void}
	 */
	protected onFilterOptionsChange( options: SingleOption[] ) {
		this.row.filter.options = options;

		this.rowChange.emit( this.row );
	}

	/**
	 * @param {LogicalOperator} operator
	 * @return {void}
	 */
	protected onLogicalOperatorChange( operator: LogicalOperator ) {
		this.row.filter.logicalOperator = operator;

		this.rowChange.emit( this.row );
	}

	/**
	 * @param {SingleCondition} condition
	 * @return {void}
	 */
	protected onConditionFilterChange( condition: SingleCondition ) {
		this.row.filter.conditions = condition;

		this.rowChange.emit( this.row );
	}

	/**
	 * @param {RowActionType} value
	 * @param {string} name
	 * @return {RowInfo}
	 */
	private _setRowInfo(
		value: RowActionType,
		name: string
	): RowInfo {
		return {
			value,
			name,
			addable: this._rowActionAddable[ value ],
		};
	}

	/**
	 * @return {void}
	 */
	private _setRowActionAddable() {
		const rowActionAddable: Record<RowActionType, boolean>
			= {
				[ RowActionType.ROW_FROM_EVENT_BEFORE ]: true,
				[ RowActionType.CONDITION ]: true,
			} as Record<RowActionType, boolean>;

		if (
			(
				this.blockSetup?.previousBlock?.blockType
					=== WorkflowBlockType.TRIGGER
				&& (
					this.blockSetup.previousBlock.type
						=== TriggerType.ROW_DELETED
					|| this.blockSetup.previousBlock.type
						=== TriggerType.SCHEDULE
				)
			)
			|| (
				this.blockSetup?.previousBlock?.blockType
					=== WorkflowBlockType.ACTION
				&& this.blockSetup.previousBlock.type
					=== ActionType.DELETE_ROW
			)
		) {
			rowActionAddable[ RowActionType.ROW_FROM_EVENT_BEFORE ] = false;
		}

		this._rowActionAddable = rowActionAddable;
	}

}
