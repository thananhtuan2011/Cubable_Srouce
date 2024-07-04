import {
	Directive, ElementRef, Input,
	Output, EventEmitter, OnChanges,
	SimpleChanges, OnDestroy
} from '@angular/core';
import _ from 'lodash';

import { DefaultValue, CoerceBoolean } from 'angular-core';

import { COLOR } from '@resources';

@Directive({ selector: '[highlightState]' })
export class HighlightStateDirective implements OnChanges, OnDestroy {

	@Input() @DefaultValue() public highlightType: 'background' | 'border' = 'background';
	@Input() @DefaultValue() public highlightColor: string = COLOR.HIGHLIGHT;
	@Input() @CoerceBoolean() public highlightState: boolean;
	@Input() @CoerceBoolean() public highlightDisabled: boolean;
	@Input() @CoerceBoolean() public autoUnhighlight: boolean;
	@Input() @DefaultValue() public autoUnhighlightDelay: number = 3000;

	@Output() public highlightStateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	private _setHighlightDebounce: ReturnType<typeof _.debounce>
		= _.debounce( this.setHighlight.bind( this ), 0 );
	private _unsetHighlightDebounce: ReturnType<typeof _.debounce>
		= _.debounce( this.unsetHighlight.bind( this ), 0 );
	private _autoUnhighlightDebounce: ReturnType<typeof _.debounce>
		= _.debounce( this.unsetHighlight.bind( this ), this.autoUnhighlightDelay );

	/**
	 * @constructor
	 * @param {ElementRef} _elementRef
	 */
	constructor( private _elementRef: ElementRef ) {}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.highlightState ) return;

		this.highlightState ? this._setHighlightDebounce( this.autoUnhighlight ) : this._unsetHighlightDebounce();
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._setHighlightDebounce.cancel();
		this._unsetHighlightDebounce.cancel();
		this._autoUnhighlightDebounce.cancel();
	}

	/**
	 * @param {boolean=} isAutoUnhighlight
	 * @return {void}
	 */
	public setHighlight( isAutoUnhighlight?: boolean ) {
		if ( !this.highlightState ) {
			this.highlightState = true;

			this.highlightStateChange.emit( this.highlightState );
		}

		// Todo: need move on top
		if ( this.highlightDisabled ) return;

		// Add style
		this._addStyle();

		// Schedule to auto unhighlight
		isAutoUnhighlight && this._autoUnhighlightDebounce();
	}

	/**
	 * @return {void}
	 */
	public unsetHighlight() {
		if ( this.highlightState ) {
			this.highlightState = false;

			this.highlightStateChange.emit( this.highlightState );
		}

		// Todo: need move on top
		if ( this.highlightDisabled ) return;

		// Remove style
		this._removeStyle();
	}

	/**
	 * @return {void}
	 */
	private _addStyle() {
		switch ( this.highlightType ) {
			case 'background':
				this._elementRef.nativeElement.style.backgroundColor = this.highlightColor;
				break;
			case 'border':
				this._elementRef.nativeElement.style.border = `1px solid ${ this.highlightColor }`;
				break;
		}
	}

	/**
	 * @return {void}
	 */
	private _removeStyle() {
		switch ( this.highlightType ) {
			case 'background':
				this._elementRef.nativeElement.style.backgroundColor = null;
				break;
			case 'border':
				this._elementRef.nativeElement.style.border = null;
				break;
		}
	}

}
