import {
	Directive,
	ElementRef,
	EventEmitter,
	HostListener,
	inject,
	Input,
	Output
} from '@angular/core';
import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from 'angular-core';

import {
	CUBMenuRef,
	CUBMenuService
} from '../../menu';

import {
	CUBEmojiData,
	CUBEmojiPickerComponent
} from './emoji-picker.component';

@Unsubscriber()
@Directive({
	selector: '[cubEmojiPicker]',
	exportAs: 'cubEmojiPicker',
})
export class CUBEmojiPickerDirective {

	@Input( 'cubEmojiPickerDisableOpen' ) @CoerceBoolean()
	public disableOpen: boolean;
	@Input( 'cubEmojiPickerCloseAfterPicked' ) @DefaultValue() @CoerceBoolean()
	public closeAfterPicked: boolean = true;

	@Output() public opened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public closed: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public picked: EventEmitter<CUBEmojiData>
		= new EventEmitter<CUBEmojiData>();
	@Output( 'cubEmojiPickerChange' )
	public pickedEmojiChange: EventEmitter<CUBEmojiData>
			= new EventEmitter<CUBEmojiData>();

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _menuService: CUBMenuService
		= inject( CUBMenuService );

	private _menuRef: CUBMenuRef<CUBEmojiPickerComponent>;
	private _pickedEmoji: CUBEmojiData;

	get isOpened(): boolean {
		return !!this._menuRef?.isOpened;
	}

	@Input( 'cubEmojiPicker' )
	get pickedEmoji(): CUBEmojiData {
		return this._pickedEmoji;
	}
	set pickedEmoji( emoji: CUBEmojiData ) {
		this._pickedEmoji = emoji;

		if ( !this._menuRef ) return;

		this._menuRef.instance.picked = emoji;
	}

	@HostListener( 'click', [ '$event' ] )
	protected onClick() {
		if ( this.disableOpen ) return;

		this.open();
	}

	/**
	 * @return {void}
	 */
	public open() {
		if ( this.isOpened ) return;

		this._menuRef = this._menuService.open(
			this._elementRef,
			CUBEmojiPickerComponent
		);

		this._menuRef
		.afterOpened()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(() => {
			this.opened.emit();

			const { instance }: CUBMenuRef<CUBEmojiPickerComponent>
				= this._menuRef;

			instance.picked = this.pickedEmoji;

			instance.pickedChange
			.pipe( untilCmpDestroyed( this ) )
			.subscribe(( emoji: CUBEmojiData ) => {
				this.pickedEmojiChange.emit(
					this.pickedEmoji = emoji
				);

				if ( !this.closeAfterPicked ) return;

				this.close();
			});
		});

		this._menuRef
		.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(() => {
			this.closed.emit();
			this.picked.emit( this.pickedEmoji );
		});
	}

	/**
	 * @return {void}
	 */
	public close() {
		if ( !this.isOpened ) return;

		this._menuRef.close();
	}

}
