import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges
} from '@angular/core';
import _ from 'lodash';

import {
	ScrollEvent,
	Throttle,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	Group
} from '../../sub-classes/group';

import {
	VirtualScrollComponent
} from './virtual-scroll.component';

function findGroupInsideViewport(
	groups: Group[],
	range: [ number, number ],
	memo: Group[] = [],
	start: number = 0,
	end: number = groups.length - 1
): Group[] {
	if ( start <= end ) {
		const mid: number
			= Math.floor( ( start + end ) / 2 );
		const group: Group
			= groups[ mid ];
		const gs: number
			= group.offset.top;
		const ge: number
			= group.offset.top + group.offset.height;
		const vs: number
			= range[ 0 ];
		const ve: number
			= range[ 1 ];
		const isGroupCoverViewport: boolean
			= gs < vs && ge > ve;
		const isGroupStartInsideViewport: boolean
			= gs >= vs && gs <= ve;
		const isGroupEndInsideViewport: boolean
			= ge >= vs && ge <= ve;

		if ( isGroupCoverViewport
			|| isGroupStartInsideViewport
			|| isGroupEndInsideViewport ) {
			memo.push( group );

			// Find children inside viewport
			if ( !group.collapsed
				&& group.children ) {
				findGroupInsideViewport(
					group.children,
					range,
					memo
				);
			}
		}

		if ( !isGroupCoverViewport ) {
			if ( gs > vs ) {
				findGroupInsideViewport(
					groups,
					range,
					memo,
					start,
					mid - 1
				);
			}

			if ( ge < ve ) {
				findGroupInsideViewport(
					groups,
					range,
					memo,
					mid + 1,
					end
				);
			}
		}
	}

	return memo;
}

@Unsubscriber()
@Component({
	selector: 'group-virtual-scroll-viewport, [groupVirtualScrollViewport]',
	templateUrl: './group-virtual-scroll-viewport.pug',
	host: { class: 'group-virtual-scroll-viewport' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupVirtualScrollViewportComponent
implements OnInit, OnChanges {

	@Input() public rootGroup: Group;

	public renderedGroups: Group[];

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _virtualScroll: VirtualScrollComponent
		= inject( VirtualScrollComponent );

	ngOnInit() {
		this
		._virtualScroll
		.scroller
		.scrolling$
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe(( e: ScrollEvent ) => {
			if ( !e.scrollingY ) {
				return;
			}

			this.updateRenderedGroups(
				e.scrollTop,
				e.clientHeight
			);
		});
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.rootGroup ) {
			return;
		}

		this.updateRenderedGroups();
	}

	/**
	 * @url https://dev.to/adamklein/build-your-own-virtual-scroll-part-ii-3j86
	 * @param scrollTop
	 * @param viewportHeight
	 */
	@Throttle( 17 ) // 60fps
	public updateRenderedGroups(
		scrollTop: number
		= this._virtualScroll.scrollBar.scrollTop,
		viewportHeight: number
		= this._virtualScroll.viewportHeight
	) {
		this.renderedGroups
			= findGroupInsideViewport(
				this.rootGroup.children,
				[
					scrollTop - viewportHeight / 2,
					scrollTop
						+ viewportHeight
						+ viewportHeight / 2,
				]
			);

		this._cdRef.markForCheck();
	}

}
