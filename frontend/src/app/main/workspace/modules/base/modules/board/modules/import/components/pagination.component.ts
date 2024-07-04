import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	SimpleChanges,
	OnChanges
} from '@angular/core';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';

import {
	Config,
	Row
} from '@main/common/spreadsheet/components';

@Unsubscriber()
@Component({
	selector: 'pagination',
	templateUrl: '../templates/pagination.pug',
	styleUrls: [ '../styles/pagination.scss' ],
	host: { class: 'pagination' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent
implements OnInit, OnChanges {

	@Input() public limit: number;
	@Input() public data: Row[];
	@Input() public config: Config;
	@Input() public maxPage: number;

	@Output() public pageChange: EventEmitter<Row[]>
		= new EventEmitter<Row[]>();

	protected currentPage: number = 1;
	protected firstPage: number = 1;
	protected rowData: Row[];
	protected displayPage: number;

	get pages(): number[] {
		const pagesArray: number[] = [];

		let startPage: number
			= Math.max(
				1,
				this.currentPage - Math.floor( this.maxPage / 2)
			);
		let endPage: number = startPage + this.maxPage - 1;

		if ( endPage > this.displayPage ) {
			endPage = this.displayPage;
			startPage = Math.max(
				endPage - this.maxPage + 1,
				1
			);
		}

		for ( let i: number = startPage; i <= endPage; i++ ) {
			pagesArray.push(i);
		}

		return pagesArray;
	}

	get isFirst(): boolean {
		return this.currentPage === 1;
	  }

	get isLast(): boolean {
		return this.currentPage === this.displayPage;
	}

	ngOnInit() {
		this.displayPage = Math.ceil(
			this.data.length / this.limit
		);
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.data ) {
			this._updateDisplayedData();
		}
	}
	/**
	 * @return {void}
	 */
	protected nextPage() {
		if (
			this.currentPage < this.displayPage
		) {
		  this.currentPage++;
		  this._updateDisplayedData();
		}
	}

	/**
	 * @param {number} page
	 * @return {void}
	 */
	protected goToPage(
		page: number
	) {
		if ( page === this.currentPage ) return;
		this.currentPage = page;
		this._updateDisplayedData();
	}

	/**
	 * @return {void}
	 */
	protected prevPage() {
		if ( this.currentPage > this.firstPage ) {
		  this.currentPage--;
		  this._updateDisplayedData();
		}
	  }

	/**
	 * @return {void}
	 */
	protected onFirstPage() {
		this.currentPage = this.firstPage;
		this._updateDisplayedData();
	}

	/**
	 * @return {void}
	 */
	protected onLastPage() {
		this.currentPage = this.displayPage;
		this._updateDisplayedData();
	}

	/**
	 * @return {void}
	 */
	private _updateDisplayedData() {
		const startIndex: number = ( this.currentPage - 1 ) * this.limit;
		this.rowData = this.data.slice(
			startIndex,
			startIndex + this.limit
		);

		this.pageChange.emit( this.rowData );
		this
		.config
		.row
		.startIndex
			= ( this.currentPage - 1 ) * this.limit;
	}
}
