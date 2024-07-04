import {
	AfterViewInit, Component, EventEmitter,
	Inject, Input, OnDestroy,
	Optional, Output, ViewChild,
	ViewEncapsulation, InjectionToken, HostBinding,
	ChangeDetectionStrategy
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { Delta, Editor } from 'quill';
type Delta = any;
type Editor = any;
// import { ContentChange } from 'ngx-quill';
import { Observable, isObservable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import _ from 'lodash';

import { REGEXP } from '@resources';

import { CoerceBoolean, CoerceNumber, Unsubscriber, untilCmpDestroyed } from '@core';

import { WGCIFilePickerEvent, WGCIFile } from '../../wgc-file-picker';
import { WGCSearchBoxComponent } from '../../wgc-search-box';
import { WGCMember } from '../../wgc-member-picker';

import { WGCIComment, WGCICommentContent, WGCIMention } from '../interfaces';

export interface WGCILinkPreview {
	link: string;
};

export interface WGCILinkService {
	preview: ( link: string ) => Observable<WGCILinkPreview>;
}

export const WGC_LINK_SERVICE: InjectionToken<WGCILinkService>
	= new InjectionToken<WGCILinkService>( 'WGC_LINK_SERVICE' );

@Unsubscriber()
@Component({
	selector		: 'wgc-comment-box',
	templateUrl		: './wgc-comment-box.pug',
	styleUrls		: [ './wgc-comment-box.scss' ],
	host			: { class: 'wgc-comment-box' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCCommentBoxComponent implements AfterViewInit, OnDestroy {

	@HostBinding( 'class.wgc-comment-box--sub' ) get classSub(): boolean { return this.subEditor; }

	// @ViewChild( WGCEditorComponent ) public wgcEditor: WGCEditorComponent;
	@ViewChild( WGCSearchBoxComponent ) public searchBox: WGCSearchBoxComponent;

	@Input() @CoerceBoolean() public autoFocusOn: boolean;
	@Input() @CoerceBoolean() public subEditor: boolean;
	@Input() @CoerceNumber() public maxFilePerComment: number;
	@Input() @CoerceNumber() public maxImagePerComment: number;
	@Input() public editingComment: WGCIComment;
	@Input() public mentionSource: Function;

	@Output() public commentSent: EventEmitter<WGCICommentContent> = new EventEmitter<WGCICommentContent>();
	@Output() public cancelled: EventEmitter<void> = new EventEmitter<void>();

	public readonly MEMBER_STATUS: typeof WGCMember.MEMBER_STATUS = WGCMember.MEMBER_STATUS;
	public readonly formats: string[] = [
		'bold', 'italic', 'strike',
		'underline', 'list', 'blockquote',
		'code-block', 'code', 'mention',
		'link',
	];
	public readonly quillModules: ObjectType = {
		table	: false,
		tableUI	: false,
		toolbar	: false,
		keyboard: {
			bindings: {
				handleEnter: { key: 13, handler: () => false },
			},
		},
		mention: {
			dataAttributes	: [ 'id', 'value', 'link' ],
			onOpen			: () => this.isNotSendOnKeyUpEnter = true,
			onClose			: () => this.enableKeyUpEnter(),
			source: async ( searchTerm: string = '', renderList: Function ) => {
				if ( !_.isFunction( this.mentionSource ) ) return;

				searchTerm = _.toLower( searchTerm ).trim();

				const mentionSource: Observable<WGCIMention[]> | WGCIMention[] = this.mentionSource( searchTerm );
				const matchedPeople: WGCIMention[] = isObservable( mentionSource )
					? await new Promise( ( resolve: any ) => {
						mentionSource
						.pipe( untilCmpDestroyed( this ) )
						.subscribe( resolve );
					} )
					: mentionSource;

				renderList( matchedPeople );
			},
		},
	};

	public linkForm: FormGroup;
	public isNotSendOnKeyUpEnter: boolean;
	public isTypographyFormating: boolean;
	public attachments: WGCIFile[] = [];
	public images: WGCIFile[] = [];
	public editor: Editor;
	public content: any;
	public people: WGCIMention[];
	public link: { label: string; link: string } = { label: '', link: '' };

	private _linkPreviews: WGCILinkPreview[] = [];
	private _sent$: Subject<void> = new Subject<void>();

	get linkFormDirty(): boolean {
		return this.linkForm.controls.label.dirty || this.linkForm.controls.link.dirty;
	}

	/**
	 * @constructor
	 * @param {ApiService} _linkService
	 * @param {FormBuilder} _fb
	 */
	constructor(
		@Optional() @Inject( WGC_LINK_SERVICE ) private _linkService: WGCILinkService,
		private _fb: FormBuilder
	) {
		this.linkForm = this._fb.group({
			label: [
				undefined,
				[ Validators.required, Validators.maxLength( 255 ) ],
			],
			link: [
				undefined,
				[ Validators.required, Validators.maxLength( 255 ), Validators.pattern( REGEXP.URL ) ],
			],
		});
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		_.delay( () => {
			// this.autoFocusOn && this.wgcEditor.focus();

			if ( !this.editingComment ) return;

			this._linkPreviews = _.clone( this.editingComment.linkPreviews ) as WGCILinkPreview[];
			this.attachments = _.clone( this.editingComment.attachments );
			this.images = _.clone( this.editingComment.images );

			if ( this.maxFilePerComment ) this.attachments = this.attachments.slice( 0, this.maxFilePerComment );
			if ( this.maxImagePerComment ) this.images = this.images.slice( 0, this.maxImagePerComment );

			this.editor.setContents( this.editingComment.content?.content );
			this.editor.focus();
			this.editor.setSelection( this.editor.getLength(), 0 );
		}, 100 );
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		// this.wgcEditor.blur();
	}

	/**
	 * @return {void}
	 */
	public enableKeyUpEnter() {
		_.delay( () => this.isNotSendOnKeyUpEnter = false, 400 );
	}

	/**
	 * @return {void}
	 */
	public sendComment() {
		const validation: boolean = this._validateContent();

		if ( !validation && !this.attachments.length && !this.images.length ) return;

		const content: WGCICommentContent = {};
		const mentions: string[] = [];
		const linkPreviews: ObjectType[] = [];

		if ( validation ) {
			content.content = _.pick( this.content, [ 'content', 'html', 'text' ] );

			_.forEach( this.content.content.ops, ( op: ObjectType ) => {
				if ( op.attributes?.link ) {
					const linkPreview: ObjectType = _.find( this._linkPreviews, { link: op.attributes?.link } );

					linkPreview && linkPreviews.push( linkPreview );
				}

				if ( typeof op.insert === 'string' || !op.insert.mention ) return;

				mentions.push( op.insert.mention.id );
			} );
		}

		if ( !validation ) content.content = { content: null, html: null, text: null };

		content.mentions = mentions;
		content.linkPreviews = linkPreviews;
		content.attachments = this.attachments;
		content.images = this.images;

		this._linkPreviews = [];
		this.attachments = [];
		this.images = [];

		// this.wgcEditor.clear();
		this._sent$.next();
		this.commentSent.emit( content );
	}

	/**
	 * @return {void}
	 */
	public cancel() {
		this.cancelled.emit();
	}

	/**
	 * @param {string} searchStr
	 * @return {void}
	 */
	public getPeople( searchStr: string = '' ) {
		if ( !_.isFunction( this.mentionSource ) ) return;

		const mentionSource: Observable<WGCIMention[]> | WGCIMention[] = this.mentionSource( searchStr );

		if ( isObservable( mentionSource ) ) {
			mentionSource
			.pipe( untilCmpDestroyed( this ) )
			.subscribe( ( data: WGCIMention[] ) => this.people = data );
			return;
		}

		this.people = mentionSource;
	}

	/**
	 * @param {ObjectType} person
	 * @return {void}
	 */
	public addMention( _person: ObjectType ) {
		// this.wgcEditor?.insertMention({ ...person, value: `<a href="${person.link}" target="_blank">${person.value}` });
	}

	/**
	 * @return { void }
	 */
	public insertLink() {
		// this.wgcEditor?.insertLink( this.link.label, this.link.link );
		this.linkForm.markAsPristine();
		this.linkForm.markAsUntouched();

		this._linkService
		.preview( this.link.link )
		.pipe(
			takeUntil( this._sent$ ),
			finalize( () => this.link = { label: '', link: '' } ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( result: WGCILinkPreview ) => {
			if ( !result ) return;

			result.link = this.link.link;

			this._linkPreviews.push( result );
		} );
	}

	/**
	 * @param {WGCIFilePickerEvent} event
	 * @return {void}
	 */
	public onFilePicked( event: WGCIFilePickerEvent ) {
		this.attachments.unshift( ...event.files as WGCIFile[] );

		if ( !this.maxFilePerComment ) return;

		this.attachments = this.attachments.slice( 0, this.maxFilePerComment );
	}

	/**
	 * @param {WGCIFilePickerEvent} event
	 * @return {void}
	 */
	public onImagePicked( event: WGCIFilePickerEvent ) {
		this.images.unshift( ...event.files as WGCIFile[] );

		if ( !this.maxImagePerComment ) return;

		this.images = this.images.slice( 0, this.maxImagePerComment );
	}

	/**
	 * @return {boolean}
	 */
	private _validateContent(): boolean {
		const content: Delta = this.editor.getContents();

		if ( !content?.ops ) return false;

		let i: number;

		for ( i = 0; i < content.ops.length; i++ ) {
			if ( !content.ops[ i ] || _.isObject( content.ops[ i ].insert ) || content.ops[ i ].attributes ) break;

			let insertedString: string = content.ops[ i ].insert.toString();
			let firstChar: string = insertedString.charAt( 0 );

			while ( firstChar === ' ' || firstChar === '\n' ) {
				insertedString = insertedString.substring( 1 );

				firstChar = insertedString.charAt( 0 );
			}

			content.ops[ i ].insert = insertedString;

			if ( insertedString.length ) break;
		}

		for ( i = content.ops.length - 1; i > -1; i-- ) {
			if ( !content.ops[ i ] || _.isObject( content.ops[ i ].insert ) || content.ops[ i ].attributes ) break;

			let insertedString: string = content.ops[ i ].insert.toString();
			let lastChar: string = insertedString.charAt( insertedString.length - 1 );

			while ( lastChar === ' ' || lastChar === '\n' ) {
				insertedString = insertedString.substring( 0, insertedString.length - 1 );

				lastChar = insertedString.charAt( insertedString.length - 1 );
			}

			content.ops[ i ].insert = insertedString;

			if ( insertedString.length ) break;
		}

		content.ops = _.filter( content.ops, ( op: ObjectType ) => op && ( _.isObject( op.insert ) || op.insert.length ) );

		this.editor.setContents( content, 'user' );

		return !!content.ops.length;
	}

}
