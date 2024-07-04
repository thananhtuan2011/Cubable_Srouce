import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	QueryList,
	SimpleChanges,
	ViewChildren,
	ViewEncapsulation,
	ViewChild
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceNumber,
	DefaultValue
} from 'angular-core';

import {
	CUBTabComponent
} from '../tab/tab.component';
import {
	CUBTabContentDirective
} from '../tab/tab-content.directive';

export type CUBTabAlignment = 'left' | 'right' | 'center';

@Component({
	selector		: 'cub-tabs',
	templateUrl		: './tabs.pug',
	styleUrls		: [ './tabs.scss' ],
	host			: { class: 'cub-tabs' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBTabsComponent implements AfterViewInit, OnChanges {

	@Input() @DefaultValue() @CoerceNumber()
	public selectedIndex: number = 0;
	@Input() @CoerceBoolean()
	public stretch: boolean;
	@Input() @DefaultValue()
	public alignment: CUBTabAlignment = 'left';

	@Output() public selectedIndexChange: EventEmitter<number>
		= new EventEmitter<number>();

	@ViewChild( 'tabGroupContentScrollBar' )
	public readonly tabGroupContentScrollBar: CUBTabContentDirective;

	@ViewChildren( 'tabHeader' )
	protected readonly tabHeaderList: QueryList<ElementRef>;
	@ContentChildren( CUBTabComponent )
	protected readonly items: QueryList<CUBTabComponent>;

	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.selectedIndex ) return;

		this.scrollToIndex( this.selectedIndex );
	}

	ngAfterViewInit() {
		this.scrollToIndex( this.selectedIndex );
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	public select( index: number ) {
		if ( this.selectedIndex === index ) return;

		this.selectedIndexChange.emit(
			this.selectedIndex = index
		);

		this.scrollToIndex( index );
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	public scrollToIndex( index: number ) {
		this._getSelectedTab( index )
		?.nativeElement
		.scrollIntoView({
			inline: 'nearest',
			behavior: 'smooth',
		});
	}

	/**
	 * @param {number} index
	 * @return {ElementRef<any>}
	 */
	private _getSelectedTab(
		index: number
	): ElementRef<any> {
		const length: number
			= this.tabHeaderList?.length;

		if ( !length ) return;

		if ( index < 0 ) {
			index = 0;
		} else if ( index > length - 1 ) {
			index = length - 1;
		}

		return this.tabHeaderList.get( index );
	}

}
