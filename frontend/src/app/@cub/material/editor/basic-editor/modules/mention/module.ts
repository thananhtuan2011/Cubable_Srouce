import Quill, { Delta } from 'quill/core';
import Module from 'quill/core/module';
import {
	EmitterSource
} from 'quill/core/emitter';
import {
	Range
} from 'quill/core/selection';
import _ from 'lodash';

import MentionBlot, {
	MentionBlotAttachedSource,
	MentionBlotValue
} from './blot';

const BREAKLINE: RegExp = /\n/;
const DOUBLE_WHITESPACE: RegExp = /\s\s/;

export enum MentionKeyboard {
	ArrowUp = 'ArrowUp',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	ArrowRight = 'ArrowRight',
	Enter = 'Enter',
	Escape = 'Escape',
}

export type MentionProps = {
	defaultBlotValue: MentionBlotValue;
	denotationChar: string;
	maxChars: number;
	allowedChars: RegExp;
	spaceAfterInsert: boolean;
	onKeyboardEvents(
		module: MenntionModule,
		key: MentionKeyboard
	): boolean;
	onQueryStart(
		module: MenntionModule,
		query: string
	);
	onQueryEnd(
		module: MenntionModule
	);
	onMentionAttached(
		module: MenntionModule,
		blot: MentionBlot,
		attachedSource: MentionBlotAttachedSource
	);
	onMentionDetached(
		module: MenntionModule,
		blot: MentionBlot
	);
	onMentionClicked(
		module: MenntionModule,
		blot: MentionBlot,
		event: MouseEvent
	);
	onMentionHovered(
		module: MenntionModule,
		blot: MentionBlot,
		event: MouseEvent
	);
};

export default class MenntionModule
	extends Module<MentionProps> {

	/* eslint-disable @typescript-eslint/explicit-member-accessibility */
	static moduleName: string = 'mention';
	static DEFAULTS: Partial<MentionProps> = {
		denotationChar: '@',
		maxChars: 30,
		allowedChars: /[a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*/,
		spaceAfterInsert: true,
	};

	private _cursorPos: number;
	private _denotationCharPos: number;
	private _query: string;

	get isMentioning(): boolean {
		return this._denotationCharPos !== null;
	}

	constructor(
		quill: Quill,
		options: Partial<MentionProps>
	) {
		super( quill, options );

		quill
		.keyboard
		.bindings[ MentionKeyboard.Enter ]
		.unshift({
			key: MentionKeyboard.Enter,
			handler: (): boolean => {
				return this._onKeyboardEvents(
					MentionKeyboard.Enter
				);
			},
		});

		quill.keyboard.addBinding({
			key: MentionKeyboard.Escape,
			handler: (): boolean => {
				return this._onKeyboardEvents(
					MentionKeyboard.Escape
				);
			},
		});

		quill.keyboard.addBinding({
			key: MentionKeyboard.ArrowUp,
			handler: (): boolean => {
				return this._onKeyboardEvents(
					MentionKeyboard.ArrowUp
				);
			},
		});

		quill.keyboard.addBinding({
			key: MentionKeyboard.ArrowDown,
			handler: (): boolean => {
				return this._onKeyboardEvents(
					MentionKeyboard.ArrowDown
				);
			},
		});

		quill.keyboard.addBinding({
			key: MentionKeyboard.ArrowLeft,
			handler: (): boolean => {
				return this._onKeyboardEvents(
					MentionKeyboard.ArrowLeft
				);
			},
		});

		quill.keyboard.addBinding({
			key: MentionKeyboard.ArrowRight,
			handler: (): boolean => {
				return this._onKeyboardEvents(
					MentionKeyboard.ArrowRight
				);
			},
		});

		const denotationChar: string
			= options.denotationChar;
		const regex: RegExp
			= new RegExp(
				`^${denotationChar}|\\s${denotationChar}`,
				'g'
			);

		quill.on(
			'text-change',
			(
				_d: Delta,
				_od: Delta,
				source: EmitterSource
			) => {
				if ( source !== Quill.sources.USER ) {
					return;
				}

				try {
					const range: Range
						= quill.getSelection();

					if ( range === null ) {
						throw new Error( 'mention end' );
					}

					const cursorPos: number
						= range.index;
					const startPos: number
						= Math.max(
							0,
							cursorPos
								- this.options.maxChars
						);
					const text: string
						= quill.getText(
							startPos,
							Math.max( 1, cursorPos - startPos )
						);
					const lastMatch: string
						= text.match( regex )?.pop();

					if ( !lastMatch ) {
						throw new Error( 'mention end' );
					}

					const denotationCharIndex: number
						= lastMatch !== denotationChar
							? text.lastIndexOf( lastMatch )
								+ lastMatch.length
								- denotationChar.length
							: 0;
					const query: string
						= text.substring(
							denotationCharIndex
								+ denotationChar.length
						);

					if ( query.match( BREAKLINE )
						|| query.match( DOUBLE_WHITESPACE )
						|| !query.match( this.options.allowedChars ) ) {
						throw new Error( 'mention end' );
					}

					this._cursorPos = cursorPos;
					this._denotationCharPos
						= cursorPos
							- text.length
							+ denotationCharIndex;

					this.options.onQueryStart?.(
						this,
						this._query = query
					);
				} catch {
					this.exit();
				}
			}
		);

		const rootNode: Node
			= quill.scroll.domNode;

		rootNode.addEventListener(
			'compositionupdate',
			( e: CompositionEvent ) => {
				if ( this.isMentioning ) {
					this.options.onQueryStart?.(
						this,
						this._query + e.data
					);
				}
			}
		);

		rootNode.addEventListener(
			`${MentionBlot.blotName}-attached`,
			( e: CustomEvent ) => {
				this.options.onMentionAttached?.(
					this,
					e.detail.blot,
					e.detail.attachedSource
				);
			}
		);

		rootNode.addEventListener(
			`${MentionBlot.blotName}-detached`,
			( e: CustomEvent ) => {
				this.options.onMentionDetached?.(
					this,
					e.detail
				);
			}
		);

		rootNode.addEventListener(
			`${MentionBlot.blotName}-clicked`,
			( e: CustomEvent ) => {
				this.options.onMentionClicked?.(
					this,
					e.detail.blot,
					e.detail.event
				);
			}
		);

		rootNode.addEventListener(
			`${MentionBlot.blotName}-hovered`,
			( e: CustomEvent ) => {
				this.options.onMentionHovered?.(
					this,
					e.detail.blot,
					e.detail.event
				);
			}
		);
	}

	/**
	 * Exits the mention mode.
	 */
	public exit() {
		if ( !this.isMentioning ) {
			return;
		}

		this._cursorPos
			= this._denotationCharPos
			= this._query
			= null;

		this.options.onQueryEnd?.( this );
	}

	/**
	 * Inserts a mention blot.
	 * @param value
	 * @param index
	 * @param source
	 */
	public insert(
		value: Omit<MentionBlotValue, 'denotationChar'>,
		index?: number,
		source?: EmitterSource
	) {
		if ( this.isMentioning ) {
			index = Math.max(
				0,
				this._denotationCharPos
			);
			source = Quill.sources.USER;

			this.quill.deleteText(
				index,
				this._cursorPos
					- this._denotationCharPos
			);
		} else {
			index = this.quill.getSelection( true )?.index;
		}

		index ??= 0;

		this.quill.insertEmbed(
			index,
			MentionBlot.blotName,
			{
				...this.options.defaultBlotValue,
				...value,

				denotationChar:
					this.options.denotationChar,
			},
			source
		);

		// Inserts a space after inserted mention.
		if ( this.options.spaceAfterInsert ) {
			this.quill.insertText(
				++index,
				' ',
				Quill.sources.SILENT
			);
		}

		// Moves the cursor to after inserted mention.
		this.quill.setSelection(
			new Range( index + 1 )
		);

		this.exit();
	}

	/**
	 * Calls the keyboard events callback
	 * inside options of module.
	 * @param key
	 * @returns A boolean value in order to prevent this event.
	 */
	private _onKeyboardEvents(
		key: MentionKeyboard
	): boolean {
		let bool: boolean;

		if ( this.isMentioning ) {
			bool = this.options.onKeyboardEvents?.(
				this,
				key
			);
		}

		return bool ?? true;
	}

}
