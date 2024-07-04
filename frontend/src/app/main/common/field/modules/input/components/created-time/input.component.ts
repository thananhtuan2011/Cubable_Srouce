import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	Unsubscriber
} from '@core';

import {
	CreatedTimeData
} from '../../../../interfaces';
import {
	CreatedTimeField
} from '../../../../objects';

import {
	FieldInputReadonly
} from '../input-readonly';

@Unsubscriber()
@Component({
	selector: 'created-time-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'created-time-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedTimeFieldInputComponent
	extends FieldInputReadonly<CreatedTimeField, CreatedTimeData> {}
