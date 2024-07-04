import {
	Component, ElementRef, ContentChildren,
	QueryList, AfterContentInit, ChangeDetectionStrategy
} from '@angular/core';
import { startWith } from 'rxjs/operators';
import _ from 'lodash';
import * as XLSX from 'xlsx';

import { Unsubscriber, untilCmpDestroyed } from '@core';
import { WGCExcelCellComponent } from './wgc-excel-cell.component';

@Unsubscriber()
@Component({
	selector		: 'table[wgcExcelTable]',
	templateUrl		: './wgc-excel-table.pug',
	styleUrls		: [ './wgc-excel-table.scss' ],
	host			: { class: 'wgc-excel-table' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCExcelTableComponent implements AfterContentInit {

	@ContentChildren( WGCExcelCellComponent, { descendants: true } ) public excelCellList: QueryList<WGCExcelCellComponent>;

	/**
	 * @constructor
	 * @param {ElementRef} _elementRef
	 */
	constructor( private _elementRef: ElementRef ) {}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this.excelCellList
		.changes
		.pipe(
			startWith( this.excelCellList ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<WGCExcelCellComponent> ) => {
			const itemArr: WGCExcelCellComponent[] = items.toArray();
			const itemArrLength: number = itemArr.length;

			_.forEach( itemArr, ( item: WGCExcelCellComponent, index: number ) => {
				if ( item.readonly ) return;

				const el: HTMLElement = item.excellCellContent.nativeElement;

				el.removeEventListener( 'paste', undefined );
				el.addEventListener( 'paste', ( event: ClipboardEvent ) => {
					event.preventDefault();

					const text: string = event.clipboardData.getData( 'text/plain' );
					const textArr: string[] = text.split( '\n' );
					const numOfColumns: number = itemArrLength / 10;

					for ( let i: number = 0; i < textArr.length; i++ ) {
						const _item: WGCExcelCellComponent = itemArr[ index + numOfColumns * i ];

						_item && _item.setTextContent( textArr[ i ] );
					}
				} );
			} );
		} );
	}

	/**
	 * @param {XLSX.Table2SheetOpts} options
	 * @return {XLSX.WorkSheet}
	 */
	public export( options?: XLSX.Table2SheetOpts ): XLSX.WorkSheet {
		const element: HTMLTableElement = this._elementRef.nativeElement.cloneNode( true );

		_.forEach( element.querySelectorAll( '[index]' ), ( child: HTMLElement ) => {
			child.parentNode.removeChild( child );
		} );

		return XLSX.utils.table_to_sheet( element, options );
	}

	/**
	 * @param {string} filename
	 * @param {boolean} isOnlyHeader
	 * @return {void}
	 */
	public download( filename: string, isOnlyHeader: boolean = false ) {
		const element: HTMLTableElement = this._elementRef.nativeElement.cloneNode( true );

		isOnlyHeader && element.querySelector( 'tbody' ).remove();

		_.forEach( element.querySelectorAll( '[index]' ), ( child: HTMLElement ) => {
			child.parentNode.removeChild( child );
		} );

		XLSX.writeFile( XLSX.utils.table_to_book( element ), filename );
	}

}
