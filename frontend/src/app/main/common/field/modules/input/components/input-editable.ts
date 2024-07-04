/* eslint-disable max-len */
import {
	AfterViewInit,
	Directive,
	EventEmitter,
	HostBinding,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
	inject
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	FocusMonitor,
	FocusOrigin
} from '@angular/cdk/a11y';
import {
	debounceTime,
	filter
} from 'rxjs/operators';
import _ from 'lodash';
import {
	QuillOptions
} from 'quill';

import {
	CoerceBoolean,
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBFormFieldDisplayErrorMode
} from '@cub/material/form-field';
import {
	ExtendedFormControl,
	extendFormControl
} from '@cub/material/value-accessor';
import {
	CUBBasicEditorComponent,
	CUBBasicEditorContent
} from '@cub/material/editor';
import TagModule from '@cub/material/editor/basic-editor/modules/tag/module';

import {
	CalculateType,
	ValueType
} from '@main/workspace/modules/base/modules/workflow/modules/setup/modules/action/resources';

import {
	Field,
	FieldValidationErrors
} from '../../../objects';
import {
	EventAndFieldsType,
	EventHelper
} from '../../../helpers';
import {
	FIELD_METADATA
} from '../../../resources';

import {
	EventAdvance
} from '../../comparison/interfaces';
import {
	OtherFieldsPipe
} from '../../comparison/pipes';

import {
	FieldInput,
	IFieldInput
} from './input';
import { DataType } from '@main/common/field/interfaces';

export enum FieldInputChangeOn {
	Default = 'default',
	Blur = 'blur',
}

export interface IFieldInputEditable<F = Field, D = any>
	extends IFieldInput<F, D> {
	hideRequiredMarker: boolean;
	required: boolean;
	readonly: boolean;
	displayErrorMode: CUBFormFieldDisplayErrorMode;
	formControl: FormControl;
	eventAdvance: EventAdvance[];
	fields: Field[];

	dataChange: EventEmitter<D>;
	changed: EventEmitter<D>;
	validateEE: EventEmitter<FieldInputValidateEvent>;
}

export type FieldInputEditableType<F = Field, D = any>
	= IFieldInputEditable<F, D>;

export type FieldInputValidateEvent = {
	field: Field;
	errors: FieldValidationErrors;
};

export enum TagBlotSource {
	FieldBlot = 'field',
	BlockBlot = 'block',
}

@Unsubscriber()
@Directive()
export class FieldInputEditable<F = Field, D = any>
	extends FieldInput<F, D>
	implements
	IFieldInputEditable<F, D>,
	OnChanges,
	OnInit,
	AfterViewInit,
	OnDestroy {

	@ViewChild( CUBBasicEditorComponent )
	private _basicEditorComp: CUBBasicEditorComponent;

	@Input() @CoerceBoolean()
	public hideRequiredMarker:
		FieldInputEditableType[ 'hideRequiredMarker' ];
	@Input() @CoerceBoolean()
	public required:
		FieldInputEditableType[ 'required' ];
	@Input() @CoerceBoolean()
	public readonly:
		FieldInputEditableType[ 'readonly' ];
	@Input() public displayErrorMode:
		FieldInputEditableType[ 'displayErrorMode' ];
	@Input() @DefaultValue()
	public formControl: FormControl
			= new FormControl();
	@Input() public eventAdvance: EventAdvance[];
	@Input() public fields: Field[];

	@Output() public dataChange: EventEmitter<D>
		= new EventEmitter<D>();
	@Output() public changed: EventEmitter<D>
		= new EventEmitter<D>();
	@Output( 'validate' )
	public validateEE: EventEmitter<FieldInputValidateEvent>
			= new EventEmitter<FieldInputValidateEvent>();

	public invalid: boolean;
	public errors: FieldValidationErrors;

	@HostBinding( 'class.field-input-editable' )
	protected readonly hostClass: boolean = true;
	protected readonly VALUE_TYPE: typeof ValueType
		= ValueType;
	protected readonly ALLOW_INPUT_DATA_TYPES: DataType[] = [
		DataType.Text,
		DataType.Paragraph,
	];

	protected readonly calculateTypes: typeof CalculateType
		= CalculateType;
	protected OPERATORS: CalculateType[]
		= [
			CalculateType.EQUAL,
			CalculateType.PLUS,
			CalculateType.MINUS,
			CalculateType.MULTIPLY,
			CalculateType.DIVIDE,
		];
	protected isPreventOnBlur: boolean;
	protected eventFields: Field[];
	protected eventFieldsFiltered: Field[];
	protected eventAdvanceSelected: EventAdvance;
	protected contentEditor: CUBBasicEditorContent;
	protected tagOptions: QuillOptions;

	private readonly _focusMonitor: FocusMonitor
		= inject( FocusMonitor );
	private readonly _eventHelper: EventHelper
		= inject( EventHelper );

	private _isChanged: boolean;
	private _dataBk: D;

	get isRequired(): boolean {
		return this.required
			?? ( this.field as Field ).isRequired;
	}

	ngOnChanges(
		changes: SimpleChanges
	) {
		if ( changes.data ) {
			this._dataBk
				= _.cloneDeep( this.data );

			super.ngOnChanges( changes );
		}

		if (
			changes.data?.currentValue?.metadata?.content
		) {
			this.contentEditor
				= ( this.data as any )
				?.metadata
				?.content;
		}
	}

	ngOnInit() {
		this.tagOptions = {
			modules: {
				[ TagModule.moduleName ]: {
					spaceAfterInsert: false,
				},
			},
		};
	}

	ngAfterViewInit() {
		this
		._focusMonitor
		.monitor(
			this
			.elementRef
			.nativeElement,
			true
		)
		.pipe(
			debounceTime( 200 ),
			filter(
				(
					origin: FocusOrigin
				): boolean => origin === null
					&& !this.disabled
					&& !this.readonly
					&& !this.invalid
					&& !this.isPreventOnBlur
					&& this._isChanged
			),
			untilCmpDestroyed( this )
		)
		.subscribe(() => {
			this._isChanged = false;

			this.changed.emit( this.data );

			this._dataBk
				= _.cloneDeep( this.data );
		});
	}

	ngOnDestroy() {
		if ( !this._isChanged ) {
			return;
		}

		this
		.dataChange
		.emit( this.data );
	}

	/**
	 * @param {D=} data
	 * @param {boolean=} emitEvent
	 * @param {boolean=} markAsErroring
	 * @return {FieldValidationErrors | null}
	 */
	public validate(
		data: D = this.data,
		emitEvent: boolean = true,
		markAsErroring: boolean = true
	): FieldValidationErrors | null {
		const field: Field
			= this.field as Field;
		let errors: FieldValidationErrors;

		// Default no dynamic value
		if ( !( data as any ) ?.valueType ) {
			errors
				= field.validate(
					data,
					!this.isRequired
				);

		// Has dynamic value
		} else {

			switch( ( data as any )?.valueType ) {
				case ValueType.DYNAMIC:
					errors
						= _.isStrictEmpty( ( data as any )?.data )
							? { required: true }
							: null;

					break;
				case ValueType.EMPTY:
					errors
						= null;

					break;
				default:
					errors
						= field.validate(
							( data as any )?.data,
							!this.isRequired
						);
			}

		}

		this.invalid = errors !== null;
		this.errors = errors;

		if ( emitEvent ) {
			this.validateEE.emit({
				field,
				errors,
			});
		}

		if ( markAsErroring ) {
			this._markFormControlAsErroring();
		}

		this.cdRef.markForCheck();

		return errors;
	}

	/**
	 * @param {D=} data
	 * @param {boolean=} emitEvent
	 * @return {void}
	 */
	public reset(
		data: D = null,
		emitEvent: boolean = true
	) {
		this.formControl.reset(
			data ?? '',
			{ emitEvent: false }
		);

		if ( emitEvent ) {
			this.dataChange.emit( data );
			this.changed.emit( data );

			this._dataBk
				= _.cloneDeep( data );
		}

		this.validate(
			data,
			false,
			false
		);

		this.cdRef.markForCheck();
	}

	/**
	 * @param {D=} data
	 * @return {void}
	 */
	public patchFormControlValue(
		data: D = this.data
	) {
		this
		.formControl
		.patchValue(
			data,
			{
				emitEvent: false,
				emitModelToViewChange: false,
				emitViewToModelChange: false,
			}
		);
	}

	/**
	 * @param {ComparisonType} type
	 * @return {void}
	 */
	protected onTypeChange(
		valueType: ValueType
	) {
		if (
			( this.data as any )
			.valueType
				=== valueType
		) {
			return;
		}

		this.disabled
			= valueType === ValueType.EMPTY
				? true
				: false;

		this.data
			= {
				...this.data,
				data: null,
				valueType,
			} as D;

		this
		.dataChange
		.emit( this.data );

		this._basicEditorComp
		?.clear();
	}

	/**
	 * @param {EventAdvance=} event
	 * @return {void}
	 */
	protected onSelectEvent(
		event?: EventAdvance
	) {
		const otherFieldPipe: OtherFieldsPipe
			= new OtherFieldsPipe();
		const fields: Field[]
			= otherFieldPipe.transform(
				this.fields,
				this.field as Field
			) as Field[];

		this._eventHelper.getEventAndFields(
			event,
			fields,
			this.field as Field
		)
		.subscribe({
			next: ( results: EventAndFieldsType ) => {
				this.eventAdvanceSelected
					= results.eventAdvanceSelected;
				this.eventFields
					= results.eventFields as Field[];
			},
		});
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	protected onFieldAdvanceChanged(
		_field: Field
	) {
		if (
			this._basicEditorComp
			&& ( this.data as any ).metadata?.field
			&& !_.includes(
				this.ALLOW_INPUT_DATA_TYPES,
				( this.field as any ).dataType )
		) {
			this._basicEditorComp.clear();
		}

		const data: any = this.data;

		data.metadata ||= {};
		data.metadata.field
			= _field;
		data.metadata.blockID
			= this.eventAdvanceSelected?.id;

		this._insertValueTag();
	}

	/**
	 * @param {D} data
	 * @param {boolean=} patchFormControlValue
	 * @param {CalculateType=} operator
	 * @return {void}
	 */
	protected onDataChanged(
		data: D,
		patchFormControlValue?: boolean
	) {
		data = _.isStrictEmpty( data )
			? null
			: data;

		this._isChanged
			= !_.isEqual( data, this._dataBk );

		if ( ( this.data as any )?.valueType ) {
			this.data
				= {
					...this.data,
					data,
				};
		} else {
			this.data
				= data;
		}

		this.dataChange.emit( this.data );
		this.validate( data );

		if ( !patchFormControlValue ) {
			return;
		}

		this.patchFormControlValue();

		this
		.formControl
		.updateValueAndValidity();

		this._markFormControlAsErroring();
	}

	/**
	 * @return {void}
	 */
	protected onContentEditorChange() {
		const content: CUBBasicEditorContent
			= this._basicEditorComp.parse();

		if (
			!content.text?.length
		) {
			this.data
				= {
					...this.data,
					data: undefined,
					metadata: undefined,
				};
		} else {
			const data: any = this.data;

			data.data
				= content.text;
			data.metadata
				||= {};
			data.metadata.content
				= content;
		}

		this.dataChange.emit( this.data );
	}

	/**
	 * @return {void}
	 */
	protected operatorChanged() {
		this.dataChange.emit( this.data );
	}

	/**
	 * @return {void}
	 */
	private _markFormControlAsErroring() {
		const control: ExtendedFormControl
			= extendFormControl(
				this.formControl
			);

		control.markAsErroring();
	}

	/**
	 * @return {void}
	 */
	private _insertValueTag() {
		const data: any
			= this.data;

		if ( !this._basicEditorComp ) return;

		if (
			data?.metadata?.blockID
		) {
			const event: EventAdvance
				= _.find(
					this.eventAdvance,
					{ id: data.metadata.blockID }
				);
			const newSpan: HTMLElement
				= document.createElement( 'span' );

			newSpan.innerHTML
				= `<span style='display: inline-flex; align-items: center;'><i class='icon icon-${event.icon} mr-4'></i><span class='text-truncate mr-4'>${event.name}</span>&nbsp;|&nbsp;<i class='icon icon-${FIELD_METADATA.get( data.metadata.field.dataType )?.icon} ml-6 mr-4'></i><span class='text-truncate'>${data.metadata.field.name}</span></span>`;

			this
			._basicEditorComp
			.insertTag(
				{
					tag: `#{${TagBlotSource.BlockBlot}_${data.metadata.blockID}|${TagBlotSource.FieldBlot}_${data.metadata.field.extra.id}}`,
					name: newSpan,
					buttonRemove: true,
				}
			);
		} else {
			this
			._basicEditorComp
			.insertTag(
				{
					tag: `#{${TagBlotSource.FieldBlot}_${data.metadata.field.extra.id}}`,
					name: data.metadata.field.name,
					icon: FIELD_METADATA.get( data.metadata.field.dataType )?.icon,
					buttonRemove: true,
				}
			);
		}
	}

}
