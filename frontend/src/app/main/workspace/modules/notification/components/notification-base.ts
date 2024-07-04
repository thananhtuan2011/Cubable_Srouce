import {
	Directive,
	ChangeDetectorRef,
	inject
} from '@angular/core';
import {
	untilCmpDestroyed
} from '@core';
import _ from 'lodash';

import {
	finalize
} from 'rxjs/operators';

import {
	NotificationService
} from '../services';
import {
	Notification,
	NotificationAction,
	NotificationCount,
	TabType
} from '../interfaces';

@Directive()
export abstract class NotificationBase {

	protected readonly TAB_TYPE: typeof TabType
		= TabType;
	protected readonly NOTIFICATION_ACTION: typeof NotificationAction
		= NotificationAction;

	protected notification: Notification[];
	protected countBadge: NotificationCount;
	protected selectedTab: TabType = TabType.ALL;

	protected bkNotification: Notification[];

	protected readonly notificationService: NotificationService
		= inject( NotificationService );

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	/**
	 * @param {number} index
	 * @return {void}
	 */
	protected onTabChange( index: number ) {
		if ( this.selectedTab === index ) return;

		this.selectedTab = index;

		switch ( index ) {
			case this.TAB_TYPE.ALL:
				this.notification
					= _.cloneDeep( this.bkNotification );
				break;

			case this.TAB_TYPE.UN_READ:
				this.notification
					= _.filter( this.bkNotification, { read: false } );
				break;

			case this.TAB_TYPE.RELATE_COMMENT:
				this.notification
					= _.filter( this.bkNotification, ( n: Notification ) => {
						return n.actionType
							!== this.NOTIFICATION_ACTION.USER_SETUP;
					} );
				break;
		}

		this._cdRef.markForCheck();
	}

	/**
	 * @param {Notification} n
	 * @return {void}
	 */
	protected onNotificationChecked(
		n: Notification,
		isCount?: boolean
	) {
		const idx: number
			= _.findIndex( this.bkNotification, { id: n.id } );

		this.bkNotification[ idx ].read = true;

		if ( isCount ) {
			this.countBadge.unRead -= 1;
		}
	}

	/**
	 * @param {Notification[]} n
	 * @return {void}
	 */
	protected onNotificationLoadMore( n: Notification[] ) {
		this.bkNotification
			= [ ...this.bkNotification, ...n ];
	}

	/**
	 * @param {boolean} isCount
	 * @return {void}
	 */
	protected markAllAsRead( isCount?: boolean ) {
		if (
			!_.filter(
				this.bkNotification,
				{ read: false }
			).length
		) return;

		this.notificationService
		.markAllAsRead()
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				_.forEach(
					this.bkNotification,
					( n: Notification ) => {
						n.read = true;
					} );
				_.forEach(
					this.notification,
					( n: Notification ) => {
						n.read = true;
					} );

				if ( isCount ) {
					this.countBadge.unRead = 0;
				}

				this.notificationService.markAllAsRead$.next();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected getListNotification() {
		this.notificationService
		.getListNotification(
			{
				limit: 30,
				offset: 0,
			}
		)
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( notification: Notification[] ) => {
				this.notification = notification;
				this.bkNotification = _.cloneDeep( this.notification );
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected countNotification() {
		this.notificationService
		.countNotification()
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( count: NotificationCount ) => {
				this.countBadge = count;
			},
		});
	}

}
