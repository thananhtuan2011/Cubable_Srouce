import {
	Component, OnChanges, SimpleChanges,
	Input, ChangeDetectionStrategy, HostBinding,
	ElementRef, ChangeDetectorRef
} from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

import { ScrollEvent, Unsubscriber, untilCmpDestroyed } from '@core';

@Unsubscriber()
@Component({
	selector		: 'table[wgcTable]',
	templateUrl		: './wgc-table.pug',
	styleUrls		: [ './wgc-table.scss' ],
	host			: { class: 'wgc-table' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCTableComponent implements OnChanges {

	@HostBinding( 'class.wgc-table--scrolling' )
	get classScrolling(): boolean { return this.isScrollingX; }

	@Input() public scrolling$: Observable<ScrollEvent>;

	public isScrollingX: boolean;

	/**
	 * @constructor
	 * @param {ElementRef} _elementRef
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _elementRef: ElementRef, private _cdRef: ChangeDetectorRef ) {}

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

			this._cdRef.markForCheck();
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
