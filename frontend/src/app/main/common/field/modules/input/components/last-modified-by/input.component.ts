import {
	ChangeDetectionStrategy,
	Component
} from '@angular/core';

import {
	Unsubscriber
} from '@core';

import {
	LastModifiedByData
} from '../../../../interfaces';
import {
	LastModifiedByField
} from '../../../../objects';

import {
	FieldInputReadonly
} from '../input-readonly';

@Unsubscriber()
@Component({
	selector: 'last-modified-by-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss' ],
	host: { class: 'last-modified-by-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastModifiedByFieldInputComponent
	extends FieldInputReadonly<LastModifiedByField, LastModifiedByData> {}
