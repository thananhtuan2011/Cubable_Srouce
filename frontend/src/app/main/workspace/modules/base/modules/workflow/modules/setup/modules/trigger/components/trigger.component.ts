import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	OnInit,
	ViewChild,
	EventEmitter,
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
	WorkflowBlock
} from '../../../../../interfaces';
import {
	findBoardId
} from '../../../../../helpers';

import {
	Trigger,
	TriggerSetting,
	TriggerTypeInfo
} from '../interfaces';
import {
	TriggerType
} from '../resources';

import {
	TriggerBase
} from './trigger-base';
import {
	AtScheduledTimeComponent
} from './at-scheduled-time.component';

@Unsubscriber()
@Component({
	selector: 'trigger',
	templateUrl: '../templates/trigger.pug',
	styleUrls: [ '../styles/trigger.scss' ],
	host: { class: 'trigger' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerComponent
implements OnInit {

	@ViewChild( 'triggerSetting' )
	public triggerSettingComp: TriggerBase;
	@ViewChild( 'triggerTypePicker' )
	private _triggerTypePicker: CUBDropdownComponent;
	@ViewChild( AtScheduledTimeComponent )
	private _atScheduledTimeComponent: AtScheduledTimeComponent;

	@Input() public baseID: ULID;
	@Input() public type: TriggerType;
	@Input() public settings: TriggerSetting;
	@Input() public blockSetup: WorkflowBlock;

	@Output() public isBoardIDChanged: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public typeChange: EventEmitter<TriggerType>
		= new EventEmitter<TriggerType>();
	@Output() public settingsChange: EventEmitter<TriggerSetting>
		= new EventEmitter<TriggerSetting>();

	protected readonly typeControl: FormControl
		= new FormControl( undefined );
	protected readonly TRIGGER_TYPE: typeof TriggerType
		= TriggerType;

	protected triggersType: ReadonlySet<TriggerTypeInfo>;
	protected onBeforeSelectType: () => boolean
		= this._onBeforeSelectType.bind( this );

	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );

	private _triggerAddable: Record<TriggerType, boolean>;

	ngOnInit() {
		this._setTriggerType();

		// KEEP check
		// if (
		// 	!( this.settings as any )?.boardID
		// 	&& !( this.blockSetup as Trigger ).isEntry
		// 	&& this.blockSetup.previousBlock
		// ) {
		// 	this.settings ||= {};

		// 	( this.settings as any ).boardID
		// 		= findBoardId( this.blockSetup.previousBlock );

		// 	this.settingsChange.emit( this.settings );
		// }

		if ( !this.type ) {
			setTimeout(
				() => this._triggerTypePicker?.open()
			);
		}
	}

	/**
	 * @param {TriggerType} type
	 * @return {void}
	 */
	protected onTriggerTypeChange(
		type: TriggerType
	) {
		if ( type === this.type ) return;

		this.type = type;
		this.settings = {} as TriggerSetting;

		this.typeChange.emit( this.type );

		if (
			!( this.blockSetup as Trigger ).isEntry
		) {
			( this.settings as any ).boardID
				= findBoardId( this.blockSetup );
		}

		this.settingsChange.emit( this.settings );

		setTimeout(
			() => {
				switch( type ) {
					case this.TRIGGER_TYPE.ROW_CREATED:
					case this.TRIGGER_TYPE.VALUE_CHANGED:
					case this.TRIGGER_TYPE.ROW_DELETED:
					case this.TRIGGER_TYPE.DATE_ARRIVES:
						this
						.triggerSettingComp
						?.selectBoardCmp
						?.boardPicker
						?.open();
						break;
					case this.TRIGGER_TYPE.DATE_ARRIVES:
						this
						.triggerSettingComp
						?.selectBoardCmp
						?.boardPicker
						?.open();
						break;
					case this.TRIGGER_TYPE.SCHEDULE:
						this
						._atScheduledTimeComponent
						.scheduleTypePicker
						.open();
				}
			}
		);
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
	private _setTriggerType() {
		this._triggerAddable = this._getTriggerAddable();

		this.triggersType
			= new Set([
				this._setTriggerTypeInfo(
					TriggerType.ROW_CREATED,
					'ROW_CREATED',
					'plus-circle',
					'blue'
				),
				this._setTriggerTypeInfo(
					TriggerType.VALUE_CHANGED,
					'ROW_VALUE_CHANGED',
					'pencil',
					'blue'
				),
				this._setTriggerTypeInfo(
					TriggerType.ROW_DELETED,
					'ROW_DELETED',
					'trash',
					'error'
				),
				this._setTriggerTypeInfo(
					TriggerType.DATE_ARRIVES,
					'ROW_DATE_ARRIVES',
					'assets/images/record-time.svg'
				),
				this._setTriggerTypeInfo(
					TriggerType.SCHEDULE,
					'SCHEDULE',
					'assets/images/scheduled-time.svg'
				),
			]);
	}

	/**
	 * @return {void}
	 */
	private _setTriggerTypeInfo(
		value: TriggerType,
		name: string,
		icon: string,
		iconColor?: string
	): TriggerTypeInfo {
		return {
			value,
			name,
			icon,
			iconColor,
			addable: this._triggerAddable[ value ],
		};
	}

	/**
	 * @return {Record<TriggerType, boolean>}
	 */
	private _getTriggerAddable(): Record<TriggerType, boolean> {
		const triggerAddable: Record<TriggerType, boolean>
			= {} as Record<TriggerType, boolean>;

		triggerAddable[ TriggerType.ROW_CREATED ]
			= this._setRowCreatedAddable();
		triggerAddable[ TriggerType.ROW_DELETED ]
			= this._setRowDeletedAddable();
		triggerAddable[ TriggerType.VALUE_CHANGED ]
			= this._setValueChangedAddable();
		triggerAddable[ TriggerType.DATE_ARRIVES ]
			= this._setDateArrivesAddable();
		triggerAddable[ TriggerType.SCHEDULE ]
			= this._setScheduleAddable();

		return triggerAddable;
	}

	/**
	 * @return {boolean}
	 */
	private _setRowCreatedAddable(): boolean {
		let addable: boolean = true;

		addable
			= ( this.blockSetup as Trigger ).isEntry;

		return addable;
	}

	/**
	 * @return {boolean | Promise}
	 */
	private _onBeforeSelectType(): boolean | Promise<boolean> {
		if ( this.type ) {
			return new Promise(
				( resolve: any ) => {
					this._confirmService
					.open(
						'BASE.WORKFLOW.SETUP.TRIGGER.MESSAGE.CHANGE_EVENT',
						'BASE.WORKFLOW.SETUP.TRIGGER.LABEL.CHANGE_EVENT',
						{
							warning: true,
							buttonApply: {
								text: 'BASE.WORKFLOW.SETUP.TRIGGER.LABEL.CHANGE',
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

	/**
	 * @return {boolean}
	 */
	private _setRowDeletedAddable(): boolean {
		return true;
		// let afterAddable: boolean = true;

		// if (
		// 	this.blockSetup.previousBlock
		// 	&& ( this.blockSetup.previousBlock as Trigger ).type
		// ) {
		// 	switch ( this.blockSetup.previousBlock.blockType ) {
		// 		case WorkflowBlockType.TRIGGER:
		// 			afterAddable
		// 				= _.includes(
		// 					[
		// 						TriggerType.ROW_CREATED,
		// 						TriggerType.VALUE_CHANGED,
		// 						TriggerType.DATE_ARRIVES,
		// 						TriggerType.SCHEDULE,
		// 					],
		// 					this.blockSetup.previousBlock.type
		// 				);
		// 			break;
		// 		case WorkflowBlockType.ACTION:
		// 			afterAddable
		// 				= _.includes(
		// 					[
		// 						ActionType.CREATE_ROW,
		// 						ActionType.NOTIFY,
		// 						ActionType.CHANGE_VALUE,
		// 					],
		// 					this.blockSetup.previousBlock.type
		// 				);
		// 			break;
		// 	}
		// }

		// let beforeAddable: boolean = true;

		// _.forEach(
		// 	this.blockSetup.childBlocks,
		// 	( child: WorkflowBlock ) => {
		// 		if ( !( child as Trigger )?.type ) return;

		// 		switch ( child.blockType ) {
		// 			case WorkflowBlockType.TRIGGER:
		// 				beforeAddable = !child.type;
		// 				break;
		// 			case WorkflowBlockType.ACTION:
		// 				beforeAddable
		// 					= _.includes(
		// 						[
		// 							ActionType.CREATE_ROW,
		// 							ActionType.NOTIFY,
		// 							ActionType.DELETE_ROW,
		// 						],
		// 						child.type
		// 					) || (
		// 						child.type === ActionType.CHANGE_VALUE
		// 						&& (
		// 							child.settings as ChangeValueSetting
		// 						)?.row.type === RowActionType.CONDITION
		// 					);
		// 				break;
		// 		}
		// 	}
		// );

		// return beforeAddable && afterAddable;
	}

	/**
	 * @return {boolean}
	 */
	private _setValueChangedAddable(): boolean {
		return true;
		// let afterAddable: boolean = true;

		// if ( this.blockSetup.previousBlock
		// 	&& ( this.blockSetup.previousBlock as Trigger ).type ) {
		// 	switch ( this.blockSetup.previousBlock.blockType ) {
		// 		case WorkflowBlockType.TRIGGER:
		// 			afterAddable
		// 				= _.includes(
		// 					[
		// 						TriggerType.ROW_CREATED,
		// 						TriggerType.DATE_ARRIVES,
		// 						TriggerType.SCHEDULE,
		// 						TriggerType.VALUE_CHANGED,
		// 					],
		// 					this.blockSetup.previousBlock.type
		// 				);
		// 			break;
		// 		case WorkflowBlockType.ACTION:
		// 			afterAddable
		// 				= _.includes(
		// 					[
		// 						ActionType.CREATE_ROW,
		// 						ActionType.NOTIFY,
		// 						ActionType.CHANGE_VALUE,
		// 					],
		// 					this.blockSetup.previousBlock.type
		// 				);
		// 			break;
		// 	}
		// }

		// let beforeAddable: boolean = true;

		// _.forEach(
		// 	this.blockSetup.childBlocks,
		// 	( child: WorkflowBlock ) => {
		// 		if ( !( child as Trigger )?.type ) return;

		// 		switch ( child.blockType ) {
		// 			case WorkflowBlockType.TRIGGER:
		// 				beforeAddable
		// 					= _.includes(
		// 						[
		// 							TriggerType.DATE_ARRIVES,
		// 							TriggerType.SCHEDULE,
		// 							TriggerType.ROW_DELETED,
		// 							TriggerType.VALUE_CHANGED,
		// 						],
		// 						child.type
		// 					);
		// 				break;
		// 			case WorkflowBlockType.ACTION:
		// 				beforeAddable
		// 					= _.includes(
		// 						[
		// 							ActionType.CREATE_ROW,
		// 							ActionType.NOTIFY,
		// 							ActionType.DELETE_ROW,
		// 							ActionType.CHANGE_VALUE,
		// 						],
		// 						child.type
		// 					);
		// 				break;
		// 		}
		// 	}
		// );

		// return beforeAddable && afterAddable;
	}

	/**
	 * @return {boolean}
	 */
	private _setDateArrivesAddable(): boolean {
		return true;
		// let afterAddable: boolean = true;

		// if ( this.blockSetup.previousBlock
		// 	&& ( this.blockSetup.previousBlock as Trigger ).type ) {
		// 	switch ( this.blockSetup.previousBlock.blockType ) {
		// 		case WorkflowBlockType.TRIGGER:
		// 			afterAddable
		// 				= _.includes(
		// 					[
		// 						TriggerType.ROW_CREATED,
		// 						TriggerType.DATE_ARRIVES,
		// 						TriggerType.SCHEDULE,
		// 						TriggerType.VALUE_CHANGED,
		// 					],
		// 					this.blockSetup.previousBlock.type
		// 				);
		// 			break;
		// 		case WorkflowBlockType.ACTION:
		// 			afterAddable
		// 				= _.includes(
		// 					[
		// 						ActionType.CREATE_ROW,
		// 						ActionType.NOTIFY,
		// 						ActionType.CHANGE_VALUE,
		// 					],
		// 					this.blockSetup.previousBlock.type
		// 				);
		// 			break;
		// 	}
		// }

		// let beforeAddable: boolean = true;

		// _.forEach(
		// 	this.blockSetup.childBlocks,
		// 	( child: WorkflowBlock ) => {
		// 		if ( !( child as Trigger )?.type ) return;

		// 		switch ( child.blockType ) {
		// 			case WorkflowBlockType.TRIGGER:
		// 				beforeAddable
		// 					= _.includes(
		// 						[
		// 							TriggerType.DATE_ARRIVES,
		// 							TriggerType.SCHEDULE,
		// 							TriggerType.ROW_DELETED,
		// 							TriggerType.VALUE_CHANGED,
		// 						],
		// 						child.type
		// 					);
		// 				break;
		// 			case WorkflowBlockType.ACTION:
		// 				beforeAddable
		// 					= _.includes(
		// 						[
		// 							ActionType.CREATE_ROW,
		// 							ActionType.NOTIFY,
		// 							ActionType.DELETE_ROW,
		// 							ActionType.CHANGE_VALUE,
		// 						],
		// 						child.type
		// 					);
		// 				break;
		// 		}
		// 	}
		// );

		// return beforeAddable && afterAddable;
	}

	/**
	 * @return {boolean}
	 */
	private _setScheduleAddable(): boolean {
		return true;
		// let afterAddable: boolean = true;

		// if (
		// 	this.blockSetup.previousBlock
		// 	&& ( this.blockSetup.previousBlock as Trigger ).type
		// ) {
		// 	switch (
		// 		this.blockSetup.previousBlock.blockType
		// 	) {
		// 		case WorkflowBlockType.TRIGGER:
		// 			afterAddable
		// 				= _.includes(
		// 					[
		// 						TriggerType.ROW_CREATED,
		// 						TriggerType.DATE_ARRIVES,
		// 						TriggerType.SCHEDULE,
		// 						TriggerType.VALUE_CHANGED,
		// 					],
		// 					this.blockSetup.previousBlock.type
		// 				);
		// 			break;
		// 		case WorkflowBlockType.ACTION:
		// 			afterAddable
		// 				= _.includes(
		// 					[
		// 						ActionType.CREATE_ROW,
		// 						ActionType.NOTIFY,
		// 						ActionType.CHANGE_VALUE,
		// 					],
		// 					this.blockSetup.previousBlock.type
		// 				);
		// 			break;
		// 	}
		// }

		// let beforeAddable: boolean = true;

		// _.forEach(
		// 	this.blockSetup.childBlocks,
		// 	( child: WorkflowBlock ) => {
		// 		if ( !child ) return;

		// 		switch ( child.blockType ) {
		// 			case WorkflowBlockType.TRIGGER:
		// 				beforeAddable = !child.type;
		// 				break;
		// 			case WorkflowBlockType.ACTION:
		// 				beforeAddable
		// 					= !child.type
		// 						|| child.type === ActionType.CREATE_ROW
		// 						|| _.includes(
		// 							[
		// 								ActionType.NOTIFY,
		// 								ActionType.CHANGE_VALUE,
		// 								ActionType.DELETE_ROW,
		// 							],
		// 							child.type
		// 						) && (
		// 							child.settings as ChangeValueSetting
		// 								| DeleteRowSetting
		// 								| NotifySetting
		// 						)?.row?.type === RowActionType.CONDITION;
		// 				break;
		// 			case WorkflowBlockType.CONDITION:
		// 				beforeAddable = false;
		// 				break;
		// 		}
		// 	}
		// );

		// return beforeAddable && afterAddable;
	}

}
