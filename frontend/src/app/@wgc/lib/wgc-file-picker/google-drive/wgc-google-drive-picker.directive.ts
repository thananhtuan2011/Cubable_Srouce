import {
	Directive, HostListener, Output,
	EventEmitter, Input
} from '@angular/core';

import { ENVIRONMENT } from '@environments/environment';
import { DefaultValue, CoerceBoolean } from '@core';

declare const gapi: any;
declare const google: any;

export interface WGCIGoogleDriveFile {
	description: string;
	embedUrl: string;
	iconUrl: string;
	id: string;
	isShared: boolean;
	lastEditedUtc: number;
	mimeType: string;
	name: string;
	organizationDisplayName: string;
	rotation: number;
	rotationDegree: number;
	serviceId: string;
	sizeBytes: number;
	type: string;
	url: string;
}

@Directive({ selector: '[wgcGoogleDrivePicker]', exportAs: 'wgcGoogleDrivePicker' })
export class WGCGoogleDrivePickerDirective {

	@Input() public mimeTypes: string[];
	@Input() @DefaultValue() @CoerceBoolean() public multiSelect: boolean = true;
	@Input() @CoerceBoolean() public disabled: boolean;

	@Output() public picked: EventEmitter<WGCIGoogleDriveFile[]> = new EventEmitter<WGCIGoogleDriveFile[]>();

	public pickerApiLoaded: boolean;

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
		gapi.load( 'auth', { callback: this._onAuthApiLoaded.bind( this ) } );
		gapi.load( 'picker', { callback: this._onPickerApiLoaded.bind( this ) } );
	}

	/**
	 * @return {void}
	 */
	private _onAuthApiLoaded() {
		google.accounts.oauth2.initTokenClient({
			// eslint-disable-next-line @typescript-eslint/naming-convention
			client_id: ENVIRONMENT.GOOGLE_CLIENT_ID,
			scope: 'https://www.googleapis.com/auth/drive',
			immediate: false,
			callback: this._handleAuthResult.bind( this ),
		}).requestAccessToken();
	}

	/**
	 * @return {void}
	 */
	private _onPickerApiLoaded() {
		this.pickerApiLoaded = true;
	}

	/**
	 * @param {ObjectType} authResult
	 * @return {void}
	 */
	private _handleAuthResult( authResult: ObjectType ) {
		if ( authResult?.error === 'popup_closed_by_user' ) return;

		if ( authResult?.error || !authResult?.access_token ) {
			this.picked.emit( undefined );
			return;
		}

		const pickerBuilder: typeof google.picker.PickerBuilder = new google.picker.PickerBuilder();
		const view: typeof google.picker.View = new google.picker.View( google.picker.ViewId.DOCS );

		view.setMimeTypes( this.mimeTypes );

		const picker: typeof pickerBuilder.build = pickerBuilder
		.enableFeature( google.picker.Feature.NAV_HIDDEN )
		.enableFeature( this.multiSelect ? google.picker.Feature.MULTISELECT_ENABLED : undefined )
		.setOAuthToken( authResult.access_token )
		.addView( view )
		.addView( new google.picker.DocsUploadView() )
		.setCallback( this._onPicked.bind( this ) )
		.build();

		picker.setVisible( true );
	}

	/**
	 * @param {ObjectType} event
	 * @return {void}
	 */
	private _onPicked( event: ObjectType ) {
		event[ google.picker.Response.ACTION ] === google.picker.Action.PICKED
			&& this.picked.emit( event[ google.picker.Response.DOCUMENTS ] );
	}

}
