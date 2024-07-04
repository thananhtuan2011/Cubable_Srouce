import {
	Component, Input, ElementRef,
	ViewEncapsulation, ViewChild, AfterViewInit,
	AfterContentInit, OnDestroy, ChangeDetectorRef,
	HostListener, ChangeDetectionStrategy, HostBinding
} from '@angular/core';
import ResizeObserver from 'resize-observer-polyfill';
import _ from 'lodash';

import { DefaultValue, AliasOf, CoerceNumber, CoerceBoolean } from '@core';

import { WGCTooltipDirective } from '../../wgc-tooltip';

const checkTextNoWrap: ( text: string ) => boolean = _.memoize(( text: string ): boolean => {
	return _.chain( text ).trim().value().search( ' ' ) !== -1;
});

@Component({
	selector		: 'wgc-truncate, [wgcTruncate]',
	templateUrl		: './wgc-truncate.pug',
	styleUrls		: [ './wgc-truncate.scss' ],
	host			: { class: 'wgc-truncate' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCTruncateComponent implements AfterViewInit, AfterContentInit, OnDestroy {

	@HostBinding( 'style.--truncate-line' )
	get styleLine(): number { return this.internalLimitLine; }

	@HostBinding( 'class.wgc-truncate--single-line' )
	get classSingleLine(): boolean { return this.internalLimitLine === 1; }

	@HostBinding( 'class.wgc-truncate--disabled' )
	get classDisabled(): boolean { return this.disabled || this.limitLine < 0; }

	@HostBinding( 'class.wgc-truncate--empty' )
	get classEmpty(): boolean { return this.isEmpty; }

	// @ViewChild( 'wrapperEle', { static: true } ) public wrapperEle: ElementRef<HTMLSpanElement>;
	@ViewChild( 'wrapperEle', { static: true } ) public wrapperEle: ElementRef<HTMLParagraphElement>;

	@Input() @DefaultValue() @CoerceNumber() public limitLine: number = 2;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() public tooltip: any;
	@Input() public wgcTooltip: WGCTooltipDirective;

	@Input() @AliasOf( 'tooltip' ) public wgcTruncate: any;

	public internalTooltip: any;
	public internalLimitLine: number;
	public isEmpty: boolean;

	private _checkTextOverDebounce: ReturnType<typeof _.debounce>
		= _.debounce( this._checkTextOver.bind( this ), 500 );
	private _resizeObserver: ResizeObserver = new ResizeObserver( this._checkTextOverDebounce.bind( this ) );
	private _mutationObserver: MutationObserver = new MutationObserver( this._checkTextOverDebounce.bind( this ) );

	// get textEle(): HTMLElement {
	// 	const ele: HTMLElement = this.wrapperEle.nativeElement;
	// 	const firstChild: HTMLElement = ( ele.firstChild as HTMLElement );

	// 	return !firstChild
	// 		|| firstChild.nodeType === Node.COMMENT_NODE
	// 		|| firstChild.nodeType === Node.TEXT_NODE
	// 		|| !firstChild.innerText.length
	// 		? ele : firstChild;
	// }

	// get content(): string { return this.textEle.innerText || ''; }
	get content(): string { return this.wrapperEle.nativeElement.innerText || ''; }

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 */
	constructor( private _cdRef: ChangeDetectorRef ) {}

	@HostListener( 'mousemove' )
	public triggerMouseMove() {
		this.internalTooltip = this._checkTextOver() ? ( this.tooltip || this.content ) : undefined;

		this._cdRef.markForCheck();
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		// Listen size changes
		this._resizeObserver.observe( this.wrapperEle.nativeElement );

		// Listen text changes
		this._mutationObserver.observe( this.wrapperEle.nativeElement, { childList: true, subtree: true } );
	}

	/**
	 * @constructor
	 */
	ngAfterContentInit() {
		this._checkTextOver();
		this._checkTextOverDebounce(); // Fix on safari
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._checkTextOverDebounce.cancel();
		this._resizeObserver.disconnect();
		this._mutationObserver.disconnect();
	}

	/**
	 * @return {boolean}
	 */
	private _checkTextOver(): boolean {
		let isTextOver: boolean = false;

		this.isEmpty = !this.content.length;
		this.internalLimitLine = this.limitLine;

		if ( !this.isEmpty ) {
			this.internalLimitLine = checkTextNoWrap( this.content ) ? Number( this.limitLine ) : 1;

			// const clientHeight: number = this.textEle.clientHeight;
			// const scrollHeight: number = this.textEle.scrollHeight;
			const { clientHeight, scrollHeight }: HTMLParagraphElement = this.wrapperEle.nativeElement;

			isTextOver = clientHeight < scrollHeight;
		}

		this._cdRef.markForCheck();

		return isTextOver;
	}

}
