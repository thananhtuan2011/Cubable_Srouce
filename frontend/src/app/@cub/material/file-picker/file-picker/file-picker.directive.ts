import {
	Directive,
	EventEmitter,
	HostListener,
	inject,
	Input,
	Output
} from '@angular/core';
import {
	take
} from 'rxjs/operators';

import {
	CoerceBoolean
} from 'angular-core';

import {
	CUBPopupRef
} from '../../popup';

import {
	CUBFilePickerPickedEvent
} from './file-picker.component';
import {
	CUBFilePickerService
} from './file-picker.service';

@Directive({
	selector: '[cubFilePicker]',
	exportAs: 'cubFilePicker',
})
export class CUBFilePickerDirective {

	@Input() public authorizedKey: string;
	@Input() public fileAccept: string | string[];
	@Input() @CoerceBoolean()
	public imageOnly: boolean;
	@Input() @CoerceBoolean()
	public multiSelect: boolean;
	@Input() @CoerceBoolean()
	public disabled: boolean;

	@Output() public opened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public closed: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public picked: EventEmitter<CUBFilePickerPickedEvent>
		= new EventEmitter<CUBFilePickerPickedEvent>();

	private readonly _pickerService: CUBFilePickerService
		= inject( CUBFilePickerService );

	private _popupRef: CUBPopupRef;

	@HostListener( 'click' )
	protected onClick() {
		if ( this.disabled ) {
			return;
		}

		this.open();
	}

	/**
	 * @return {void}
	 */
	public open() {
		if ( this._popupRef?.isOpened ) {
			return;
		}

		this._popupRef
			= this
			._pickerService
			.pick({
				authorizedKey: this.authorizedKey,
				fileAccept: this.fileAccept,
				imageOnly: this.imageOnly,
				multiSelect: this.multiSelect,
				onPicked: this._onPicked.bind( this ),
			});

		this._popupRef
		.afterOpened()
		.pipe( take( 1 ) )
		.subscribe(() => {
			this.opened.emit();
		});

		this._popupRef
		.afterClosed()
		.pipe( take( 1 ) )
		.subscribe(() => {
			this.closed.emit();
		});
	}

	/**
	 * @return {void}
	 */
	public close() {
		if ( !this._popupRef?.isOpened ) {
			return;
		}

		this._popupRef.close();
	}

	/**
	 * @param {CUBFilePickerPickedEvent} event
	 * @return {void}
	 */
	private _onPicked(
		event: CUBFilePickerPickedEvent
	) {
		this.picked.emit( event );

		this.close();
	}

}
