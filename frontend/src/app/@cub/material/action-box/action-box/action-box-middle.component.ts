import {
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';

@Component({
	selector: 'cub-action-box-middle',
	template: `
		<ng-template>
			<ng-content></ng-content>
		</ng-template>
	`,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBActionBoxMiddleComponent {

	@ViewChild( TemplateRef, { static: true } )
	public templateRef: TemplateRef<any>;

}
