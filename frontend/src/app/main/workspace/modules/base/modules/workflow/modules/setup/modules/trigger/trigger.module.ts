import {
	NgModule
} from '@angular/core';
import {
	DragDropModule
} from '@angular/cdk/drag-drop';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	CUBCardModule
} from '@cub/material/card';
import {
	CUBDropdownModule
} from '@cub/material/dropdown';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBIconModule
} from '@cub/material/icon';
import {
	CUBFormFieldModule
} from '@cub/material/form-field';
import {
	CUBDatePickerModule
} from '@cub/material/date-picker';
import {
	CUBSwitchModule
} from '@cub/material/switch';
import {
	CUBMenuModule
} from '@cub/material/menu';
import {
	CUBRadioModule
} from '@cub/material/radio';
import {
	CUBScrollBarModule
} from '@cub/material/scroll-bar';

import {
	DateValuePipe,
	FieldMetadataPipe
} from '@main/common/field/pipes';

import {
	CommonModule
} from '../common/common.module';

import {
	TriggerComponent,
	ValueChangedComponent,
	RowCreatedComponent,
	RowDeleteComponent,
	AtScheduledTimeComponent,
	DateArrivesComponent
} from './components';
import {
	SelectRowComponent
} from './common/components';

@NgModule({
	imports: [
		CoreModule,
		FormModule,
		DragDropModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP.TRIGGER',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBButtonModule,
		CUBCardModule,
		CUBDropdownModule,
		CUBIconModule,
		CUBSwitchModule,
		CUBRadioModule,
		CUBFormFieldModule,
		CUBMenuModule,
		CUBScrollBarModule,
		CUBDatePickerModule,

		CommonModule,
		FieldMetadataPipe,
		DateValuePipe,
	],
	exports: [
		TriggerComponent,
		ValueChangedComponent,
		DateArrivesComponent,
		RowCreatedComponent,
		RowDeleteComponent,
		SelectRowComponent,
		AtScheduledTimeComponent,
	],
	declarations: [
		TriggerComponent,
		ValueChangedComponent,
		DateArrivesComponent,
		RowCreatedComponent,
		RowDeleteComponent,
		SelectRowComponent,
		AtScheduledTimeComponent,
	],
	providers: [],
})
export class TriggerModule {}
