import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	HostListener,
	Input,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

import {
	CUB_VALUE_ACCESSOR,
	CUBValueAccessor
} from '../value-accessor';

export enum CUBCheckboxSize {
	Small = 'small',
	Large = 'large',
}

// eslint-disable-next-line @typescript-eslint/typedef
export const createCheckboxDOM = _.memoize(
	function(
		isChecked: boolean = false,
		size: CUBCheckboxSize = CUBCheckboxSize.Large
	): string {
		const isSmallSize: boolean
			= size === CUBCheckboxSize.Small;
		const s: number
			= isSmallSize ? 16 : 20;

		const svgNS: string = 'http://www.w3.org/2000/svg';

		// Create SVG element
		const svg: SVGElement
			= document.createElementNS( svgNS, 'svg' ) as SVGElement;
		svg.setAttribute( 'width', s.toString() );
		svg.setAttribute( 'height', s.toString() );
		svg.setAttribute( 'fill', 'none' );

		// Create white background rectangle
		const rectBackground: SVGRectElement
			= document.createElementNS( svgNS, 'rect' ) as SVGRectElement;
		rectBackground.setAttribute( 'width', ( s - 1 ).toString() );
		rectBackground.setAttribute( 'height', ( s - 1 ).toString() );
		rectBackground.setAttribute( 'rx', '4' );
		rectBackground.setAttribute( 'transform', 'translate(0.5 0.5)' );
		rectBackground.setAttribute( 'fill', 'white' );
		rectBackground.setAttribute( 'stroke', '#E4E4E6' );
		rectBackground.setAttribute( 'stroke-width', '.9px' );
		rectBackground.setAttribute( 'stroke-linejoin', 'round' );
		svg.appendChild( rectBackground );

		if ( isChecked ) {
			// Create green background rectangle
			const rectGreen: SVGRectElement
				= document.createElementNS( svgNS, 'rect' ) as SVGRectElement;
			rectGreen.setAttribute( 'x', '0.5' );
			rectGreen.setAttribute( 'y', '0.5' );
			rectGreen.setAttribute( 'width', ( s - 1 ).toString() );
			rectGreen.setAttribute( 'height', ( s - 1 ).toString() );
			rectGreen.setAttribute( 'rx', '4' );
			rectGreen.setAttribute( 'fill', '#53CD52' );
			rectGreen.setAttribute( 'stroke', '#E4E4E6' );
			rectGreen.setAttribute( 'stroke-width', '.9px' );
			rectGreen.setAttribute( 'stroke-linejoin', 'round' );
			svg.appendChild( rectGreen );

			// Create check icon path
			const path: SVGPathElement
				= document.createElementNS( svgNS, 'path' ) as SVGPathElement;
			path.setAttribute( 'fill-rule', 'evenodd' );
			path.setAttribute( 'clip-rule', 'evenodd' );
			path.setAttribute( 'transform', 'translate(-1 0)' );
			path.setAttribute(
				'd',
				isSmallSize
					? 'M6.14406 8.4097C5.93624 8.1722 5.57523 8.14813 5.33773 8.35595C5.10022 8.56377 5.07615 8.92477 5.28397 9.16228L7.28397 11.448C7.50591 11.7016 7.89803 11.7091 8.12945 11.4641L12.9866 6.32121C13.2033 6.09177 13.1929 5.73011 12.9635 5.51342C12.7341 5.29672 12.3724 5.30706 12.1557 5.5365L7.73015 10.2224L6.14406 8.4097Z'
					: 'M7.43041 10.3868C7.17063 10.0899 6.71938 10.0598 6.42249 10.3196C6.12561 10.5793 6.09553 11.0306 6.3553 11.3275L8.8553 14.1846C9.13272 14.5017 9.62287 14.511 9.91214 14.2047L15.9836 7.77614C16.2544 7.48934 16.2415 7.03727 15.9547 6.7664C15.6679 6.49554 15.2158 6.50845 14.945 6.79525L9.41303 12.6526L7.43041 10.3868Z'
			);
			path.setAttribute( 'fill', 'white' );
			svg.appendChild( path );
		}

		return document
		.createElement( 'div' )
		.appendChild( svg )
		.parentElement
		.innerHTML;
	},
	function(
		isChecked: boolean = false,
		size: CUBCheckboxSize = CUBCheckboxSize.Large
	): string {
		return `${isChecked}|${size}`;
	}
);

@Component({
	selector: 'cub-checkbox',
	templateUrl: './checkbox.pug',
	styleUrls: [ './checkbox.scss' ],
	host: { class: 'cub-checkbox' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		CUB_VALUE_ACCESSOR( CUBCheckboxComponent ),
	],
})
export class CUBCheckboxComponent
	extends CUBValueAccessor<boolean> {

	@HostBinding( 'attr.tabindex' )
	@Input() public tabindex: number = 0;
	@Input() public label: string;
	@HostBinding( 'style.--checkbox-size' )
	@Input() @DefaultValue()
	public size: CUBCheckboxSize = CUBCheckboxSize.Small;
	@Input() @CoerceBoolean()
	public readonly: boolean;
	@Input() public onBeforeToggle:
		() => boolean | Promise<boolean>;

	protected checkboxDOM: string;

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean {
		return this.isDisabled || undefined;
	}

	@HostBinding( 'attr.readonly' )
	get attrReadonly(): boolean {
		return this.readonly || undefined;
	}

	@HostBinding( 'class' )
	get class(): ObjectType<boolean> {
		return {
			'cub-checkbox--small':
				this.size === CUBCheckboxSize.Small,
			'cub-checkbox--large':
				this.size === CUBCheckboxSize.Large,
		};
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override writeValue( value: boolean ) {
		super.writeValue( value );

		this.checkboxDOM
			= createCheckboxDOM( !!value, this.size );
	}

	@HostListener( 'click' )
	@HostListener( 'keydown.space' )
	protected onClickAndKeydownSpace() {
		if ( this.isDisabled || this.readonly ) {
			return;
		}

		let isContinue: boolean
			| Promise<boolean> = true;

		if ( this.onBeforeToggle ) {
			isContinue = this.onBeforeToggle();

			if ( isContinue instanceof Promise ) {
				isContinue
				.then(( v: boolean ) => {
					if ( !v ) return;

					this.toggle();
				});

				return;
			}
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
		if ( isContinue !== true ) {
			return;
		}

		this.toggle();
	}

	/**
	 * @return {void}
	 */
	protected toggle() {
		const value: boolean = !this.value;

		this.writeValue( value );
		this.onChange( value );
	}

}
