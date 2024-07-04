import {
	Component, TemplateRef, ViewChild,
	ContentChildren, QueryList, ChangeDetectionStrategy
} from '@angular/core';

import { WGCExpansionPanelContentDirective } from './wgc-expansion-panel-content.directive';

@Component({
	selector		: 'wgc-expansion-panel-content',
	templateUrl		: './wgc-expansion-panel-content.pug',
	host			: { class: 'wgc-expansion-panel-content' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCExpansionPanelContentComponent {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

	@ContentChildren( WGCExpansionPanelContentDirective, { descendants: false } )
	private _panelContentList: QueryList<WGCExpansionPanelContentDirective>;

	get template(): TemplateRef<any> { return this._panelContentList.first?.templateRef || this.templateRef; }

}
