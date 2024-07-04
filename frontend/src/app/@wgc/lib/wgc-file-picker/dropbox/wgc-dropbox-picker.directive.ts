import {
	Directive, HostListener, Output,
	EventEmitter, Input
} from '@angular/core';

import { DefaultValue, CoerceBoolean, CoerceNumber } from '@core';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const Dropbox: any;

export interface WGCIDropboxFile {
	bytes: number;
	icon: string;
	id: string;
	isDir: boolean;
	link: string;
	linkType: string;
	name: string;
	thumbnailLink: string;
}

@Directive({ selector: '[wgcDropboxPicker]', exportAs: 'wgcDropboxPicker' })
export class WGCDropboxPickerDirective {

	@Input() public extensions: string[];
	@Input() @DefaultValue() public linkType: string = 'direct';
	@Input() @CoerceNumber() public sizeLimit: number;
	@Input() @CoerceBoolean() public folderSelect: boolean;
	@Input() @DefaultValue() @CoerceBoolean() public multiSelect: boolean = true;
	@Input() @CoerceBoolean() public disabled: boolean;

	@Output() public picked: EventEmitter<WGCIDropboxFile[]> = new EventEmitter<WGCIDropboxFile[]>();
	@Output() public cancelled: EventEmitter<void> = new EventEmitter<void>();

	@HostListener( 'click', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	public triggerClick( event: Event ) {
		if ( this.disabled ) return;

		event.stopPropagation();
		event.preventDefault();
		this._loadPicker();
	}

	/**
	 * @return {void}
	 */
	private _loadPicker() {
		Dropbox.choose({
			success		: ( files: WGCIDropboxFile[] ) => this.picked.emit( files ),
			cancel		: () => this.cancelled.emit(),
			linkType	: this.linkType,
			multiselect	: this.multiSelect,
			folderselect: this.folderSelect,
			sizeLimit	: this.sizeLimit,
			extensions	: this.extensions,
		});
	}

}
