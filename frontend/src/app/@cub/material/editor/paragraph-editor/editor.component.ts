import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

/* Editor */
import EditorJS, {
	API,
	BlockMutationEvent,
	EditorConfig,
	OutputData
} from '@editorjs/editorjs';
/* Tools */
import AlignmentTuneTool from 'editorjs-text-alignment-blocktune';
import Checklist from '@editorjs/checklist';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Header from '@editorjs/header';
import InlineCode from '@editorjs/inline-code';
import List from '@editorjs/list';
import Marker from '@editorjs/marker';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import RawTool from '@editorjs/raw';
import Table from '@editorjs/table';
import Underline from '@editorjs/underline';
import DragDrop from 'editorjs-drag-drop';
import Undo from 'editorjs-undo';
import edjsParser from 'editorjs-parser';

import {
	CoerceBoolean
} from 'angular-core';

export type CUBParagraphEditorData = OutputData;
export type CUBParagraphEditorParseOutput = {
	html: string;
	text: string;
	data: CUBParagraphEditorData;
};

const defaultConfig: EditorConfig = {
	logLevel: 'ERROR' as any,
	tools: {
		alignmentTuneTool: {
			class: AlignmentTuneTool,
		},
		checklist: {
			class: Checklist,
		},
		code: {
			class: Code,
		},
		delimiter: {
			class: Delimiter,
		},
		header: {
			class: Header,
			shortcut: 'CMD+SHIFT+H',
			tunes: [ 'alignmentTuneTool' ],
		},
		inlineCode: {
			class: InlineCode,
			shortcut: 'CMD+SHIFT+M',
		},
		list: {
			class: List,
			config: {
				defaultStyle: 'unordered',
			},
		},
		marker: {
			class: Marker,
			shortcut: 'CMD+SHIFT+M',
		},
		paragraph: {
			class: Paragraph,
			tunes: [ 'alignmentTuneTool' ],
		},
		quote: {
			class: Quote,
			shortcut: 'CMD+SHIFT+O',
		},
		rawTool: {
			class: RawTool,
		},
		table: {
			class: Table,
		},
		underline: {
			class: Underline,
		},
	},
};

const parser: edjsParser = new edjsParser();

@Component({
	selector: 'cub-paragraph-editor',
	template: '<div #editorHolder></div>',
	styleUrls: [ './editor.scss' ],
	host: { class: 'cub-paragraph-editor' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBParagraphEditorComponent
implements OnChanges, OnDestroy, AfterViewInit {

	@Input() public data: CUBParagraphEditorData;
	@Input() public raw: string;
	@Input() public placeholder: string;
	@Input() @CoerceBoolean()
	public autoFocusOn: boolean;
	@Input() @CoerceBoolean()
	public readonly: boolean;
	@Input() public config: EditorConfig;

	@Output() public dataChange: EventEmitter<OutputData>
		= new EventEmitter<OutputData>();

	public editor: EditorJS;

	@ViewChild( 'editorHolder' )
	protected readonly editorHolder:
		ElementRef<HTMLDivElement>;

	ngOnChanges( changes: SimpleChanges ) {
		if ( !changes.data
			|| !changes.raw ) {
			return;
		}

		this._render();
	}

	ngOnDestroy() {
		this.editor.destroy();
	}

	ngAfterViewInit() {
		const onReadyFn: () => void
			= this.config?.onReady;
		const onChangeFn: (
			api: API,
			event: BlockMutationEvent
				| BlockMutationEvent[]
		) => void = this.config?.onChange;

		this.editor = new EditorJS({
			..._.defaultsDeep(
				defaultConfig,
				this.config
			),

			holder: this.editorHolder.nativeElement,
			placeholder: this.placeholder,
			autofocus: this.autoFocusOn,
			readOnly: this.readonly,
			onReady: () => {
				new DragDrop( this.editor );
				new Undo({ editor: this.editor });

				onReadyFn?.();
			},
			onChange: (
				api: API,
				event: BlockMutationEvent
					| BlockMutationEvent[]
			) => {
				if ( this.readonly ) return;

				api.saver
				.save()
				.then((
					outputData: OutputData
				) => {
					this.dataChange.emit(
						this.data = outputData
					);
				})
				.catch( console.error );

				onChangeFn?.( api, event );
			},
		});

		this._render();
	}

	/**
	 * @return {Promise}
	 */
	public save(): Promise<CUBParagraphEditorData> {
		return this.editor.save();
	}

	/**
	 * @param {CUBParagraphEditorData=} data
	 * @return {CUBParagraphEditorParseOutput | null}
	 */
	public parse(
		data: CUBParagraphEditorData = this.data
	): CUBParagraphEditorParseOutput | null {
		if ( !data?.blocks.length ) {
			return null;
		}

		const div: HTMLDivElement
			= document.createElement( 'div' );
		const html: string
			= parser.parse( data );

		div.innerHTML = html;

		const text: string = div.innerText;

		return { html, text, data };
	}

	/**
	 * @return {void}
	 */
	private _render() {
		this
		.editor
		?.isReady
		.then(() => {
			if ( this.data ) {
				this
				.editor
				.blocks
				.render( this.data );
			} else if ( this.raw ) {
				this
				.editor
				.blocks
				.renderFromHTML( this.raw );
			}
		})
		.catch( console.error );
	}

}
