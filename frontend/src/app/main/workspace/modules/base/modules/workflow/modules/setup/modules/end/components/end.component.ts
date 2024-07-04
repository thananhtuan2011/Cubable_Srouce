import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	EndType
} from '../resources';

@Unsubscriber()
@Component({
	selector: 'end',
	templateUrl: '../templates/end.pug',
	styleUrls: [ '../styles/end.scss' ],
	host: { class: 'end' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EndComponent
implements OnInit {

	@Input() public type: EndType;

	@Output() public typeChange: EventEmitter<EndType>
		= new EventEmitter<EndType>();

	protected readonly endType: typeof EndType
		= EndType;

	ngOnInit() {
		if ( !this.type ) {
			this.type = EndType.Once;

			this.typeChange.emit( this.type );
		}
	}

	/**
	 * @param {EndType} type
	 * @return {void}
	 */
	protected onChangeType(
		type: EndType
	) {
		if (
			this.type === type
		) return;

		this.type = type;

		this.typeChange.emit( this.type );
	}

}
