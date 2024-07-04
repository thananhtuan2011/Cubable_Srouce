import {
	AfterContentInit,
	ChangeDetectionStrategy,
	Component,
	ContentChildren,
	HostBinding,
	Input,
	QueryList,
	ViewEncapsulation
} from '@angular/core';
import {
	skipWhile,
	startWith
} from 'rxjs/operators';

import {
	CoerceNumber,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBMenuItemComponent
} from '../menu-item/menu-item.component';

@Unsubscriber()
@Component({
	selector: 'cub-menu-group',
	templateUrl: './menu-group.pug',
	styleUrls: [ './menu-group.scss' ],
	host: { class: 'cub-menu-group' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBMenuGroupComponent implements AfterContentInit {


	@Input() public title: string;
	@HostBinding( 'style.--items-per-line' )
	@Input() @CoerceNumber() public itemsPerLine: number;

	@ContentChildren( CUBMenuItemComponent, { descendants: true } )
	public readonly items: QueryList<CUBMenuItemComponent>;

	@HostBinding( 'class.cub-menu-group--row-direction' )
	get classRowDirection(): boolean {
		return this.itemsPerLine > 1
			&& this.items.length > 1;
	}

	ngAfterContentInit() {
		this.items
		.changes
		.pipe(
			startWith( this.items ),
			skipWhile(( items: QueryList<CUBMenuItemComponent> ) => {
				return !items.length
					|| !this.itemsPerLine;
			}),
			untilCmpDestroyed( this )
		)
		.subscribe(( items: QueryList<CUBMenuItemComponent> ) => {
			const countItemsOnLastRow: number
				= ( items.length % this.itemsPerLine )
					|| this.itemsPerLine;

			items
			.forEach(( item: CUBMenuItemComponent, i: number ) => {
				item.position = null;

				if ( i < this.itemsPerLine ) {
					item.position = 'first';
				}

				if ( i >= items.length - countItemsOnLastRow ) {
					item.position = 'last';
				}
			});
		});
	}

}
