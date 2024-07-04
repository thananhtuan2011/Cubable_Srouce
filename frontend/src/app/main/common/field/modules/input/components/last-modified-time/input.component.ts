import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	Unsubscriber
} from '@core';

import {
	LastModifiedTimeData
} from '../../../../interfaces';
import {
	LastModifiedTimeField
} from '../../../../objects';

import {
	FieldInputReadonly
} from '../input-readonly';

@Unsubscriber()
@Component({
	selector: 'last-modified-time-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'last-modified-time-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastModifiedTimeFieldInputComponent
	extends FieldInputReadonly<LastModifiedTimeField, LastModifiedTimeData> {}
