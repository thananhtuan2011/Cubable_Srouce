import {
	Directive,
	HostBinding,
	ViewChild
} from '@angular/core';

import {
	CellTouchEvent
} from './field-cell-touchable';
import {
	FieldCellEditable
} from './field-cell-editable';
import {
	InputBoxComponent,
	InputBoxContent
} from './input-box.component';

@Directive()
export class FieldCellInputable<T = any>
	extends FieldCellEditable<T> {

	@ViewChild( InputBoxComponent )
	public readonly inputBox: InputBoxComponent;

	@HostBinding( 'class.field-cell-inputable' )
	protected readonly hostClass: boolean = true;

	@HostBinding( 'class.field-cell-inputable--inputting' )
	protected isInputting: boolean;

	public input( e?: CellTouchEvent ) {
		this.isInputting = true;

		this.cdRef.markForCheck();

		setTimeout(() => {
			if ( e instanceof KeyboardEvent ) {
				this.inputBox.keypress( e );
			}

			this.inputBox.focus();
		});

		this.onInput( e );
	}

	protected override onTouch(
		e: CellTouchEvent
	) {
		if ( this.readonly ) {
			return;
		}

		this.input( e );
	}

	protected override onRevert() {
		this.isInputting = false;

		this.cdRef.markForCheck();
	}

	protected onInput( _e: CellTouchEvent ) {}

	protected onInputBoxEdited(
		content: InputBoxContent
	) {
		this.save( content as T );
	}

	protected onInputBoxInput( _e: Event ) {
		this.markAsValid();
	}

	protected onInputBoxFocus( _e: FocusEvent ) {
		const el: HTMLElement
			= this.elementRef.nativeElement;

		el.scrollLeft = el.scrollWidth;
		el.scrollTop = el.scrollHeight;
	}

	protected onInputBoxBlur( _e: FocusEvent ) {
		setTimeout(() => {
			if ( this.isInvalid ) {
				return;
			}

			this.isInputting = false;

			this.cdRef.markForCheck();

			this.focus();
		});
	}

}
