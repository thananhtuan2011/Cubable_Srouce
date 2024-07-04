import { NgModule } from '@angular/core';

import {
	CoreModule,
	FormModule,
	I18nLazyTranslateModule
} from '@core';

import {
	AutoAccessWorkspaceComponent
} from './components';
import {
	CUBButtonModule
} from '@cub/material/button';
import {
	CUBAvatarModule
} from '@cub/material/avatar';
import {
	CUBImageModule
} from '@cub/material/image';

@NgModule({
	imports: [
		CoreModule,
		FormModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'AUTH.COMMON',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		CUBAvatarModule,
		CUBButtonModule,
		CUBImageModule,
	],
	exports		: [ AutoAccessWorkspaceComponent ],
	declarations: [ AutoAccessWorkspaceComponent ],
	providers	: [],
})
export class CommonModule {}
