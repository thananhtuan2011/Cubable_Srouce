import {
	ChangeDetectionStrategy,
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	CreateRowSetting
} from '../interfaces';

import {
	ActionBase
} from './action-base';
import {
	SetRowContentComponent
} from '../common/components';

@Unsubscriber()
@Component({
	selector: 'create-row',
	templateUrl: '../templates/create-row.pug',
	styleUrls: [ '../styles/create-row.scss' ],
	host: { class: 'create-row' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateRowComponent
	extends ActionBase {

	@ViewChild( SetRowContentComponent )
	public setRowContentComp: SetRowContentComponent;

	@Input() public baseID: ULID;
	@Input() public settings: CreateRowSetting;

	@Output() public settingsChange: EventEmitter<CreateRowSetting>
		= new EventEmitter<CreateRowSetting>();

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	protected onBoardIDChange( boardID: ULID ) {
		if ( boardID === this.settings?.boardID ) return;

		this.settings = {
			boardID,
		} as CreateRowSetting;

		setTimeout(() => {
			this.setRowContentComp.loadFieldsFromBoard();
		});

		this.settingsChange.emit( this.settings );
	}

	/**
	 * @param {CreateRowSetting} settingsChange
	 * @return {void}
	 */
	protected onSettingChange( settingsChange: CreateRowSetting ) {
		this.settingsChange.emit( settingsChange );
	}

}
