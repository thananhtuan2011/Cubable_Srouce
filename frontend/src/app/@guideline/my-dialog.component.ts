import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';

import { WGC_DIALOG_DATA, WGC_DIALOG_REF, WGCIDialogRef } from '@wgc/wgc-dialog';

@Component({
	selector		: 'my-dialog',
	templateUrl		: './my-dialog.pug',
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class MyDialogComponent {

	/**
	 * @constructor
	 * @param {ObjectType} data
	 * @param {Dialog} dialogRef
	 */
	constructor(
		@Inject( WGC_DIALOG_DATA ) public data: ObjectType,
		@Inject( WGC_DIALOG_REF ) public dialogRef: WGCIDialogRef
	) {}

}
