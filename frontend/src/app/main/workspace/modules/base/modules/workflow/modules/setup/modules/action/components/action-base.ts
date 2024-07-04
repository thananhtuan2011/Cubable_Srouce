import {
	Directive,
	ViewChild,
	OnInit,
	Input
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
	SelectBoardComponent
} from '../../common/select-board/select-board.component';

import {
	SelectRowComponent
} from '../common/components';
import {
	Action
} from '../interfaces';

@Directive()
export abstract class ActionBase
implements OnInit {

	@ViewChild( SelectBoardComponent )
	public selectBoardComp: SelectBoardComponent;
	@ViewChild( SelectRowComponent )
	public selectRowComp: SelectRowComponent;

	@Input() public blockSetup: Action;
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
