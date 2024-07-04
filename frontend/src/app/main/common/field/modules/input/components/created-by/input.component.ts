import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	Unsubscriber
} from '@core';

import {
	CreatedByData
} from '../../../../interfaces';
import {
	CreatedByField
} from '../../../../objects';

import {
	FieldInputReadonly
} from '../input-readonly';

@Unsubscriber()
@Component({
	selector: 'created-by-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'created-by-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatedByFieldInputComponent
	extends FieldInputReadonly<CreatedByField, CreatedByData> {}
