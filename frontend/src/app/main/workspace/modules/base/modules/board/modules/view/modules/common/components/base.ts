import {
	ChangeDetectorRef,
	Directive,
	EventEmitter,
	Input,
	Output,
	inject
} from '@angular/core';
import { ULID } from 'ulidx';

import {
	CoerceArray,
	CoerceBoolean
} from '@core';

import {
	View,
	ViewActiveEmit,
	ViewUpdate
} from '../../../interfaces';
import {
	SharingType,
	ViewType
} from '../../../resources';
import { ViewService } from '../../../services';

export type UpdateChange = {
	view: View;
	data: ViewUpdate;
};

export type SharedChange = {
	view: View;
	sharingStatus: SharingType;
};

@Directive()
export abstract class Base<T extends View> {

	@Input() @CoerceBoolean()
	public canCreate: boolean;
	@Input() @CoerceArray()
	public views: T[];
	@Input() public activeView: T;
	@Input() public tempView: T;
	@Input() public boardID: ULID;

	@Output() public updateChange: EventEmitter<UpdateChange>
		= new EventEmitter<UpdateChange>();
	@Output() public duplicateChange: EventEmitter<T>
		= new EventEmitter<T>();
	@Output() public deleteChange: EventEmitter<T>
		= new EventEmitter<T>();
	@Output() public activeViewChange: EventEmitter<ViewActiveEmit<T>>
		= new EventEmitter<ViewActiveEmit<T>>();
	@Output() public sharedChange: EventEmitter<SharedChange>
		= new EventEmitter<SharedChange>();
	@Output() public exportChange: EventEmitter<T>
		= new EventEmitter<T>();
	public readonly VIEW_TYPE: typeof ViewType = ViewType;
	public readonly SHARING_TYPE: typeof SharingType = SharingType;

	protected readonly viewService: ViewService
		= inject( ViewService );
	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

}
