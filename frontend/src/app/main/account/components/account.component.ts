import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
	selector		: 'account',
	templateUrl		: '../templates/account.pug',
	styleUrls		: [ '../styles/account.scss' ],
	host			: { class: 'account' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {}
