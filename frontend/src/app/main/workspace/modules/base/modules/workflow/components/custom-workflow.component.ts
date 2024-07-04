import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnInit,
	ViewChild,
	inject
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	ULID
} from 'ulidx';
import {
	forkJoin
} from 'rxjs';
import moment from 'moment';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	ComparisonErrorType
} from '@main/common/field/modules/comparison/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	TeamService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/services';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	ITeam
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/interfaces';

import {
	BoardFieldService,
	BoardService
} from '../../board/services';
import {
	BoardField,
	IBoard
} from '../../board/interfaces';

import {
	Workflow,
	WorkflowBlock
} from '../interfaces';
import {
	WorkflowService
} from '../services';
import {
	WorkflowBlockType
} from '../resources';
import {
	DateArrivesSetting,
	RowCreatedSetting,
	RowDeleteSetting,
	Trigger,
	ValueChangedSetting
} from '../modules/setup/modules/trigger/interfaces';
import {
	ScheduleType,
	TriggerType
} from '../modules/setup/modules/trigger/resources';
import {
	ActionType,
	RowActionType
} from '../modules/setup/modules/action/resources';
import {
	ChartComponent
} from '../modules/chart/components';
import {
	SetupComponent
} from '../modules/setup/components';
import {
	SingleOption,
	singleConditionalCheckAnOption
} from '../modules/setup/modules/common/conditional';
import {
	Action,
	ChangeValueSetting,
	CreateRowSetting,
	DeleteRowSetting,
	NotifySetting
} from '../modules/setup/modules/action/interfaces';
import {
	ConditionSetting
} from '../modules/setup/modules/condition/interfaces';
import {
	AtScheduleTimeSetting
} from '../modules/setup/modules/trigger/interfaces/schedule.interface';
import {
	triggerValidation
} from '../modules/setup/modules/trigger/components';
import {
	actionValidation
} from '../modules/setup/modules/action/components';
import {
	conditionValidation
} from '../modules/setup/modules/condition/components';
import {
	delayValidation
} from '../modules/setup/modules/delay/components';
import {
	DelaySetting
} from '../modules/setup/modules/delay/interfaces';
import {
	DelayPeriod
} from '../modules/setup/modules/delay/resources';
import {
	findBoardId
} from '../helpers';
import {
	subProcessValidation
} from '../modules/setup/modules/sub-process/components';
import{
	parallelValidation
} from '../modules/setup/modules/parallel/components';
import {
	loopValidation
} from '../modules/setup/modules/loop/components';
import{
	endValidation
} from '../modules/setup/modules/end/components';

import {
	DialogWorkflowComponent
} from './dialog-workflow.component';

@Unsubscriber()
@Component({
	selector: 'custom-workflow',
	templateUrl: '../templates/custom-workflow.pug',
	styleUrls: [ '../styles/custom-workflow.scss' ],
	host: { class: 'custom-workflow' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomWorkflowComponent
implements OnInit {

	@ViewChild( 'chartComp' )
	private _chartComp: ChartComponent;
	@ViewChild( 'setupComp' )
	private _setupComp: SetupComponent;

	@Input() public workflow: Workflow;

	public blockStateInvalid: Record<ULID, boolean>;

	protected readonly SCHEDULE_ACTION_TYPE: typeof ScheduleType
		= ScheduleType;

	protected blockSetup: WorkflowBlock;
	protected boardsLk: ObjectType<IBoard>;

	private readonly _workflowService: WorkflowService
		= inject( WorkflowService );
	private readonly _translateService: TranslateService
		= inject( TranslateService );
	private readonly _boardService: BoardService
		= inject( BoardService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _dialogWorkflowComp: DialogWorkflowComponent
		= inject( DialogWorkflowComponent );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _teamService: TeamService
		= inject( TeamService );

	private _boardsLk: ObjectType<IBoard>;
	private _fieldsLk: ObjectType<BoardField>;
	private _usersLk: ObjectType<IUser>;
	private _teamsLk: ObjectType<ITeam>;

	ngOnInit() {
		if ( !this._boardsLk ) {
			this._getBoards();
		}

		this._initSubscription();

		setTimeout(
			() => {
				this._setupWfBlock();
				this._setupBlockDescription(
					this.workflow.entryTrigger,
					true
				);
				this.onBlockClicked(
					this.workflow.entryTrigger
				);

				if ( !this.workflow.id ) this.validate();
			}
		);
	}

	/**
	 * @return {Workflow}
	 */
	public save(): Workflow {
		return this.workflow;
	}

	/**
	 * @return {void}
	 */
	protected validate() {
		this.blockStateInvalid = {};

		this._validate(
			this.workflow.entryTrigger,
			false
		);
	}

	/**
	 * @param {WorkflowBlock} e
	 * @param {boolean=} forceUpdate
	 * @return {void}
	 */
	protected onBlockClicked(
		e: WorkflowBlock,
		forceUpdate?: boolean
	) {
		if ( e === undefined ) {
			this.blockSetup = e;
			return;
		}

		if ( !e ) {
			setTimeout(
				() => {
					this._validate(
						this.blockSetup
					);

					this.blockSetup = e;
				}
			);
			return;
		}

		if (
			this.blockSetup?.id === e.id
		) {
			if ( forceUpdate ) {
				this.blockSetup = null;

				this._cdRef.detectChanges();

				this.blockSetup = e;

				this._cdRef.detectChanges();

				setTimeout(
					() => {
						this._validate(
							e,
							!!e.extra?.invalid
						);
					}
				);
			}

			return;
		}

		if (
			this.blockSetup
			&& !this.blockSetup.extra?.invalid
		) {
			setTimeout(
				() => {
					this._validate(
						this.blockSetup
					);

					this.blockSetup = null;

					this._cdRef.detectChanges();

					this.blockSetup = e;

					this._cdRef.detectChanges();
				}
			);
		} else {
			setTimeout(
				() => {
					this.blockSetup = null;

					this._cdRef.detectChanges();

					this.blockSetup = e;

					this._cdRef.detectChanges();
				}
			);
		}

		setTimeout(
			() => {
				this._validate(
					e,
					!!e.extra?.invalid
				);
			}, 100
		);
	}

	/**
	 * @return {void}
	 */
	protected onBlockSetupChange() {
		if ( !this._boardsLk ) this._getBoards();

		this._workflowService.dataChanged$.next();

		this._validate(
			this.blockSetup,
			!!this.blockSetup.extra?.invalid
		);

		this._setupBlockDescription(
			this.blockSetup
		);

		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected onChartChange() {
		this._setupWfBlock();

		this._workflowService.dataChanged$.next();
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @param {boolean=} isInit
	 * @return {void}
	 */
	private _setupBlockDescription(
		wfBlock: WorkflowBlock,
		isInit?: boolean
	) {
		if ( !wfBlock ) return;

		if ( _.isStrictEmpty( wfBlock.settings ) ) {
			this._resetSettingDescription( wfBlock );
		} else {
			switch ( wfBlock.blockType ) {
				case WorkflowBlockType.TRIGGER:
					this._setTriggerDescription( wfBlock );
					break;
				case WorkflowBlockType.ACTION:
					this._setActionDescription( wfBlock );
					break;
				case WorkflowBlockType.CONDITION:
					this._setConditionDescription( wfBlock );
					break;
				case WorkflowBlockType.DELAY:
					this._setDelayDescription( wfBlock );
					break;
			}
		}

		this._updateNode(
			wfBlock
		);

		if ( !isInit ) return;

		_.forEach(
			wfBlock.childBlocks,
			( block: WorkflowBlock ) => {
				if ( !block ) return;

				this._setupBlockDescription(
					block,
					isInit
				);
			}
		);

		if (
			wfBlock.nextBlock
		) {
			this._setupBlockDescription(
				wfBlock.nextBlock,
				isInit
			);
		}
	}

	// TODO init parentBlock
	/**
	 * @param {WorkflowBlock=} wfBlock
	 * @param {WorkflowBlock=} previousBlock
	 * @param {string} index
	 * @param {number} order
	 * @return {void}
	 */
	private _setupWfBlock(
		wfBlock: WorkflowBlock = this.workflow.entryTrigger,
		previousBlock?: WorkflowBlock,
		index: string = '0',
		order: number = 0,
		childIndex: number = 0,
		subLevel: number = 0,
		parLevel: number = 1,
		loopLevel: number = 1
	) {
		// Set previousBlock, parentBlock
		if ( childIndex ) {
			wfBlock.parentBlock
				= previousBlock;
		} else {
			if ( previousBlock?.parentBlock ) {
				wfBlock.parentBlock
					= previousBlock.parentBlock;
			}

			if ( previousBlock ) {
				wfBlock.previousBlock
					= previousBlock;
			}
		}

		// Set boardID
		wfBlock.boardID
			= ( wfBlock as Trigger ).isEntry
				? ( wfBlock.settings as any )?.boardID
				: wfBlock.parentBlock?.blockType
					=== WorkflowBlockType.SUB_PROCESS
					? wfBlock.parentBlock.settings?.boardID
					: ( previousBlock as any )?.boardID;

		// Set childIndex in metadata
		if (
			previousBlock?.blockType
			=== WorkflowBlockType.PARALLEL
		) {
			wfBlock.metadata
				= {
					...wfBlock.metadata,
					childIndex: childIndex
						? childIndex - 1
						: previousBlock.metadata.childIndex,
				};
		}

		let isParallel: boolean;
		let newIndex: string;
		let newOrder: number;

		switch ( wfBlock.blockType ) {
			case WorkflowBlockType.TRIGGER:
			case WorkflowBlockType.ACTION:
			case WorkflowBlockType.CONDITION:
			case WorkflowBlockType.SUB_PROCESS:
				if ( !order ) {
					newIndex
						= ( +index + 1 ).toString();
					newOrder
						= order;
				} else {
					// Not after SUB_PROCESS_START
					if ( order !== 1 ) {
						const strs: string[]
							= _.split( index, '.' );

						index
							= _.join(
								_.slice(
									index,
									0,
									-( _.last( strs ).length + 1 )
								),
								''
							);
					}

					index =
						index.length
							? index + '.'
							: '';

					newIndex
						= index + ( order++ );
					newOrder
						= order;
				}

				break;
			case WorkflowBlockType.LOOP:
				if ( !order ) {
					newIndex
						= ( +index + 1 ).toString();
					newOrder
						= order;
				} else {
					// Not after SUB_PROCESS_START
					if ( order !== 1 ) {
						const strs: string[]
							= _.split( index, '.' );

						index
							= _.join(
								_.slice(
									index,
									0,
									-( _.last( strs ).length + 1 )
								),
								''
							);
					}

					index =
						index.length
							? index + '.'
							: '';

					newIndex
						= index + ( order++ );
					newOrder
						= order;

					loopLevel
						= childIndex
							? previousBlock.loopLevel + 1
							: previousBlock.loopLevel;
				}
				break;
			case WorkflowBlockType.SUB_PROCESS_START:
				newIndex = index;
				newOrder = 1;
				subLevel
					= childIndex
						? previousBlock.subLevel + 1
						: previousBlock.subLevel;

				break;
			case WorkflowBlockType.LOOP_START:
				newIndex = index;
				newOrder = 1;
				loopLevel
					= childIndex
						? previousBlock.loopLevel + 1
						: previousBlock.loopLevel;
				break;
			case WorkflowBlockType.PARALLEL:
				newIndex = index;
				newOrder = order;
				isParallel = true;
				parLevel
					= childIndex
						? previousBlock.parLevel + 1
						: previousBlock.parLevel;

				break;
			default:
				newIndex = index;
				newOrder = order;
		}

		wfBlock.metadata
			= {
				...wfBlock.metadata,
				name:
					this._translateService.instant(
						'BASE.WORKFLOW.LABEL.EVENT_NAME',
						{
							eventName: newIndex,
						}
					),
				index: newIndex,
			};

		wfBlock.parLevel
			= parLevel;
		wfBlock.subLevel
			= subLevel;
		wfBlock.loopLevel
			= loopLevel;

		_.forEach(
			wfBlock.childBlocks,
			( block: WorkflowBlock, _index: number ) => {
				if ( !block ) return;

				childIndex = _index + 1;

				this._accessBlock(
					block,
					wfBlock,
					_.slice( wfBlock.childBlocks, 0, _index ),
					newIndex,
					newOrder,
					!!_index,
					isParallel,
					childIndex,
					subLevel,
					parLevel,
					loopLevel
				);
			}
		);

		if ( wfBlock.nextBlock ) {
			const isNewPosition: boolean
				= wfBlock.childBlocks
				&& wfBlock.blockType
					!== WorkflowBlockType.SUB_PROCESS
				&& wfBlock.blockType
					!== WorkflowBlockType.LOOP;

			childIndex = 0;

			this._accessBlock(
				wfBlock.nextBlock,
				wfBlock,
				wfBlock.childBlocks,
				newIndex,
				newOrder,
				isNewPosition,
				isParallel,
				childIndex,
				subLevel,
				parLevel,
				loopLevel
			);
		}
	}

	/**
	 * @param {WorkflowBlock} block
	 * @param {WorkflowBlock} currentBlock
	 * @param {WorkflowBlock[]} childBlocks
	 * @param {string} newIndex
	 * @param {number} newOrder
	 * @param {boolean} isNewPosition
	 * @return {string}
	 */
	private _accessBlock(
		accessedBlock: WorkflowBlock,
		currentBlock: WorkflowBlock,
		childBlocks: WorkflowBlock[],
		index: string,
		order: number,
		isNewPosition: boolean,
		isParallel: boolean,
		childIndex: number,
		subLevel: number,
		parLevel: number,
		loopLevel: number
	) {
		if ( isNewPosition ) {
			const newIndex: string
				= this._getNewIndex( currentBlock, childBlocks );
			const values: string[]
				= _.split( newIndex, '.' );
			const newOrder: number
				= +_.last( values ) + 1;

			order
				= isParallel && ( newIndex === index )
					? order
					: newOrder;
			index
				= newIndex;
		}

		this._setupWfBlock(
			accessedBlock,
			currentBlock,
			index,
			order,
			childIndex,
			subLevel,
			parLevel,
			loopLevel
		);
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @param {WorkflowBlock[]} childBlocks
	 * @param {string} newIndex
	 * @return {string}
	 */
	private _getNewIndex(
		wfBlock: WorkflowBlock,
		childBlocks: WorkflowBlock[]
	) {
		const newIndex: string
			= this._getLastIndex(
				_.findLast(
					childBlocks,
					( value: WorkflowBlock ) => value !== null
				)
			);

		return newIndex || wfBlock.metadata.index;
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {string}
	 */
	private _getLastIndex( wfBlock: WorkflowBlock ) {
		if ( !wfBlock ) return;

		if ( wfBlock.nextBlock ) {
			return this._getLastIndex( wfBlock.nextBlock );
		} else {
			if (
				wfBlock.childBlocks
				&& wfBlock.blockType !== WorkflowBlockType.SUB_PROCESS
				&& wfBlock.blockType !== WorkflowBlockType.LOOP
			) {
				const childBlock: WorkflowBlock
					= _.findLast(
						wfBlock.childBlocks,
						( value: WorkflowBlock ) => value !== null
					);

				if ( childBlock ) {
					return this._getLastIndex( childBlock );
				} else {
					return wfBlock.metadata.index;
				}
			} else {
				return wfBlock.metadata.index;
			}
		}
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {void}
	 */
	private _setTriggerDescription(
		wfBlock: WorkflowBlock
	) {
		const key: string
			= 'BASE.WORKFLOW.DESCRIPTION.TRIGGER';

		switch ( ( wfBlock as Trigger ).type ) {
			case TriggerType.ROW_CREATED:
				const rowCreatedSettings: RowCreatedSetting
					= wfBlock.settings as RowCreatedSetting;

				if ( !rowCreatedSettings.boardID ) {
					this._resetSettingDescription( wfBlock );
				} else {
					wfBlock.extra ||= {};

					wfBlock.extra.settingDescription
						= {
							message: this._translateService.instant(
								`${key}.ROW_CREATED`,
								{
									boardName: this
									._boardsLk[ rowCreatedSettings.boardID ]
									.name,
								}
							),
							iconName: 'plus-circle',
							iconColor: 'blue',
						};
				}
				break;
			case TriggerType.ROW_DELETED:
				const rowDeletedSettings: RowDeleteSetting
					= wfBlock.settings as RowDeleteSetting;

				if ( !rowDeletedSettings.boardID ) {
					this._resetSettingDescription( wfBlock );
				} else {
					wfBlock.extra ||= {};

					wfBlock.extra.settingDescription
						= {
							message: this._translateService.instant(
								`${key}.ROW_DELETED`,
								{
									boardName: this
									._boardsLk[ rowDeletedSettings.boardID ]
									.name,
								}
							),
							iconName: 'trash',
							iconColor: 'error',
						};
				}
				break;
			case TriggerType.VALUE_CHANGED:
				const valueChangedSettings: ValueChangedSetting
					= wfBlock.settings as ValueChangedSetting;

				if ( !valueChangedSettings.boardID ) {
					this._resetSettingDescription( wfBlock );
				} else {
					wfBlock.extra ||= {};

					wfBlock.extra.settingDescription
						= {
							message: this._translateService.instant(
								`${key}.VALUE_CHANGED`,
								{
									boardName: this
									._boardsLk[ valueChangedSettings.boardID ]
									.name,
								}
							),
							iconName: 'pencil',
							iconColor: 'blue',
						};
				}
				break;
			case TriggerType.DATE_ARRIVES:
				const dateArrivesSettings: DateArrivesSetting
					= wfBlock.settings as DateArrivesSetting;

				if ( !dateArrivesSettings.boardID
					|| !dateArrivesSettings.dateSelection?.fieldID ) {
					this._resetSettingDescription( wfBlock );
				} else {
					this._getFields();

					wfBlock.extra ||= {};

					wfBlock.extra.settingDescription
						= {
							message: this._translateService.instant(
								`${key}.DATE_ARRIVES`,
								{
									boardName:
										this._boardsLk
										[ dateArrivesSettings.boardID ]
										.name,
									fieldName:
										this._fieldsLk
										[
										dateArrivesSettings
										.dateSelection
										.fieldID
										]
										.name,
								}
							),
							iconName: 'assets/images/record-time.svg',
						};
				}
				break;
			case TriggerType.SCHEDULE:
				this._setScheduleDescription( key, wfBlock );
				break;
		}
	}

	/**
	 * @param {WorkflowBlock} workflowBlock
	 * @return {void}
	 */
	private _setActionDescription(
		workflowBlock: WorkflowBlock
	) {
		const key: string
			= 'BASE.WORKFLOW.DESCRIPTION.ACTION';

		switch ( ( workflowBlock as Action ).type ) {
			case ActionType.CREATE_ROW:
				const createRowSettings: CreateRowSetting
					= workflowBlock.settings as CreateRowSetting;

				if (
					!createRowSettings.boardID
					|| _.isStrictEmpty( createRowSettings )
				) {
					this._resetSettingDescription( workflowBlock );
				} else {
					workflowBlock.extra ||= {};

					workflowBlock.extra.settingDescription
						= {
							message: this._translateService.instant(
								`${key}.CREATE_ROW`,
								{
									boardName: this
									._boardsLk[ createRowSettings.boardID ]
									.name,
								}
							),
							iconName: 'plus-circle',
							iconColor: 'blue',
						};
				}
				break;
			case ActionType.DELETE_ROW:
				const deleteRowSettings: DeleteRowSetting
					= workflowBlock.settings as DeleteRowSetting;

				if (
					_.isStrictEmpty( deleteRowSettings.row )
					|| (
						deleteRowSettings.row.type === RowActionType.CONDITION
							&& !deleteRowSettings.row.boardID
					)
				) {
					this._resetSettingDescription( workflowBlock );
				} else {
					const boardId: ULID
						= findBoardId( workflowBlock );

					if ( !boardId ) return;

					workflowBlock.extra ||= {};

					workflowBlock.extra.settingDescription
						= {
							message: this._translateService.instant(
								`${key}.DELETE_ROW`,
								{
									boardName: this
									._boardsLk[ boardId ]
									.name,
								}
							),
							iconName: 'trash',
							iconColor: 'error',
						};
				}
				break;
			case ActionType.CHANGE_VALUE:
				const changeValueSettings: ChangeValueSetting
					= workflowBlock.settings as ChangeValueSetting;

				if (
					_.isStrictEmpty( changeValueSettings )
					|| (
						changeValueSettings.row?.type
							=== RowActionType.CONDITION
						&& !changeValueSettings.row.boardID
					)
					|| !changeValueSettings.fields?.length
				) {
					this._resetSettingDescription( workflowBlock );
				} else {
					const boardId: ULID
						= findBoardId( workflowBlock );

					if ( !boardId ) return;

					workflowBlock.extra ||= {};

					workflowBlock.extra.settingDescription
						= {
							message: this._translateService.instant(
								`${key}.CHANGE_VALUE`,
								{
									boardName: this
									._boardsLk[ boardId ]
									.name,
								}
							),
							iconName: 'pencil',
							iconColor: 'blue',
						};
				}
				break;
			case ActionType.NOTIFY:
				const notifySettings: NotifySetting
					= workflowBlock.settings as NotifySetting;

				if (
					_.isStrictEmpty( notifySettings.row )
					|| (
						notifySettings.row.type === RowActionType.CONDITION
							&& !notifySettings.row.boardID
					)
					|| !notifySettings.rawSubject?.length
					|| (
						!notifySettings.receivers?.baseID?.length
						&& !notifySettings.receivers?.fieldIDs?.length
						&& !notifySettings.receivers?.userIDs?.length
						&& !notifySettings.receivers?.teamIDs?.length
					)
				) {
					this._resetSettingDescription( workflowBlock );
				} else {
					this._getNotifyActionDescription( workflowBlock );
				}
				break;
		}
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {void}
	 */
	private _setConditionDescription(
		wfBlock: WorkflowBlock
	) {
		const options: SingleOption[]
			= ( wfBlock.settings as ConditionSetting )?.filter?.options;

		if ( !options ) {
			this._resetSettingDescription( wfBlock );
		} else {
			let validOptions: SingleOption[];

			_.forEach(
				options,
				( option: SingleOption, index: number ) => {
					const error: ComparisonErrorType
						= singleConditionalCheckAnOption(
							option,
							index,
							true,
							this
							._setupComp
							?.conditionComp
							?.conditionSettingComp
							?.conditionalComp
						);
					const isOptionValid: boolean
						= _.values( error )
						.indexOf( true ) < 0;

					if ( isOptionValid ) {
						validOptions ||= [];

						validOptions.push( option );
					}
				}
			);

			if ( !validOptions?.length ) {
				this._resetSettingDescription( wfBlock );
				return;
			}

			wfBlock.extra ||= {};

			wfBlock.extra.settingDescription
				= {
					iconName: 'branch',
					iconColor: 'blue',
					message: this
					._translateService
					.instant(
						'BASE.WORKFLOW.DESCRIPTION.CONDITION.APPLIED_CONDITION',
						{ optionsLength: validOptions.length }
					),
				};
		}
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {void}
	 */
	private _setDelayDescription(
		wfBlock: WorkflowBlock
	) {
		if (
			!( wfBlock.settings as DelaySetting )?.quantity
		) {
			this._resetSettingDescription( wfBlock );
		} else {
			wfBlock.extra ||= {};

			wfBlock.extra.settingDescription
				= {
					iconName: 'hourglass',
					message: this._translateService.instant(
						'BASE.WORKFLOW.DESCRIPTION.DELAY',
						{
							quantity:
								( wfBlock.settings as DelaySetting )
								?.quantity,
							period: this._getPeriodMessage( wfBlock ),
						}
					),
				};
		}
	}

	/**
	 * @param {WorkflowBlock} blockSetup
	 * @return {string}
	 */
	private _getPeriodMessage( blockSetup: WorkflowBlock ) {
		return this._translateService.instant(
			'BASE.WORKFLOW.LABEL.' +
			(
				( blockSetup?.settings as DelaySetting )
				?.period === DelayPeriod.MINUTE
					? 'MINUTE'
					: (
						blockSetup?.settings as DelaySetting
					)?.period === DelayPeriod.HOUR
						? 'HOUR'
						: 'DAY'
			)
		).toLowerCase();
	}

	/**
	 * @param {WorkflowBlock} workflowBlock
	 * @return {void}
	 */
	private _resetSettingDescription( workflowBlock: WorkflowBlock ) {
		workflowBlock.extra ||= {};
		workflowBlock.extra.settingDescription = null;
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @param {boolean=} showInvalidState
	 * @return {void}
	 */
	private _validate(
		wfBlock: WorkflowBlock,
		showInvalidState: boolean = true
	) {
		this.blockStateInvalid ||= {};
		this.blockStateInvalid[ wfBlock.id ]
			= !this._getValidation(
				wfBlock,
				showInvalidState
			);

		this
		._dialogWorkflowComp
		.cdRef
		.markForCheck();

		if ( !showInvalidState ) return;

		wfBlock.extra ||= {};
		wfBlock.extra.invalid
			= this.blockStateInvalid[ wfBlock.id ];

		this._chartComp
		.updateNode(
			wfBlock,
			{
				metadata: {
					invalid: wfBlock.extra.invalid,
				},
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _getBoards() {
		this._boardService
		.get( this.workflow.baseID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( boards: IBoard[] ) => {
				this._boardsLk
					= _.keyBy( boards, 'id' );
				this.boardsLk
					= _.cloneDeep( this._boardsLk );
			},
		});
	}

	/**
	 * @param {WorkflowBlock} workflowBlock
	 * @return {void}
	 */
	private _setScheduleDescription(
		key: string,
		workflowBlock: WorkflowBlock
	) {
		const scheduleSettings: AtScheduleTimeSetting
			= workflowBlock.settings as AtScheduleTimeSetting;
		const scheduleDetail: any
			= scheduleSettings.scheduleDetail;

		if (
			scheduleDetail?.date && scheduleDetail?.time
			|| ( scheduleDetail?.dateFrom
				&& scheduleDetail?.time
				&& scheduleSettings.type
					=== this.SCHEDULE_ACTION_TYPE.DAILY )
			|| ( scheduleDetail?.selectDayOfWeek
				&& scheduleDetail?.dateFrom
				&& scheduleDetail?.time )
			|| ( scheduleDetail?.selectDayOfMonth
				&& scheduleDetail?.time
				&& scheduleDetail?.dateFrom
				&& scheduleSettings.type
					=== this.SCHEDULE_ACTION_TYPE.MONTHLY)
			|| ( scheduleDetail?.selectMonth
				&& scheduleDetail?.selectDayOfMonth
				&& scheduleDetail?.time
				&& scheduleDetail?.dateFrom )
		) {
			workflowBlock.extra ||= {};

			let _hour: string;
			let _minute: string;
			let dayOfWeek: string;
			let dayOfMonth: string;
			let month: string;
			let scheduleTypeKey: string;

			_hour = scheduleDetail.time.hour < 10
				? _hour = '0' + scheduleDetail.time.hour
				: scheduleDetail.time.hour;
			_minute = scheduleDetail.time.minute < 10
				? _minute = '0' + scheduleDetail.time.minute
				: scheduleDetail.time.minute;

			if ( scheduleDetail?.date ) scheduleTypeKey = 'SCHEDULE_SETTING_NONE';
			if (
				scheduleDetail?.dateFrom
				&& scheduleSettings.type
					=== this.SCHEDULE_ACTION_TYPE.DAILY ) {
				scheduleTypeKey = 'SCHEDULE_SETTING_DAILY';
			}
			if ( scheduleDetail?.selectDayOfWeek ) {
				scheduleTypeKey = 'SCHEDULE_SETTING_WEEKLY';
				dayOfWeek = scheduleDetail.selectDayOfWeek <= 6
					? scheduleDetail.selectDayOfWeek + 1
					: 'CN';
			}
			if ( scheduleDetail?.selectDayOfMonth ) {
				dayOfMonth
					= scheduleDetail?.selectDayOfMonth < 10
						? '0' + scheduleDetail?.selectDayOfMonth
						: scheduleDetail?.selectDayOfMonth;

				scheduleTypeKey = 'SCHEDULE_SETTING_MONTHLY';
			}
			if ( scheduleDetail?.selectMonth ) {
				month
					= scheduleDetail.selectMonth < 10
						? '0' + scheduleDetail.selectMonth
						: scheduleDetail.selectMonth;

				scheduleTypeKey = 'SCHEDULE_SETTING_YEARLY';
			}

			workflowBlock.extra.settingDescription
				= {
					message: this._translateService.instant(
						`${key}.${scheduleTypeKey}`,
						{
							hour: _hour,
							minute: _minute,
							date: moment( scheduleDetail.date ).format( 'DD/MM/YYYY' ),
							dateFrom: moment( scheduleDetail.dateFrom ).format( 'DD/MM/YYYY' ),
							selectDayOfWeek: dayOfWeek,
							selectDayOfMonth: dayOfMonth,
							selectMonth: month,
						}
					),
					iconName: 'calendar-clock-fill',
					iconColor: 'primary',
				};
		} else {
			this._resetSettingDescription( workflowBlock );
		}
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @param {boolean=} showInvalidState
	 * @return {boolean}
	 */
	private _getValidation(
		wfBlock: WorkflowBlock,
		showInvalidState?: boolean
	): boolean {
		let isValid: boolean = true;

		switch ( wfBlock.blockType ) {
			case WorkflowBlockType.TRIGGER:
				isValid
					= triggerValidation(
						wfBlock,
						showInvalidState,
						this._setupComp?.triggerComp?.triggerSettingComp
					);
				break;
			case WorkflowBlockType.ACTION:
				isValid
					= actionValidation(
						wfBlock,
						showInvalidState,
						this._setupComp?.actionComp?.actionSettingComp
					);
				break;
			case WorkflowBlockType.CONDITION:
				isValid
					= conditionValidation(
						wfBlock,
						showInvalidState,
						this._setupComp?.conditionComp?.conditionSettingComp
					);
				break;
			case WorkflowBlockType.SUB_PROCESS:
				isValid
					= subProcessValidation(
						wfBlock,
						showInvalidState,
						this._setupComp?.subProcessComp
					);
				break;
			case WorkflowBlockType.PARALLEL:
				isValid
					= parallelValidation(
						wfBlock,
						showInvalidState,
						this._setupComp?.parallelComp?.parallelSettingComp
					);
				break;
			case WorkflowBlockType.LOOP:
				isValid
					= loopValidation(
						wfBlock,
						showInvalidState,
						this._setupComp?.loopComp
					);
				break;
			case WorkflowBlockType.DELAY:
				isValid
					= delayValidation( wfBlock );
				break;
			case WorkflowBlockType.END:
				isValid
					= endValidation( wfBlock );
				break;
		}

		return isValid;
	}

	/**
	 * @return {void}
	 */
	private _getFields() {
		const boardID: ULID
			= ( this.workflow.entryTrigger.settings as any )?.boardID;

		if ( !boardID ) return;

		this._boardFieldService
		.get( boardID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				this._fieldsLk
					= _.keyBy( fields, 'id' );
			},
		});
	}

	/**
	 * @param {NotifySetting} notifySettings
	 * @return {string}
	 */
	private _getReceiversStr( notifySettings: NotifySetting ) {
		let receiversStr: string
			= '';

		if ( notifySettings.receivers?.baseID ) {
			receiversStr
				+= this._translateService.instant(
					'BASE.WORKFLOW.DESCRIPTION.ACTION.ALL'
				) + ', ';
		}

		if ( notifySettings.receivers?.fieldIDs?.length ) {
			_.forEach( notifySettings.receivers.fieldIDs, ( id: ULID ) => {
				receiversStr
					+= this._fieldsLk[ id ].name + ', ';
			} );
		}

		if ( notifySettings.receivers?.userIDs?.length ) {
			_.forEach( notifySettings.receivers.userIDs, ( id: ULID ) => {
				receiversStr
					+= this._usersLk[ id ].name + ', ';
			} );
		}

		if ( notifySettings.receivers?.teamIDs?.length ) {
			_.forEach( notifySettings.receivers.teamIDs, ( id: ULID ) => {
				receiversStr
					+= this._teamsLk[ id ].name + ', ';
			} );
		}

		return receiversStr.length > 0 ? receiversStr.slice( 0, -2 ) : '';
	}

	/**
	 * @param {WorkflowBlock} workflowBlock
	 * @param {NotifySetting} notifySettings
	 * @return {void}
	 */
	private _getNotifyActionDescription(
		workflowBlock: WorkflowBlock
	) {
		const boardID: ULID
			= ( this.workflow.entryTrigger.settings as any )?.boardID;

		if ( !boardID ) return;

		forkJoin([
			this._boardFieldService.get( boardID ),
			this._userService.getAvailableUser(),
			this._teamService.getAvailableTeams(),
		])
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(
			( [ fields, users, teams ]: [ BoardField[],IUser[], ITeam[] ] ) => {
				this._fieldsLk
					= _.keyBy( fields, 'id' );
				this._usersLk
					= _.keyBy( users, 'id' );
				this._teamsLk
					= _.keyBy( teams, 'id' );

				const receivers: string
					= this._getReceiversStr( (
						workflowBlock.settings as NotifySetting )
					);

				workflowBlock.extra ||= {};
				workflowBlock.extra.settingDescription
					= {
						message: this._translateService.instant(
							`BASE.WORKFLOW.DESCRIPTION.ACTION.NOTIFY`,
							{
								receivers,
							}
						),
						iconName: 'assets/images/notify-someone.webp',
					};
				this._updateNode(
					workflowBlock
				);
			}
		);
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {void}
	 */
	private _initSubscription() {
		this._workflowService
		.boardIDChanged$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				this._setupWfBlock();

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {void}
	 */
	private _updateNode(
		wfBlock: WorkflowBlock
	) {
		this._chartComp
		.updateNode(
			wfBlock,
			{
				metadata: {
					settingDescription: wfBlock
					.extra
					?.settingDescription,
				},
			}
		);
	}
}
