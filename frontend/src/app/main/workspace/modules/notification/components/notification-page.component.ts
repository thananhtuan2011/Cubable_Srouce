import {
	Component,
	ChangeDetectionStrategy,
	OnInit
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	Notification
} from '../interfaces';
import {
	NotificationBase
} from './notification-base';

@Unsubscriber()
@Component({
	selector: 'notification-page',
	templateUrl: '../templates/notification-page.pug',
	styleUrls: [ '../styles/notification-page.scss' ],
	host: { class: 'notification-page' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NotificationPageComponent
	extends NotificationBase implements OnInit {

	ngOnInit() {
		this.getListNotification();
		this.countNotification();
	}

	/**
	 * @param {Notification} n
	 * @return {void}
	 */
	protected onNotificationChecked( n: Notification ) {
		super.onNotificationChecked( n, true );
	}

	/**
	 * @return {void}
	 */
	protected markAllAsRead() {
		super.markAllAsRead( true );
	}

}
