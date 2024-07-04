import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild,
	ViewEncapsulation
} from '@angular/core';
import Quill, {
	QuillOptions
} from 'quill/core';
import _ from 'lodash';

import TagModule
	from './modules/tag/module';
import {
	convertContentToDelta,
	CUBBasicEditorContent
} from './editor.component';

@Component({
	selector: 'cub-basic-editor-content-viewer',
	template: '<div #editorHolder></div>',
	styleUrls: [ './content-viewer.scss' ],
	host: { class: 'cub-basic-editor-content-viewer' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBBasicEditorContentViewerComponent
implements AfterViewInit, OnChanges {

	@Input() public content: CUBBasicEditorContent;
	@Input() public options: Omit<QuillOptions, 'readOnly'>;

	@ViewChild( 'editorHolder' )
	protected readonly editorHolder:
		ElementRef<HTMLDivElement>;

	private _quill: Quill;

	ngOnChanges( changes: SimpleChanges ) {
		if ( this._quill ) {
			if ( changes.content ) {
				this.setContent( this.content );
			}
		}
	}

	ngAfterViewInit() {
		this._quill = new Quill(
			this.editorHolder.nativeElement,
			_.defaultsDeep(
				this.options,
				{
					modules: {
						[ TagModule.moduleName ]: true,
					},
				}
			)
		);

		// Always disable the editor
		this._quill.disable();

		// Init content
		this.setContent( this.content );
	}

	/**
	 * Sets content of the quill editor
	 * @param content
	 */
	public setContent(
		content: CUBBasicEditorContent
	) {
		this._quill.setContents(
			convertContentToDelta( content ),
			'silent'
		);
	}

}
