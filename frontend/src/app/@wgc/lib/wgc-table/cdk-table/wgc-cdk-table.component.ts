import {
	Component, OnChanges, SimpleChanges,
	Input, ChangeDetectionStrategy, HostBinding
} from '@angular/core';
import {
	CDK_TABLE_TEMPLATE, CDK_TABLE, STICKY_POSITIONING_LISTENER,
	_COALESCED_STYLE_SCHEDULER, CdkTable, _CoalescedStyleScheduler
} from '@angular/cdk/table';
import { _DisposeViewRepeaterStrategy, _RecycleViewRepeaterStrategy, _VIEW_REPEATER_STRATEGY } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

import { ScrollEvent, Unsubscriber, untilCmpDestroyed } from '@core';

@Unsubscriber()
@Component({
	selector		: 'table[wgcCdkTable]',
	styleUrls		: [ './wgc-cdk-table.scss' ],
	host			: { class: 'wgc-cdk-table' },
	template		: CDK_TABLE_TEMPLATE,
	changeDetection	: ChangeDetectionStrategy.OnPush,
	providers: [
		{ provide: CdkTable, useExisting: WGCCdkTableComponent },
		{ provide: CDK_TABLE, useExisting: WGCCdkTableComponent },
		{ provide: _VIEW_REPEATER_STRATEGY, useClass: _DisposeViewRepeaterStrategy },
		{ provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler },
		{ provide: STICKY_POSITIONING_LISTENER, useValue: null },
	],
})
export class WGCCdkTableComponent<T> extends CdkTable<T> implements OnChanges {

	@HostBinding( 'class.wgc-cdk-table--scrolling' )
	get classScrolling(): boolean { return this.isScrollingX; }

	@Input() public scrolling$: Observable<ScrollEvent>;

	public isScrollingX: boolean;

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.scrolling$ || !this.scrolling$ ) return;

		this.scrolling$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( event: ScrollEvent ) => {
			this.isScrollingX = event.scrollLeft > 0;

			this._changeDetectorRef.markForCheck();
		} );
	}

	/**
	 * @param {XLSX.Table2SheetOpts} options
	 * @return {XLSX.WorkSheet}
	 */
	public export( options?: XLSX.Table2SheetOpts ): XLSX.WorkSheet {
		return XLSX.utils.table_to_sheet( this._elementRef.nativeElement, options );
	}

	/**
	 * @param {string} filename
	 * @param {boolean} isOnlyHeader
	 * @return {void}
	 */
	public download( filename: string, isOnlyHeader: boolean = false ) {
		const element: HTMLTableElement = this._elementRef.nativeElement.cloneNode( true );

		isOnlyHeader && element.querySelector( 'tbody' ).remove();

		XLSX.writeFile( XLSX.utils.table_to_book( element ), filename );
	}

}
