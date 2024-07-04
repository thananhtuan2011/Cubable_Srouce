import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	inject
} from '@angular/core';
import {
	ULID
} from 'ulidx';

import {
	Unsubscriber
} from '@core';

import {
	WorkflowService
} from '../../../../../services';

import {
	RowTriggerType
} from '../resources';
import {
	RowDeleteSetting
} from '../interfaces/row-deleted.interface';

import {
	TriggerBase
} from './trigger-base';

@Unsubscriber()
@Component({
	selector: 'row-deleted',
	templateUrl: '../templates/row-deleted.pug',
	styleUrls: [ '../styles/row-deleted.scss' ],
	host: { class: 'row-deleted' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowDeleteComponent
	extends TriggerBase {

	@Input() public settings: RowDeleteSetting;

	@Output() public settingsChange: EventEmitter<RowDeleteSetting>
		= new EventEmitter<RowDeleteSetting>();

	private readonly _workflowService: WorkflowService
		= inject( WorkflowService );

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	protected onBoardIDChange( boardID: ULID ) {
		if ( boardID === this.settings.boardID ) return;

		this.settings = {
			boardID,
			row: {
				type: RowTriggerType.ANY,
			},
		};

		this.settingsChange.emit( this.settings );
		this._workflowService.boardIDChanged$.next();

		super.openRowPicker();
	}

	/**
	 * @return {void}
	 */
	protected onRowChange() {
		this.settingsChange.emit( this.settings );
	}

}
