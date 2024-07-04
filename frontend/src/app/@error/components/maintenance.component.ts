import { Component, ChangeDetectionStrategy } from '@angular/core';

import { PageService } from '@core';

@Component({
	selector		: 'maintenance',
	templateUrl		: '../templates/maintenance.pug',
	styleUrls		: [ '../styles/error.scss' ],
	host			: { class: 'maintenance' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class MaintenanceComponent {

	/**
	 * @constructor
	 * @param {PageService} _pageService
	 */
	constructor( private _pageService: PageService ) {}

	/**
	 * @return {void}
	 */
	public reload() {
		this._pageService.setCurrentURL( null );
		window.location.href = '';
	}

}
