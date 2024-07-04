import {
	ChangeDetectionStrategy,
	Component,
	ContentChild,
	TemplateRef,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';

import {
	CUBExpansionPanelContentDirective
} from './expansion-panel-content.directive';

@Component({
	selector		: 'cub-expansion-panel-content',
	template		: '<ng-template><ng-content></ng-content></ng-template>',
	host			: { class: 'cub-expansion-panel-content' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBExpansionPanelContentComponent {

	@ViewChild( TemplateRef, { static: true } )
	public templateRef: TemplateRef<any>;

	@ContentChild( CUBExpansionPanelContentDirective )
	private _content: CUBExpansionPanelContentDirective;

	get template(): TemplateRef<any> {
		return this._content?.templateRef
			|| this.templateRef;
	}

}
