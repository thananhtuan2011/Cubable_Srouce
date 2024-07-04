import {
	Component, ViewEncapsulation, Input,
	ContentChild, ViewChild, ChangeDetectionStrategy,
	HostBinding
} from '@angular/core';

import { DetectScrollDirective, CoerceBoolean } from '@core';
import { WGCScrollBarDirective, IWGCScrollBarMode } from '../../wgc-scroll-bar';
import { WGCPageHeaderDirective } from '../page-header/wgc-page-header.directive';
import { WGCPageContentDirective } from '../page-content/wgc-page-content.directive';

@Component({
	selector		: 'wgc-page',
	templateUrl		: './wgc-page.pug',
	styleUrls		: [ './wgc-page.scss' ],
	host			: { class: 'wgc-page' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCPageComponent {

	@HostBinding( 'style.--header-padding-top' )
	get styleHeaderPaddingTop(): string { return this.headerPaddingTop; }

	@HostBinding( 'style.--header-padding-bottom' )
	get styleHeaderPaddingBottom(): string { return this.headerPaddingBottom; }

	@HostBinding( 'style.--header-padding-left' )
	get styleHeaderPaddingLeft(): string { return this.headerPaddingLeft; }

	@HostBinding( 'style.--header-padding-right' )
	get styleHeaderPaddingRight(): string { return this.headerPaddingRight; }

	@HostBinding( 'style.--content-padding-top' )
	get styleContentPaddingTop(): string { return this.contentPaddingTop; }

	@HostBinding( 'style.--content-padding-bottom' )
	get styleContentPaddingBottom(): string { return this.contentPaddingBottom; }

	@HostBinding( 'style.--content-padding-left' )
	get styleContentPaddingLeft(): string { return this.contentPaddingLeft; }

	@HostBinding( 'style.--content-padding-right' )
	get styleContentPaddingRight(): string { return this.contentPaddingRight; }

	@HostBinding( 'class.wgc-page--stretch' )
	get classStretch(): boolean { return this.stretch; }

	@HostBinding( 'class.wgc-page--scrolling' )
	get classScrolling(): boolean { return this.isScrolling; }

	@ViewChild( DetectScrollDirective ) public scroller: DetectScrollDirective;
	@ViewChild( WGCScrollBarDirective ) public scrollBar: WGCScrollBarDirective;

	@ContentChild( WGCPageHeaderDirective ) public pageHeader: WGCPageHeaderDirective;
	@ContentChild( WGCPageContentDirective ) public pageContent: WGCPageContentDirective;

	@Input() @CoerceBoolean() public stretch: boolean;
	@Input() @CoerceBoolean() public suppressScrollX: boolean;
	@Input() @CoerceBoolean() public suppressScrollY: boolean;
	@Input() public scrollBarMode: IWGCScrollBarMode;

	public isScrolling: boolean;

	get headerPaddingTop(): string {
		return this.pageHeader?.paddingTop || this.pageHeader?.paddingVertical;
	}

	get headerPaddingBottom(): string {
		return this.pageHeader?.paddingBottom || this.pageHeader?.paddingVertical;
	}

	get headerPaddingLeft(): string {
		return this.pageHeader?.paddingLeft || this.pageHeader?.paddingHorizontal;
	}

	get headerPaddingRight(): string {
		return this.pageHeader?.paddingRight || this.pageHeader?.paddingHorizontal;
	}

	get contentPaddingTop(): string {
		return this.pageContent?.paddingTop || this.pageContent?.paddingVertical;
	}

	get contentPaddingBottom(): string {
		return this.pageContent?.paddingBottom || this.pageContent?.paddingVertical;
	}

	get contentPaddingLeft(): string {
		return this.pageContent?.paddingLeft || this.pageContent?.paddingHorizontal;
	}

	get contentPaddingRight(): string {
		return this.pageContent?.paddingRight || this.pageContent?.paddingHorizontal;
	}

}
