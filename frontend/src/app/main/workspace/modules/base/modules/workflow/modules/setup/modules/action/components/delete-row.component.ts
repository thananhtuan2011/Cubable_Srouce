import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	DeleteRowSetting
} from '../interfaces';

import {
	ActionBase
} from './action-base';

@Unsubscriber()
@Component({
	selector: 'delete-row',
	templateUrl: '../templates/delete-row.pug',
	styleUrls: [ '../styles/delete-row.scss' ],
	host: { class: 'delete-row' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteRowComponent
	extends ActionBase {

	@Input() public baseID: ULID;
	@Input() public settings: DeleteRowSetting;

	@Output() public settingsChange: EventEmitter<DeleteRowSetting>
		= new EventEmitter<DeleteRowSetting>();

	/**
	 * @return {void}
	 */
	protected onRowChange() {
		this.settingsChange.emit( this.settings );
	}
}
