import { Component, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector		: 'wgc-action-box-middle',
	templateUrl		: './wgc-action-box-middle.pug',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCActionBoxMiddleComponent {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

}
