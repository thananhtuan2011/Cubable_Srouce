import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	DelaySetting,
	PeriodOption
} from '../interfaces';
import {
	DelayPeriod
} from '../resources';

@Unsubscriber()
@Component({
	selector: 'delay',
	templateUrl: '../templates/delay.pug',
	styleUrls: [ '../styles/delay.scss' ],
	host: { class: 'delay' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelayComponent
implements OnChanges {

	@Input() public settings: DelaySetting;

	@Output() public settingsChange: EventEmitter<DelaySetting>
		= new EventEmitter<DelaySetting>();

	protected readonly periodControl: FormControl
		= new FormControl( undefined );
	protected readonly quantityControl: FormControl
		= new FormControl( undefined );

	protected quantity: number;
	protected periodTypes: PeriodOption[]
		= [
			{
				label	: 'MINUTE',
				period	: DelayPeriod.MINUTE,
			},
			{
				label	: 'HOUR',
				period	: DelayPeriod.HOUR,
			},
			{
				label	: 'DAY',
				period	: DelayPeriod.DAY,
			},
		];

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes?.settings ) {
			if ( !this.settings?.period ) {
				this.settings = {
					quantity: null,
					period: DelayPeriod.MINUTE,
				};
			}

			if ( this.settings?.quantity ) {
				this.quantity
					= this.settings.quantity;
			}
		}
	}

	/**
	 * @return {void}
	 */
	protected onSettingChanged() {
		this.settings.quantity = +this.quantity;

		this.settingsChange.emit( this.settings );
	}

}
