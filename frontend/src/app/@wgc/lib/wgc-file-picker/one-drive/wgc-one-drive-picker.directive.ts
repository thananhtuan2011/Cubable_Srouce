import {
	Directive, HostListener, Output,
	EventEmitter, Input
} from '@angular/core';
import _ from 'lodash';

import { ENVIRONMENT } from '@environments/environment';
import { DefaultValue, CoerceBoolean } from '@core';

// eslint-disable-next-line @typescript-eslint/naming-convention
declare const OneDrive: any;

export interface WGCIOneDriveFile {
	'@microsoft.graph.downloadUrl': string;
	'@odata.context': string;
	id: string;
	name: string;
	size: number;
}

@Directive({ selector: '[wgcOneDrivePicker]', exportAs: 'wgcOneDrivePicker' })
export class WGCOneDrivePickerDirective {

	@Input() public extensions: string[];
	@Input() @DefaultValue() public action: string = 'download';
	@Input() @DefaultValue() @CoerceBoolean() public multiSelect: boolean = true;
	@Input() @CoerceBoolean() public disabled: boolean;

	@Output() public picked: EventEmitter<WGCIOneDriveFile[]> = new EventEmitter<WGCIOneDriveFile[]>();
	@Output() public cancelled: EventEmitter<void> = new EventEmitter<void>();
	@Output() public error: EventEmitter<unknown> = new EventEmitter<unknown>();

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
		OneDrive.open({
			clientId	: ENVIRONMENT.MICROSOFT_CLIENT_ID,
			action		: this.action,
			multiSelect	: this.multiSelect,
			advanced	: { redirectUri: ENVIRONMENT.APP_URL, filter: _.join( this.extensions, ',' ) },
			cancel		: () => this.cancelled.emit(),
			success		: ( { value }: { value: WGCIOneDriveFile[] } ) => this.picked.emit( value ),
			error		: ( error: unknown ) => this.error.emit( error ),
		});
	}

}
