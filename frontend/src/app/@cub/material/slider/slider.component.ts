import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	inject,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import {
	CdkDrag,
	Point
} from '@angular/cdk/drag-drop';
import ResizeObserver
	from 'resize-observer-polyfill';
import _ from 'lodash';

import {
	CoerceBoolean,
	CoerceNumber,
	DefaultValue
} from 'angular-core';

import {
	CUB_VALUE_ACCESSOR,
	CUBValueAccessor
} from '../value-accessor';

function createMemoizeKey(
	value: number,
	min: number = 0,
	max: number = 1
): string {
	return `${value}|${min}|${max}`;
}

// eslint-disable-next-line @typescript-eslint/typedef
const makeUpValue = _.memoize(
	function(
		value: number,
		min: number = 0,
		max: number = 1
	): number {
		if ( _.isStrictEmpty( value ) ) {
			return value;
		}

		if ( value < min ) {
			value = min;
		} else if ( value > max ) {
			value = max;
		}

		return parseFloat(
			value.toFixed( 2 )
		);
	},
	createMemoizeKey
);

// eslint-disable-next-line @typescript-eslint/typedef
export const percent = _.memoize(
	function(
		value: number,
		min: number = 0,
		max: number = 1
	): number {
		value = makeUpValue(
			value,
			min,
			max
		);

		return ( value - min )
			/ ( max - min );
	},
	createMemoizeKey
);

// eslint-disable-next-line @typescript-eslint/typedef
export const createProgressSVG = _.memoize(
	function( percentage: number = 0 ): string {
		const svgNS: string = 'http://www.w3.org/2000/svg';

		const svg: SVGElement
			= document.createElementNS(
				svgNS,
				'svg'
			) as SVGElement;

		svg.setAttribute( 'viewBox', '0 0 136 4' );
		svg.setAttribute( 'preserveAspectRatio', 'none' );
		svg.setAttribute( 'width', '100%' );
		svg.setAttribute( 'height', '4' );
		svg.setAttribute( 'fill', 'none' );

		const rect: SVGRectElement
			= document.createElementNS(
				svgNS,
				'rect'
			) as SVGRectElement;

		rect.setAttribute( 'height', '4' );
		rect.setAttribute( 'rx', '2' );
		rect.style.width = `
			var(--progress-percentage, ${percentage.toString()}%)
		`;
		rect.style.fill = `
			var(--progress-color, #2997FF)
		`;

		const backgroundRect: SVGRectElement
			= document.createElementNS(
				svgNS,
				'rect'
			) as SVGRectElement;

		backgroundRect.setAttribute( 'width', '100%' );
		backgroundRect.setAttribute( 'height', '4' );
		backgroundRect.setAttribute( 'rx', '2' );
		backgroundRect.style.fill = `
			var(--progress-track-color, #F1F1F1)
		`;

		svg.appendChild( backgroundRect );
		svg.appendChild( rect );

		return document
		.createElement( 'div' )
		.appendChild( svg )
		.parentElement
		.innerHTML;
	}
);

@Component({
	selector: 'cub-slider',
	templateUrl: './slider.pug',
	styleUrls: [ './slider.scss' ],
	host: { class: 'cub-slider' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		CUB_VALUE_ACCESSOR( CUBSliderComponent ),
	],
})
export class CUBSliderComponent
	extends CUBValueAccessor<number>
	implements AfterViewInit, OnDestroy, OnInit {

	@HostBinding( 'attr.tabindex' )
	@Input() public tabindex: number = 0;
	@Input() public color: string;
	@Input() public thumbColor: string;
	@Input() public trackColor: string;
	@Input() @DefaultValue() @CoerceNumber()
	public min: number = 0;
	@Input() @DefaultValue() @CoerceNumber()
	public max: number = 1;
	@Input() @CoerceBoolean()
	public readonly: boolean;
	@Input() @CoerceBoolean()
	public showTickMarks: boolean;
	@Input() public displayWith: ( value: number ) => string;

	@Output() public slideStart: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public slideEnd: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public sliding: EventEmitter<number>
		= new EventEmitter<number>();

	@ViewChild( 'progressBar', { static: true } )
	protected readonly progressBar: ElementRef<HTMLButtonElement>;
	@ViewChild( 'thumb', { read: CdkDrag, static: true } )
	protected readonly thumb: CdkDrag<HTMLButtonElement>;

	protected readonly dragPosition: Point
		= { x: 0, y: 0 };

	protected progressDom: string;
	protected percentage: string;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	private _resizeObserver: ResizeObserver;

	@Input()
	set rangeColor(
		range: Record<number, string>
	) {
		let color: string;
		let thumbColor: string;

		for ( const [ k, v ] of Object.entries( range ) ) {
			color = thumbColor = v;

			if ( this.value < parseFloat( k ) / 100 ) {
				break;
			}
		}

		if ( color ) {
			this.color = color;
		}

		if ( thumbColor ) {
			this.thumbColor = thumbColor;
		}
	}

	@HostBinding( 'attr.disabled' )
	get attrDisabled(): boolean {
		return this.isDisabled || undefined;
	}

	@HostBinding( 'attr.readonly' )
	get attrReadonly(): boolean {
		return this.readonly || undefined;
	}

	@HostBinding( 'style' )
	get style(): ObjectType {
		return {
			'--slider-color':
				this.color,
			'--slider-track-color':
				this.trackColor,
			'--slider-thumb-color':
				this.thumbColor,
		};
	}

	get range(): number {
		return this.max - this.min;
	}

	get ratio(): number {
		return percent(
			this.value || 0,
			this.min,
			this.max
		);
	}

	get canEdit(): boolean {
		return !this.isDisabled
			&& !this.readonly;
	}

	ngOnInit() {
		this.progressDom = createProgressSVG();
	}

	ngOnDestroy() {
		this._resizeObserver?.disconnect();
	}

	ngAfterViewInit() {
		this
		.thumb
		._dragRef
		._withDropContainer( null );

		this._resizeObserver
			= new ResizeObserver(
				_.throttle(() => {
					this._updateThumbPosition();
				})
			);

		this._resizeObserver.observe(
			this.element
		);

		this._updatePercentage();
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	override writeValue(
		value: number,
		onlySelf?: boolean
	) {
		value = makeUpValue(
			value,
			this.min,
			this.max
		);

		super.writeValue( value );

		this._updatePercentage();

		if ( onlySelf ) {
			return;
		}

		this._updateThumbPosition();
	}

	@HostListener( 'keydown.arrowup', [ '$event' ] )
	@HostListener( 'keydown.arrowright', [ '$event' ] )
	protected onKeydownArrowUpAndRight(
		e: KeyboardEvent
	) {
		if ( !this.canEdit ) {
			return;
		}

		e.preventDefault();

		let value: number
			= this.value || this.min;

		if ( value < this.max ) {
			value += .01;
		}

		this.writeValue( value );
	}

	@HostListener( 'keyup.arrowup', [ '$event' ] )
	@HostListener( 'keyup.arrowright', [ '$event' ] )
	protected onKeyupArrowUpAndRight(
		e: KeyboardEvent
	) {
		if ( !this.canEdit ) {
			return;
		}

		e.preventDefault();

		this.onChange(
			this.value
		);
	}

	@HostListener( 'keydown.arrowdown', [ '$event' ] )
	@HostListener( 'keydown.arrowleft', [ '$event' ] )
	protected onKeydownArrowDownAndLeft(
		e: KeyboardEvent
	) {
		if ( !this.canEdit ) {
			return;
		}

		e.preventDefault();

		let value: number
			= this.value || this.min;

		if ( value > this.min ) {
			value -= .01;
		}

		this.writeValue( value );
	}

	@HostListener( 'keyup.arrowdown', [ '$event' ] )
	@HostListener( 'keyup.arrowleft', [ '$event' ] )
	protected onKeyupArrowDownAndLeft(
		e: KeyboardEvent
	) {
		if ( !this.canEdit ) {
			return;
		}

		e.preventDefault();

		this.onChange( this.value );
	}

	@HostListener( 'click', [ '$event' ] )
	protected onClick( e: MouseEvent ) {
		if ( !this.canEdit ) {
			return;
		}

		const {
			x: progressBarX,
			width: progressBarWidth,
		}: DOMRect
			= this
			.progressBar
			.nativeElement
			.getBoundingClientRect();
		let value: number;

		if ( e.pageX < progressBarX ) {
			value = this.min;
		} else if (
			e.pageX > ( progressBarX + progressBarWidth )
		) {
			value = this.max;
		} else {
			const ratio: number
				= ( e.pageX - progressBarX )
					/ progressBarWidth;

			value = this.min
				+ ( ratio * this.range )
				/ 1;
		}

		value = makeUpValue(
			value,
			this.min,
			this.max
		);

		this.writeValue( value );
		this.onChange( value );
	}

	protected onThumbDragMoved() {
		const { x: hostX }: DOMRect
			= this
			.elementRef
			.nativeElement
			.getBoundingClientRect();
		const { x: thumbX }: DOMRect
			= this
			.thumb
			.element
			.nativeElement
			.getBoundingClientRect();
		const { width: progressBarWidth }: DOMRect
			= this
			.progressBar
			.nativeElement
			.getBoundingClientRect();
		const ratio: number
			= ( thumbX - hostX )
				/ progressBarWidth;
		let value: number
			= this.min
				+ ( ratio * this.range )
				/ 1;

		value = makeUpValue(
			value,
			this.min,
			this.max
		);

		this.writeValue( value, true );

		this.sliding.emit( value );
	}

	protected onThumbDragStarted() {
		this.slideStart.emit();
	}

	protected onThumbDragEnded() {
		this.onChange( this.value );

		this.slideEnd.emit();
	}

	private _updateThumbPosition() {
		const { width: progressBarWidth }: DOMRect
			= this
			.progressBar
			.nativeElement
			.getBoundingClientRect();
		const pos: number
			= this.ratio * progressBarWidth;

		this.thumb.setFreeDragPosition({
			x: pos,
			y: 0,
		});
	}

	private _updatePercentage() {
		this.percentage
			= this.displayWith?.( this.value )
				?? _.toPercent(
					this.value,
					0,
					true
				) as string;

		this._cdRef.markForCheck();
	}

}
