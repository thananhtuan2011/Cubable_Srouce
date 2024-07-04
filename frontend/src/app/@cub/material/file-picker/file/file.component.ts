import {
	ChangeDetectionStrategy,
	Component,
	Input,
	ViewEncapsulation
} from '@angular/core';
import {
	ULID
} from 'ulidx';

import {
	CoerceBoolean
} from 'angular-core';

import {
	CUBFileObject
} from './file.object';

export enum CUBFileSource {
	Local = 'Local',
	GoogleDrive = 'Google Drive',
	OneDrive = 'One Drive',
	Dropbox = 'Dropbox',
}

export type CUBFile = {
	id: ULID;
	filename: string;
	mimeType: string;
	size: number;
	url: string;
	thumbnailUrl: string;
	source: CUBFileSource;
	attachedAt: Date;
	metadata: any;
};

@Component({
	selector: 'cub-file',
	templateUrl: './file.pug',
	styleUrls: [ './file.scss' ],
	host: { class: 'cub-file' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBFileComponent {

	@Input() @CoerceBoolean()
	public showNameOnTooltip: boolean;

	public fileObject: CUBFileObject
		= new CUBFileObject();

	@Input()
	set file( file: string | CUBFile ) {
		this.fileObject.update( file );
	}

}
