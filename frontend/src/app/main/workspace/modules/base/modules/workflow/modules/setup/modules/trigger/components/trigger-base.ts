import {
	Directive,
	ViewChild,
	Input
} from '@angular/core';

import {
	CoerceBoolean
} from '@core';

import {
	SelectBoardComponent
} from '../../common/select-board/select-board.component';

import {
	SelectRowComponent
} from '../common/components';
import {
	Trigger
} from '../interfaces';
import { ULID } from 'ulidx';

@Directive()
export abstract class TriggerBase {

	@ViewChild( SelectBoardComponent )
	public selectBoardCmp: SelectBoardComponent;
	@ViewChild( SelectRowComponent )
	public selectRowComp: SelectRowComponent;

	@Input() @CoerceBoolean()
	public isEntry: boolean;
	@Input() public boardID: ULID;
	@Input() public blockSetup: Trigger;
	@Input() public baseID: ULID;

	/**
	 * @return {void}
	 */
	protected openRowPicker() {
		setTimeout(
			() => this.selectRowComp?.rowPicker?.open()
		);
	}

}
