import { ChangeDetectionStrategy, Component, ContentChild, TemplateRef } from '@angular/core';

@Component({
	selector		: 'menu-bar',
	templateUrl		: './menu-bar.pug',
	styleUrls		: [ './menu-bar.scss' ],
	host			: { class: 'menu-bar' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class MenuBarComponent {

	@ContentChild( 'leftMenu' ) public leftMenu: TemplateRef<any>;
	@ContentChild( 'rightMenu' ) public rightMenu: TemplateRef<any>;

}
