import { Component, TemplateRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector		: 'wgc-action-box-end',
	templateUrl		: './wgc-action-box-end.pug',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCActionBoxEndComponent {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

}
