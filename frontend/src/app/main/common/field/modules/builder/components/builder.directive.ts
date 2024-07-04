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
	CUBPopupConfig,
	CUBPopupRef
} from '@cub/material/popup';

import {
	Field
} from '../../../objects';
import {
	FieldList
} from '../../../interfaces';

import {
	FieldBuilderService
} from '../services/builder.service';

@Directive({
	selector: '[fieldBuilder]',
	exportAs: 'fieldBuilder',
})
export class FieldBuilderDirective {

	@Input() public targetElement: ElementRef | HTMLElement;
	@Input() public config: CUBPopupConfig;
	@Input( 'fieldBuilder' ) public field: Field;
	@Input() public otherFields: FieldList;

	@Output() public built: EventEmitter<Field>
		= new EventEmitter<Field>();
	@Output() public cancelled: EventEmitter<void>
		= new EventEmitter<void>();

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _fieldBuilder: FieldBuilderService
		= inject( FieldBuilderService );

	private _popupRef: CUBPopupRef;

	@HostListener( 'click', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	protected onClick(
		e: MouseEvent | KeyboardEvent
	) {
		if ( this._popupRef?.isOpened ) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();

		this._popupRef
			= this._fieldBuilder.build(
				this.field,
				this.targetElement || this._elementRef,
				this.otherFields,
				undefined,
				this.onDone.bind( this ),
				this.onCancel.bind( this ),
				this.config
			);
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	protected onDone( field: Field ) {
		this.built.emit( field );
	}

	/**
	 * @return {void}
	 */
	protected onCancel() {
		this.cancelled.emit();
	}

}
