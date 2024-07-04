import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector		: 'drag-zone',
	templateUrl		: './drag-zone.pug',
	styleUrls		: [ './drag-zone.scss' ],
	host			: { class: 'drag-zone' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class DragZoneComponent {

	@Input() public name: string;

}
