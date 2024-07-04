import {
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';

@Component({
	selector: 'cub-action-box-end',
	template: `
		<ng-template>
			<ng-content></ng-content>
		</ng-template>
	`,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBActionBoxEndComponent {

	@ViewChild( TemplateRef, { static: true } )
	public templateRef: TemplateRef<any>;

}
