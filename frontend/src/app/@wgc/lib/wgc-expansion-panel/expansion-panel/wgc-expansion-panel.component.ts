import {
	Component, ViewEncapsulation, Input,
	Output, EventEmitter, ContentChildren,
	ElementRef, SimpleChanges, OnChanges,
	ChangeDetectorRef, QueryList, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';

import { DefaultValue, CoerceBoolean, CoerceCssPixel, CoerceNumber } from '@core';

import { WGCExpansionPanelHeaderComponent } from '../expansion-panel-header/wgc-expansion-panel-header.component';
import { WGCExpansionPanelContentComponent } from '../expansion-panel-content/wgc-expansion-panel-content.component';

export type WGCIExpansionPanelTheme = 'default' | 'background';

@Component({
	selector		: 'wgc-expansion-panel',
	templateUrl		: './wgc-expansion-panel.pug',
	styleUrls		: [ './wgc-expansion-panel.scss' ],
	host			: { class: 'wgc-expansion-panel' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCExpansionPanelComponent implements OnChanges {

	@HostBinding( 'style.--expansion-panel-header-color' )
	get styleHeaderColor(): string { return this.expansionPanelHeader?.color; }

	@HostBinding( 'style.--expansion-panel-header-text-color' )
	get styleHeaderTextColor(): string { return this.expansionPanelHeader?.textColor; }

	@HostBinding( 'style.--expansion-panel-header-text-font-size' )
	get styleHeaderFontSize(): string { return this.expansionPanelHeader?.textFontSize; }

	@HostBinding( 'style.--expansion-panel-header-width' )
	get styleHeaderWidth(): string { return this.expansionPanelHeader?.width; }

	@HostBinding( 'style.--expansion-panel-content-padding-top' )
	get styleContentPaddingTop(): string { return this.contentPaddingTop || this.contentPaddingVertical; }

	@HostBinding( 'style.--expansion-panel-content-padding-bottom' )
	get styleContentPaddingBottom(): string { return this.contentPaddingBottom || this.contentPaddingVertical; }

	@HostBinding( 'style.--expansion-panel-content-padding-left' )
	get styleContentPaddingLeft(): string { return this.contentPaddingLeft || this.contentPaddingHorizontal; }

	@HostBinding( 'style.--expansion-panel-content-padding-right' )
	get styleContentPaddingRight(): string { return this.contentPaddingRight || this.contentPaddingHorizontal; }

	@HostBinding( 'class.wgc-expansion-panel--expanded' )
	get classExpanded(): boolean { return this.expanded; }

	@HostBinding( 'class.wgc-expansion-panel--draggable' )
	get classDraggable(): boolean { return this.draggable; }

	@HostBinding( 'class.wgc-expansion-panel--has-scroll-bar' )
	get classHasScrollBar(): boolean { return this.hasScrollBar; }

	@HostBinding( 'class.wgc-expansion-panel--theme-background' )
	get classThemeBackground(): boolean { return this.theme === 'background'; }

	@ContentChildren( WGCExpansionPanelHeaderComponent, { descendants: false } )
	public expansionPanelHeaderList: QueryList<WGCExpansionPanelHeaderComponent>;
	@ContentChildren( WGCExpansionPanelContentComponent, { descendants: false } )
	public expansionPanelContentList: QueryList<WGCExpansionPanelContentComponent>;

	@Input( 'cdkDrag' ) public cdkDrag: CdkDrag;
	@Input( 'cdkDragDisabled' ) public cdkDragDisabled: boolean;
	@Input() @DefaultValue() @CoerceNumber() public renderDelay: number = 0;
	@Input() @CoerceBoolean() public expanded: boolean;
	@Input() @CoerceBoolean() public draggable: boolean;
	@Input() @CoerceBoolean() public hasScrollBar: boolean;
	@Input() @CoerceCssPixel() public contentPaddingVertical: string;
	@Input() @CoerceCssPixel() public contentPaddingHorizontal: string;
	@Input() @CoerceCssPixel() public contentPaddingTop: string;
	@Input() @CoerceCssPixel() public contentPaddingBottom: string;
	@Input() @CoerceCssPixel() public contentPaddingLeft: string;
	@Input() @CoerceCssPixel() public contentPaddingRight: string;
	@Input() @DefaultValue() public theme: WGCIExpansionPanelTheme = 'default';

	@Output() public expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	public isRendered: boolean;

	get expansionPanelHeader(): WGCExpansionPanelHeaderComponent {
		return this.expansionPanelHeaderList.first;
	}

	get expansionPanelContent(): WGCExpansionPanelContentComponent {
		return this.expansionPanelContentList.first;
	}

	/**
	 * @constructor
	 * @param {ElementRef} elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( public elementRef: ElementRef, private _cdRef: ChangeDetectorRef ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		changes.expanded && this._render();
	}

	/**
	 * @return {void}
	 */
	public expand() {
		this.expanded = true;

		this._render();
		this.expandedChange.emit( true );
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	public collapse() {
		this.expanded = false;

		this.expandedChange.emit( false );
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	private _render() {
		if ( this.isRendered || !this.expanded ) return;

		setTimeout( () => {
			this.isRendered = true;

			this._cdRef.markForCheck();
		}, this.renderDelay );
	}

}
