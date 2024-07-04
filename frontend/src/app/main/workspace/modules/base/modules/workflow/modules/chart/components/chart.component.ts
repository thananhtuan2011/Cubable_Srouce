/* eslint-disable max-len */
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	ViewContainerRef,
	inject
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	ULID,
	ulid
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	CUBFlowchartNode,
	CUBFlowchartNodeAddonEvent,
	CUBFlowchartNodeClickedEvent,
	CUBFlowchartComponent,
	CUBFlowchartNodeComponent
} from '@cub/material/flowchart';
import {
	CUBMenuComponent,
	CUBMenuService
} from '@cub/material/menu';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBBasicButtonComponent
} from '@cub/material/button';

import {
	WorkflowBlock
} from '../../../interfaces';
import {
	WorkflowBlockType
} from '../../../resources';

import {
	Trigger
} from '../../setup/modules/trigger/interfaces';
import {
	triggerValidation
} from '../../setup/modules/trigger/components';
import {
	actionValidation
} from '../../setup/modules/action/components';
import {
	conditionValidation
} from '../../setup/modules/condition/components';
import {
	delayValidation
} from '../../setup/modules/delay/components';
import {
	subProcessValidation
} from '../../setup/modules/sub-process/components';
import {
	loopValidation
} from '../../setup/modules/loop/components';
import {
	parallelValidation
} from '../../setup/modules/parallel/components';

type NodeAddable = {
	trigger: boolean;
	action: boolean;
	condition: boolean;
	subProcess: boolean;
	parallel: boolean;
	loop: boolean;
	delay: boolean;
};

export type NodeDataUpdate = {
	metadata: {
		settingDescription?: {
			message?: string;
			iconName?: string;
			iconColor?: string;
		};
		invalid?: boolean;
	};
};

export type BlockActiveChange = {
	blockActive: WorkflowBlock;
	forceUpdate?: boolean;
};

const blockSupportDescription: ReadonlySet<WorkflowBlockType>
	= new Set([
		WorkflowBlockType.CONDITION,
		WorkflowBlockType.ACTION,
		WorkflowBlockType.SUB_PROCESS,
		WorkflowBlockType.TRIGGER,
		WorkflowBlockType.LOOP,
		WorkflowBlockType.PARALLEL,
	]);
const notHaveSettings: ReadonlySet<WorkflowBlockType>
	= new Set([
		WorkflowBlockType.SUB_PROCESS_START,
		WorkflowBlockType.SUB_PROCESS_EXIT,
		WorkflowBlockType.LOOP_START,
		WorkflowBlockType.LOOP_EXIT,
		WorkflowBlockType.MERGE,
	]);
const disableInsertNextNode: ReadonlySet<WorkflowBlockType>
	= new Set([
		WorkflowBlockType.SUB_PROCESS_EXIT,
		WorkflowBlockType.LOOP_EXIT,
		WorkflowBlockType.PARALLEL,
		WorkflowBlockType.END,
	]);

@Unsubscriber()
@Component({
	selector: 'chart',
	templateUrl: '../templates/chart.pug',
	styleUrls: [ '../styles/chart.scss' ],
	host: { class: 'chart' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent
implements OnInit {

	@ViewChild( 'blockAddMenu', { static: true } )
	private _blockAddMenu: CUBMenuComponent;
	@ViewChild( 'blockWrapperDescription', { static: true } )
	private _blockWrapperDescription: CUBMenuComponent;
	@ViewChild( 'blockActionMenu', { static: true } )
	private _blockActionMenu: CUBMenuComponent;
	@ViewChild( 'flowChart', { static: true } )
	private _flowchartCmp: CUBFlowchartComponent;

	@Input() public entryTrigger: Trigger;
	@Input() public blockActive: WorkflowBlock;

	@Output() public blockActiveChange: EventEmitter<BlockActiveChange>
		= new EventEmitter<BlockActiveChange>();
	@Output() public entryTriggerChange: EventEmitter<Trigger>
		= new EventEmitter<Trigger>();
	@Output() public validate: EventEmitter<void>
		= new EventEmitter<void>();

	protected readonly WORKFLOW_BLOCK_TYPE: typeof WorkflowBlockType
		= WorkflowBlockType;
	protected readonly BLOCK_SUPPORT_DESCRIPTION: typeof blockSupportDescription
		= blockSupportDescription;
	protected readonly descriptionFormControl: FormControl
		= new FormControl( undefined );

	protected scalable: boolean = true;
	protected nodeEditing: ULID;
	protected description: string;
	protected rootNode: CUBFlowchartNode;

	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _translateService: TranslateService
		= inject( TranslateService );

	ngOnInit() {
		this.rootNode = {
			id: this.entryTrigger.id,
			type: this.entryTrigger.blockType,
			nextNode: this._initBlock( this.entryTrigger.nextBlock ) || null,
			childNodes: this.entryTrigger.childBlocks?.length
				? this._initChildNodes(
					this.entryTrigger.childBlocks
				)
				: undefined,
			metadata: {
				description: this.entryTrigger.description,
				settingDescription: this.entryTrigger.extra?.settingDescription,
				blockData: this.entryTrigger,
			},
		};
	}

	/**
	 * @param {ULID} blockSetup
	 * @param {NodeDataUpdate} data
	 * @return {void}
	 */
	public updateNode(
		blockSetup: WorkflowBlock,
		data: NodeDataUpdate
	) {
		const nodeUpdate: CUBFlowchartNode
			= this._findNode(
				blockSetup.id,
				this.rootNode
			);

		if ( !nodeUpdate ) return;

		nodeUpdate.metadata ||= {};

		let hasUpdated: boolean;

		if (
			_.has( data.metadata, 'settingDescription' )
			|| _.has( data.metadata, 'invalid' )
		) {
			if (
				_.has( data.metadata, 'settingDescription' )
				&& !_.isEqual(
					data.metadata.settingDescription,
					nodeUpdate.metadata.settingDescription
				)
			) {
				nodeUpdate.metadata.settingDescription
					= data.metadata.settingDescription;

				hasUpdated = true;
			}
			if (
				_.has( data.metadata, 'invalid' )
				&& data.metadata.invalid !== nodeUpdate.metadata.invalid
			) {
				nodeUpdate.metadata.invalid
					= data.metadata.invalid;

				hasUpdated = true;
			}
		}

		if (
			!hasUpdated
		) return;

		this._flowchartCmp.update();
		this._cdRef.markForCheck();
	}

	/**
	 * @param {CUBFlowchartNodeAddonEvent} e
	 * @return {void}
	 */
	protected onAddNode(
		e: CUBFlowchartNodeAddonEvent
	) {
		this._menuService
		.open(
			e.event.target as HTMLElement,
			this._blockAddMenu,
			{
				nodeEvent: e,
				addable:
					this._getNodeAddable(
						e.sourceNode.metadata?.blockData,
						true
					),
			},
			{
				viewContainerRef: this._vcRef,
			}
		);
	}

	/**
	 * @param {CUBFlowchartNodeAddonEvent} e
	 * @param {WorkflowBlockType} type
	 * @return {void}
	 */
	protected async addedNode(
		e: CUBFlowchartNodeAddonEvent,
		type: WorkflowBlockType
	) {
		const newBlock: WorkflowBlock
			= {
				id: ulid(),
				blockType: type,
				// TODO improve when before block settings error => find board when settings change
				// Switch
				nextBlock: null,
			} as WorkflowBlock;
		const newNode: CUBFlowchartNode = {
			type,
			id: newBlock.id,
			disableInsertNextNode: disableInsertNextNode.has( type ),
		};

		this._addSpecificNodeData(
			newBlock,
			newNode
		);

		this._setBlockData(
			e,
			newBlock
		);

		newNode.metadata = {
			blockData: newBlock,
		};

		await this._flowchartCmp
		.insertNode(
			e.sourceNode,
			newNode,
			e.position
		).then(
			( [ n, _cmp ]: [ CUBFlowchartNode, CUBFlowchartNodeComponent ] ) => {
				if (
					newNode.type === WorkflowBlockType.PARALLEL
				) {
					this.addedNode(
						{
							sourceNode: n,
						} as CUBFlowchartNodeAddonEvent,
						WorkflowBlockType.MERGE
					);
				}
			}
		);

		this.entryTriggerChange.emit(
			this.entryTrigger
		);
		!notHaveSettings.has( newBlock.blockType )
			&& this.blockActiveChange.emit({
				blockActive: this.blockActive = newBlock,
			});
	}

	/**
	 * @param {CUBFlowchartNode} node
	 * @return {void}
	 */
	protected addedChildNode(
		node: CUBFlowchartNode
	) {
		node.childNodes ||= [];
		node.childNodes.push( null );

		node.metadata.blockData.childBlocks ||= [];
		node.metadata.blockData.childBlocks.push( null );

		this._flowchartCmp.update();
	}

	/**
	 * @param {CUBFlowchartNodeClickedEvent} e
	 * @return {void}
	 */
	protected onNodeClicked( e: CUBFlowchartNodeClickedEvent ) {
		if (
			e.node.id === this.blockActive?.id
			|| notHaveSettings.has( e.node.type )
		) return;

		this.blockActiveChange.emit({
			blockActive: this.blockActive = e.node.metadata?.blockData,
		});
	}

	/**
	 * @return {void}
	 */
	protected onBackdropClicked() {
		if ( !this.blockActive ) return;

		this.blockActiveChange.emit({
			blockActive: this.blockActive = null,
		});
	}

	/**
	 * @param {CUBFlowchartNode} node
	 * @param {CUBBasicButtonComponent} elementRef
	 * @return {void}
	 */
	protected editDescription(
		node: CUBFlowchartNode,
		element?: CUBBasicButtonComponent
	) {
		this.nodeEditing = node.id;

		if (
			node.type
			=== this.WORKFLOW_BLOCK_TYPE.SUB_PROCESS
			||
			node.type
			=== this.WORKFLOW_BLOCK_TYPE.LOOP
			|| node.type
			=== this.WORKFLOW_BLOCK_TYPE.PARALLEL
		) {
			this._menuService
			.open(
				element.elementRef,
				this._blockWrapperDescription,
				{ node },
				{ viewContainerRef: this._vcRef }
			);
		}

		this._flowchartCmp.update();
	}

	/**
	 * @param {CUBFlowchartNode} node
	 * @return {void}
	 */
	protected refreshDescription(
		node: CUBFlowchartNode
	) {
		node.metadata.description
			= node.metadata.blockData.description
			= undefined;

		this._flowchartCmp.update();

		this.entryTriggerChange.emit( this.entryTrigger );
	}

	/**
	 * @param {CUBFlowchartNode} node
	 * @param {WorkflowBlockType} type
	 * @return {void}
	 */
	protected changedBlockType(
		node: CUBFlowchartNode,
		type: WorkflowBlockType
	) {
		this._blockActionMenu?.close();

		this._cubConfirmService
		.open(
			`BASE.WORKFLOW.CHART.MESSAGE.CHANGE_AFFECTED`,
			'BASE.WORKFLOW.CHART.MESSAGE.CHANGE_EVENT',
			{
				warning: true,
				buttonApply: {
					text: 'BASE.WORKFLOW.CHART.LABEL.CHANGE',
					type: 'destructive',
				},
				buttonDiscard: 'BASE.WORKFLOW.CHART.LABEL.CANCEL',
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				// node
				node.type = type;
				node.childNodes = [];
				node.childNodeLineCaptions = [];
				node.addOuterBox = false;
				node.disableInsertNextNode = disableInsertNextNode.has( type );
				node.metadata = {
					blockData: node.metadata.blockData,
				};

				// block
				node.metadata.blockData.blockType = type;
				node.metadata.blockData.type
					= node.metadata.blockData.settings
					= node.metadata.blockData.description
					= null;
				node.metadata.blockData.extra = {};
				node.metadata.blockData.childBlocks = [];

				this._addSpecificNodeData(
					node.metadata.blockData,
					node
				);

				switch (
					node.type
				) {
					case WorkflowBlockType.PARALLEL:
						this.addedNode(
							{
								sourceNode: node,
							} as CUBFlowchartNodeAddonEvent,
							WorkflowBlockType.MERGE
						);
						break;
				}

				this._flowchartCmp.update();
				this.entryTriggerChange.emit( this.entryTrigger );
				this.blockActiveChange.emit({
					blockActive: this.blockActive = node.metadata.blockData,
					forceUpdate: true,
				});
			},
		});
	}

	/**
	 * @param {CUBFlowchartNode} node
	 * @return {void}
	 */
	protected async delete(
		node: CUBFlowchartNode
	) {
		this._cubConfirmService
		.open(
			`BASE.WORKFLOW.CHART.MESSAGE.WILL_AFFECTED`,
			'BASE.WORKFLOW.CHART.MESSAGE.DELETE_EVENT',
			{
				warning: true,
				buttonApply: {
					text: 'BASE.WORKFLOW.CHART.LABEL.DELETE',
					type: 'destructive',
				},
				buttonDiscard: 'BASE.WORKFLOW.CHART.LABEL.CANCEL',
			}
		)
		.afterClosed()
		.subscribe({
			next: async ( answer: boolean ) => {
				if ( !answer ) return;

				if (
					node._cmp.previousNode
				) {
					switch (
						node.metadata.blockData.blockType
					) {
						case WorkflowBlockType.PARALLEL:
							// remove merge block
							node.metadata.blockData.previousBlock.nextBlock
								= node.metadata.blockData.nextBlock.nextBlock;
							break;
						default:
							node.metadata.blockData.previousBlock.nextBlock
								= node.metadata.blockData.nextBlock;
							break;
					}
				} else if ( node._cmp.parentNode ) {
					const { childBlocks }: WorkflowBlock
						= node.metadata.blockData.parentBlock;

					const index: number
						= childBlocks.indexOf(
							node.metadata.blockData
						);

					childBlocks[ index ] = null;
				}

				if (
					node.type === WorkflowBlockType.PARALLEL
				) {
					await this._flowchartCmp
					.destroyNode(
						node.nextNode
					);
				}

				await this._flowchartCmp
				.destroyNode(
					node
				);

				this._flowchartCmp.update();

				if ( this.blockActive ) {
					this.blockActiveChange.emit({
						blockActive: this.blockActive = undefined,
					});
				}

				this.entryTriggerChange.emit( this.entryTrigger );
				this.validate.emit();
			},
		});
	}

	/**
	 * @param {CUBFlowchartNode} node
	 * @return {void}
	 */
	protected onDescriptionChange(
		node: CUBFlowchartNode
	) {
		if (
			this.description === undefined
			|| node.metadata.description === this.description
		) {
			this.nodeEditing
				= this.description
				= undefined;

			this._flowchartCmp.update();
			return;
		}

		node.metadata.description
			= node.metadata.blockData.description
			= this.description;

		this.nodeEditing
			= this.description
			= undefined;

		this._flowchartCmp.update();

		this.entryTriggerChange.emit( this.entryTrigger );
	}

	/**
	 * @param {WorkflowBlock} block
	 * @param {boolean=} validateBlock
	 * @return {NodeAddable | null}
	 */
	private _getNodeAddable(
		block: WorkflowBlock,
		validateBlock?: boolean
	): NodeAddable | null {
		let isValid: boolean = true;

		if ( validateBlock ) {
			switch ( block.blockType ) {
				case WorkflowBlockType.TRIGGER:
					isValid
						= triggerValidation(
							block
						);

					break;
				case WorkflowBlockType.ACTION:
					isValid
						= actionValidation(
							block
						);

					break;
				case WorkflowBlockType.CONDITION:
					isValid
						= conditionValidation(
							block
						);

					break;
				case WorkflowBlockType.SUB_PROCESS:
					isValid
						= subProcessValidation( block );
					break;
				case WorkflowBlockType.SUB_PROCESS_START:
					isValid
						= subProcessValidation( block.parentBlock );

					break;
				case WorkflowBlockType.PARALLEL:
					isValid
						= parallelValidation( block );
					break;
				case WorkflowBlockType.LOOP:
					isValid
						= loopValidation( block );
					break;
				case WorkflowBlockType.LOOP_START:
					isValid
						= loopValidation( block.parentBlock );
					break;
				case WorkflowBlockType.DELAY:
					isValid
						= delayValidation( block );

					break;
			}
		}

		if ( !isValid ) return null;

		const addable: NodeAddable = {
			trigger: true,
			condition: true,
			action: true,
			subProcess: block.subLevel < 2
				&& block.parentBlock?.blockType
					!== WorkflowBlockType.LOOP,
			parallel: block.parLevel < 5,
			loop: block.loopLevel < 3,
			delay: true,
		};

		// switch ( block.blockType ) {
		// 	case WorkflowBlockType.TRIGGER:
		// 		if ( block.type === TriggerType.ROW_DELETED
		// 			|| block.type === TriggerType.SCHEDULE ) {
		// 			addable.trigger = false;
		// 		}

		// 		if ( block.type === TriggerType.SCHEDULE ) {
		// 			addable.condition = false;
		// 		}
		// 		break;
		// 	case WorkflowBlockType.ACTION:
		// 		if ( block.type === ActionType.DELETE_ROW ) {
		// 			addable.trigger = false;
		// 		}
		// 		break;
		// }

		return addable;
	}

	/**
	 * @param {WorkflowBlock[]} childBlocks
	 * @return {CUBFlowchartNode[]}
	 */
	private _initChildNodes(
		childBlocks: WorkflowBlock[]
	): CUBFlowchartNode[] {
		const childNodes: CUBFlowchartNode[] = [];

		_.forEach(
			childBlocks,
			( child: WorkflowBlock ) => {
				if ( child === null ) {
					childNodes.push( null );
					return;
				};

				const newNode: CUBFlowchartNode
					= this._initBlock( child );

				childNodes.push( newNode );
			}
		);

		return childNodes;
	}

	/**
	 * @param {WorkflowBlock} wfBlock
	 * @return {void}
	 */
	private _initBlock(
		wfBlock: WorkflowBlock
	): CUBFlowchartNode {
		if ( !wfBlock ) return;
		const newNode: CUBFlowchartNode
			= {
				id: wfBlock.id,
				type: wfBlock.blockType,
				disableInsertNextNode: disableInsertNextNode.has( wfBlock.blockType ),
				metadata: {
					description: wfBlock.description,
					settingDescription: wfBlock.extra?.settingDescription,
					blockData: wfBlock,
				},
				nextNode: this._initBlock( wfBlock.nextBlock ) || null,
				childNodes: wfBlock.childBlocks?.length
					? this._initChildNodes(
						wfBlock.childBlocks
					)
					: undefined,
			};

		switch( newNode.type ) {
			case WorkflowBlockType.CONDITION:
				newNode.childNodeLineCaptions = [
					this._translateService.instant(
						'BASE.WORKFLOW.CHART.LABEL.RIGHT'
					),
					this._translateService.instant(
						'BASE.WORKFLOW.CHART.LABEL.WRONG'
					),
				];
				break;
			case WorkflowBlockType.SUB_PROCESS:
			case WorkflowBlockType.LOOP:
				newNode.addOuterBox
					= true;
				break;
			case WorkflowBlockType.PARALLEL:
				break;
		}

		return newNode;
	}

	/**
	 * @param {CUBFlowchartNode} childNode
	 * @return {void}
	 */
	private _setBlockData(
		e: CUBFlowchartNodeAddonEvent,
		newBlock: WorkflowBlock
	) {
		if (
			_.isFinite( e.position )
		) {
			let childBlock: WorkflowBlock
				= e
				.sourceNode
				.metadata
				.blockData
				.childBlocks[ e.position ];

			if ( childBlock ) {
				newBlock.nextBlock
					= childBlock;

				childBlock
					= newBlock;
			} else {
				childBlock
					= newBlock;
			}

			e
			.sourceNode
			.metadata
			.blockData
			.childBlocks[ e.position ] = childBlock;
		} else {
			newBlock.nextBlock
				= e
				.sourceNode
				.metadata
				.blockData
				.nextBlock;

			e
			.sourceNode
			.metadata
			.blockData
			.nextBlock = newBlock;
		}
	}

	/**
	 * @return {void}
	 */
	private _addSpecificNodeData(
		newBlock: WorkflowBlock,
		newNode: CUBFlowchartNode
	) {
		switch ( newNode.type ) {
			case WorkflowBlockType.CONDITION:
				newBlock.childBlocks = [
					null,
					null,
				];

				newNode.childNodeLineCaptions = [
					this._translateService.instant(
						'BASE.WORKFLOW.CHART.LABEL.RIGHT'
					),
					this._translateService.instant(
						'BASE.WORKFLOW.CHART.LABEL.WRONG'
					),
				];
				newNode.childNodes = [
					null,
					null,
				];
				break;
			case WorkflowBlockType.SUB_PROCESS:
				newBlock.childBlocks = [
					{
						id: ulid(),
						boardID: newBlock.boardID,
						blockType: WorkflowBlockType.SUB_PROCESS_START,
						parentBlock: newBlock,
						nextBlock:
							{
								id: ulid(),
								blockType: WorkflowBlockType.SUB_PROCESS_EXIT,
								parentBlock: newBlock,
								nextBlock: null,
							},
					},
				];

				newNode.addOuterBox
					= true;
				newNode.childNodes = [
					{
						id: ulid(),
						type: WorkflowBlockType.SUB_PROCESS_START,
						metadata: {
							blockData: newBlock.childBlocks[ 0 ],
						},
						nextNode:
							{
								id: ulid(),
								type: WorkflowBlockType.SUB_PROCESS_EXIT,
								disableInsertNextNode: true,
							},
					},
				];
				break;
			case WorkflowBlockType.LOOP:
				newBlock.childBlocks = [
					{
						id: ulid(),
						boardID: newBlock.boardID,
						blockType: WorkflowBlockType.LOOP_START,
						parentBlock: newBlock,
						nextBlock:
							{
								id: ulid(),
								blockType: WorkflowBlockType.LOOP_EXIT,
								parentBlock: newBlock,
								nextBlock: null,
							},
					},
				];

				newNode.addOuterBox
					= true;
				newNode.childNodes = [
					{
						id: ulid(),
						type: WorkflowBlockType.LOOP_START,
						metadata: {
							blockData: newBlock.childBlocks[ 0 ],
						},
						nextNode:
							{
								id: ulid(),
								type: WorkflowBlockType.LOOP_EXIT,
								disableInsertNextNode: true,
							},
					},
				];
				break;
			case WorkflowBlockType.PARALLEL:
				// block
				newBlock.childBlocks = [
					null,
					null,
				];

				// node
				newNode.childNodes = [
					null,
					null,
				];
				break;
		}
	}

	/**
	 * @param {ULID} nodeId
	 * @param {CUBFlowchartNode} nextNode
	 * @return {CUBFlowchartNode}
	 */
	private _findNode(
		nodeId: ULID,
		nextNode: CUBFlowchartNode
	): CUBFlowchartNode {
		let node: CUBFlowchartNode;

		if (
			nextNode.id === nodeId
		) {
			return node = nextNode;
		}

		_.forEach(
			nextNode.childNodes,
			( n: CUBFlowchartNode ) => {
				if ( !n ) return;

				node = this._findNode( nodeId, n );

				if ( node ) return false;
			}
		);

		if (
			nextNode.nextNode
			&& !node
		) {
			return node = this._findNode(
				nodeId,
				nextNode.nextNode
			);
		}

		return node;
	}

}
