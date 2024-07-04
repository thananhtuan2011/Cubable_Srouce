import { Component, ChangeDetectionStrategy } from '@angular/core';

import { PageService } from '@core';

@Component({
	selector		: 'error',
	templateUrl		: '../templates/error.pug',
	styleUrls		: [ '../styles/error.scss' ],
	host			: { class: 'error' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {

	/**
	 * @constructor
	 * @param {PageService} _pageService
	 */
	constructor( private _pageService: PageService ) {}

	/**
	 * @return {void}
	 */
	public back() {
		this._pageService.navigateToCurrentURL();
	}

}
