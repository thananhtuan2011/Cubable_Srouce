import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Inject,
	OnInit,
	ViewChild,
	inject
} from '@angular/core';
import {
	Validators,
	FormControl
} from '@angular/forms';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	finalize
} from 'rxjs';
import {
	ULID,
	ulid
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	generateUniqueName,
	untilCmpDestroyed
} from '@core';

import {
	CUBDialogRef,
	CUB_DIALOG_CONTEXT,
	CUB_DIALOG_REF
} from '@cub/material/dialog';
import {
	CUBConfirmService,
	CUBIConfirmRef
} from '@cub/material/confirm';
import {
	CUBScrollBarComponent
} from '@cub/material/scroll-bar';
import {
	CUBPopupComponent
} from '@cub/material/popup';

import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

import {
	IBase
} from '../../../interfaces';

import {
	Workflow,
	DialogWorkflowContext,
	TypeAction,
	WorkflowUpdateDesc,
	WorkflowBlock
} from '../interfaces';
import {
	WorkflowBlockType
} from '../resources';
import {
	WorkflowService
} from '../services';
import {
	EndType
} from '../modules/setup/modules/end/resources';
import {
	ConditionTrigger,
	SingleCondition,
	SingleOption
} from '../modules/setup/modules/common/conditional';
import {
	AnyBranchSetting
} from '../modules/setup/modules/parallel/interfaces';

import {
	CustomWorkflowComponent
} from './custom-workflow.component';
import { LogicalOperator } from '../modules/setup/modules/common/conditional/constant';
import { buildMemoDepth, processSiblingItems } from '../../board/modules/filter/helpers/filter.helper';
import { ActionType } from '../modules/setup/modules/action/resources';
import { ChangeValueSetting, DeleteRowSetting } from '../modules/setup/modules/action/interfaces';

interface IAction {
	all: number;
	active: number;
	inactive: number;
}

@Unsubscriber()
@Component({
	selector: 'dialog-workflow',
	templateUrl: '../templates/dialog-workflow.pug',
	styleUrls: [ '../styles/dialog-workflow.scss' ],
	host: { class: 'dialog-workflow' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogWorkflowComponent
implements OnInit {
	@ViewChild( CustomWorkflowComponent )
	private _customWorkflowCmp: CustomWorkflowComponent;
	@ViewChild( 'automationScrollBar' )
	private _automationScrollBar: CUBScrollBarComponent;
	@ViewChild ('renamePopup')
	private _renamePopup: CUBPopupComponent;

	public readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	protected readonly TAB_TYPE: typeof TypeAction
		= TypeAction;
	protected readonly nameControl: FormControl
		= new FormControl(
			undefined,
			[
				Validators.required,
				Validators.maxLength( 100 ),
			]
		);
	protected readonly descriptionControl: FormControl
		= new FormControl(
			undefined,
			[
				Validators.maxLength( 1000 ),
			]
		);

	protected onBeforeSwitchMode: () => boolean
		= this.onBeforeSwitchModeFn.bind( this );
	protected isCustomizing: boolean;
	protected isDataChanged: boolean;
	protected workflow: Workflow;
	protected workflows: Workflow[];
	protected workflowsBK: Workflow[];
	protected activeTab: TypeAction = TypeAction.All;
	protected countBadge: IAction;
	protected workflowName: string;
	protected workflowDescription: string;
	protected isSubmitting: boolean;
	protected workflowIsActive: Workflow;
	protected highlightCard: boolean;

	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _workflowService: WorkflowService
		= inject( WorkflowService );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _translateService: TranslateService
		= inject( TranslateService );

	private _base: IBase;
	// TODO
	private _blockIdCache: Map<ULID, ULID>;

	get canSave(): boolean {
		return this.isDataChanged
			&& _.values(
				this._customWorkflowCmp?.blockStateInvalid
			).indexOf( true ) < 0;
	}

	/**
	 * @constructor
	 * @param {DialogWorkflowContext} _data
	 * @param {CUBDialogRef} _dialogRef
	 */
	constructor(
		@Inject( CUB_DIALOG_CONTEXT )
		private _data: DialogWorkflowContext,
		@Inject( CUB_DIALOG_REF )
		private _dialogRef: CUBDialogRef
	) {
		this._base = this._data.base;
	}

	ngOnInit() {
		this._initSubscription();
		this._initListWorkflow();
	}

	/**
	 * @return {Promise}
	 */
	protected onBeforeSwitchModeFn(): Promise<boolean> {
		return new Promise(
			( resolve: any ) => {
				if( !this.workflowIsActive.isActive ) {
					this._workflowService
					.activate( this.workflowIsActive.id )
					.pipe(
						finalize( () => {
							this._countWorkflow();
							this.cdRef.markForCheck();
							resolve( true );
							return;
						} ),
						untilCmpDestroyed( this )
					)
					.subscribe({
						next: () => {
							_.assign(
								this.workflowIsActive,
								{ isActive: true }
							);

							if(
								this.activeTab === TypeAction.All
							) {
								this.workflowsBK
									= _.cloneDeep( this.workflows );
								return;
							}
							this.workflows =
								_.reject(
									this.workflows,
									{ id: this.workflowIsActive.id }
								);

						},
					});
				} else {
					const confirmRef: CUBIConfirmRef
						= this
						._cubConfirmService
						.open(
							`BASE.WORKFLOW.MESSAGE.DEACTIVATE_CONFIRM`,
							'BASE.WORKFLOW.MESSAGE.DEACTIVATE_AUTOMATION',
							{
								buttonApply: {
									text: 'BASE.WORKFLOW.LABEL.DEACTIVATE',
									type: 'destructive',
								},
								buttonDiscard: 'BASE.WORKFLOW.LABEL.CANCEL',
								translate: {
									workflowName: this.workflowIsActive.name,
								},
							}
						);

					confirmRef
					.afterClosed()
					.pipe( untilCmpDestroyed( this ) )
					.subscribe({
						next: ( answer: boolean ) => {
							if ( !answer ) {
								resolve();
								return;
							}

							this.switchActive( this.workflowIsActive );
							resolve( true );
						},
					});
				}
			}
		);
	}

	/**
	 * @return {void}
	 */
	protected changedAction( action: number) {
		if( this.activeTab === action ) return;

		this.activeTab = action;

		switch ( action ) {
			case TypeAction.All:
				this.workflows = this.workflowsBK;
				break;
			case TypeAction.Active:
				this.workflows
					= _.filter(
						this.workflowsBK,
						{ isActive: true }
					);
				break;
			case TypeAction.Inactive:
				this.workflows
					= _.filter(
						this.workflowsBK,
						{ isActive: false }
					);
				break;
		}
	}

	/**
	 * @return {void}
	 */
	protected close() {
		if(
			this.isCustomizing
			&& this.isDataChanged
		) {
			this._cubConfirmService
			.open(
				`BASE.WORKFLOW.MESSAGE.WILL_LOST_VALUE`,
				'BASE.WORKFLOW.MESSAGE.LOST_PROGRESS',
				{
					warning: true,
					buttonApply: {
						text: 'BASE.WORKFLOW.LABEL.CONFIRM_CANCEL',
						type: 'destructive',
					},
					buttonDiscard: 'BASE.WORKFLOW.LABEL.KEEP',
				}
			)
			.afterClosed()
			.subscribe({
				next: ( answer: boolean ) => {
					if ( !answer ) return;

					this._dialogRef.close();
				},
			});
		} else this._dialogRef.close();
	}

	/**
	 * @return {void}
	 */
	protected closeRename() {
		this.nameControl.reset();
		this.descriptionControl.reset();
	}

	/**
	 * @return {void}
	 */
	protected openInfoPopup( workflow: Workflow ) {
		this._userService
		.getAvailableUser()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( users: IUser[] ) => {
				const createdByUser: IUser = _.find(
					users,
					{ id: workflow.createdBy }
				);
				const updatedByUser: IUser = _.find(
					users,
					{ id: workflow.updatedBy }
				);

				if ( createdByUser ) {
					workflow.createdBy = createdByUser.name;
				}
				if ( updatedByUser ) {
					workflow.updatedBy = updatedByUser.name;
				}

				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {Workflow} workflow
	 * @return {void}
	 */
	protected updateInformation(
		workflow: Workflow
	) {
		this.isSubmitting = true;

		const newWorkflow: WorkflowUpdateDesc = {};

		if(
			this.workflowName
		) {
			newWorkflow.name = this.workflowName;
		}
		if(
			this.workflowDescription
		) {
			newWorkflow.description = this.workflowDescription;
		}

		this._workflowService
		.update( workflow.id, newWorkflow )
		.pipe(
			finalize(
				() => {
					this.isSubmitting = false;

					this.cdRef.markForCheck();
				}
			),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				if ( this.workflowName ) {
					workflow.name
						= this.workflowName;
				}

				if ( this.workflowDescription ) {
					workflow.description
						= this.workflowDescription;
				}
				this.workflowsBK = _.cloneDeep(this.workflows);
				this._renamePopup.close();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected addWorkflow() {
		this.isCustomizing = true;

		const newWorkflow: Workflow = {
			baseID: this._base.id,
			name: generateUniqueName(
				_.map( this.workflowsBK, 'name' ),
				this._translateService.instant(
					'BASE.WORKFLOW.LABEL.AUTOMATE_WORKFLOW'
				)
			),
			entryTrigger: {
				id: ulid(),
				metadata: {
					index: '1',
					name: 'Sự kiện 1',
				},
				blockType: WorkflowBlockType.TRIGGER,
				nextBlock: {
					id: ulid(),
					blockType: WorkflowBlockType.END,
					type: EndType.Once,
					nextBlock: null,
				},
				isEntry: true,
			},
		} as Workflow;

		this.workflow = newWorkflow;
	}

	/**
	 * @return {void}
	 */
	protected backToWorkflowList() {
		if(
			this.isCustomizing
			&& this.isDataChanged
		) {
			this._cubConfirmService
			.open(
				`BASE.WORKFLOW.MESSAGE.WILL_LOST_VALUE`,
				'BASE.WORKFLOW.MESSAGE.LOST_PROGRESS',
				{
					warning: true,
					buttonApply: {
						text: 'BASE.WORKFLOW.LABEL.CONFIRM_CANCEL',
						type: 'destructive',
					},
					buttonDiscard: 'BASE.WORKFLOW.LABEL.KEEP',
				}
			)
			.afterClosed()
			.subscribe({
				next: ( answer: boolean ) => {
					if ( !answer ) return;

					this.isCustomizing
						= this.isDataChanged
						= false;

					this._dialogRef.enableClose();
					this.cdRef.markForCheck();
				},
			});
		} else {
			this.isCustomizing
				= this.isDataChanged
				= false;

			this._dialogRef.enableClose();
		}
	}

	/**
	 * @return {void}
	 */
	protected save() {
		this.workflow
			= this._customWorkflowCmp?.save();

		if(
			this.workflow.id
		) {
			this.updateSettings();
			return;
		}

		this.create();
	}

	/**
	 * @return {void}
	 */
	protected updateSettings() {
		this._workflowService
		.update (
			this.workflow.id,
			{
				entryTrigger: this._redoData(
					_.cloneDeep(
						this.workflow
					)
				).entryTrigger,
			}
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				this.isCustomizing = false;

				this._dialogRef.enableClose();
				this.cdRef.markForCheck();
				this._renamePopup.close();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected create() {
		if ( !this.workflow ) return;

		this._workflowService
		.create(
			this._redoData(
				_.cloneDeep(
					this.workflow
				)
			)
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( value: Workflow ) => {
				_.assign( this.workflow, value );

				this.activeTab = this.TAB_TYPE.All;
				this.workflowsBK.push( this.workflow );
				this.workflows = _.cloneDeep( this.workflowsBK );

				this._countWorkflow();

				this.isCustomizing
					= this.isDataChanged
					= false;
				this.highlightCard = true;

				this._dialogRef.enableClose();
				this.cdRef.markForCheck();

				setTimeout(
					() => this._automationScrollBar?.scrollToBottom(),
					100
				);
				setTimeout(
					() => {
						this.highlightCard = false;
						this.cdRef.markForCheck();
					},
					2000
				);

			},
		});
	}

	/**
	 * @return {void}
	 */
	protected duplicatedWorkflow( workflowID: ULID) {
		this._workflowService
		.getDetail( workflowID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( value: Workflow ) => {
				const newId: ULID
					= ulid();

				this._blockIdCache ||= new Map();
				this._blockIdCache.set(
					value.entryTrigger.id,
					newId
				);

				const newWorkflow: Workflow = {
					baseID: value.baseID,
					name: _.join(
						[
							value.name,
							this._translateService.instant( 'BASE.WORKFLOW.LABEL.COPY' ),
						],
						' '
					),
					description: value.description,
					entryTrigger: {
						...value.entryTrigger,
						id: newId,
						...this._setBlockId( value.entryTrigger ),
					},
				} as Workflow;

				this.workflow = newWorkflow;
				this.isCustomizing
					= this.isDataChanged
					= true;

				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected deleteWorkflow( workflow: Workflow ) {
		this._cubConfirmService
		.open(
			`BASE.WORKFLOW.MESSAGE.LOST_AUTOMATION`,
			'BASE.WORKFLOW.MESSAGE.DELETE_AUTOMATION',
			{
				warning: true,
				buttonApply: {
					text: 'BASE.WORKFLOW.LABEL.DELETE',
					type: 'destructive',
				},
				buttonDiscard: 'BASE.WORKFLOW.LABEL.KEEP',
				translate: { workflowName: workflow.name },
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;
				this._workflowService
				.delete( workflow.id )
				.pipe( untilCmpDestroyed( this ) )
				.subscribe({
					next: () => {
						_.remove( this.workflows, workflow );

						this.workflowsBK =
							_.reject(
								this.workflowsBK,
								{ id: workflow.id }
							);

						this._countWorkflow();
						this.cdRef.markForCheck();
					},
					error: () => {
						this.workflows = _.cloneDeep( this.workflowsBK );
					},
				});
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected switchActive( workflow: Workflow ) {
		const workflowBK: Workflow = _.cloneDeep( workflow );

		this._workflowService
		.deactivate( workflow.id )
		.pipe(
			finalize(
				() => {
					this._countWorkflow();
					this.cdRef.markForCheck();
				}
			),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				_.assign( workflow, { isActive: false } );

				if(
					this.activeTab === TypeAction.All
				) {
					this.workflowsBK = _.cloneDeep( this.workflows );
					return;
				}
				this.workflows =
					_.reject(this.workflows,
						{ id: workflow.id }
					);
			},
			error: () => {
				workflow.isActive = workflowBK.isActive;
			},
		});
	}

	/**
	 * @param {ULID} workflowID
	 * @return {void}
	 */
	protected accessWorkflow( workflowID: ULID) {
		this._workflowService
		.getDetail( workflowID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( value: Workflow ) => {
				this.workflow = {
					...value,
					entryTrigger: this._sortIndexParallel( value.entryTrigger ),
				};

				this.isCustomizing = true;

				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {any}
	 */
	private _sortIndexParallel(
		wfBlock: WorkflowBlock
	): any {
		if( !wfBlock ) return;

		if (
			wfBlock.blockType
				=== WorkflowBlockType.PARALLEL
		) {
			wfBlock.childBlocks = _.sortBy(
				wfBlock.childBlocks,
				'metadata.childIndex'
			);
		}

		_.forEach(
			wfBlock.childBlocks,
			( childBlock: WorkflowBlock ) => {
				if( childBlock ) {
					childBlock =
						this._sortIndexParallel( childBlock );
				}
			}
		);

		if (
			wfBlock.nextBlock
		) {
			wfBlock.nextBlock = this._sortIndexParallel( wfBlock.nextBlock );
		}

		return wfBlock;
	}

	/**
	 * @return {void}
	 */
	private _countWorkflow() {
		this.countBadge = {
			all: this.workflowsBK.length,
			active: _.filter(
				this.workflowsBK,
				['isActive', true]).length ,
			inactive: _.filter(
				this.workflowsBK,
				['isActive', false]).length,
		};
	}
	/**
	 * @return {void}
	 */
	private _initListWorkflow() {
		this._workflowService
		.get( this._base.id )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( workflows: Workflow[] ) => {
				this.workflows = _.orderBy(
					workflows,
					[ 'createdAt' ],
					[ 'asc' ]
				);

				this.workflowsBK = _.cloneDeep( this.workflows );
				this._countWorkflow();

				this.cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initSubscription() {
		this
		._workflowService
		.dataChanged$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => {
			this.isDataChanged = true;

			this._dialogRef.disableClose();
			this.cdRef.markForCheck();
		} );
	}

	/**
	 * @param {Workflow} wf
	 * @return {void}
	 */
	private _redoData(
		wf: Workflow
	): Workflow {
		this._removeLoopAttrInBlock(
			wf.entryTrigger
		);

		wf.entryTrigger = this._removeEmptyBlocks(
			wf.entryTrigger
		);

		return wf;
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {void}
	 */
	private _removeLoopAttrInBlock(
		wfBlock: WorkflowBlock
	) {
		delete wfBlock.previousBlock;
		delete wfBlock.parentBlock;

		_.forEach(
			wfBlock.childBlocks,
			( child: WorkflowBlock ) => {
				if ( child === null ) return;

				this._removeLoopAttrInBlock( child );
			}
		);

		if (
			wfBlock.nextBlock
		) {
			this._removeLoopAttrInBlock(
				wfBlock.nextBlock
			);
		}
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {any}
	 */
	private _removeEmptyBlocks(
		wfBlock: WorkflowBlock
	): any {

		if( !wfBlock ) return;

		if (
			wfBlock.blockType === WorkflowBlockType.PARALLEL
		) {
			if (
				_.every(
					wfBlock.childBlocks,
					( childBlock: WorkflowBlock ) =>
						_.isStrictEmpty( childBlock )
				)
			) {
				return this._removeEmptyBlocks(
					wfBlock.nextBlock.nextBlock
				);
			} else {
				wfBlock.childBlocks = _.filter(
					wfBlock.childBlocks,
					( childBlock: WorkflowBlock ) => childBlock !== null);
			}
		}

		_.forEach(
			wfBlock.childBlocks,
			( childBlock: WorkflowBlock ) => {
				if( childBlock ) {
					childBlock =
						this._removeEmptyBlocks( childBlock );
				}
			}
		);

		if (
			wfBlock.nextBlock
		) {
			wfBlock.nextBlock = this._removeEmptyBlocks( wfBlock.nextBlock );
		}

		return wfBlock;
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {WorkflowBlock}
	 */
	private _setBlockId(
		wfBlock: WorkflowBlock
	): {
		nextBlock?: WorkflowBlock;
		childBlocks?: WorkflowBlock[];
	} {
		const newData: {
			nextBlock?: WorkflowBlock;
			childBlocks?: WorkflowBlock[];
		} = {};

		_.forEach(
			wfBlock.childBlocks,
			( child: WorkflowBlock ) => {
				if ( !child ) return;

				const newId: ULID
					= ulid();

				this._setNewBlockIdForSetting(
					child,
					newId
				);

				child.id = newId;
				newData.childBlocks
					= child.childBlocks;

				this._setBlockId( child );
			}
		);

		if (
			wfBlock.nextBlock
		) {
			const newId: ULID
				= ulid();

			this._setNewBlockIdForSetting(
				wfBlock.nextBlock,
				newId
			);

			wfBlock.nextBlock.id
				= newId;
			newData.nextBlock
				= wfBlock.nextBlock;

			this._setBlockId(
				wfBlock.nextBlock
			);
		} else {
			newData.nextBlock = null;
		}

		return newData;
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @param {ULID} newId
	 * @return {void}
	 */
	private _setNewBlockIdForSetting(
		wfBlock: WorkflowBlock,
		newId: ULID
	) {
		this._blockIdCache ||= new Map();
		this._blockIdCache.set(
			wfBlock.id,
			newId
		);

		switch ( wfBlock.blockType ) {
			case WorkflowBlockType.SUB_PROCESS:
				if (
					!this._blockIdCache.has(
						wfBlock.settings.blockID
					)
				) return;

				wfBlock.settings.blockID
					= this._blockIdCache.get(
						wfBlock.settings.blockID
					);
				break;
			case WorkflowBlockType.CONDITION:
				this._reflectFilterData(
					wfBlock.settings.filter
				);
				break;
			case WorkflowBlockType.ACTION:
				switch ( wfBlock.type ) {
					case ActionType.CHANGE_VALUE:
					case ActionType.DELETE_ROW:
						this._reflectFilterData(
							(
								wfBlock.settings as ChangeValueSetting
									| DeleteRowSetting
							)
							.row
							.filter
						);
						break;
				}
				break;
			case WorkflowBlockType.PARALLEL:
				this._reflectFilterData(
					( wfBlock.settings as AnyBranchSetting ).filter
				);
				break;
			case WorkflowBlockType.LOOP:
				this._reflectFilterData(
					wfBlock.settings.filter
				);
				break;
		}
	}

	/**
	 * @param {ConditionTrigger<SingleOption, SingleCondition>} filter
	 * @return {vid}
	 */
	private _reflectFilterData(
		filter: ConditionTrigger<SingleOption, SingleCondition>
	) {
		let hasUpdated: boolean;

		_.forEach(
			filter?.options,
			( option: SingleOption ) => {
				if (
					!this._blockIdCache.has(
						option.data.targetField.blockID
					)
				) return;

				hasUpdated = true;

				option.data.targetField.blockID
					= this._blockIdCache.get(
						option.data.targetField.blockID
					);
			}
		);

		if (
			!hasUpdated
		) return;

		filter.conditions = this._parseCondition(
			filter.options,
			filter.logicalOperator,
			filter.logicalExpression
		);
	}

	/**
	 * @param {SingleOption[]} options
	 * @param {LogicalOperator} logicalOperator
	 * @param {string} logicalExpression
	 * @return {void}
	 */
	private _parseCondition(
		options: SingleOption[],
		logicalOperator: LogicalOperator,
		logicalExpression: string
	): SingleCondition {
		let conditions: SingleCondition = {};
		const logicalOperatorName: ObjectType<string>
			= _.invert( LogicalOperator );

		if ( logicalOperator !== LogicalOperator.CUSTOM ) {
			conditions[
			logicalOperatorName[ logicalOperator ]
			.toLowerCase() ]
				= options;
		} else {
			conditions
				= processSiblingItems(
					buildMemoDepth(
						logicalExpression.match(
							new RegExp( /(AND|OR|\(|\)|\d{1,})/g )
						)
					),
					{
						logicalOperator,
						options,
						logicalExpression,
					} as any,
					false
				) as SingleCondition;
		}

		return conditions;
	}

}
