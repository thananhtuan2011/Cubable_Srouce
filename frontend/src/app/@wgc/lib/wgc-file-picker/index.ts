import { WGCIFile } from './wgc-file-picker.component';

export * from './google-drive/wgc-google-drive-picker.directive';
export * from './dropbox/wgc-dropbox-picker.directive';
export * from './one-drive/wgc-one-drive-picker.directive';
export * from './wgc-file-picker.component';
export * from './wgc-file-picker.directive';
export * from './wgc-file-picker.module';

export function openFile( file: WGCIFile ): boolean {
	let cannotOpen: boolean;

	switch ( file.attachmentType ) {
		case 'google-drive':
			openNewWindow( file.url );
			break;
		case 'dropbox':
			openNewWindow( file.link );
			break;
		case 'one-drive':
			openNewWindow( file[ '@microsoft.graph.downloadUrl' ] );
			break;
		default:
			cannotOpen = true;
	}

	return !cannotOpen;
}

export function openNewWindow( url: string ) {
	const win: Window = window.open( url, '_blank' );

	win?.focus();
}
