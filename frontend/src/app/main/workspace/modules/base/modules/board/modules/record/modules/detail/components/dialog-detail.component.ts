import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Inject,
	OnDestroy,
	OnInit,
	inject
} from '@angular/core';
import {
	SafeUrl
} from '@angular/platform-browser';
import _ from 'lodash';
import {
	ULID
} from 'ulidx';
import {
	Subject,
	Subscription,
	Observable
} from 'rxjs';
import {
	debounceTime,
	finalize
} from 'rxjs/operators';

import {
	ENVIRONMENT
} from '@environments/environment';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBDialogRef,
	CUB_DIALOG_CONTEXT,
	CUB_DIALOG_REF
} from '@cub/material/dialog';
import {
	CUBConfirmService
} from '@cub/material/confirm';

import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';

import {
	IError
} from '@error/interfaces';

import {
	BoardFieldService,
	BoardService
} from '../../../../../services';
import {
	BoardField
} from '../../../../../interfaces';

import {
	RecordService
} from '../../../services';
import {
	RecordDetail
} from '../../../interfaces';

import {
	DialogItemDetailContext
} from '../interfaces';
import {
	CONSTANT
} from '../resources';

@Unsubscriber()
@Component({
	selector: 'dialog-detail',
	templateUrl: '../templates/dialog-detail.pug',
	styleUrls: [ '../styles/dialog-detail.scss' ],
	host: { class: 'dialog-detail' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		BoardService,
	],
})
export class DialogDetailComponent
implements OnInit, OnDestroy {

	protected itemName: string;
	protected isLoaded: boolean;
	protected isTopSticky: boolean;
	protected isBottomSticky: boolean;
	protected hasCommentPermission: boolean = true;
	protected rowIndex: number;
	protected cardPaddingNumber: number = 30;
	protected editorHeight: number;
	protected commentListHeight: number;
	protected user: IUser;
	protected users: IUser[];
	protected boardAvailableUser: IUser[];
	protected boardFields: BoardField[];
	protected itemDetail: RecordDetail;

	// Event
	protected commentListResizeObserver: ResizeObserver;
	protected commentListObserver: IntersectionObserver;
	protected commentListSubscription: Subscription;
	protected editorObserver: IntersectionObserver;
	protected editorResizeObserver: ResizeObserver;
	protected editorSubscription: Subscription;

	private readonly _recordService: RecordService
		= inject( RecordService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _boardService: BoardService
		= inject( BoardService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _userService: UserService
		= inject( UserService );

	private _qrCodeDownloadLink: SafeUrl;

	get publicLink(): string {
		if ( !this.dialogContext.itemID ) return '';

		// eslint-disable-next-line max-len
		return`${ENVIRONMENT.APP_URL}/${CONSTANT.SHARING_PATH}/${this.dialogContext.itemID}`;
	}

	constructor(
		@Inject( CUB_DIALOG_CONTEXT )
		protected dialogContext: DialogItemDetailContext,
		@Inject( CUB_DIALOG_REF )
		private _dialogRef: CUBDialogRef
	) {}

	ngOnInit() {
		if ( !this.dialogContext ) return;

		this._getUser();

		this.rowIndex
			= _.indexOf(
				this.dialogContext.itemIDs,
				this.dialogContext.itemID
			);

		this._recordService.itemName$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( itemName: string ) => {
			this.itemName = itemName;

			this._cdRef.markForCheck();
		} );

		if ( this.dialogContext.boardID ) {
			this._boardFieldService
			.get( this.dialogContext.boardID, true )
			.pipe(
				finalize( () => this._cdRef.markForCheck() ),
				untilCmpDestroyed( this )
			)
			.subscribe({
				next: ( fields: BoardField[] ) => {
					this.boardFields = fields;

					this._getRecordDetail();
				},
				error: ( error: IError ) => {
					if ( error.status === 400 ) this.dialogContext = undefined;
				},
			});
		} else {
			this.boardFields = this.dialogContext.fields;

			this._getRecordDetail();
		}

	}

	ngOnDestroy() {
		this.commentListObserver.disconnect();
		this.commentListResizeObserver.disconnect();
		this.commentListSubscription.unsubscribe();
		this.editorObserver.disconnect();
		this.editorResizeObserver.disconnect();
		this.editorSubscription.unsubscribe();
	}

	/**
	 * @return {void}
	 */
	protected onCommentsLoaded() {
		const commentListElement: HTMLElement
			= document.querySelector( '.cub-comment-list__wrapper' );
		const editorElement: HTMLElement
			= document.querySelector( '.cub-comment-box' );

		this.commentListHeight
			= commentListElement?.offsetHeight;
		this.editorHeight
			= editorElement?.offsetHeight;

		this._scrollEvent( commentListElement, editorElement );
		this._resizeEvent( commentListElement, editorElement );
	}

	/**
	 * @return {void}
	 */
	protected stickEditorTop( isSticky: boolean ) {
		this.isTopSticky = isSticky;

		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected close() {
		this._dialogRef.close();
	}

	/**
	 * @param {SafeUrl} url
	 * @return {void}
	 */
	protected onChangeQRUrl( url: SafeUrl ) {
		this._qrCodeDownloadLink = url;
	}

	/**
	 * @return {void}
	 */
	protected downloadQR() {
		fetch(
			( this._qrCodeDownloadLink as any )
			.changingThisBreaksApplicationSecurity
		)
		.then( ( response: Response ) => response.blob() )
		.then(( blob: Blob ) => {
			const link: HTMLAnchorElement
				= document.createElement( 'a' );

			link.href = URL.createObjectURL( blob );
			link.download = this.dialogContext.itemID;

			link.click();
			link.remove();
		});
	}

	/**
	 * @return {void}
	 */
	protected deleteItem(){
		this._cubConfirmService
		.open(
			`RECORD.DETAIL.MESSAGE.DELETE_ITEM_PERMANENTLY`,
			'RECORD.DETAIL.MESSAGE.DELETE_ITEM',
			{
				warning: true,
				buttonApply: {
					text: 'RECORD.DETAIL.LABEL.DELETE',
					type: 'destructive',
				},
				buttonDiscard: 'RECORD.DETAIL.LABEL.KEEP',
				translate: {
					name: this.itemName,
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this._recordService
				.bulkDelete(
					this.itemDetail.boardID,
					[ this.itemDetail.id ]
				)
				.pipe( untilCmpDestroyed( this ) )
				.subscribe({
					next: () => {
						this
						._recordService
						.detailItemChange$
						.next({
							type: 'delete',
							data: this.itemDetail.id,
						});

						this.close();
					},
				});

			},
		});
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	protected onChangeItem( index: number ) {
		this.rowIndex = index;
		this.dialogContext.itemID = this.dialogContext.itemIDs[ index ];

		this._getRecordDetail();
	}

	/**
	 * @return {Observable}
	 */
	protected getBoardAvailableUsers(): Observable<IUser[]> {
		return this._boardService
		.getBoardAvailableUsers( this.itemDetail.boardID );
	}

	/**
	 * @return {void}
	 */
	private _getRecordDetail() {
		this._recordService
		.getDetail( this.dialogContext.itemID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( item: RecordDetail ) => {
				this.itemDetail = item;

				const primaryColID: ULID
					= _.find( this.boardFields, { isPrimary: true } )?.id;

				this.itemName
					= this.itemDetail.cells[ primaryColID ];

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _getUser() {
		this._userService
		.getAvailableUser()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( users: IUser[] ) => {
				this.users = users;
				this.user
					= _.find(
						users,
						{ id: this._userService.storedUser.user.id }
					);

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {HTMLElement} commentListElement
	 * @param {HTMLElement} editorElement
	 * @return {void}
	 */
	private _resizeEvent(
		commentListElement: HTMLElement,
		editorElement: HTMLElement
	) {
		this.commentListResizeObserver
			= new ResizeObserver( ( entries: ResizeObserverEntry[] ) => {
				_.forEach( entries, ( entry: ResizeObserverEntry ) => {
					const height: number
						= entry.contentRect.height;

					if ( height ) {
						this.commentListHeight
							= height;
					}

					this._reloadScrollEvent();
				});
			});
		this.editorResizeObserver
			= new ResizeObserver( ( entries: ResizeObserverEntry[] ) => {
				_.forEach(
					entries,
					( entry: ResizeObserverEntry ) => {
						const height: number
							= entry.contentRect.height;
						if ( height ) {
							this.editorHeight
								= height;
						}

						this._reloadScrollEvent();
					}
				);
			});

		commentListElement
		&& this.commentListResizeObserver.observe( commentListElement );

		editorElement
		&& this.editorResizeObserver.observe( editorElement );
	}

	/**
	 * @param {HTMLElement} commentListElement
	 * @param {HTMLElement} editorElement
	 * @return {void}
	 */
	private _scrollEvent(
		commentListElement: HTMLElement,
		editorElement: HTMLElement
	) {
		const commentListSubject: Subject<IntersectionObserverEntry[]>
			= new Subject<IntersectionObserverEntry[]>();
		const editorSubject: Subject<IntersectionObserverEntry[]>
			= new Subject<IntersectionObserverEntry[]>();

		this.commentListSubscription?.unsubscribe();
		this.commentListSubscription
			= commentListSubject
			.pipe(
				debounceTime( 10 )
			).subscribe( ( entries: IntersectionObserverEntry[] ) => {
				_.forEach( entries, ( entry: IntersectionObserverEntry ) => {
					if ( entry.isIntersecting ) {
						this.isBottomSticky = false;
					}
				} );

				this._cdRef.markForCheck();
			});

		this.editorSubscription?.unsubscribe();
		this.editorSubscription
			= editorSubject
			.pipe(
				debounceTime( 10 )
			).subscribe( ( entries: IntersectionObserverEntry[] ) => {
				_.forEach( entries, ( entry: IntersectionObserverEntry ) => {
					if ( !entry.isIntersecting ) {
						this.isBottomSticky = true;
					};
				} );

				this._cdRef.markForCheck();
			});

		// Intersection Observer
		const commentListoptions: IntersectionObserverInit = {
			root: null,
			rootMargin: `
				0px
				0px
				-${ this.editorHeight + this.cardPaddingNumber }px
				0px`,
			threshold: 0,
		};
		const editorOptions: IntersectionObserverInit = {
			root: null,
			rootMargin: `
				0px
				0px
				-${ this.editorHeight + this.cardPaddingNumber }px
				0px`,
			threshold: 0,
		};

		this.commentListObserver
			= new IntersectionObserver(
				( entries: IntersectionObserverEntry[] ) => {
					commentListSubject.next( entries );
				},
				commentListoptions
			);
		this.editorObserver
			= new IntersectionObserver(
				( entries: IntersectionObserverEntry[] ) => {
					editorSubject.next( entries );
				},
				editorOptions
			);

		commentListElement
		&& this.commentListObserver.observe( commentListElement );

		editorElement
		&& this.editorObserver.observe( editorElement );
	}

	/**
	 * @return {void}
	 */
	private _reloadScrollEvent() {
		const commentListElement: HTMLElement
			= document.querySelector( '.cub-comment-list__wrapper' );
		const editorElement: HTMLElement
			= document.querySelector( '.cub-comment-list__editor' );

		commentListElement
		&& this.commentListObserver.unobserve( commentListElement );

		editorElement
		&& this.editorObserver.unobserve( editorElement );

		this._scrollEvent( commentListElement, editorElement );
	}

}
