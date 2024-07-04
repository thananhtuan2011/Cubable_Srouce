import {
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';

@Component({
	selector		: 'cub-expansion-panel-header',
	template		: '<ng-template><ng-content></ng-content></ng-template>',
	host			: { class: 'cub-expansion-panel-header' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBExpansionPanelHeaderComponent {

	@ViewChild( TemplateRef, { static: true } )
	public templateRef: TemplateRef<any>;

}
