import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input,
	OnDestroy,
	Output,
	OnChanges,
	ViewChild,
	ViewContainerRef,
	ViewEncapsulation,
	SimpleChanges,
	inject
} from '@angular/core';
import {
	QuillOptions
} from 'quill/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';
import {
	FormControl,
	Validators
} from '@angular/forms';
import {
	forkJoin,
	Observable
} from 'rxjs';

import {
	CoerceBoolean,
	untilCmpDestroyed
} from '@core';

import {
	REGEX
} from '@cub/filter/dist/constants';

import {
	IUser
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	ITeam
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	TeamService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/services';

import {
	CUBFile,
	CUBFilePickerPickedEvent,
	CUBFilePickerService,
	CUBFilePreviewerService
} from '../../file-picker';
import {
	CUBPopupComponent,
	CUBPopupRef
} from '../../popup';
import {
	CUBMenuComponent,
	CUBMenuService
} from '../../menu';
import MenntionModule, { MentionKeyboard } from '../../editor/basic-editor/modules/mention/module';
import {
	CUBBasicEditorComponent,
	CUBBasicEditorContent
} from '../../editor';
import MentionBlot from '../../editor/basic-editor/modules/mention/blot';

import {
	CUBComment,
	CUBCommentContent
} from '../interfaces';
import { CUBEmojiData } from '../../emoji-picker';
import { CUBConfirmService } from '../../confirm';

@Component({
	selector: 'cub-comment-box',
	templateUrl: './comment-box.pug',
	styleUrls: [ './comment-box.scss' ],
	host: { class: 'cub-comment-box' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBCommentBoxComponent
implements OnChanges, AfterViewInit, OnDestroy {

	@HostBinding( 'class.cub-comment-box--no-border' )
	get classNoBorder(): boolean { return this.isBorderHidden; }

	@ViewChild ( 'fileListContainer' )
	public _fileListContainer: ElementRef<HTMLElement>;
	@ViewChild( 'linkPopup' )
	public linkPopup: CUBPopupComponent;
	@ViewChild( 'mentionMenu' )
	public mentionMenu: CUBMenuComponent;
	@ViewChild( 'emojiMenu' )
	public emojiMenu: CUBMenuComponent;
	@ViewChild( 'editor' )
	public editor: CUBBasicEditorComponent;

	@Input() @CoerceBoolean()
	public autoFocusOn: boolean;
	@Input() @CoerceBoolean()
	public isBorderHidden: boolean;
	@Input() public boardID: ULID;
	@Input() public comment: CUBComment;
	@Input() public replyOfComment: CUBComment;
	@Input() public boardAvailableUsersFunc: Function;

	@Output() public commentSent: EventEmitter<CUBCommentContent>
		= new EventEmitter<CUBCommentContent>();
	@Output() public cancelled: EventEmitter<void>
		= new EventEmitter<void>();

	protected readonly labelControl: FormControl
		= new FormControl( undefined );
	protected readonly linkControl: FormControl
		= new FormControl(
			undefined,
			[ Validators.pattern( REGEX.WEBSITE ) ]
		);

	protected isSending: boolean;
	protected isTextFormatting: boolean;
	protected canScrollingLeft: boolean;
	protected canScrollingRight: boolean;
	protected isEnterToSubmit: boolean = true;
	protected label: string;
	protected link: string;
	protected keySearch: string;
	protected editorWidth: number;
	protected content: CUBBasicEditorContent;
	protected options: QuillOptions;
	protected files: CUBFile[];
	protected users: IUser[];
	protected boardAvailableUser: IUser[];
	protected teams: ITeam[];
	protected mentionIDs: ULID[];

	private readonly _filePickerService: CUBFilePickerService
		= inject( CUBFilePickerService );
	private readonly _filePreviewerService: CUBFilePreviewerService
		= inject( CUBFilePreviewerService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _teamService: TeamService
		= inject( TeamService );
	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );
	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );
	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );

	private _filePickerPopupRef: CUBPopupRef;
	private _filePreviewerPopupRef: CUBPopupRef;
	private _resizeObserver: ResizeObserver;
	private _editorResizeObserver: ResizeObserver;

	get isFilePopupOpened(): boolean {
		return this._filePickerPopupRef?.isOpened
			|| this._filePreviewerPopupRef?.isOpened;
	}

	get isSendButtonDisabled(): boolean {
		return this.content?.text?.length > 2000
			|| !( this.content?.text?.length
				|| this.files?.length );
	}

	get isLinkFormInvalid(): boolean {
		return ( !this.labelControl.dirty && !this.linkControl.dirty )
		|| this.labelControl.invalid
		|| this.linkControl.invalid;
	}

	constructor() {
		this.options
			= {
				modules: {
					mention: {
						onQueryStart: (
							_m: MenntionModule,
							query: string
						) => {
							this.keySearch = query;

							if( this.mentionMenu?.isOpened ) return;

							this.openMention();
						},
						onQueryEnd: (
							_m: MenntionModule
						) => {
							this.mentionMenu?.close();
						},
						onMentionDetached: (
							_m: MenntionModule,
							blot: MentionBlot
						) => {
							const id: ULID
								= ( blot.domNode as any )
								.attributes['data-id']
								.value;

							_.remove(
								this.mentionIDs,
								( _id: ULID ) => id === _id
							);
						},
						onKeyboardEvents: (
							module: MenntionModule,
							key: MentionKeyboard
						): boolean => {
							const bool: boolean = true;

							switch ( key ) {
								// case MentionKeyboard.ArrowUp:
								// 	bool = false;
								// 	this.trigger.menu.pointPreviousItem();
								// 	break;
								// case MentionKeyboard.ArrowDown:
								// 	bool = false;
								// 	this.trigger.menu.pointNextItem();
								// 	break;
								// case MentionKeyboard.Enter:
								// 	bool = false;
								// 	this.trigger.menu.choosePointingItem();
								// 	break;
								case MentionKeyboard.ArrowLeft:
								case MentionKeyboard.ArrowRight:
								case MentionKeyboard.Escape:
									module.exit();
									break;
							}

							return bool;
						},
					},
				},
			};

		this.content
			= {
				delta: [],
				html: '',
				text: '',
			};
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.comment ) {
			this.files
				= this.comment?.files
					|| [];
			this.mentionIDs
				= this.comment?.mentions
					|| [];

			if ( this.comment?.metadata ) {
				this.content
					= this.comment?.metadata;
			}
		}
	}

	ngAfterViewInit() {
		_.delay(
			() => {
				this._loadCommentBoxData();

				this._checkScrollingAttachment();

				this.editorWidth
					= this._elementRef.nativeElement
					.querySelector( 'cub-basic-editor' )
					.offsetWidth;

				this._editorResizeEvent();
			},
			100
		);
	}

	ngOnDestroy() {
		this
		._resizeObserver
		?.disconnect();

		this
		._editorResizeObserver
		?.disconnect();
	}

	/**
	 * @return {void}
	 */
	public focus( index?: number ) {
		if ( index < 0 ) {
			index = null;
		}

		this.editor.insertText( '', index, 'user' );
	}

	/**
	 * @return {void}
	 */
	protected onLinkPopupClosed() {
		this.label = null;
		this.link = null;
		this.labelControl.markAsPristine();
		this.labelControl.markAsUntouched();
		this.linkControl.markAsPristine();
		this.linkControl.markAsUntouched();
	}

	/**
	 * @return {void}
	 */
	protected switchFormatting() {
		this.isTextFormatting
			= !this.isTextFormatting;

		this.focus();
	}

	/**
	 * @return {void}
	 */
	protected send() {
		this.mentionMenu?.close();
		this.emojiMenu?.close();
		this.linkPopup?.close();

		if ( this.isSendButtonDisabled ) return;

		const userIDs: ULID[]
			= _.map( this.boardAvailableUser, 'id' );
		const isPermissionOnBoard: boolean
			= _.every(
				this.mentionIDs,
				( id: ULID ) => _.includes( userIDs, id ) );

		if (
			( this.users?.length
			=== this.boardAvailableUser?.length )
			|| isPermissionOnBoard
		) {
			this._sendComment();

			return;
		}

		this.editor.blur();

		this._confirmService
		.open(
			'CUB.MESSAGE.SEND_NOTIFICATION_CONFIRM',
			'CUB.LABEL.SEND_NOTIFICATION',
			{
				buttonDiscard	: 'CUB.LABEL.CANCEL',
				buttonApply: {
					text: 'CUB.LABEL.CONFIRM',
					type: 'primary',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) {
					this.editor.focus();

					return;
				};

				this._sendComment();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected insertLink() {
		this._formatLink();

		this.editor.insertLink(
			{ text: this.label, url: this.link }
		);

		this.linkPopup.close();
	}

	/**
	 * @param {number=} idx
	 * @return {void}
	 */
	protected previewFile(
		idx: number
	) {
		if ( this.isFilePopupOpened ) {
			return;
		}

		this._filePreviewerPopupRef
			= this
			._filePreviewerService
			.preview(
				{
					files:
						_.cloneDeep( this.files ),
					removable:
						true,
					previewingIndex:
						idx,
					onDone:
						this
						._saveFilesChange
						.bind( this ),
				}
			);
	}

	/**
	 * @param {CUBFile} file
	 * @return {void}
	 */
	protected removeFile(
		file: CUBFile
	) {
		_.pull(
			this.files,
			file
		);

		this._checkScrollingAttachment();
	}

	/**
	 * @return {void}
	 */
	protected pickFile() {
		if ( this.isFilePopupOpened ) {
			return;
		}

		this._filePickerPopupRef
			= this
			._filePickerService
			.pick(
				{
					onPicked:
						this
						._onFilePicked
						.bind( this ),
				}
			);

		this.linkPopup?.close();
		this.mentionMenu?.close();
		this.emojiMenu?.close();
	}

	/**
	 * @return {void}
	 */
	protected cancel() {
		this.cancelled.emit();
	}

	/**
	 * @return {void}
	 */
	protected nextScrolling() {
		const scrollingElement: Element
			= document.querySelector(
				'.cub-comment-box__attachment__file-list'
			);

		scrollingElement
		.scrollBy({
			left: 100,
			behavior: 'smooth',
		});

		this._checkScrollingAttachment(
			0,
			10
		);
	}

	/**
	 * @return {void}
	 */
	protected onMentionMenuClosed() {
		this.keySearch = null;
	}

	/**
	 * @return {void}
	 */
	protected onMentionMenuOpened() {
		forkJoin([
			this._userService.getAvailableUser(),
			this._teamService.getAvailableTeams(),
			( this.boardAvailableUsersFunc() as Observable<IUser[]> ),
		])
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(
			(
				[ users, teams, boardAvailableUser ]:
				[ IUser[], ITeam[], IUser[] ]
			) => {
				this.users
					= users;
				this.teams
					= teams;
				this.boardAvailableUser
					= boardAvailableUser;

				this._cdRef.markForCheck();
			}
		);
	}

	/**
	 * @return {void}
	 */
	protected previousScrolling() {
		const scrollingElement: Element
			= document.querySelector(
				'.cub-comment-box__attachment__file-list'
			);

		scrollingElement
		.scrollBy({
			left: -100,
			behavior: 'smooth',
		});

		this._checkScrollingAttachment(
			10
		);
	}

	/**
	 * @param {CUBTMember} users
	 * @return {void}
	 */
	protected addedUserIDs( _ids: ULID[] ) {
		this.mentionIDs ||= [];
		this.mentionIDs.push( _ids[ 0 ] );

		this.editor.insertMention({
			id: _ids[ 0 ],
			name: _.find( this.users, { id: _ids[ 0 ] } ).name,
		});

		this.mentionMenu?.close();
	}

	/**
	 * @param {ULID[]} ids
	 * @return {void}
	 */
	protected addedTeamIDs( _ids: ULID[] ) {
		this.mentionIDs ||= [];
		this.mentionIDs.push( _ids[ 0 ] );

		this.editor.insertMention({
			id: _ids[ 0 ],
			name: _.find( this.teams, { id: _ids[ 0 ] } ).name,
		});

		this.mentionMenu?.close();
	}

	/**
	 * @return {void}
	 */
	protected onEmojiMenuOpened() {
		this.linkPopup?.close();
		this.mentionMenu?.close();

		if ( this.emojiMenu?.isOpened ) {
			return;
		}
	}

	/**
	 * @return {void}
	 */
	protected onLinkPopupOpened() {
		this.emojiMenu?.close();
		this.mentionMenu?.close();

		if ( this.linkPopup?.isOpened ) {
			return;
		}
	}

	/**
	 * @return {void}
	 */
	protected onContentChange() {
		const content: CUBBasicEditorContent
			= this.editor.parse();

		this.content.delta
			= content.delta;
		this.content.html
			= content.html;
		this.content.text
			= content.text;

		this.isEnterToSubmit
			= this.editor.formatting.list !== 'bullet'
			&& this.editor.formatting.list !== 'ordered'
			&& !this.editor.formatting.blockquote
			&& !this.editor.formatting.code
			&& !this.editor.formatting.codeBlock;
	}

	/**
	 * @return {void}
	 */
	protected onMentionClick() {
		this.editor.insertText(
			'@',
			undefined,
			'user'
		);

		this.focus();
	}

	/**
	 * @return {void}
	 */
	protected pickEmoji( emoji: CUBEmojiData ) {
		this.editor.insertText( emoji?.native );
	}

	/**
	 * @return {void}
	 */
	protected openMention() {
		this.emojiMenu?.close();
		this.linkPopup?.close();

		if ( this.mentionMenu?.isOpened ) {
			return;
		}

		this._menuService
		.open(
			this._elementRef.nativeElement,
			this.mentionMenu,
			undefined,
			{
				viewContainerRef: this._vcRef,
				offsetX: -16,
				autoFocus: false,
			}
		);
	}

	/**
	 * @param {CUBFilePickerPickedEvent} e
	 * @return {void}
	 */
	private _onFilePicked(
		e: CUBFilePickerPickedEvent
	) {
		this.files ||= [];

		this.files.push( ...e.files );

		this._cdRef.markForCheck();

		if ( !this.files?.length ) {
			this.canScrollingLeft
				= this.canScrollingRight
				= false;
			return;
		}

		this._checkScrollingAttachment();
		this._followResize();
	}

	/**
	 * @param {CUBFile=} files
	 * @return {void}
	 */
	private _saveFilesChange(
		files: CUBFile[]
	) {
		this.files = files;

		this._cdRef.markForCheck();

		if ( !this.files?.length ) {
			this.canScrollingLeft
				= this.canScrollingRight
				= false;
			return;
		}

		this._checkScrollingAttachment();
	}

	/**
	 * @param {number=} offsetLeft
	 * @param {number=} offsetRight
	 * @return {void}
	 */
	private _checkScrollingAttachment(
		offsetLeft: number = 0,
		offsetRight: number = 0
	) {
		setTimeout(
			() => {
				const parentElement: Element
					= document.querySelector(
						'.cub-comment-box__attachment__file-list'
					);

				if ( !parentElement ) return;

				const children: NodeListOf<Element>
					= parentElement.querySelectorAll(
						'.cub-comment-box__attachment__file-list__wrapper'
					);
				const lastChild: Element
					= children[ children.length - 1 ];
				const firstChild: Element
					= children[ 0 ];
				const parentRect: DOMRect
					= parentElement.getBoundingClientRect();
				const lastChildRect: DOMRect
					= lastChild.getBoundingClientRect();
				const firstChildRect: DOMRect
					= firstChild.getBoundingClientRect();

				this.canScrollingRight
					= lastChildRect.right - offsetRight > parentRect.right;
				this.canScrollingLeft
					= firstChildRect.left + offsetLeft < parentRect.left;

				this._cdRef.markForCheck();
			},
			100
		);
	}

	/**
	 * @return {void}
	 */
	private _editorResizeEvent() {
		this._editorResizeObserver
			= new ResizeObserver(
				( entries: ResizeObserverEntry[] ) => {
					_.forEach(
						entries,
						( entry: ResizeObserverEntry ) => {
							const width: number
								= entry.contentRect.width;

							if ( width ) {
								this.editorWidth
									= width;
							}
						}
					);
				}
			);

		const editorRef: Element
			= this._elementRef.nativeElement
			.querySelector( 'quill-editor' );

		if ( !editorRef ) return;

		this._editorResizeObserver
		.observe( editorRef );
	}

	/**
	 * @return {void}
	 */
	private _followResize() {
		if (
			!this.files?.length
			|| this._resizeObserver
		) return;

		this._resizeObserver
			= new ResizeObserver(
				() => this._checkScrollingAttachment()
			);

		setTimeout(
			() => {
				this
				._resizeObserver
				.observe(
					this
					._fileListContainer
					.nativeElement
				);
			}, 100
		);
	}

	/**
	 * @param {string} link
	 * @return {void}
	 */
	private _formatLink( link: string = this.link ) {
		if ( !this.label ) {
			this.label
				= link;
		}

		if ( !/^http(s)?/.test( link ) ) {
			link
				= 'https://' + link;
		}

		this.link
			= link;
	}

	/**
	 * @return {void}
	 */
	private _loadCommentBoxData() {
		if ( !this.autoFocusOn ) return;

		this.focus( this.content?.text?.length );

		if ( this.replyOfComment ) {
			this.editor.insertText(
				'@',
				undefined,
				'user'
			);

			this.editor.insertMention({
				id: this.replyOfComment.user.id,
				name: this.replyOfComment.user.name,
			});
		}
	}

	private _sendComment() {
		const content: CUBCommentContent
			= {};

		content.mentions
			= this.mentionIDs;
		content.message
			= this.content?.text;
		content.files
			= this.files;
		content.metadata
			= _.cloneDeep( this.content );

		this.content
			= {
				delta: [],
				html: '',
				text: '',
			};
		this.files
			= [];
		this.mentionIDs
			= [];

		this.editor.clear();
		this.editor.focus();
		this.commentSent.emit( content );
	}
}
