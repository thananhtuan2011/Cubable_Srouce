import {
	Component, TemplateRef, ElementRef,
	ViewChild, Input, ContentChildren,
	QueryList, ViewEncapsulation, ChangeDetectorRef,
	ContentChild, ChangeDetectionStrategy, Output,
	EventEmitter, NgZone
} from '@angular/core';
import { startWith, takeUntil } from 'rxjs/operators';
import _ from 'lodash';

import {
	DetectScrollDirective, Unsubscriber, DefaultValue,
	CoerceBoolean, CoerceCssPixel, Debounce,
	untilCmpDestroyed
} from '@core';
import { WGCScrollBarDirective, IWGCScrollBarMode } from '../../wgc-scroll-bar';
import { WGCMenuButtonCloseDirective } from '../menu-button-close/wgc-menu-button-close.directive';
import { WGCMenuItemComponent } from '../menu-item/wgc-menu-item.component';
import { WGCMenuHeaderComponent } from '../menu-header/wgc-menu-header.component';
import { WGCMenuContentComponent } from '../menu-content/wgc-menu-content.component';
import { WGCMenuFooterComponent } from '../menu-footer/wgc-menu-footer.component';

export type WGCIMenuPosition = 'above' | 'below' | 'before' | 'after';
export type WGCIMenuDirection = 'start' | 'end' | 'center';

@Unsubscriber()
@Component({
	selector		: 'wgc-menu',
	templateUrl		: './wgc-menu.pug',
	styleUrls		: [ './wgc-menu.scss' ],
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCMenuComponent {

	@ViewChild( TemplateRef, { static: true } ) public templateRef: TemplateRef<any>;

	@ViewChild( DetectScrollDirective )
	set _scroller( scroller: DetectScrollDirective ) { this.scroller = scroller; }
	@ViewChild( WGCScrollBarDirective )
	set _scrollBar( scrollBar: WGCScrollBarDirective ) { this.scrollBar = scrollBar; }

	@ContentChildren( WGCMenuButtonCloseDirective, { descendants: true } )
	public menuButtonCloseList: QueryList<WGCMenuButtonCloseDirective>;
	@ContentChildren( WGCMenuItemComponent, { descendants: true } ) public menuItems: QueryList<WGCMenuItemComponent>;
	@ContentChild( WGCMenuHeaderComponent ) public menuHeader: WGCMenuHeaderComponent;
	@ContentChild( WGCMenuContentComponent ) public menuContent: WGCMenuContentComponent;
	@ContentChild( WGCMenuFooterComponent ) public menuFooter: WGCMenuFooterComponent;

	@Input() public title: string;
	@Input() public backdropClass: string;
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public minWidth: string;
	@Input() @CoerceCssPixel() public maxWidth: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @CoerceCssPixel() public minHeight: string;
	@Input() @CoerceCssPixel() public maxHeight: string;
	@Input() @DefaultValue() @CoerceBoolean() public hasScrollBar: boolean = true;
	@Input() @CoerceBoolean() public hasBackdrop: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public hasArrow: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public hasButtonClose: boolean = true;
	@Input() @DefaultValue() @CoerceBoolean() public closeOnClickOutside: boolean = true;
	@Input() public scrollBarMode: IWGCScrollBarMode;

	@Output() public opened: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public closed: EventEmitter<Event> = new EventEmitter<Event>();
	@Output() public backdropPress: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
	@Output() public loadMore: EventEmitter<boolean> = new EventEmitter<boolean>();

	public scroller: DetectScrollDirective;
	public scrollBar: WGCScrollBarDirective;
	public isRefreshing: boolean;
	public isOpened: boolean;
	public isAllItemsActivated: boolean;
	public data: ObjectType;
	public classList: ObjectType<boolean> = {};
	public close: ( event?: Event ) => void;
	public reopen: () => void;

	private _previousPanelClass: string;

	@Input( 'class' )
	set panelClass( classes: string ) {
		const previousPanelClass: string = this._previousPanelClass;

		previousPanelClass?.split( ' ' ).forEach( ( className: string ) => {
			this.classList[ className ] = false;
		} );

		this._previousPanelClass = classes;

		classes?.split( ' ' ).forEach( ( className: string ) => {
			this.classList[ className ] = true;
		} );

		this.elementRef.nativeElement.className = '';
	}

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {NgZone} _ngZone
	 */
	constructor( public elementRef: ElementRef, private _cdRef: ChangeDetectorRef, private _ngZone: NgZone ) {}

	/**
	 * @param {ObjectType} data
	 * @return {void}
	 */
	public markAsOpened( data: ObjectType ) {
		this.menuButtonCloseList
		.changes
		.pipe(
			startWith( this.menuButtonCloseList ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<WGCMenuItemComponent> ) => {
			this.scrollBar?.reset();

			_.forEach( items.toArray(), ( item: WGCMenuButtonCloseDirective ) => {
				item.clicked$
				.pipe(
					takeUntil( this.menuButtonCloseList.changes ),
					untilCmpDestroyed( this )
				)
				// .subscribe( ( ev: MouseEvent ) => ev.detail && this.close( ev ) );
				.subscribe( this.close.bind( this ) );
			} );
		} );

		this.menuItems
		.changes
		.pipe(
			startWith( this.menuItems ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<WGCMenuItemComponent> ) => {
			this.scrollBar?.reset();

			let isScrolled: boolean;

			_.forEach( items.toArray(), ( item: WGCMenuItemComponent ) => {
				item
				.clicked$
				.pipe(
					takeUntil( this.menuItems.changes ),
					untilCmpDestroyed( this )
				)
				// .subscribe( ( ev: MouseEvent ) => ev.detail && this.close( ev ) );
				.subscribe( this.close.bind( this ) );

				item
				.activeChange
				.pipe(
					takeUntil( this.menuItems.changes ),
					untilCmpDestroyed( this )
				)
				.subscribe( this._checkAllItemsSelected.bind( this ) );

				if ( isScrolled ) return;

				isScrolled = item.active;

				isScrolled && setTimeout( () => this.scrollToElement( item ) );
			} );

			this._checkAllItemsSelected();
		} );

		this.isOpened = true;
		this.data = data;

		this.opened.emit();
		this.markForCheck();
		this.detach();
	}

	/**
	 * @return {void}
	 */
	public markAsClosed() {
		this.isOpened = false;

		this.closed.emit();
		this.markForCheck();
	}

	/**
	 * @param {WGCIMenuPosition} position
	 * @param {WGCIMenuDirection} direction
	 * @return {void}
	 */
	public setPositionClasses( position: WGCIMenuPosition, direction: WGCIMenuDirection ) {
		this._ngZone.runGuarded( () => {
			this.classList[ 'wgc-menu--above' ] = position === 'above';
			this.classList[ 'wgc-menu--below' ] = position === 'below';
			this.classList[ 'wgc-menu--before' ] = position === 'before';
			this.classList[ 'wgc-menu--after' ] = position === 'after';
			this.classList[ 'wgc-menu--dir-start' ] = direction === 'start';
			this.classList[ 'wgc-menu--dir-end' ] = direction === 'end';
			this.classList[ 'wgc-menu--no-arrow' ] = !this.hasArrow;
		} );
	}

	/**
	 * @return {void}
	 */
	public reattach() {
		this._cdRef.reattach();
	}

	/**
	 * @return {void}
	 */
	public detach() {
		this._cdRef.detach();
	}

	/**
	 * @return {void}
	 */
	public markForCheck() {
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public detectChanges() {
		this._cdRef.detectChanges();
	}

	/**
	 * @param {WGCMenuItemComponent} item
	 * @return {void}
	 */
	public scrollToElement( item: WGCMenuItemComponent ) {
		this.hasScrollBar
			&& !this.scrollBar?.scrollTop
			&& item.elementRef.nativeElement.scrollIntoView({ block: 'center', inline: 'nearest' });
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public chooseItem( event?: Event ) {
		const focusingItem: WGCMenuItemComponent = _.find( this.menuItems?.toArray(), { focusing: true } );

		if ( !focusingItem ) return;

		focusingItem.click( event );
		focusingItem.autoClose && !focusingItem.disabled && this.close();
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public focusNextItem( event?: Event ) {
		const list: WGCMenuItemComponent[] = this.menuItems?.toArray();
		const focusingIndex: number = _.findLastIndex( list, ( item: WGCMenuItemComponent ) => item.focusing );
		const focusIndex: number = focusingIndex + 1;

		focusIndex < list.length && this._focusItem( focusingIndex, focusingIndex + 1, event );
	}

	/**
	 * @param {Event=} event
	 * @return {void}
	 */
	public focusPreviousItem( event?: Event ) {
		const list: WGCMenuItemComponent[] = this.menuItems?.toArray();
		const focusingIndex: number = _.findLastIndex( list, ( item: WGCMenuItemComponent ) => item.focusing );
		const focusIndex: number = focusingIndex - 1;

		focusIndex >= 0 && this._focusItem( focusingIndex, focusIndex, event );
	}

	/**
	 * @param {number} focusingIndex
	 * @param {number} focusIndex
	 * @param {Event=} event
	 * @return {void}
	 */
	private _focusItem( focusingIndex: number, focusIndex: number, event?: Event ) {
		const items: WGCMenuItemComponent[] = ( this.menuItems as ObjectType )?._results;
		const currentFocusedItem: WGCMenuItemComponent = items[ focusingIndex ];
		const focusItem: WGCMenuItemComponent = items[ focusIndex ];

		if ( currentFocusedItem ) currentFocusedItem.focusing = false;

		focusItem.focusing = true;

		focusItem.elementRef.nativeElement.scrollIntoView( false );
		focusItem.focus( event );
		this.markForCheck();
	}

	/**
	 * @return {void}
	 */
	@Debounce()
	private _checkAllItemsSelected() {
		const menuItems: WGCMenuItemComponent[] = this.menuItems?.toArray();
		let i: number = 0;
		let isAllItemsActivated: boolean = true;

		while ( i < menuItems?.length ) {
			isAllItemsActivated = menuItems[ i++ ].active;

			if ( !isAllItemsActivated ) break;
		}

		this.isAllItemsActivated = isAllItemsActivated;

		this.markForCheck();
	}

}
