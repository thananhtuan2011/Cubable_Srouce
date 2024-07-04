import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	inject,
	Input,
	OnChanges,
	SimpleChanges,
	ViewEncapsulation
} from '@angular/core';

import {
	IsContrastPipe,
	CoerceBoolean
} from 'angular-core';

@Component({
	selector		: 'cub-chip',
	template		: '<ng-content></ng-content>',
	styleUrls		: [ './chip.scss' ],
	host			: { class: 'cub-chip' },
	providers		: [ IsContrastPipe ],
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBChipComponent implements OnChanges {

	@HostBinding( 'style.--chip-color' )
	get styleColor(): string { return this.color; };

	@HostBinding( 'style.--chip-text-color' )
	get styleTextColor(): string { return this.textColor; };

	@HostBinding( 'class.cub-chip--has-avatar' )
	get classHasAvatar(): boolean { return this.hasAvatar; }

	@Input() public color: string;
	@Input() public textColor: string;
	@Input() @CoerceBoolean() public hasAvatar: boolean;

	private readonly _isContrastPipe: IsContrastPipe = inject( IsContrastPipe );

	/**
	 * @constructor
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.color
			|| this.textColor
			|| !this._isContrastPipe.transform( this.color ) ) {
			return;
		}

		this.textColor = 'white';
	}

}
