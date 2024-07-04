import {
	Component,
	inject,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Input,
	Output,
	EventEmitter,
	OnChanges,
	SimpleChanges,
	OnInit
} from '@angular/core';
import {
	Router
} from '@angular/router';
import {
	ULID
} from 'ulidx';
import {
	finalize
} from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBPopupRef
} from '@cub/material/popup';
import {
	CUBFile,
	CUBFilePreviewerService
} from '@cub/material/file-picker';

import {
	WorkspaceService
} from '@main/workspace/services';
import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';

import {
	BoardExpandService
} from '../../base/modules/board/services';
import {
	BoardField
} from '../../base/modules/board/interfaces';

import {
	CONSTANT as BASE_CONSTANT
} from '../resources';
import {
	Notification,
	NotificationAction
} from '../interfaces';
import {
	NotificationService
} from '../services';

@Unsubscriber()
@Component({
	selector: 'notification',
	templateUrl: '../templates/notification.pug',
	styleUrls: [ '../styles/notification.scss' ],
	host: { class: 'notification' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})

export class NotificationComponent
implements OnChanges, OnInit {

	@Input() public notification: Notification[];

	@Output() public notificationChecked: EventEmitter<Notification>
		= new EventEmitter<Notification>();
	@Output() public notificationLoadMore: EventEmitter<Notification[]>
		= new EventEmitter<Notification[]>();

	protected isScrolling: boolean;
	protected isLoadMore: boolean;
	protected offset: number = 30;
	protected isHovered: ULID;
	protected baseID: ULID;
	protected notificationToday: Notification[];
	protected notificationYesterday: Notification[];
	protected notificationOlder: Notification[];
	protected fields: BoardField[];
	protected readonly NOTIFICATION_ACTION_TYPE: typeof NotificationAction
		= NotificationAction;

	private readonly _filePreviewerService: CUBFilePreviewerService
		= inject( CUBFilePreviewerService );
	private readonly _router: Router
		= inject( Router );
	private readonly _workspaceService: WorkspaceService
		= inject( WorkspaceService );
	private readonly _notificationService: NotificationService
		= inject( NotificationService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _boardExpandService: BoardExpandService
		= inject( BoardExpandService );

	private _filePreviewerPopupRef: CUBPopupRef;
	private _navigation: { baseID: ULID; boardID: ULID };

	ngOnChanges( changes: SimpleChanges ) {
		this.notificationToday = [];
		this.notificationYesterday = [];
		this.notificationOlder = [];

		this._filterNotificationArr(
			changes.notification.currentValue
		);
	}

	ngOnInit() {
		this.baseID
			= this._notificationService.storedBaseID;

		this._notificationService
		.markAllAsRead$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {Notification} notification
	 * @return {void}
	 */
	protected markAsRead( notification: Notification ) {
		if ( notification.read ) return;

		this._notificationService
		.markAsRead( notification.id )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				notification.read = true;

				this.notificationChecked.emit( notification );
			},
		});
	}

	/**
	 * @param {ULID} baseID
	 * @param {ULID=} boardID
	 * @return {void}
	 */
	protected navigate( baseID: ULID, boardID?: ULID ) {
		if ( !boardID && this.baseID === baseID ) return;

		const workspaceID: string = this._workspaceService.storedWorkspace?.id;

		if ( !workspaceID ) return;

		this.baseID = baseID;

		this._navigation = { baseID, boardID };

		this._router.navigate(
			[
				WORKSPACE_CONSTANT.PATH.MAIN,
				workspaceID,
				BASE_CONSTANT.PATH.MAIN,
			],
			{ skipLocationChange: true }
		)
		.then( () => {
			const queryParams: any = {};

			if (
				this._navigation.boardID
			) queryParams.boardID = this._navigation.boardID;

			this._router.navigate(
				[
					WORKSPACE_CONSTANT.PATH.MAIN,
					workspaceID,
					BASE_CONSTANT.PATH.MAIN,
					BASE_CONSTANT.PATH.DETAIL,
					baseID,
				],
				{ queryParams }
			);
		} );
	}

	/**
	 * @param {Notification} n
	 * @return {void}
	 */
	protected onOpenItemDetail( n: Notification ) {
		this.markAsRead( n );

		this._boardExpandService
		.openDialogItemDetail(
			{
				itemID: n.metadata.recordID,
				boardID: n.metadata.boardID,
			}
		);
	}

	/**
	 * @param {number} idx
	 * @param {CUBFile[]} _files
	 * @return {void}
	 */
	protected previewFile(
		idx: number,
		_files: CUBFile[]
	) {
		if (
			this._filePreviewerPopupRef?.isOpened
		) {
			return;
		}

		this._filePreviewerPopupRef
			= this
			._filePreviewerService
			.preview(
				{
					files:
						_.cloneDeep( _files ),
					previewingIndex:
						idx,
				}
			);
	}

	protected onNotificationScroll() {
		if ( this.isScrolling ) return;

		if (
			(
				this.notification.length >= 30
				&& _.isUndefined( this.isLoadMore )
			)
			|| this.isLoadMore
		) {
			this._getListNotification();
		}
	}

	/**
	 * @return {void}
	 */
	protected _getListNotification() {
		this.isScrolling = true;

		this._notificationService
		.getListNotification(
			{
				limit: 30,
				offset: this.offset,
			}
		)
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( notification: Notification[] ) => {
				if ( !notification.length ) {
					this.isLoadMore = false;

					return;
				}

				this.notification =
					[
						...this.notification,
						...notification,
					];

				this.isLoadMore
					= notification.length < 30
						? false
						: true;

				this._filterNotificationArr( notification );

				this.notificationLoadMore.emit( notification );

				this.offset += 30;
				this.isScrolling = false;
			},
		});
	}

	/**
	 * @param {Notification[]} notification
	 * @return {void}
	 */
	private _filterNotificationArr( notification: Notification[] ) {
		const today: number = new Date().getDate();

		_.forEach(
			notification,
			( n: Notification) => {
				if (
					new Date( n.createdAt ).getDate()
					=== today
				) {
					this.notificationToday.push( n );
				} else {
					if (
						new Date( n.createdAt ).getDate()
						=== today - 1
					) {
						this.notificationYesterday.push( n );
					} else {
						this.notificationOlder.push( n );
					}
				}
			} );
	}

}
