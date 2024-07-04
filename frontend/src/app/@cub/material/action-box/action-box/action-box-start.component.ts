import {
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';

@Component({
	selector: 'cub-action-box-start',
	template: `
		<ng-template>
			<ng-content></ng-content>
		</ng-template>
	`,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBActionBoxStartComponent {

	@ViewChild( TemplateRef, { static: true } )
	public templateRef: TemplateRef<any>;

}
