import {
	Directive,
	Input,
	OnInit,
	ViewChild
} from '@angular/core';

import {
	EventAdvance
} from '@main/common/field/modules/comparison/interfaces';
import {
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	eventBlock
} from '../../../../../helpers';

import {
	SingleConditionalComponent
} from '../../common/conditional';

import {
	SubProcess
} from '../interfaces';

@Directive()
export abstract class SubProcessBase
implements OnInit {

	@ViewChild( SingleConditionalComponent )
	public singleConditionalComp: SingleConditionalComponent;

	@Input() public blockSetup: SubProcess;
	@Input() public boardsLk: ObjectType<IBoard>;

	protected eventAdvance: EventAdvance[];

	ngOnInit() {
		this.eventAdvance
			= eventBlock(
				this.blockSetup,
				this.boardsLk,
				true
			);
	}

}
