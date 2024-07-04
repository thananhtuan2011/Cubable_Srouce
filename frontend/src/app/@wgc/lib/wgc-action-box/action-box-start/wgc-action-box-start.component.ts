import { Component, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector		: 'wgc-action-box-start',
	templateUrl		: './wgc-action-box-start.pug',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCActionBoxStartComponent {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

}
