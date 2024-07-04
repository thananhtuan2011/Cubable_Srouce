import {
	Component, ContentChildren, QueryList,
	Input, ViewEncapsulation, ChangeDetectionStrategy,
	AfterContentInit, HostBinding, Output,
	EventEmitter, OnChanges, SimpleChanges
} from '@angular/core';
import _ from 'lodash';

import { Unsubscriber, CoerceBoolean } from '@core';

import { WGCBlockTruncateDirective } from '../../wgc-truncate';
import { WGCIMenuPosition, WGCMenuComponent } from '../../wgc-menu';

import { WGCTagComponent } from '../tag/wgc-tag.component';

@Unsubscriber()
@Component({
	selector		: 'wgc-tag-list',
	templateUrl		: './wgc-tag-list.pug',
	styleUrls		: [ './wgc-tag-list.scss' ],
	host			: { class: 'wgc-tag-list' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCTagListComponent extends WGCBlockTruncateDirective implements OnChanges, AfterContentInit {

	@HostBinding( 'class.wgc-tag-list--wrapping' )
	get classWrapping(): boolean { return this.wrapping; }

	@ContentChildren( WGCTagComponent ) public tags: QueryList<WGCTagComponent>;

	@Input() public tagColor: string;
	@Input() @CoerceBoolean() public wrapping: boolean;
	@Input() public moreMenu: WGCMenuComponent;
	@Input() public moreMenuPosition: WGCIMenuPosition;

	@Output() public showMore: EventEmitter<void> = new EventEmitter<void>();

	get isFixedLimit(): boolean {
		return this.wrapping || this.limit >= 1;
	}

	/**
	 * @constructor
	 * @overloading
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.length && !changes.wrapping ) return;

		this.wrapping
			? this.setMaxDisplay( 0 )
			: super.ngOnChanges( changes );
	}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		if ( this.isFixedLimit ) return;

		this.blocks = this.tags;
	}

}
