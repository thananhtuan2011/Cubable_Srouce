import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
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
	ChangeValueSetting
} from '../interfaces';
import {
	SetRowContentComponent
} from '../common/components';

import {
	ActionBase
} from './action-base';

@Unsubscriber()
@Component({
	selector: 'change-value',
	templateUrl: '../templates/change-value.pug',
	styleUrls: [ '../styles/change-value.scss' ],
	host: { class: 'change-value' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeValueComponent
	extends ActionBase {

	@ViewChild( SetRowContentComponent )
	public setRowContentComp: SetRowContentComponent;

	@Input() public baseID: ULID;
	@Input() public settings: ChangeValueSetting;

	@Output() public settingsChange: EventEmitter<ChangeValueSetting>
		= new EventEmitter<ChangeValueSetting>();

	/**
	 * @return {void}
	 */
	protected onRowChange() {
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	protected onLoadFields() {
		this.settings.fields = null;

		this.setRowContentComp.loadFieldsFromBoard();
	}

	/**
	 * @param {ChangeValueSetting} settingChange
	 * @return {void}
	 */
	protected onSettingChange( settingChange: ChangeValueSetting ) {
		this.settingsChange.emit( settingChange );
	}

}
