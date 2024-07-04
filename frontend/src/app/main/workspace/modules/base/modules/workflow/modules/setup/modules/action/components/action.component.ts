import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	OnInit,
	OnChanges,
	SimpleChanges,
	ViewChild,
	inject
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';
import {
	CUBConfirmService
} from '@cub/material/confirm';

import {
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	WorkflowBlock
} from '../../../../../interfaces';
import {
	WorkflowBlockType
} from '../../../../../resources';

import {
	TriggerType
} from '../../trigger/resources';

import {
	ActionType,
	RowActionType
} from '../resources';
import {
	ActionSetting,
	ActionTypeInfo,
	ChangeValueSetting
} from '../interfaces';

import {
	ActionBase
} from './action-base';

const actionTypeHasSelectRow: ReadonlySet<ActionType>
	= new Set([
		ActionType.CHANGE_VALUE,
		ActionType.DELETE_ROW,
		ActionType.NOTIFY,
	]);

@Unsubscriber()
@Component({
	selector: 'action',
	templateUrl: '../templates/action.pug',
	styleUrls: [ '../styles/action.scss' ],
	host: { class: 'action' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionComponent
implements OnInit, OnChanges {

	@ViewChild( 'actionSetting' )
	public actionSettingComp: ActionBase;
	@ViewChild( 'actionTypePicker' )
	private _actionTypePicker: CUBDropdownComponent;

	@Input() public baseID: ULID;
	@Input() public type: ActionType;
	@Input() public settings: ActionSetting;
	@Input() public blockSetup: WorkflowBlock;
	@Input() public boardsLk: ObjectType<IBoard>;

	@Output() public typeChange: EventEmitter<ActionType>
		= new EventEmitter<ActionType>();
	@Output() public settingsChange: EventEmitter<ActionSetting>
		= new EventEmitter<ActionSetting>();

	protected readonly typeControl: FormControl
		= new FormControl( undefined );
	protected readonly ACTION_TYPE: typeof ActionType
		= ActionType;

	protected actionsType: ReadonlySet<ActionTypeInfo>;
	protected onBeforeSelectType: () => boolean
		= this._onBeforeSelectType.bind( this );

	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );

	// private _actionAddable: Record<ActionType, boolean>;

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.blockSetup?.currentValue ) {
			this._setActionsType();
		}
	}

	ngOnInit() {
		if ( !this.type ) {
			setTimeout(
				() => this._actionTypePicker?.open()
			);
		}
	}

	/**
	 * @param {ActionType} type
	 * @return {void}
	 */
	protected onActionTypeChange( type: ActionType ) {
		if ( type === this.type ) return;

		this.type = type;
		this.settings = {} as ActionSetting;

		if (
			actionTypeHasSelectRow.has( this.type )
		) {
			switch ( this.blockSetup.previousBlock?.blockType ) {
				case WorkflowBlockType.TRIGGER:
					switch ( this.blockSetup.previousBlock.type ) {
						case TriggerType.ROW_DELETED:
						case TriggerType.SCHEDULE:
							( this.settings as ChangeValueSetting )
							.row = {
								type: RowActionType.CONDITION,
							};
							break;
						default:
							( this.settings as ChangeValueSetting )
							.row = {
								type: RowActionType.ROW_FROM_EVENT_BEFORE,
							};
							break;
					}
					break;
				case WorkflowBlockType.ACTION:
					switch ( this.blockSetup.previousBlock.type ) {
						case ActionType.DELETE_ROW:
							( this.settings as ChangeValueSetting )
							.row = {
								type: RowActionType.CONDITION,
							};
							break;
						default:
							( this.settings as ChangeValueSetting )
							.row = {
								type: RowActionType.ROW_FROM_EVENT_BEFORE,
							};
							break;
					}
					break;
				default:
					( this.settings as ChangeValueSetting )
					.row = {
						type: RowActionType.ROW_FROM_EVENT_BEFORE,
					};
					break;
			}

			setTimeout(
				() => this
				.actionSettingComp
				?.selectRowComp
				?.rowTypePicker
				?.open()
			);
		} else {
			setTimeout(
				() => this
				.actionSettingComp
				?.selectBoardComp
				?.boardPicker
				?.open()
			);
		}

		this.typeChange.emit( this.type );
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onSettingChange() {
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	private _setActionsType() {
		// this._actionAddable = this._getActionAddable();

		this.actionsType
			= new Set([
				this._setActionTypeInfo(
					ActionType.CREATE_ROW,
					'CREATE_ROW',
					'plus-circle',
					'blue'
				),
				this._setActionTypeInfo(
					ActionType.DELETE_ROW,
					'DELETE_ROW',
					'trash',
					'error'
				),
				this._setActionTypeInfo(
					ActionType.CHANGE_VALUE,
					'UPDATE_ROW_VALUE',
					'pencil',
					'blue'
				),
				this._setActionTypeInfo(
					ActionType.NOTIFY,
					'NOTIFY',
					'assets/images/notify-someone.webp'
				),
			]);
	}

	/**
	 * @return {void}
	 */
	private _setActionTypeInfo(
		value: ActionType,
		name: string,
		icon: string,
		iconColor?: string
	): ActionTypeInfo {
		return {
			value,
			name,
			icon,
			iconColor,
			addable: true,
		};
	}

	// /**
	//  * @return {Record<ActionType, boolean>}
	//  */
	// private _getActionAddable(): Record<ActionType, boolean> {
	// 	const actionAddable: Record<ActionType, boolean>
	// 		= {} as Record<ActionType, boolean>;

	// 	actionAddable[ ActionType.CREATE_ROW ]
	// 		= this._setCreateRowAddable();
	// 	actionAddable[ ActionType.DELETE_ROW ]
	// 		= this._setDeleteRowAddable();
	// 	actionAddable[ ActionType.CHANGE_VALUE ]
	// 		= this._setChangeValueAddable();
	// 	actionAddable[ ActionType.NOTIFY ]
	// 		= this._setNotifyAddable();

	// 	return actionAddable;
	// }

	/**
	 * @return {boolean | Promise}
	 */
	private _onBeforeSelectType(
	): boolean | Promise<boolean> {
		if ( this.type ) {
			return new Promise(
				( resolve: any ) => {
					this._confirmService
					.open(
						'BASE.WORKFLOW.SETUP.ACTION.MESSAGE.CHANGE_EVENT',
						'BASE.WORKFLOW.SETUP.ACTION.LABEL.CHANGE_EVENT',
						{
							warning: true,
							buttonApply: {
								text: 'BASE.WORKFLOW.SETUP.ACTION.LABEL.CHANGE',
								type: 'destructive',
							},
						}
					)
					.afterClosed()
					.subscribe({
						next: ( answer: boolean ) => {
							if ( !answer ) {
								resolve();
								return;
							}

							resolve( true );
						},
					});
				}
			);
		} else {
			return true;
		}
	}

	// /**
	//  * @return {boolean}
	//  */
	// private _setCreateRowAddable(): boolean {
	// 	let afterAddable: boolean = true;

	// 	if ( this.blockSetup.previousBlock
	// 		&& ( this.blockSetup.previousBlock as Action ).type ) {
	// 		switch ( this.blockSetup.previousBlock.blockType ) {
	// 			case WorkflowBlockType.TRIGGER:
	// 				afterAddable
	// 					= _.includes(
	// 						[
	// 							TriggerType.ROW_CREATED,
	// 							TriggerType.DATE_ARRIVES,
	// 							TriggerType.VALUE_CHANGED,
	// 							TriggerType.ROW_DELETED,
	// 							TriggerType.SCHEDULE,
	// 						],
	// 						this.blockSetup.previousBlock.type
	// 					);
	// 				break;
	// 			case WorkflowBlockType.ACTION:
	// 				afterAddable
	// 					= _.includes(
	// 						[
	// 							ActionType.CREATE_ROW,
	// 							ActionType.NOTIFY,
	// 							ActionType.CHANGE_VALUE,
	// 							ActionType.DELETE_ROW,
	// 						],
	// 						this.blockSetup.previousBlock.type
	// 					);
	// 				break;
	// 		}
	// 	}

	// 	let beforeAddable: boolean = true;

	// 	_.forEach(
	// 		this.blockSetup.childBlocks,
	// 		( child: WorkflowBlock ) => {
	// 			if ( !( child as Action ).type ) return;

	// 			switch ( child.blockType ) {
	// 				case WorkflowBlockType.TRIGGER:
	// 					beforeAddable
	// 						= _.includes(
	// 							[
	// 								TriggerType.DATE_ARRIVES,
	// 								TriggerType.VALUE_CHANGED,
	// 								TriggerType.ROW_DELETED,
	// 								TriggerType.SCHEDULE,
	// 							],
	// 							child.type
	// 						);
	// 					break;
	// 				case WorkflowBlockType.ACTION:
	// 					beforeAddable
	// 						= _.includes(
	// 							[
	// 								ActionType.CREATE_ROW,
	// 								ActionType.NOTIFY,
	// 								ActionType.DELETE_ROW,
	// 								ActionType.CHANGE_VALUE,
	// 							],
	// 							child.type
	// 						);
	// 					break;
	// 			}
	// 		}
	// 	);

	// 	return beforeAddable && afterAddable;
	// }

	// /**
	//  * @return {boolean}
	//  */
	// private _setDeleteRowAddable(): boolean {
	// 	let afterAddable: boolean = true;

	// 	if ( this.blockSetup.previousBlock
	// 		&& ( this.blockSetup.previousBlock as Action ).type ) {
	// 		switch ( this.blockSetup.previousBlock.blockType ) {
	// 			case WorkflowBlockType.TRIGGER:
	// 				afterAddable
	// 					= _.includes(
	// 						[
	// 							TriggerType.ROW_CREATED,
	// 							TriggerType.DATE_ARRIVES,
	// 							TriggerType.VALUE_CHANGED,
	// 							TriggerType.ROW_DELETED,
	// 							TriggerType.SCHEDULE,
	// 						],
	// 						this.blockSetup.previousBlock.type
	// 					);
	// 				break;
	// 			case WorkflowBlockType.ACTION:
	// 				afterAddable
	// 					= _.includes(
	// 						[
	// 							ActionType.CREATE_ROW,
	// 							ActionType.NOTIFY,
	// 							ActionType.CHANGE_VALUE,
	// 							ActionType.DELETE_ROW,
	// 						],
	// 						this.blockSetup.previousBlock.type
	// 					);
	// 				break;
	// 		}
	// 	}

	// 	let beforeAddable: boolean = true;

	// 	_.forEach(
	// 		this.blockSetup.childBlocks,
	// 		( child: WorkflowBlock ) => {
	// 			if ( !( child as Action ).type ) return;

	// 			switch ( child.blockType ) {
	// 				case WorkflowBlockType.TRIGGER:
	// 					beforeAddable = false;
	// 					break;
	// 				case WorkflowBlockType.ACTION:
	// 					beforeAddable
	// 						= child.type === ActionType.CREATE_ROW
	// 							|| _.includes(
	// 								[
	// 									ActionType.NOTIFY,
	// 									ActionType.DELETE_ROW,
	// 									ActionType.CHANGE_VALUE,
	// 								],
	// 								child.type
	// 							) && (
	// 								child.settings as ChangeValueSetting
	// 									| DeleteRowSetting
	// 									| NotifySetting
	// 							)?.row?.type === RowActionType.CONDITION;
	// 					break;
	// 			}
	// 		}
	// 	);

	// 	return beforeAddable && afterAddable;
	// }

	// /**
	//  * @return {boolean}
	//  */
	// private _setChangeValueAddable(): boolean {
	// 	let afterAddable: boolean = true;

	// 	if ( this.blockSetup.previousBlock
	// 		&& ( this.blockSetup.previousBlock as Action ).type ) {
	// 		switch ( this.blockSetup.previousBlock.blockType ) {
	// 			case WorkflowBlockType.TRIGGER:
	// 				afterAddable
	// 					= _.includes(
	// 						[
	// 							TriggerType.ROW_CREATED,
	// 							TriggerType.DATE_ARRIVES,
	// 							TriggerType.VALUE_CHANGED,
	// 							TriggerType.ROW_DELETED,
	// 							TriggerType.SCHEDULE,
	// 						],
	// 						this.blockSetup.previousBlock.type
	// 					);
	// 				break;
	// 			case WorkflowBlockType.ACTION:
	// 				afterAddable
	// 					= _.includes(
	// 						[
	// 							ActionType.CREATE_ROW,
	// 							ActionType.NOTIFY,
	// 							ActionType.CHANGE_VALUE,
	// 							ActionType.DELETE_ROW,
	// 						],
	// 						this.blockSetup.previousBlock.type
	// 					);
	// 				break;
	// 		}
	// 	}

	// 	let beforeAddable: boolean = true;

	// 	_.forEach(
	// 		this.blockSetup.childBlocks,
	// 		( child: WorkflowBlock ) => {
	// 			if ( !( child as Action ).type ) return;

	// 			switch ( child.blockType ) {
	// 				case WorkflowBlockType.TRIGGER:
	// 					beforeAddable = _.includes(
	// 						[
	// 							TriggerType.DATE_ARRIVES,
	// 							TriggerType.VALUE_CHANGED,
	// 							TriggerType.ROW_DELETED,
	// 							TriggerType.SCHEDULE,
	// 						],
	// 						child.type
	// 					);
	// 					break;
	// 				case WorkflowBlockType.ACTION:
	// 					beforeAddable
	// 						= _.includes(
	// 							[
	// 								ActionType.CREATE_ROW,
	// 								ActionType.NOTIFY,
	// 								ActionType.DELETE_ROW,
	// 								ActionType.CHANGE_VALUE,
	// 							],
	// 							child.type
	// 						);
	// 					break;
	// 			}
	// 		}
	// 	);

	// 	return beforeAddable && afterAddable;
	// }

	// /**
	//  * @return {boolean}
	//  */
	// private _setNotifyAddable(): boolean {
	// 	let afterAddable: boolean = true;

	// 	if ( this.blockSetup.previousBlock
	// 		&& ( this.blockSetup.previousBlock as Action ).type ) {
	// 		switch ( this.blockSetup.previousBlock.blockType ) {
	// 			case WorkflowBlockType.TRIGGER:
	// 				afterAddable
	// 					= _.includes(
	// 						[
	// 							TriggerType.ROW_CREATED,
	// 							TriggerType.DATE_ARRIVES,
	// 							TriggerType.VALUE_CHANGED,
	// 							TriggerType.ROW_DELETED,
	// 							TriggerType.SCHEDULE,
	// 						],
	// 						this.blockSetup.previousBlock.type
	// 					);
	// 				break;
	// 			case WorkflowBlockType.ACTION:
	// 				afterAddable
	// 					= _.includes(
	// 						[
	// 							ActionType.CREATE_ROW,
	// 							ActionType.NOTIFY,
	// 							ActionType.CHANGE_VALUE,
	// 							ActionType.DELETE_ROW,
	// 						],
	// 						this.blockSetup.previousBlock.type
	// 					);
	// 				break;
	// 		}
	// 	}

	// 	let beforeAddable: boolean = true;

	// 	_.forEach(
	// 		this.blockSetup.childBlocks,
	// 		( child: WorkflowBlock ) => {
	// 			if ( !( child as Action ).type ) return;

	// 			switch ( child.blockType ) {
	// 				case WorkflowBlockType.TRIGGER:
	// 					beforeAddable = _.includes(
	// 						[
	// 							TriggerType.DATE_ARRIVES,
	// 							TriggerType.VALUE_CHANGED,
	// 							TriggerType.ROW_DELETED,
	// 							TriggerType.SCHEDULE,
	// 						],
	// 						child.type
	// 					);
	// 					break;
	// 				case WorkflowBlockType.ACTION:
	// 					beforeAddable
	// 						= _.includes(
	// 							[
	// 								ActionType.CREATE_ROW,
	// 								ActionType.NOTIFY,
	// 								ActionType.DELETE_ROW,
	// 								ActionType.CHANGE_VALUE,
	// 							],
	// 							child.type
	// 						);
	// 					break;
	// 			}
	// 		}
	// 	);

	// 	return beforeAddable && afterAddable;
	// }

}
