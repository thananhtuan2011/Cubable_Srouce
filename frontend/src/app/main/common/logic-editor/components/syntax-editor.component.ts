import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceBoolean,
	Throttle,
	Unsubscriber
} from '@core';

import {
	CUBScrollBarComponent
} from '@cub/material/scroll-bar';

import {
	RESERVED_KEYWORDS
} from '../resources';
import {
	Highlighter,
	IReplacerInfo,
	Replacer
} from '../objects';
import {
	Field
} from '@main/common/field/objects';

export interface ITextSegment {
	text: string;
	length: number;
	node?: Node;
}

export interface ISelectionLine {
	row: number;
	column: number;
	indent: number;
	content: string;
}

export interface ISelection {
	anchorIndex: number;
	focusIndex: number;
	line: ISelectionLine;
	native: Selection;
}

export interface IPosition {
	start: number;
	end: number;
}

export interface IFoundWord extends IPosition {
	word: string;
}

export interface IRevision {
	content: string;
	selection: ISelection;
}

export const buildRegExp: ReturnType<typeof _.memoize> = _.memoize(
	function( arr: string[], flags: string = 'g' ): RegExp {
		// return new RegExp( _.map( arr, _.escapeRegExp ).join( '|' ), flags );
		return new RegExp( arr.join( '|' ), flags );
	},
	function( arr: string[], flags: string = 'g' ): string {
		return `/${ arr.join( '|' )}/${flags}`;
	}
);

export const getBracketType: ReturnType<typeof _.memoize> = _.memoize(
	function( bracket: string ): IBracketType {
		if ( bracket === '(' || bracket === ')' ) return 'round';
		if ( bracket === '[' || bracket === ']' ) return 'box';
		if ( bracket === '{' || bracket === '}' ) return 'curly';
	}
);

export const isOpeningBracket: ReturnType<typeof _.memoize> = _.memoize(
	function( char: string, type?: IBracketType ): boolean {
		switch ( type ) {
			case 'round':
				return char === '(';
			case 'box':
				return char === '[';
			case 'curly':
				return char === '{';
			default:
				return char === '(' || char === '[' || char === '{';
		}
	},
	function( char: string, type?: IBracketType ): string {
		return char + '|' + type;
	}
);

export const isClosingBracket: ReturnType<typeof _.memoize> = _.memoize(
	function( char: string, type?: IBracketType ): boolean {
		switch ( type ) {
			case 'round':
				return char === ')';
			case 'box':
				return char === ']';
			case 'curly':
				return char === '}';
			default:
				return char === ')' || char === ']' || char === '}';
		}
	},
	function( char: string, type?: IBracketType ): string {
		return char + '|' + type;
	}
);

export const findOpeningBracketPosition: ReturnType<typeof _.memoize>
	= _.memoize(
		function( text: string, pos: number ): number {
			if ( pos === null
				|| !text.length
				|| !text[ pos ]?.length ) {
				return null;
			}

			const bracketType: IBracketType
				= getBracketType( text[ pos ] );
			let matched: number = null;
			let skip: number = 0;
			let char: string;

			for ( let i: number = pos - 1; i >= 0; i-- ) {
				char = text[ i ];

				if ( isClosingBracket( char, bracketType ) ) skip++;

				if ( isOpeningBracket( char, bracketType ) ) {
					if ( skip ) skip--;
					else {
						matched = i;
						break;
					}
				}
			}

			return matched;
		},
		function(
			text: string,
			pos: number
		): string {
			return text + '|' + pos;
		}
	);

export const findClosingBracketPosition: ReturnType<typeof _.memoize>
	= _.memoize(
		function(
			text: string,
			pos: number
		): number {
			if ( pos === null
				|| !text.length
				|| !text[ pos ]?.length ) {
				return null;
			}

			const bracketType: IBracketType
				= getBracketType( text[ pos ] );
			let matched: number = null;
			let skip: number = 0;
			let char: string;

			for ( let i: number = pos + 1; i < text.length; i++ ) {
				char = text[ i ];

				if ( isOpeningBracket( char, bracketType ) ) skip++;

				if ( isClosingBracket( char, bracketType ) ) {
					if ( skip ) skip--;
					else {
						matched = i;
						break;
					}
				}
			}

			return matched;
		},
		function(
			text: string,
			pos: number
		): string {
			return text + '|' + pos;
		}
	);

export const findWordAt: ReturnType<typeof _.memoize>
	= _.memoize(
		function(
			text: string,
			pos: number
		): IFoundWord {
			let i: number = pos;
			let j: number = pos;
			let c: string;

			do { c = text[ --i ]?.trim() || ''; }
			while ( c.length && c.match( /\w|"/ ) );

			do { c = text[ j++ ]?.trim() || ''; }
			while ( c.length && c.match( /\w|"/ ) );

			const start: number = i + 1;
			const end: number = j - 1;
			const word: string = text.substring( start, end ).trim();

			return { word, start, end };
		},
		function(
			text: string,
			pos: number
		): string {
			return text + '|' + pos;
		}
	);

export const safeEval: ReturnType<typeof _.memoize> = _.memoize(
	function( script: string ): any {
		const whitelistRegexp: RegExp = /"(?:\\.|[^"\\])*"|true|false|null|undefined/g;
		const reservedKeywordRegexp: RegExp = buildRegExp( RESERVED_KEYWORDS );
		const words: string[] = script.split(
			new RegExp( `((?:${ whitelistRegexp.source })+)` ) );
		let execScript: string = '';

		for ( const word of words ) {
			if (
				!word.match( whitelistRegexp )
				&& word.match( reservedKeywordRegexp )
			) {
				throw new SyntaxError( 'Unexpected string' );
			}

			execScript += word;
		}

		return eval( execScript );
	}
);

export const IS_MACOS: boolean = /Mac/i.test( navigator.userAgent );
// export const SPLIT_WORD_REGEXP: RegExp = /((?:<[^>].*?>[\s\S]*?<\/[^>].*?>|"(?:\\.|[^"\\])*"|[^a-zA-Z0-9]| +)+)/;
export const SPLIT_WORD_REGEXP: RegExp = /((?:<[^>].*?>[\s\S]*?<\/[^>].*?>|"(?:\\.|[^"\\])*"| +)+)/;
export const SPLIT_MARK_TAG_REGEXP: RegExp = /((?:<mark>[\s\S]*?<\/mark>)+)/;
export const INDENT_REGEXP: RegExp = /^\t+/g;
export const HTML_REGEXP: RegExp = /<[^>].*?>[\s\S]*?<\/[^>].*?>/g;
export const STRING_REGEXP: RegExp = /("(?:\\.|[^"\\])*")|('(?:\\.|[^"\\])*')/g;
export const NUMBER_REGEXP: RegExp = /\d+\.?\d*|NaN|Infinity/g;
export const ATOM_REGEXP: RegExp = /true|false|null|undefined/g;
export const OPERATOR_REGEXP: RegExp = /=|<|>|%|!|\+|-|\*|\/|\&\&|\|\|/g;
export const COMMAS_REGEXP: RegExp = /,|;/g;

type IBracketType = 'round' | 'box' | 'curly';
type IReplacerFocusDirection = 'before' | 'after';

const DEFAULT_HIGHLIGHTERS: Highlighter[] = [
	new Highlighter( 'string', STRING_REGEXP ),
	new Highlighter( 'number', NUMBER_REGEXP ),
	new Highlighter( 'atom', ATOM_REGEXP ),
	new Highlighter( 'operator', OPERATOR_REGEXP ),
	new Highlighter( 'commas', COMMAS_REGEXP ),
];

@Unsubscriber()
@Component({
	selector		: 'syntax-editor',
	templateUrl		: '../templates/syntax-editor.pug',
	styleUrls		: [ '../styles/syntax-editor.scss' ],
	host			: { class: 'syntax-editor' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SyntaxEditorComponent
implements OnChanges, OnDestroy, AfterViewInit {

	@HostBinding( 'class.syntax-editor--readonly' )
	get classReadonly(): boolean { return this.readonly; }

	@HostBinding( 'class.syntax-editor--disabled' )
	get classDisabled(): boolean { return this.disabled; }

	@ViewChild( CUBScrollBarComponent ) public scrollBar: CUBScrollBarComponent;
	@ViewChild( 'editor' ) public editorEle: ElementRef<HTMLDivElement>;
	@ViewChild( 'placeholder' ) public placeholderEle: ElementRef<HTMLDivElement>;

	@Input() public content: string;
	@Input() public fields: Field[];

	@Input() @CoerceArray() public placeholder: string[];
	@Input() @CoerceBoolean() public autoFocusOn: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;
	@Input() @CoerceBoolean() public lineNumbers: boolean;
	@Input() public highlighters: Highlighter[];
	@Input() public replacers: Replacer[];
	@Input() public beforeKeydown: ( e: KeyboardEvent ) => boolean;
	@Input() public beforeHighlightBrackets:
		( text: string, start: number, end: number ) => boolean;

	@Output() public contentChange: EventEmitter<string>
		= new EventEmitter<string>();
	@Output( 'undo' ) public undoEE: EventEmitter<string>
		= new EventEmitter<string>();
	@Output( 'redo' ) public redoEE: EventEmitter<string>
		= new EventEmitter<string>();

	public editor: HTMLDivElement;
	public numberOfLines: number;
	public activeLine: number;

	private _isInsertCompositionText: boolean;
	private _highlightBracketPosition: IPosition;
	private _lastSelection: ISelection;
	private _previousRevisions: IRevision[] = [];
	private _nextRevisions: IRevision[] = [];
	private _editorCSSStyles: CSSStyleDeclaration;
	private _interval: NodeJS.Timeout;

	get canAction(): boolean {
		return !this.readonly && !this.disabled;
	}

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.content
			&& ( _.isStrictEmpty( changes.content.currentValue ) // Is clear content
				|| ( _.isStrictEmpty( changes.content.previousValue )
					&& !_.isStrictEmpty( changes.content.currentValue ) ) ) ) { // Is initial set content
			this.markAsUpdate();
		}
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		clearInterval( this._interval );

		document.removeEventListener( 'selectionchange', null );

		this.editor.removeEventListener( 'compositionstart', null );
		this.editor.removeEventListener( 'compositionend', null );
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this.editor = this.editorEle.nativeElement;
		this._editorCSSStyles = getComputedStyle( this.editor );

		this.markAsUpdate();

		this._setupAnimationPlaceholder();

		document.addEventListener( 'selectionchange', () => {
			const { height }: DOMRect = this.editor.getBoundingClientRect();
			const {
				paddingTop,
				paddingBottom,
				lineHeight,
			}: CSSStyleDeclaration = this._editorCSSStyles;

			this.numberOfLines = Math.round(
				( height
					- parseFloat( paddingTop )
					- parseFloat( paddingBottom )
				) / parseFloat( lineHeight )
			) || 1;

			if ( !this.canAction ) return;

			const { line }: ISelection = this.getSelection();

			this.activeLine = line?.row || 1;
		} );

		this.editor.addEventListener( 'compositionstart', () => {
			this._isInsertCompositionText = true;

			this._unhighlightBrackets();
		} );

		this.editor.addEventListener( 'compositionend', () => {
			this._isInsertCompositionText = false;

			this.markAsInput();
		} );
	}

	/**
	 * @param {Event} e
	 * @return {void}
	 */
	public onInput( e: Event ) {
		if ( !this.canAction || this._isInsertCompositionText ) return;

		switch ( ( e as InputEvent ).inputType ) {
			case 'deleteContentBackward':
				this._deleteReplacerNode();
				break;
		}

		this.markAsInput();

		this._setupAnimationPlaceholder();
	}

	/**
	 * @param {KeyboardEvent | MouseEvent | FocusEvent} e
	 * @return {void}
	 */
	public onEventStart( e: KeyboardEvent | MouseEvent | FocusEvent ) {
		if ( !this.canAction || this._isInsertCompositionText ) return;

		if ( e instanceof KeyboardEvent ) {
			if ( e.isComposing ) return;

			const isContinue: boolean = !this.beforeKeydown
				|| this.beforeKeydown( e );

			if ( !isContinue ) return;

			switch ( e.key ) {
				case 'Enter':
					e.preventDefault();

					this._stackCurrentRevision();

					this.insertBreakLine();
					break;
				case 'Tab':
					e.preventDefault();

					this._stackCurrentRevision();

					this.insertTab();
					break;
				case 'z':
					if ( IS_MACOS ? e.metaKey : e.ctrlKey ) {
						e.preventDefault();

						e.shiftKey ? this.redo() : this.undo();
					}
					break;
				default:
					!e.shiftKey
						&& !e.metaKey
						&& !e.ctrlKey
						&& !e.altKey
						&& this._stackCurrentRevision();
			}
		}

		this._unhighlightBrackets();
	}

	/**
	 * @param {KeyboardEvent | MouseEvent | FocusEvent} e
	 * @return {void}
	 */
	public onEventEnd( e: KeyboardEvent | MouseEvent | FocusEvent ) {
		if ( !this.canAction || this._isInsertCompositionText ) return;

		if ( e instanceof KeyboardEvent ) {
			if ( e.isComposing ) return;

			switch ( e.key ) {
				case 'ArrowLeft':
					this._focusReplacerNode( 'before' );
					break;
				case 'ArrowRight':
					this._focusReplacerNode( 'after' );
					break;
			}
		}

		this._lastSelection = this.getSelection();

		this._highlightBrackets();
	}

	/**
	 * @return {void}
	 */
	public undo() {
		this._undoPreviousRevision();

		this.undoEE.emit( this.content );
	}

	/**
	 * @return {void}
	 */
	public redo() {
		this._redoNextRevision();

		this.redoEE.emit( this.content );
	}

	/**
	 * @param {ITextSegment[]=} textSegments
	 * @return {ITextSegment}
	 */
	public serialize(
		textSegments: ITextSegment[] = this.getTextSegments( this.editor )
	): ITextSegment {
		let t: string = '';
		let l: number = 0;

		_.forEach( textSegments, ( { text, length }: ITextSegment ) => {
			t += text;
			l += length;
		} );

		return { text: t, length: l };
	}

	/**
	 * @param {number} anchorIndex
	 * @param {number} focusIndex
	 * @param {ITextSegment[]=} textSegments
	 * @return {IPosition}
	 */
	public convertIntoTextPosition(
		anchorIndex: number,
		focusIndex: number,
		textSegments: ITextSegment[] = this.getTextSegments( this.editor )
	): IPosition {
		let currentOffset: number = 0;
		let start: number = 0;
		let end: number = 0;

		_.forEach( textSegments, ( { text, length }: ITextSegment ) => {
			const endIndexOfNode: number = currentOffset + length;

			if ( anchorIndex > currentOffset ) {
				if ( anchorIndex >= endIndexOfNode ) {
					start += text.length;
				} else {
					start += anchorIndex - currentOffset;
				}
			}

			if ( focusIndex > currentOffset ) {
				if ( focusIndex >= endIndexOfNode ) {
					end += text.length;
				} else {
					end += focusIndex - currentOffset;
				}
			}

			currentOffset += length;
		} );

		return { start, end };
	}

	/**
	 * @param {number} anchorIndex
	 * @param {number} focusIndex
	 * @param {ITextSegment[]=} textSegments
	 * @return {string}
	 */
	public findText(
		anchorIndex: number,
		focusIndex: number,
		textSegments: ITextSegment[] = this.getTextSegments( this.editor )
	): string {
		const { text: serializedText }: ITextSegment
			= this.serialize( textSegments );

		if ( !serializedText.length ) return serializedText;

		const { start, end }: IPosition
			= this.convertIntoTextPosition(
				anchorIndex,
				focusIndex,
				textSegments );

		return serializedText.substring( start, end );
	}

	/**
	 * @param {number} focusIndex
	 * @param {ITextSegment[]=} textSegments
	 * @return {IFoundWord}
	 */
	public findWordAt(
		focusIndex: number,
		textSegments: ITextSegment[] = this.getTextSegments( this.editor )
	): IFoundWord {
		const { text: serializedText }: ITextSegment
			= this.serialize( textSegments );
		const { end: newPos }: IPosition
			= this.convertIntoTextPosition( null, focusIndex, textSegments );

		return findWordAt( serializedText, newPos );
	}

	/**
	 * @return {void}
	 */
	public insertBreakLine() {
		const { line, focusIndex }: ISelection = this.getSelection();
		const text: string = this.findText( focusIndex - 1, focusIndex );
		const indent: number = line.indent;

		if ( isOpeningBracket( text ) ) {
			let str: string = '\n';
			let focusOffet: number = 0;

			str += _.fill( Array( indent + 1 ), '\t' ).join( '' );

			if ( isClosingBracket(
				this.findText( focusIndex, focusIndex + 1 ),
				getBracketType( text )
			) ) {
				str += '\n';
				str += _.fill( Array( indent ), '\t' ).join( '' );

				focusOffet -= indent + 1;
			}

			this.insertText( str, undefined, focusOffet );
		} else {
			// Insert line break
			// eslint-disable-next-line deprecation/deprecation
			document.execCommand( 'insertLineBreak' );

			// Insert indent
			// eslint-disable-next-line deprecation/deprecation
			indent > 0 && document.execCommand(
				'insertHTML',
				false,
				_.fill( Array( indent ), '&#009' ).join( '' )
			);
		}

		// Scroll to caret position
		const {
			paddingTop,
			paddingBottom,
			lineHeight,
		}: CSSStyleDeclaration = this._editorCSSStyles;
		const {
			scrollTop,
			viewportHeight,
		}: typeof this.scrollBar = this.scrollBar;
		let top: number = ( this.activeLine + 1 ) * parseFloat( lineHeight );

		if ( top < scrollTop + viewportHeight ) return;

		top -= viewportHeight
			+ parseFloat( paddingTop )
			+ parseFloat( paddingBottom );

		this.scrollBar.scrollTo({ left: 0, top });
	}

	/**
	 * @return {void}
	 */
	public insertTab() {
		this.insertText( '\t' );
	}

	/**
	 * @param {string} text
	 * @param {IPosition=} position
	 * @param {number=} newFocusOffset
	 * @return {void}
	 */
	public insertText(
		text: string,
		position?: IPosition,
		newFocusOffset: number = 0
	) {
		this._unhighlightBrackets();

		const selection: ISelection
			= this._lastSelection || this.getSelection();
		const textSegments: ITextSegment[]
			= this.getTextSegments( this.editor );
		const { anchorIndex, focusIndex }: ISelection = selection;
		const {
			text: serializedText,
			length: serializedLength,
		}: ITextSegment = this.serialize( textSegments );

		position = position
			|| this.convertIntoTextPosition(
				anchorIndex,
				focusIndex,
				textSegments );

		const start: number = !isNaN( position.start ) ? position.start : 0;
		const end: number
			= !isNaN( position.end )
				? position.end
				: serializedLength;
		const replacer: Replacer
			= Replacer.find(
				this.replacers,
				text ) as Replacer;
		const newFocusPosition: number = start
			+ newFocusOffset
			+ ( anchorIndex - end )
			+ ( replacer
				? Replacer.parseNode(
					replacer.render( text, this.fields ) ).length
				: text.length );

		this.markAsInput(
			serializedText.substring( 0, start )
				+ text
				+ serializedText.substring( end ),
			{
				...selection,
				anchorIndex: newFocusPosition,
				focusIndex: newFocusPosition,
			}
		);
		this.editor.focus();

		this._lastSelection = this.getSelection();
	}

	/**
	 * @param {string=} content
	 * @return {void}
	 */
	public updateContent(
		content: string = this.serialize().text
	) {
		this.contentChange.emit( this.content = content );
	}

	/**
	 * @param {string=} content
	 * @param {ISelection=} selection
	 * @return {void}
	 */
	public markAsInput( content?: string, selection?: ISelection ) {
		this.updateContent( content );
		this.markAsUpdate( selection );
	}

	/**
	 * @param {ISelection=} selection
	 * @return {void}
	 */
	public markAsUpdate( selection?: ISelection ) {
		if ( !this.editor ) return;

		const {
			anchorIndex,
			focusIndex,
		}: ISelection = selection || this.getSelection();

		this.editor.innerHTML = this._renderHTML( this.content );

		this.restoreSelection( anchorIndex, focusIndex );
	}

	/**
	 * @param {Node} element
	 * @return {ITextSegment[]}
	 */
	public getTextSegments( element: Node ): ITextSegment[] {
		const textSegments: ITextSegment[] = [];

		_.forEach( element.childNodes, ( node: Node ) => {
			switch ( node.nodeType ) {
				case Node.TEXT_NODE:
					textSegments.push({
						text: node.nodeValue,
						length: node.nodeValue.length,
						node,
					});
					break;
				case Node.ELEMENT_NODE:
					if ( Replacer.isNode( node ) ) {
						const { matched: text, length }: IReplacerInfo
							= Replacer.parseNode( node );

						textSegments.push({ text, length, node });
					} else {
						textSegments.splice(
							textSegments.length,
							0,
							...this.getTextSegments( node )
						);
					}
					break;
				default:
					throw new Error(
						`Unexpected node type: ${ node.nodeType }` );
			}
		} );

		return textSegments;
	}

	/**
	 * @return {ISelection}
	 */
	public getSelection(): ISelection {
		const sel: Selection = window.getSelection();
		const {
			anchorNode,
			anchorOffset,
			focusNode,
			focusOffset,
		}: Selection = sel;
		let anchorIndex: number = null;
		let focusIndex: number = null;
		let line: ISelectionLine = null;

		if ( this.editor === document.activeElement ) {
			const textSegments: ITextSegment[]
				= this.getTextSegments( this.editor );
			const {
				text: serializedText,
				length: serializedLength,
			}: ITextSegment = this.serialize( textSegments );

			// Get anchor & focus informations
			let currentOffset: number = 0;

			_.forEach( textSegments, ( { length, node }: ITextSegment ) => {
				if (
					node === anchorNode
				) anchorIndex = currentOffset + anchorOffset;
				else if (
					this.editor === anchorNode ) anchorIndex = serializedLength;
				else if ( anchorNode
					&& node === anchorNode.parentNode
					&& Replacer.isNode( node )
					&& Replacer.isNode( anchorNode.parentNode ) ) {
					anchorIndex = currentOffset + ( anchorOffset ? length : 0 );
				}

				if (
					node === focusNode
				) focusIndex = currentOffset + focusOffset;
				else if (
					this.editor === focusNode
				) focusIndex = serializedLength;
				else if ( focusNode
					&& node === focusNode.parentNode
					&& Replacer.isNode( node )
					&& Replacer.isNode( focusNode.parentNode ) ) {
					focusIndex = currentOffset + ( focusOffset ? length : 0 );
				}

				currentOffset += length;
			} );

			// Get line informations
			let row: number = null;
			let column: number = null;
			let content: string = null;
			let indent: number = null;

			if ( focusIndex !== null ) {
				const subText: string
					= this.findText(
						0,
						focusIndex,
						textSegments
					);

				row = subText.split( '\n' ).length;
				column = subText.split( '\n' ).pop().length;
				content = serializedText.split( '\n' )[ row - 1 ];
				indent = content.match( INDENT_REGEXP )?.[ 0 ]?.length || 0;
			}

			line = { row, column, indent, content };
		}

		return {
			anchorIndex,
			focusIndex,
			line,
			native: sel,
		};
	}

	/**
	 * @param {number} absoluteAnchorIndex
	 * @param {number} absoluteFocusIndex
	 * @return {void}
	 */
	public restoreSelection(
		absoluteAnchorIndex: number,
		absoluteFocusIndex: number
	) {
		if ( absoluteAnchorIndex === null
			|| absoluteFocusIndex === null ) {
			return;
		}

		const sel: Selection = window.getSelection();
		const textSegments: ITextSegment[]
			= this.getTextSegments( this.editor );
		let anchorNode: Node = this.editor;
		let anchorOffset: number = 0;
		let focusNode: Node = this.editor;
		let focusOffset: number = 0;
		let currentOffset: number = 0;

		_.forEach( textSegments, ( { length, node }: ITextSegment ) => {
			const startIndexOfNode: number = currentOffset;
			const endIndexOfNode: number = startIndexOfNode + length;

			if ( startIndexOfNode <= absoluteAnchorIndex
					&& absoluteAnchorIndex <= endIndexOfNode ) {
				anchorNode = node;
				anchorOffset = absoluteAnchorIndex - startIndexOfNode;
			}

			if ( startIndexOfNode <= absoluteFocusIndex
					&& absoluteFocusIndex <= endIndexOfNode ) {
				focusNode = node;
				focusOffset = absoluteFocusIndex - startIndexOfNode;
			}

			currentOffset += length;
		} );

		sel.setBaseAndExtent(
			anchorNode,
			anchorOffset,
			focusNode,
			focusOffset
		);
	}

	/**
	 * @param {string} text
	 * @return {string}
	 */
	private _renderHTML( text: string ): string {
		if ( !text?.length ) return '';

		const replacers: Replacer[] = this.replacers || [];
		const highlighters: Highlighter[]
			= _.concat( DEFAULT_HIGHLIGHTERS, this.highlighters || [] );
		const regexp: RegExp = buildRegExp( _.flatten([
			_.map( replacers, 'matcher.source' ),
			_.map( highlighters, 'matcher.source' ),
		]) );
		let words: string[] = [];

		if ( this._highlightBracketPosition ) {
			const { start, end }: IPosition = this._highlightBracketPosition;

			text = _.reduce(
				text,
				( memo: string, t: string, index: number ) => {
					memo += index === start
					|| index === end
						? `<mark>${ t }</mark>`
						: t;

					return memo;
				}, '' );

			_.forEach( text.split( SPLIT_WORD_REGEXP ), ( word: string ) => {
				const arr: string[] = word.split( SPLIT_MARK_TAG_REGEXP );

				arr.length > 1
					? words.push( ...arr )
					: words.push( word );
			} );
		} else {
			words = text.split( SPLIT_WORD_REGEXP );
		}

		return _.map( words, ( word: string ) => {
			return word.replace(
				regexp,
				( matched: string ): string => {
					let isReplaced: boolean;

					if ( !word.match( HTML_REGEXP ) ) {
						if ( !matched.match( STRING_REGEXP ) ) { // Prevent replace in string (double quotes)
							const replacer: Replacer
								= Replacer.find(
									replacers,
									matched ) as Replacer;

							if ( replacer ) {
								isReplaced = true;
								matched = replacer.render(
									matched,
									this.fields).outerHTML;
							}
						}

						if ( !isReplaced ) {
							const highlighter: Highlighter
								= Replacer.find(
									highlighters,
									matched ) as Highlighter;

							if (
								highlighter
							) matched = highlighter.replace( matched );
						}
					}

					return matched;
				}
			);
		}).join( '' );
	}

	/**
	 * @return {IRevision}
	 */
	private _getCurrentRevision(): IRevision {
		const content: string = this.content || '';
		const selection: ISelection = this.getSelection();

		return { content, selection };
	}

	/**
	 * @return {void}
	 */
	@Throttle( 400 )
	private _stackCurrentRevision() {
		this._nextRevisions = [];

		this._previousRevisions.push( this._getCurrentRevision() );
	}

	/**
	 * @return {void}
	 */
	private _undoPreviousRevision() {
		if ( !this._previousRevisions.length ) return;

		this._nextRevisions.push( this._getCurrentRevision() );

		const revision: IRevision = this._previousRevisions.pop();
		const { content, selection }: IRevision = revision || {} as IRevision;

		this.updateContent( content );

		this.markAsUpdate( selection );
	}

	/**
	 * @return {void}
	 */
	private _redoNextRevision() {
		if ( !this._nextRevisions.length ) return;

		this._previousRevisions.push( this._getCurrentRevision() );

		const revision: IRevision = this._nextRevisions.pop();
		const { content, selection }: IRevision = revision || {} as IRevision;

		this.updateContent( content );

		this.markAsUpdate( selection );
	}

	/**
	 * @return {void}
	 */
	private _setupAnimationPlaceholder() {
		const placeholder: string[]
			= _.filter(
				this.placeholder,
				( p: string ) => !_.isStrictEmpty( p ) );

		if ( !placeholder.length ) return;

		clearInterval( this._interval );

		const element: HTMLDivElement = this.placeholderEle.nativeElement;
		let i: number = 0;

		element.innerHTML = '';
		element.innerHTML = placeholder[ i++ ];

		this._interval = setInterval( () => {
			if ( i >= placeholder.length ) i = 0;

			element.innerHTML = '';
			setTimeout( () => element.innerHTML = placeholder[ i++ ], 50 );
		}, 6000 );
	}

	/**
	 * @return {void}
	 */
	private _highlightBrackets() {
		this._highlightBracketPosition = null;

		const { focusIndex, native }: ISelection = this.getSelection();

		if ( focusIndex === null || native.toString().length ) return;

		const textSegments: ITextSegment[]
			= this.getTextSegments( this.editor );
		const { text: serializedText }: ITextSegment
			= this.serialize( textSegments );

		if ( !serializedText.length ) return;

		const { end: newPos }: IPosition
			= this.convertIntoTextPosition( null, focusIndex, textSegments );
		const currentChar: string = serializedText[ newPos ];
		const previousChar: string = serializedText[ newPos - 1 ];
		let start: number = null;
		let end: number = null;

		if ( isOpeningBracket( currentChar ) ) {
			start = newPos;
			end = findClosingBracketPosition( serializedText, start );
		} else if ( isOpeningBracket( previousChar ) ) {
			start = newPos - 1;
			end = findClosingBracketPosition( serializedText, start );
		} else if ( isClosingBracket( currentChar ) ) {
			end = newPos;
			start = findOpeningBracketPosition( serializedText, end );
		} else if ( isClosingBracket( previousChar ) ) {
			end = newPos - 1;
			start = findOpeningBracketPosition( serializedText, end );
		}

		if ( start === null || end === null ) return;

		const isContinue: boolean = !this.beforeHighlightBrackets
			|| this.beforeHighlightBrackets( serializedText, start, end );

		if ( !isContinue ) return;

		this._highlightBracketPosition = { start, end };

		this.markAsUpdate();
	}

	/**
	 * @return {void}
	 */
	private _unhighlightBrackets() {
		if ( !this._highlightBracketPosition ) return;

		this._highlightBracketPosition = null;

		this.markAsUpdate();
	}

	/**
	 * @param {IReplacerFocusDirection} direction
	 * @return {void}
	 */
	private _focusReplacerNode( direction: IReplacerFocusDirection ) {
		const {
			anchorIndex,
			focusIndex,
			native,
		}: ISelection = this.getSelection();

		if ( native.toString().length ) return;

		const { focusNode, focusOffset }: Selection = native;

		if ( !Replacer.isNode( focusNode.parentNode ) ) return;

		switch ( direction ) {
			case 'before':
				focusNode === focusNode.parentNode.lastChild
					&& !focusOffset
					&& this.restoreSelection( anchorIndex, focusIndex );
				break;
			case 'after':
				focusNode === focusNode.parentNode.firstChild
					&& focusOffset
					&& this.restoreSelection( anchorIndex, focusIndex );
				break;
		}
	}

	/**
	 * @return {void}
	 */
	private _deleteReplacerNode() {
		const {
			focusNode,
			focusOffset,
		}: Selection = window.getSelection();
		let node: Node;

		if ( focusOffset ) {
			node = focusNode;
		} else if ( focusNode.nodeType === Node.TEXT_NODE
			&& focusNode.parentNode !== this.editor ) {
			node = focusNode.parentNode.previousSibling;
		} else {
			node = focusNode.previousSibling;
		}

		if ( !Replacer.isNode( node ) ) return;

		( node as HTMLElement ).remove();

		this.updateContent();
	}

}
