import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostBinding,
	inject,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import Quill, {
	Delta,
	Op,
	QuillOptions
} from 'quill/core';
import {
	EmitterSource
} from 'quill/core/emitter';
import {
	Range
} from 'quill/core/selection';
import Module from 'quill/core/module';
import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Underline from 'quill/formats/underline';
import Strike from 'quill/formats/strike';
import Link from 'quill/formats/link';
import List from 'quill/formats/list';
import Blockquote from 'quill/formats/blockquote';
import CodeBlock, { Code } from 'quill/formats/code';
import _ from 'lodash';

import {
	CoerceBoolean
} from 'angular-core';

import './modules/register';
import TagBlot
	from './modules/tag/blot';
import TagModule
	from './modules/tag/module';
import MentionBlot, { MentionBlotValue }
	from './modules/mention/blot';
import MenntionModule
	from './modules/mention/module';

export type CUBBasicEditorContent = {
	delta: Op[];
	html: string;
	text: string;
};

export type CUBBasicEditorTextChangedEvent = {
	delta: Delta;
	oldContent: Delta;
	source: EmitterSource;
};

export type CUBBasicEditorSelectionChangedEvent = {
	range: Range;
	oldRange: Range;
	source: EmitterSource;
};

export function convertContentToDelta(
	content: CUBBasicEditorContent
): Delta | Op[] {
	let delta: Delta | Op[];

	if ( content ) {
		delta = content.delta
			|| new Delta([
				{
					insert: content.html
						|| content.text,
				},
			]);
	}

	return delta;
}

// eslint-disable-next-line @typescript-eslint/typedef
const TEXT_FORMATS = [
	Blockquote.blotName,
	Bold.blotName,
	Code.blotName,
	CodeBlock.blotName,
	Italic.blotName,
	Link.blotName,
	Strike.blotName,
	Underline.blotName,
] as const;
const ALLOWED_BASIC_FORMATS: string[] = [
	...TEXT_FORMATS,
	List.blotName,
];
const ALLOWED_CUSTOM_FORMATS: string[] = [
	TagBlot.blotName,
	MentionBlot.blotName,
];

type TextFormat = typeof TEXT_FORMATS[ number ];
type ListFormat = 'ordered' | 'bullet';

@Component({
	selector: 'cub-basic-editor',
	templateUrl: './editor.pug',
	styleUrls: [ './editor.scss' ],
	host: { class: 'cub-basic-editor' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBBasicEditorComponent
implements AfterViewInit, OnChanges {

	@Input() public content: CUBBasicEditorContent;
	@Input() public placeholder: string;
	@Input() @CoerceBoolean() public readonly: boolean;
	@HostBinding( 'class.cub-basic-editor--no-toolbar' )
	@Input() @CoerceBoolean() public noToolbar: boolean;
	@Input() @CoerceBoolean() public disableFormats: boolean;
	@Input() @CoerceBoolean() public submitOnEnterKey: boolean;
	@Input() @CoerceBoolean() public preventBreakLine: boolean;
	@Input() public options: QuillOptions;

	@Output() public textChanged:
		EventEmitter<CUBBasicEditorTextChangedEvent>
		= new EventEmitter();
	@Output() public selectionChanged:
		EventEmitter<CUBBasicEditorSelectionChangedEvent>
		= new EventEmitter();

	@ViewChild( 'editorHolder' )
	protected readonly editorHolder: ElementRef<HTMLDivElement>;

	public formatting: {
		bold?: boolean;
		italic?: boolean;
		underline?: boolean;
		strike?: boolean;
		link?: boolean;
		blockquote?: boolean;
		code?: boolean;
		codeBlock?: boolean;
		list?: 'ordered' | 'bullet';
	} = {};

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	private _quill: Quill;

	ngOnChanges( changes: SimpleChanges ) {
		if ( this._quill ) {
			if ( changes.content ) {
				this.setContent( this.content );
			}

			if ( changes.readonly ) {
				this.readonly
					? this.disable()
					: this.enable();
			}
		}
	}

	ngAfterViewInit() {
		const options: QuillOptions
			= _.defaultsDeep(
				this.options,
				{
					readOnly: this.readonly,
					placeholder: this.placeholder,
					modules: {
						keyboard: {
							bindings: {
								enter: {
									key: 'Enter',
									handler: (): boolean => {
										return !this.preventBreakLine
											&& !this.submitOnEnterKey;
									},
								},
								shiftEnter: {
									key: 'Enter',
									shiftKey: true,
									handler: (): boolean => {
										return !this.preventBreakLine;
									},
								},
								ctrlEnter: {
									key: 'Enter',
									ctrlKey: true,
									handler: (
										{ index, length }: Range
									): boolean => {
										if ( !this.preventBreakLine ) {
											this._quill.updateContents(
												new Delta()
												.delete( length )
												.retain( index )
												.insert( '\n' )
											);

											this._quill.setSelection(
												new Range( index + 1 )
											);
										}

										return !this.preventBreakLine;
									},
								},
							},
						},
						[ TagModule.moduleName ]: true,
					},
				}
			);

		if ( this.disableFormats ) {
			options.formats = [
				...ALLOWED_CUSTOM_FORMATS,
			];
		} else {
			options.formats = [
				...ALLOWED_BASIC_FORMATS,
				...ALLOWED_CUSTOM_FORMATS,
				...( options.formats || [] ),
			];
		}

		this._quill = new Quill(
			this.editorHolder.nativeElement,
			options
		);

		// Init content.
		this.setContent( this.content );

		this._quill.on(
			'text-change',
			(
				delta: Delta,
				oldContent: Delta,
				source: EmitterSource
			) => {
				this.textChanged.emit({
					delta,
					oldContent,
					source,
				});

				this._detectFormats();
			}
		);

		this._quill.on(
			'selection-change',
			(
				range: Range,
				oldRange: Range,
				source: EmitterSource
			) => {
				this.selectionChanged.emit({
					range,
					oldRange,
					source,
				});

				this._detectFormats( range );
			}
		);

		const rootNode: HTMLElement
			= this._quill.scroll.domNode;

		rootNode.addEventListener(
			'compositionstart',
			() => {
				rootNode.classList.add( 'ql-composition' );
			}
		);

		rootNode.addEventListener(
			'compositionend',
			() => {
				rootNode.classList.remove( 'ql-composition' );
			}
		);
	}

	/**
	 * Gets a Quill module.
	 * @param moduleName The name of module.
	 * @returns A Quill module.
	 */
	public getModule<T = Module>(
		moduleName: string
	): T {
		return this._quill.getModule(
			moduleName
		) as T;
	}

	/**
	 * Sets content of this editor.
	 * @param content
	 * @param source
	 */
	public setContent(
		content: CUBBasicEditorContent,
		source?: EmitterSource
	) {
		this._quill.setContents(
			convertContentToDelta( content ),
			source
		);
	}

	/**
	 * Clears content of this editor.
	 */
	public clear() {
		this.setContent( null );
	}

	/**
	 * Enables this editor.
	 */
	public enable() {
		this._quill.enable();
	}

	/**
	 * Disables this editor.
	 */
	public disable() {
		this._quill.disable();
	}

	/**
	 * Focus this editor.
	 */
	public focus( options?: FocusOptions ) {
		this._quill.focus( options );
	}

	/**
	 * Blur this editor.
	 */
	public blur() {
		this._quill.blur();
	}

	/**
	 * @returns A parsed content.
	 */
	public parse(): CUBBasicEditorContent {
		const delta: Op[]
			= this._quill.getContents().ops;
		const html: string
			= this._quill.getSemanticHTML().trim();
		const text: string
			= _.stripHtml( html ).trim();

		return { delta, html, text };
	}

	/**
	 * Formats text at current range.
	 * @param type
	 * @param source
	 */
	public formatText(
		type: TextFormat,
		source?: EmitterSource
	) {
		this._quill.format(
			type,
			this.formatting[ type ]
				= !this.formatting[ type ],
			source
		);
	}

	/**
	 * Formats list at current range.
	 * @param type
	 * @param source
	 */
	public formatList(
		type: ListFormat,
		source?: EmitterSource
	) {
		const range: Range
			= this._quill.getSelection();

		if ( !range ) {
			return;
		}

		this._quill.formatLine(
			range.index,
			range.length,
			List.blotName,
			type,
			source
		);
	}

	/**
	 * Inserts a text at current focus index.
	 * @param text
	 * @param index
	 * @param source
	 */
	public insertText(
		text: string,
		index: number = this._quill.getSelection( true )?.index,
		source?: EmitterSource
	) {
		index ??= 0;

		this._quill.insertText(
			index,
			text,
			source
		);
		this._quill.setSelection(
			new Range( index + text.length )
		);
	}

	/**
	 * Inserts a link at current focus index.
	 * @param text
	 * @param index
	 * @param source
	 */
	public insertLink(
		value: string | { url: string; text?: string },
		index: number = this._quill.getSelection( true )?.index,
		source?: EmitterSource
	) {
		index ??= 0;

		let url: string = value as string;
		let text: string = value as string;

		if ( !_.isString( value ) ) {
			url = value.url;
			text = value.text || url;
		}

		this._quill.insertText(
			index,
			text,
			source
		);
		this._quill.setSelection(
			index,
			text.length
		);
		this._quill.format(
			Link.blotName,
			url,
			source
		);
		this._quill.setSelection(
			new Range( index + text.length )
		);
	}

	/**
	 * Inserts a tag at current focus index.
	 * @param value
	 * @param index
	 * @param source
	 */
	public insertTag(
		value: any,
		index?: number,
		source?: EmitterSource
	) {
		const module: TagModule
			= this.getModule<TagModule>(
				TagModule.moduleName
			);

		module?.insert(
			value,
			index,
			source
		);
	}

	/**
	 * Inserts a mention at current focus index.
	 * @param value
	 * @param index
	 * @param source
	 */
	public insertMention(
		value: MentionBlotValue,
		index?: number,
		source?: EmitterSource
	) {
		const module: MenntionModule
			= this.getModule<MenntionModule>(
				MenntionModule.moduleName
			);

		module?.insert(
			value,
			index,
			source
		);
	}

	/**
	 * Detects format at current range.
	 * @param range
	 */
	private _detectFormats(
		range: Range = this._quill.getSelection()
	) {
		const format: Record<string, unknown>
			= range
				? this._quill.getFormat(
					range.index,
					range.length
				)
				: {};

		this.formatting[ Bold.blotName ]
			= !!format[ Bold.blotName ];
		this.formatting[ Italic.blotName ]
			= !!format[ Italic.blotName ];
		this.formatting[ Underline.blotName ]
			= !!format[ Underline.blotName ];
		this.formatting[ Strike.blotName ]
			= !!format[ Strike.blotName ];
		this.formatting[ Link.blotName ]
			= !!format[ Link.blotName ];
		this.formatting[ Blockquote.blotName ]
			= !!format[ Blockquote.blotName ];
		this.formatting[ Code.blotName ]
			= !!format[ Code.blotName ];
		this.formatting[ CodeBlock.blotName ]
			= !!format[ CodeBlock.blotName ];
		this.formatting[ List.blotName ]
			= format[ List.blotName ];

		this._cdRef.detectChanges();
	}

}
