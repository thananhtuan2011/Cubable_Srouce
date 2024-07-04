import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	Input,
	OnChanges,
	SimpleChanges,
	ViewEncapsulation
} from '@angular/core';

import {
	AliasOf,
	CoerceBoolean,
	CoerceCssPixel,
	DefaultValue
} from 'angular-core';

export type CUBImageFitMode = 'contain'
	| 'cover'
	| 'fill'
	| 'scale-down';

@Component({
	selector		: 'cub-image, [cubImage]',
	templateUrl		: './image.pug',
	styleUrls		: [ './image.scss' ],
	host			: { class: 'cub-image' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class CUBImageComponent implements OnChanges {

	@Input() public src: string;
	@Input() @DefaultValue()
	public defaultImage: string = 'assets/@cub/images/loading.gif';
	@Input()
	public errorImage: string = 'assets/@cub/images/no-image.svg';
	@Input() @CoerceCssPixel() public width: string;
	@Input() @CoerceCssPixel() public minWidth: string;
	@Input() @CoerceCssPixel() public maxWidth: string;
	@Input() @CoerceCssPixel() public height: string;
	@Input() @CoerceCssPixel() public minHeight: string;
	@Input() @CoerceCssPixel() public maxHeight: string;
	@Input() @CoerceBoolean() public noLazy: boolean;
	@Input() public fitMode: CUBImageFitMode;

	@Input() @AliasOf( 'src' ) public cubImage: string;

	public state: 'loading' | 'loaded' | 'error';

	@HostBinding( 'style.--preload-image' )
	get styleDefaultImage(): string {
		return `url(${this.defaultImage})`;
	}

	@HostBinding( 'class.cub-image--loading' )
	get classLoading(): boolean {
		return this.state === 'loading';
	}

	@HostBinding( 'class.cub-image--loaded' )
	get classLoaded(): boolean {
		return this.state === 'loaded';
	}

	@HostBinding( 'class.cub-image--error' )
	get classError(): boolean {
		return this.state === 'error';
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.src || !this.src || this.noLazy ) return;

		this.state = 'loading';
	}

	/**
	 * @return {void}
	 */
	protected onImageLoaded() {
		this.state = 'loaded';
	}

	/**
	 * @return {void}
	 */
	protected onImageError() {
		this.state = 'error';

		this.src = this.errorImage || this.defaultImage;
	}

}
