import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostBinding,
	inject,
	Input,
	ViewEncapsulation
} from '@angular/core';

import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

export enum CUBCardVariant {
	Default = 'default',
	Outlined = 'outlined',
	Tonal = 'tonal',
}

export enum CUBCardSize {
	Small = 'small',
	Large = 'large',
}

export enum CUBCardState {
	Active = 'active',
	Error = 'error',
}

export enum CUBCardBoxShadow {
	On = 'on',
	Off = 'off',
}

@Component({
	selector: 'cub-card',
	template: '<ng-content></ng-content>',
	styleUrls: [ './card.scss' ],
	host: { class: 'cub-card' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBCardComponent implements AfterViewInit {

	@Input() @DefaultValue()
	public variant: CUBCardVariant
			= CUBCardVariant.Default;
	@Input() @DefaultValue()
	public size: CUBCardSize
			= CUBCardSize.Large;
	@Input() public state: CUBCardState;
	@Input() @DefaultValue()
	public boxShadow: CUBCardBoxShadow
			= CUBCardBoxShadow.Off;
	@Input() @CoerceBoolean()
	public clickable: boolean;
	@Input() @CoerceBoolean()
	public includeOuterSize: boolean;

	private readonly _elementRef: ElementRef
		= inject( ElementRef );

	@HostBinding( 'class' )
	get class(): ObjectType<boolean> {
		return {
			'cub-card--default':
				this.variant
					=== CUBCardVariant.Default,
			'cub-card--outlined':
				this.variant
					=== CUBCardVariant.Outlined,
			'cub-card--tonal':
				this.variant
					=== CUBCardVariant.Tonal,
			'cub-card--small':
				this.size
					=== CUBCardSize.Small,
			'cub-card--large':
				this.size
					=== CUBCardSize.Large,
			'cub-card--active':
				this.state
					=== CUBCardState.Active,
			'cub-card--error':
				this.state
					=== CUBCardState.Error,
			'cub-card--shadow':
				this.boxShadow
					=== CUBCardBoxShadow.On,
			'cub-card--clickable':
				this.clickable,
		};
	}

	ngAfterViewInit() {
		if ( !this.includeOuterSize ) {
			return;
		}

		const {
			nativeElement,
		}: ElementRef
			= this._elementRef;
		const wrapper: HTMLDivElement
			= document.createElement( 'div' );

		wrapper
		.style
		.padding = '3px';

		nativeElement
		.parentNode
		.appendChild( wrapper );

		wrapper
		.appendChild( nativeElement );
	}

}
