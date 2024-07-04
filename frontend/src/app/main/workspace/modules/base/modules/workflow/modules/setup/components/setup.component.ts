import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	Output,
	ViewChild,
	inject,
	EventEmitter
} from '@angular/core';
import {
	ULID
} from 'ulidx';

import {
	Unsubscriber
} from '@core';

import {
	IBoard
} from '../../../../board/interfaces';

import {
	WorkflowBlock
} from '../../../interfaces';
import {
	WorkflowBlockType
} from '../../../resources';

import {
	TriggerComponent
} from '../modules/trigger/components';
import {
	ActionComponent
} from '../modules/action/components';
import {
	ConditionComponent
} from '../modules/condition/components';
import {
	SubProcessComponent
} from '../modules/sub-process/components';
import {
	LoopComponent
} from '../modules/loop/components';
import{
	ParallelComponent
} from '../modules/parallel/components';

@Unsubscriber()
@Component({
	selector: 'setup',
	templateUrl: '../templates/setup.pug',
	styleUrls: [ '../styles/setup.scss' ],
	host: { class: 'setup' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupComponent {

	@ViewChild( 'conditionComp' )
	public conditionComp: ConditionComponent;
	@ViewChild( 'triggerComp' )
	public triggerComp: TriggerComponent;
	@ViewChild( 'actionComp' )
	public actionComp: ActionComponent;
	@ViewChild( 'subProcessComp' )
	public subProcessComp: SubProcessComponent;
	@ViewChild( 'loopComp' )
	public loopComp: LoopComponent;
	@ViewChild( 'parallelComp' )
	public parallelComp: ParallelComponent;

	@Input() public baseID: ULID;
	@Input() public blockSetup: WorkflowBlock;
	@Input() public boardsLk: ObjectType<IBoard>;

	@Output() public blockSetupChange: EventEmitter<WorkflowBlock>
		= new EventEmitter<WorkflowBlock>();

	public readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	protected readonly WORKFLOW_BLOCK_TYPE: typeof WorkflowBlockType
		= WorkflowBlockType;

	/**
	 * @return {void}
	 */
	protected onBlockSetupChange() {
		this.blockSetupChange.emit( this.blockSetup );
	}

}
