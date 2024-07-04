import {
	ChangeDetectorRef,
	ComponentRef,
	Directive,
	EventEmitter,
	inject,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewContainerRef
} from '@angular/core';

import {
	CoerceBoolean
} from '@core';

import {
	DataType
} from '../../../interfaces';

import {
	AttachmentFieldInputComponent
} from './attachment/input.component';
import {
	CheckboxFieldInputComponent
} from './checkbox/input.component';
import {
	CurrencyFieldInputComponent
} from './currency/input.component';
import {
	DateFieldInputComponent
} from './date/input.component';
import {
	DropdownFieldInputComponent
} from './dropdown/input.component';
import {
	EmailFieldInputComponent
} from './email/input.component';
import {
	NumberFieldInputComponent
} from './number/input.component';
import {
	ParagraphFieldInputComponent
} from './paragraph/input.component';
import {
	PhoneFieldInputComponent
} from './phone/input.component';
import {
	ProgressFieldInputComponent
} from './progress/input.component';
import {
	RatingFieldInputComponent
} from './rating/input.component';
import {
	LinkFieldInputComponent
} from './link/input.component';
import {
	FormulaFieldInputComponent
} from './formula/input.component';
import {
	TextFieldInputComponent
} from './text/input.component';
import {
	PeopleFieldInputComponent
} from './people/input.component';
import {
	ReferenceFieldInputComponent
} from './reference/input.component';
import {
	LastModifiedByFieldInputComponent
} from './last-modified-by/input.component';
import {
	CreatedByFieldInputComponent
} from './created-by/input.component';
import {
	LastModifiedTimeFieldInputComponent
} from './last-modified-time/input.component';
import {
	CreatedTimeFieldInputComponent
} from './created-time/input.component';
import {
	FieldInput,
	FieldInputType
} from './input';
import {
	FieldInputEditable,
	FieldInputEditableType,
	FieldInputValidateEvent,
	IFieldInputEditable
} from './input-editable';
import {
	FieldInputReadonly,
	IFieldInputReadonly
} from './input-readonly';

const FIELD_EDITOR_MAP:
	ReadonlyMap<DataType, FieldInput>
	= new Map([
		[ DataType.Attachment, AttachmentFieldInputComponent as any ],
		[ DataType.Checkbox, CheckboxFieldInputComponent ],
		[ DataType.Currency, CurrencyFieldInputComponent ],
		[ DataType.Date, DateFieldInputComponent ],
		[ DataType.Dropdown, DropdownFieldInputComponent ],
		[ DataType.Email, EmailFieldInputComponent ],
		[ DataType.Formula, FormulaFieldInputComponent ],
		[ DataType.Link, LinkFieldInputComponent ],
		[ DataType.Number, NumberFieldInputComponent ],
		[ DataType.Paragraph, ParagraphFieldInputComponent ],
		[ DataType.Phone, PhoneFieldInputComponent ],
		[ DataType.Progress, ProgressFieldInputComponent ],
		[ DataType.Rating, RatingFieldInputComponent ],
		[ DataType.Reference, ReferenceFieldInputComponent ],
		[ DataType.Text, TextFieldInputComponent ],
		[ DataType.People, PeopleFieldInputComponent ],
		[ DataType.LastModifiedBy, LastModifiedByFieldInputComponent ],
		[ DataType.LastModifiedTime, LastModifiedTimeFieldInputComponent ],
		[ DataType.CreatedBy, CreatedByFieldInputComponent ],
		[ DataType.CreatedTime, CreatedTimeFieldInputComponent ],
	]);

@Directive({
	selector: '[fieldInputFactory]',
	exportAs: 'FieldInputFactory',
})
export class FieldInputFactoryDirective
implements
	IFieldInputEditable,
	IFieldInputReadonly,
	OnInit,
	OnChanges {

	@Input() public field:
		FieldInputType[ 'field' ];
	@Input() public data:
		FieldInputType[ 'data' ];
	@Input() public label:
		FieldInputType[ 'label' ];
	@Input() public placeholder:
		FieldInputType[ 'placeholder' ];
	@Input() @CoerceBoolean()
	public autoFocusOn:
		FieldInputType[ 'autoFocusOn' ];
	@Input() @CoerceBoolean()
	public hideRequiredMarker:
		FieldInputEditableType[ 'hideRequiredMarker' ];
	@Input() @CoerceBoolean()
	public required:
		FieldInputEditableType[ 'required' ];
	@Input()
	public eventAdvance:
		FieldInputEditableType[ 'eventAdvance' ];
	@Input()
	public fields:
		FieldInputEditableType[ 'fields' ];
	@Input() @CoerceBoolean()
	public disabled:
		FieldInputType[ 'disabled' ];
	@Input() @CoerceBoolean()
	public readonly:
		FieldInputEditableType[ 'readonly' ];
	@Input() public size:
		FieldInputType[ 'size' ];
	@Input() public variant:
		FieldInputType[ 'variant' ];
	@Input() public displayErrorMode:
		FieldInputEditableType[ 'displayErrorMode' ];
	@Input() public formControl:
		FieldInputEditableType[ 'formControl' ];
	@Input() public metadata: ObjectType;

	@Output() public dataChange: EventEmitter<any>
		= new EventEmitter<any>();
	@Output() public changed: EventEmitter<any>
		= new EventEmitter<any>();
	@Output( 'validate' )
	public validateEE: EventEmitter<FieldInputValidateEvent>
			= new EventEmitter<FieldInputValidateEvent>();

	public componentRef: ComponentRef<FieldInput>;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _vcRef: ViewContainerRef
		= inject( ViewContainerRef );

	ngOnChanges(
		changes: SimpleChanges
	) {
		if ( !this.componentRef ) {
			return;
		}

		for (
			const key
			of Object.keys( changes )
		) {
			key === 'metadata'
				? this._setMetadata()
				: this._setInput( key );
		}
	}

	ngOnInit() {
		const fieldInputComp: FieldInput
			= FIELD_EDITOR_MAP.get(
				this.field.dataType
			);

		if ( !fieldInputComp ) {
			return;
		}

		const { instance }:
			ComponentRef<FieldInput>
			= this.componentRef
			= this
			._vcRef
			.createComponent(
				fieldInputComp as any
			) as ComponentRef<FieldInput>;

		this._setInput( 'field' );
		this._setInput( 'data' );
		this._setInput( 'label' );
		this._setInput( 'placeholder' );
		this._setInput( 'autoFocusOn' );
		this._setInput( 'disabled' );
		this._setInput( 'size' );
		this._setInput( 'variant' );

		if (
			instance
				instanceof
					FieldInputEditable
		) {
			this._setInput( 'hideRequiredMarker' );
			this._setInput( 'required' );
			this._setInput( 'eventAdvance' );
			this._setInput( 'readonly' );
			this._setInput( 'displayErrorMode' );
			this._setInput( 'formControl' );
			this._setInput( 'fields' );

			instance.dataChange
				= this.dataChange;
			instance.changed
				= this.changed;
			instance.validateEE
				= this.validateEE;
		} else if (
			instance
				instanceof
					FieldInputReadonly
		) {}

		this._setMetadata();

		this._cdRef.detectChanges();
	}

	/**
	 * @param {string} inputName
	 * @param {any=} inputData
	 * @return {void}
	 */
	private _setInput(
		inputName: string,
		inputData: any = this[ inputName ]
	) {
		this
		.componentRef
		.setInput(
			inputName,
			inputData
		);
	}

	/**
	 * @return {void}
	 */
	private _setMetadata() {
		if ( !this.metadata ) {
			return;
		}

		for (
			const [ key, value ]
			of Object.entries( this.metadata )
		) {
			this._setInput( key, value );
		}
	}

}
