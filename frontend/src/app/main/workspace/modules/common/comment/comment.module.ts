import {
	ModuleWithProviders,
	NgModule,
	Type
} from '@angular/core';

import { CoreModule, I18nLazyTranslateModule } from '@core';

import { WGCCommentModuleWithProviders } from '@main/common/module-with-providers';

import { CommentComponent, COMMENT_SERVICE } from './components';
import { ICommentService } from './services';

@NgModule({
	imports: [
		CoreModule,

		I18nLazyTranslateModule.forChild({
			prefix: 'COMMENT',
			loader: ( lang: string ) => import( `./i18n/${lang}.json` ),
		}),

		WGCCommentModuleWithProviders,
	],
	exports		: [ CommentComponent ],
	declarations: [ CommentComponent ],
	providers	: [],
})
export class CommentModule {

	/**
	 * @constructor
	 * @param {Type<ICommentService>} commentService
	 */
	public static forChild( commentService: Type<ICommentService> ): ModuleWithProviders<CommentModule> {
		return {
			ngModule	: CommentModule,
			providers	: [{ provide: COMMENT_SERVICE, useClass: commentService }],
		};
	}

}
