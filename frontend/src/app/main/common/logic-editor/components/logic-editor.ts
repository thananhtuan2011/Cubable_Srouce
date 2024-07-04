import {
	ChangeDetectorRef,
	Directive,
	EventEmitter,
	HostBinding,
	inject,
	Input,
	Output,
	ViewChild
} from '@angular/core';
import _ from 'lodash';

import { CoerceBoolean } from '@core';

import {
	SyntaxEditorComponent
} from './syntax-editor.component';

export interface ISyntaxError {
	key: string;
	params: ObjectType;
}

export interface IParsedValue {
	html: string;
	text: string;
	content: string;
	value: string;
}

@Directive()
export abstract class LogicEditor {

	@HostBinding( 'class.logic-editor--readonly' )
	get classReadonly(): boolean { return this.readonly; }

	@HostBinding( 'class.logic-editor--disabled' )
	get classDisabled(): boolean { return this.disabled; }

	@ViewChild( SyntaxEditorComponent ) public syntaxEditor: SyntaxEditorComponent;

	@Input() public content: string;
	@Input() @CoerceBoolean() public autoFocusOn: boolean;
	@Input() @CoerceBoolean() public readonly: boolean;
	@Input() @CoerceBoolean() public disabled: boolean;

	@Output() public contentChange: EventEmitter<string> = new EventEmitter<string>();

	public isSyntaxChecking: boolean;
	public syntaxError: ISyntaxError;

	protected readonly cdRef: ChangeDetectorRef = inject( ChangeDetectorRef );

	get value(): string {
		return _.chain( this.content )
		.replace( /\n|\t|\r|\s\s/g, ' ' ) // breakline/tab/carriage return/double spaces
		.trim()
		.value();
	}

	/**
	 * @return {IParsedValue}
	 */
	public parse(): IParsedValue {
		if ( !this.syntaxEditor?.editor ) return;

		const html: string = this.syntaxEditor.editor.innerHTML || null;
		const text: string = this.syntaxEditor.editor.innerText || null;
		const content: string = this.content || null;
		const value: string = this.value || null;

		return {
			html,
			text,
			content,
			value,
		};
	}

	/**
	 * @return {ISyntaxError}
	 */
	public abstract checkSyntax(): ISyntaxError;

}
