import {
	NgModule
} from '@angular/core';

import {
	CoreModule,
	I18nLazyTranslateModule
} from '@core';

import {
	SetupComponent
} from './components';
import {
	ActionModule
} from './modules/action/action.module';
import {
	TriggerModule
} from './modules/trigger/trigger.module';
import {
	DelayModule
} from './modules/delay/delay.module';
import {
	ConditionModule
} from './modules/condition/condition.module';
import {
	ParallelModule
} from './modules/parallel/parallel.module';
import {
	MergeModule
} from './modules/merge/merge.module';
import {
	SubProcessModule
} from './modules/sub-process/sub-process.module';
import {
	LoopModule
} from './modules/loop/loop.module';
import {
	EndModule
} from './modules/end/end.module';

@NgModule({
	imports: [
		CoreModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'BASE.WORKFLOW.SETUP',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		ActionModule,
		TriggerModule,
		ConditionModule,
		SubProcessModule,
		DelayModule,
		ParallelModule,
		MergeModule,
		LoopModule,
		EndModule,
	],
	exports: [
		SetupComponent,
	],
	declarations: [
		SetupComponent,
	],
	providers: [
	],
})
export class SetupModule {}
