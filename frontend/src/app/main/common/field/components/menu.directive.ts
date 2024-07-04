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
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBOverlayPosition
} from '@cub/material/overlay';
import {
	CUBMenuRef
} from '@cub/material/menu';

import {
	DataType,
	FieldList
} from '../interfaces';
import {
	Field
} from '../objects';

import {
	FieldMenuService
} from '../services/menu.service';

@Unsubscriber()
@Directive({
	selector: '[fieldMenu]',
	exportAs: 'fieldMenu',
})
export class FieldMenuDirective {

	@Input() @CoerceBoolean() public strictMode: boolean;
	@Input() public targetElement: ElementRef | HTMLElement;
	@Input() public position: CUBOverlayPosition;
	@Input() public otherFields: FieldList;
	@Input() public unsupportDataTypes: DataType[];
	@Input() public context: ObjectType;

	@Output() public added: EventEmitter<Field>
		= new EventEmitter<Field>();
	@Output() public opened: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public closed: EventEmitter<void>
		= new EventEmitter<void>();

	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _fieldMenuService: FieldMenuService
		= inject( FieldMenuService );

	private _menuRef: CUBMenuRef;
	private _isFieldBuilding: boolean;

	get isOpened(): boolean {
		return this._menuRef?.isOpened;
	}

	@HostListener( 'click', [ '$event' ] )
	@HostListener( 'keydown.space', [ '$event' ] )
	protected onClick( e: MouseEvent | KeyboardEvent ) {
		if ( this._isFieldBuilding
			|| this._menuRef?.isOpened ) {
			return;
		}

		e.stopPropagation();
		e.preventDefault();

		this._menuRef = this._fieldMenuService.open(
			this.targetElement || this._elementRef,
			{
				strictMode: this.strictMode,
				otherFields: this.otherFields,
				unsupportDataTypes: this.unsupportDataTypes,
				context: this.context,
				config: { position: this.position },
				onFieldBuilding: this._onFieldBuilding.bind( this ),
				onDone: this._onDone.bind( this ),
				onCancel: this._onCancel.bind( this ),
			},
			{ position: this.position }
		);

		this._menuRef
		.afterOpened()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => this.opened.emit() );

		this._menuRef
		.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => this.closed.emit() );
	}

	/**
	 * @return {void}
	 */
	public close() {
		this._menuRef?.close();

		this.closed.emit();
	}

	/**
	 * @param {boolean} isBuilding
	 * @return {void}
	 */
	private _onFieldBuilding(
		isBuilding: boolean
	) {
		this._isFieldBuilding = isBuilding;
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	private _onDone( field: Field ) {
		this.added.emit( field );
	}

	/**
	 * @return {void}
	 */
	private _onCancel() {
		this.closed.emit();
	}

}
