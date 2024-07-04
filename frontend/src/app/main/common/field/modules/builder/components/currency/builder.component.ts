import {
	ChangeDetectionStrategy,
	Component,
	OnInit
} from '@angular/core';

import {
	CurrencyField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

@Component({
	selector: 'currency-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'currency-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrencyFieldBuilderComponent
	extends FieldBuilder<CurrencyField>
	implements OnInit {

	protected internalField: CurrencyField;

}
