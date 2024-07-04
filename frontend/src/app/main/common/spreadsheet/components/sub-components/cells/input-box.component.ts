import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	HostListener,
	inject,
	Input,
	Output
} from '@angular/core';
import _ from 'lodash';

import {
	DefaultValue,
	Memoize
} from '@core';
import {
	omitNonNumericChars
} from '@core/number-parser';

export enum InputBoxType {
	Text = 'text',
	Paragraph = 'paragraph',
	Number = 'number',
	Integer = 'integer',
	PositiveNumber = 'positive-number',
	PositiveInteger = 'positive-integer',
	Hyperlink = 'hyperlink',
}

export type InputBoxContent
	= string | number;

@Component({
	selector: 'input-box',
	template: '',
	styleUrls: [ './input-box.scss' ],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputBoxComponent implements AfterViewInit {

	@HostBinding( 'attr.contenteditable' )
	protected readonly attrContentEditable: string
			= 'plaintext-only';

	@Input() @DefaultValue()
	public type: InputBoxType = InputBoxType.Text;
	@HostBinding( 'attr.textContent' )
	@Input() public content: InputBoxContent;
	@HostBinding( 'attr.placeholder' )
	@Input() public placeholder: string;

	@Output() public edited: EventEmitter<InputBoxContent>
		= new EventEmitter<InputBoxContent>();

	private readonly _elementRef: ElementRef
		= inject( ElementRef );

	private _bkContent: InputBoxContent;

	get editor(): HTMLElement {
		return this
		._elementRef
		.nativeElement;
	}

	get textContent(): string {
		return this.editor.textContent;
	}
	set textContent( content: string ) {
		this.editor.textContent
			= content;
	}

	get isGenericNumberType(): boolean {
		return this.type === InputBoxType.Number
			|| this.type === InputBoxType.Integer
			|| this.type === InputBoxType.PositiveNumber
			|| this.type === InputBoxType.PositiveInteger;
	}

	@HostListener( 'click', [ '$event' ] )
	@HostListener( 'contextmenu', [ '$event' ] )
	@HostListener( 'wheel', [ '$event' ] )
	@HostListener( 'paste', [ '$event' ] )
	protected onEvents( e: Event ) {
		e.stopPropagation();
	}

	@HostListener( 'input', [ '$event' ] )
	protected onInput( e: InputEvent ) {
		e.stopPropagation();

		if ( !this.textContent
			|| !this.isGenericNumberType ) {
			return;
		}

		e.preventDefault();

		this._writeContent(
			this.textContent
		);
	}

	@HostListener( 'keydown', [ '$event' ] )
	protected onKeydown( e: KeyboardEvent ) {
		if ( e.code === 'Tab'
			|| ( !e.shiftKey
				&& e.code === 'Enter' ) ) {
			this.blur();
			return;
		}

		if ( e.code === 'Escape' ) {
			this.revert();
			this.blur();
			return;
		}

		if ( !this._validateKeyPress( e ) ) {
			e.preventDefault();
		}

		e.stopPropagation();
	}

	@HostListener( 'blur' )
	protected onBlur() {
		let content: InputBoxContent
			= this.textContent;

		if (
			this._compareContent(
				content,
				this._bkContent
			)
		) {
			return;
		}

		if ( this.isGenericNumberType ) {
			content = content
				? parseFloat( content )
				: null;
		}

		this.edited.emit( content );
	}

	ngAfterViewInit() {
		this._writeContent(
			this._bkContent
				= this.content
		);
	}

	/**
	 * @return {void}
	 */
	public revert() {
		this._writeContent(
			this._bkContent
		);
	}

	/**
	 * @param {KeyboardEvent} e
	 * @return {void}
	 */
	public keypress( e: KeyboardEvent ) {
		if ( !this._validateKeyPress( e ) ) {
			return;
		}

		this._writeContent( e.key );
	}

	/**
	 * @return {void}
	 */
	public focus() {
		this.editor.focus(
			{ preventScroll: false }
		);

		this._setCaretAtEnd();
	}

	/**
	 * @return {void}
	 */
	public blur() {
		this.editor.blur();
	}

	/**
	 * @param {KeyboardEvent} e
	 * @return {boolean}
	 */
	private _validateKeyPress(
		e: KeyboardEvent
	): boolean {
		let isValid: boolean = true;

		switch ( this.type ) {
			case InputBoxType.Paragraph:
				break;
			default:
				isValid = !e.shiftKey
					|| e.code !== 'Enter';
		}

		return isValid;
	}

	/**
	 * @param {InputBoxContent} content
	 * @return {void}
	 */
	private _writeContent(
		content: InputBoxContent
	) {
		let text: string
			= String( content ?? '' );

		if ( text ) {
			switch ( this.type ) {
				case InputBoxType.Number:
					text = omitNonNumericChars( text );
					break;
				case InputBoxType.Integer:
					text = omitNonNumericChars(
						text,
						true,
						true
					);
					break;
				case InputBoxType.PositiveNumber:
					text = omitNonNumericChars(
						text,
						false
					);
					break;
				case InputBoxType.PositiveInteger:
					text = omitNonNumericChars(
						text,
						false,
						true
					);
					break;
			}
		}

		if ( text === this.textContent ) {
			return;
		}

		this.textContent = text;

		this._setCaretAtEnd();
	}

	/**
	 * @param {InputBoxContent} source
	 * @param {InputBoxContent} destination
	 * @return {boolean}
	 */
	@Memoize()
	private _compareContent(
		source: InputBoxContent,
		destination: InputBoxContent
	): boolean {
		return String( source ?? '' )
			=== String( destination ?? '' );
	}

	/**
	 * @return {void}
	 */
	private _setCaretAtEnd() {
		const range: Range
			= document.createRange();

		range.selectNodeContents( this.editor );
		range.collapse( false );

		const selection: Selection
			= window.getSelection();

		selection.removeAllRanges();
		selection.addRange( range );
	}

}
