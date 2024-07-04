/* eslint-disable max-len */
import {
	ChangeDetectorRef,
	Directive,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	TemplateRef,
	ViewChild,
	inject
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	QuillOptions
} from 'quill';
import _ from 'lodash';

import {
	CoerceArray
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';
import {
	CUBFormFieldDisplayErrorMode
} from '@cub/material/form-field';
import {
	CUBBasicEditorComponent,
	CUBBasicEditorContent
} from '@cub/material/editor';
import TagModule from '@cub/material/editor/basic-editor/modules/tag/module';

import {
	FIELD_METADATA
} from '@main/common/field/resources';
import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';

import {
	Field
} from '../../../interfaces';
import {
	EventAndFieldsType,
	EventHelper,
	FieldHelper
} from '../../../helpers';

import {
	ComparisonType,
	ComparisonOperator
} from '../resources/comparison';
import {
	ComparisonDefault,
	ComparisonErrorType,
	EventAdvance,
	ComparisonSource,
	ComparisonSpecificInfo,
	TComparisonOperator
} from '../interfaces';

import {
	ExcludeFields
} from './comparison.component';

export enum TagBlotSource {
	OtherField = 'field',
	BlockField = 'block_field',
	Specific = 'specific',
}

@Directive()
export abstract class ComparisonBase<D = any, CS = any>
implements OnChanges, OnInit {

	public static default: ComparisonDefault = {
		operator: ComparisonOperator.IS_EXACTLY,
		compareType: ComparisonType.STATIC,
	};

	@ViewChild( CUBBasicEditorComponent )
	private _basicEditorComp: CUBBasicEditorComponent;
	// @ViewChild( 'comparisonTypeAuto' )
	// private _comparisonTypeAuto: CUBDropdownComponent;
	@ViewChild( 'operatorDropdown' )
	protected operatorDropdown: CUBDropdownComponent;

	@Input() @CoerceArray()
	public otherFields: Field[];
	@Input() public field: any;
	@Input() public excludeFields: ExcludeFields;
	@Input() public error: ComparisonErrorType;
	@Input() public operator: ComparisonOperator;
	@Input() public data: D;
	@Input() public fieldPicker: TemplateRef<any>;
	@Input() public advanceOperators: TComparisonOperator[];
	@Input() public eventAdvance: EventAdvance[];
	@Input() public source: ComparisonSource;

	@Output() public operatorChange: EventEmitter<ComparisonOperator>
		= new EventEmitter<ComparisonOperator>();
	@Output() public dataChange: EventEmitter<any>
		= new EventEmitter<any>();

	public readonly dataControl: FormControl
		= new FormControl( undefined );
	public readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	public showErrorData: boolean;
	public excludeFieldsLK: ObjectType<Field>;

	protected readonly COMPARISON_SOURCE: typeof ComparisonSource
		= ComparisonSource;
	protected readonly ERROR_MODE: typeof CUBFormFieldDisplayErrorMode
		= CUBFormFieldDisplayErrorMode;
	protected readonly COMPARISON_TYPE: typeof ComparisonType
		= ComparisonType;
	protected readonly COMPARISON_OPERATOR: typeof ComparisonOperator
		= ComparisonOperator;
	protected readonly typeControl: FormControl
		= new FormControl( undefined );
	protected readonly comparisonControl: FormControl
		= new FormControl( undefined );
	protected readonly fieldHelper: FieldHelper
		= new FieldHelper();
	protected readonly boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _eventHelper: EventHelper
		= inject( EventHelper );

	protected eventFields: Field[];
	protected eventFieldsFiltered: Field[];
	protected comparisonTypeSpecific: ComparisonSpecificInfo<CS>[];
	protected tagOptions: QuillOptions;
	protected eventAdvanceSelected: EventAdvance;

	// temp
	protected contentEditor: CUBBasicEditorContent;
	private _isSwitchAutoType: boolean;

	private readonly _translateService: TranslateService
		= inject( TranslateService );

	protected abstract comparisonOperators: TComparisonOperator[];

	/**
	 * @param {ComparisonOperator} value
	 * @param {string} label
	 * @return {TComparisonOperator}
	 */
	public static setComparisonOperator(
		value: ComparisonOperator,
		label: string
	): TComparisonOperator {
		return {
			value,
			label: `FIELD.COMPARISON.OPERATOR.${label}`,
		};
	}

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.excludeFields?.currentValue ) {
			this.excludeFieldsLK
				= _.keyBy( this.excludeFields.fields, 'id' );
		}

		if ( changes.advanceOperators?.currentValue?.length ) {
			this.comparisonOperators.unshift(
				...this.advanceOperators
			);
		}

		if (
			changes.data?.currentValue?.metadata?.content
		) {
			this.contentEditor = ( this.data as any ).metadata.content;
		}
	}

	ngOnInit() {
		this.tagOptions = {
			modules: {
				[ TagModule.moduleName ]: {
					spaceAfterInsert: false,
					onTagDetached: () => this._onEventComparisonRemove(),
				},
			},
		};
	}

	/**
	 * @return {void}
	 */
	public openComparisonOperator() {
		setTimeout( () => this.operatorDropdown?.open() );
	}

	/**
	 * @return {void}
	 */
	protected onOperatorChange() {
		this.operatorChange.emit( this.operator );
	}

	/**
	 * @param {string} _data
	 * @return {void}
	 */
	protected onDataChange( _data?: string ) {
		this.dataChange.emit( this.data );
	}

	/**
	 * @return {void}
	 */
	public resetDataControl() {
		setTimeout(
			() => {
				if (
					!this.dataControl.dirty
					&& !this.dataControl.touched
				) return;

				this.dataControl.reset(
					undefined,
					{
						emitEvent: false,
					}
				);
			}
		);
	}

	// /**
	//  * @return {void}
	//  */
	// public openComparisonSpecificField() {
	// 	setTimeout(
	// 		() => {
	// 			this._comparisonTypeAuto
	// 			&& this._comparisonTypeAuto.open();
	// 		}
	// 	);
	// }

	/**
	 * @param {ComparisonType} type
	 * @return {void}
	 */
	protected onTypeChange(
		type: ComparisonType
	) {
		if (
			type === ComparisonType.AUTO
		) {
			this._isSwitchAutoType = true;
		}

		this.data = {
			compareType: type,
			metadata: undefined,
			fieldID: undefined,
			targetField: undefined,
		} as D;

		this.contentEditor = undefined;
		this.showErrorData = false;
	}

	/**
	 * @param {EventAdvance=} event
	 * @return {void}
	 */
	protected onSelectEvent(
		event?: EventAdvance
	) {
		this._eventHelper.getEventAndFields(
			event,
			this.otherFields,
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
	 * @param {CS} type
	 * @return {void}
	 */
	protected onEventAdvanceChanged(
		type: CS
	) {
		const data: any
			= this.data;

		if (
			this._basicEditorComp
			&& (
				data.specific
				|| data.fieldID
				|| data.targetField )
		) {
			this._basicEditorComp.clear();
		}

		data.specific = type;
		data.fieldID
			= data.targetField
			= data.metadata
			= undefined;

		this._insertComparisonTag();
	}

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	protected onComparisonFieldAdvanceChanged(
		field: Field
	) {
		const data: any = this.data;

		if (
			this._basicEditorComp
			&& ( data.fieldID
				|| data.targetField
				|| data.specific )
		) {
			this._basicEditorComp.clear();
		}

		data.specific = undefined;

		if (
			!this.eventAdvanceSelected
		) {
			data.fieldID = field.extra.id;
		} else {
			data.fieldID = undefined;
			data.targetField ||= {};
			data.targetField.blockID
				= this.eventAdvanceSelected.id;
			data.targetField.boardID
				= this.eventAdvanceSelected.boardID;
			data.targetField.fieldID
				= field.extra.id;
		}

		data.metadata = {
			field,
		};

		this._insertComparisonTag();
	}

	/**
	 * @return {void}
	 */
	protected onOperatorDropdownOpened() {}

	/**
	 * @return {void}
	 */
	protected onContentEditorChange() {
		const data: any
			= this.data;
		const content: CUBBasicEditorContent
			= this._basicEditorComp.parse();

		if (
			!content.text?.length
		) {
			data.fieldID
				= data.specific
				= data.targetField
				= data.metadata
				= undefined;
		} else {
			data.metadata ||= {};
			data.metadata.content ||= {};
			data.metadata.content.delta = content.delta;
			data.metadata.content.html = content.html;
			data.metadata.content.text = content.text;
		}

		this.contentEditor = ( this.data as any )?.metadata?.content;

		this.onDataChange();
	}

	/**
	 * @return {void}
	 */
	private _insertComparisonTag() {
		const data: any
			= this.data;

		if (
			!this._basicEditorComp
			|| !data.fieldID
				&& !data.targetField
				&& !data.specific
		) return;

		if (
			data.fieldID
		) {
			this
			._basicEditorComp
			.insertTag(
				{
					tag: `{{${TagBlotSource.OtherField}_${data.metadata.field.extra.id}}}`,
					name: data.metadata.field.name,
					icon: FIELD_METADATA.get( data.metadata.field.dataType )?.icon,
					buttonRemove: true,
				}
			);
		}

		if (
			data.specific
		) {
			const comparisonTypeSpecificLK:
			Record<number, ComparisonSpecificInfo<CS>>
				= _.keyBy( this.comparisonTypeSpecific, 'value' );

			this
			._basicEditorComp
			.insertTag(
				{
					tag: `{{${TagBlotSource.Specific}_${comparisonTypeSpecificLK[ data.specific ].value}}}`,
					name:
						this
						._translateService
						.instant(
							comparisonTypeSpecificLK[ data.specific ].label
						),
					icon: comparisonTypeSpecificLK[ data.specific ].icon,
					buttonRemove: true,
				}
			);
		}

		if (
			data.targetField
		) {
			let event: EventAdvance;

			if ( data.targetField?.blockID ) {
				event
					= _.find(
						this.eventAdvance,
						{ id: ( this.data as any ).targetField.blockID }
					);
			} else {
				event = {
					icon: this.eventAdvance[ 0 ]?.icon,
					name: this.eventAdvance[ 0 ]?.name,
				};
			}
			const newSpan: HTMLElement
				= document.createElement( 'span' );

			newSpan.innerHTML
				= `<span style='display: inline-flex; align-items: center;'><i class='icon icon-${event.icon} mr-4'></i><span class='text-truncate mr-4'>${event.name}</span>&nbsp;|&nbsp;<i class='icon icon-${FIELD_METADATA.get( data.metadata.field.dataType )?.icon} ml-6 mr-4'></i><span class='text-truncate'>${data.metadata.field.name}</span></span>`;

			this
			._basicEditorComp
			.insertTag(
				{
					tag: `{{${TagBlotSource.BlockField}_${data.metadata.field.extra.id}}}`,
					name: newSpan,
					buttonRemove: true,
				}
			);
		}
	}

	/**
	 * @return {void}
	 */
	private _onEventComparisonRemove() {
		if (
			!this._isSwitchAutoType
		) {
			this.showErrorData = true;
		}

		this._isSwitchAutoType = false;
		// TODO need check when clear content will called
		return;
		const data: any
			= this.data;

		data.fieldID
			= data.specific
			= data.targetField
			= data.metadata
			= undefined;

		this.onDataChange();
	}

}
