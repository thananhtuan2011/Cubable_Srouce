import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	forwardRef,
	HostBinding,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBMenuItemComponent,
	CUBMenuItemType
} from './menu-item.component';

@Unsubscriber()
@Component({
	selector: 'button[cubMenuSelectItem]',
	templateUrl: './menu-select-item.pug',
	styleUrls: [
		'./menu-item.scss',
		'./menu-select-item.scss',
	],
	host: {
		class: 'cub-menu-item cub-menu-select-item',
	},
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		{
			provide: CUBMenuItemComponent,
			useExisting: forwardRef(
				() => CUBMenuSelectItemComponent
			),
		},
	],
})
export class CUBMenuSelectItemComponent
	extends CUBMenuItemComponent
	implements AfterViewInit {

	@Input( 'cubMenuSelectItem' )
	public itemType: CUBMenuItemType;
	@HostBinding( 'class.cub-menu-item--selected' )
	@Input() @CoerceBoolean()
	public selected: boolean;

	@Output() public selectedChange: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	ngAfterViewInit() {
		this
		.triggered
		.pipe(
			untilCmpDestroyed( this )
		)
		.subscribe( () => this.select() );
	}

	/**
	 * @return {void}
	 */
	public select() {
		if ( this.selected ) {
			return;
		}

		this._updateSelectedState( true );
	}

	/**
	 * @return {void}
	 */
	public deselect() {
		if ( !this.selected ) {
			return;
		}

		this._updateSelectedState( false );
	}

	/**
	 * @param {boolean} state
	 * @return {void}
	 */
	private _updateSelectedState(
		state: boolean
	) {
		this.selectedChange.emit(
			this.selected = state
		);

		this.cdRef.markForCheck();
	}

}
