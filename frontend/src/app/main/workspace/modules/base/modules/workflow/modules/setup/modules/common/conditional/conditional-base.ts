import {
	ChangeDetectorRef,
	Directive,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewChild,
	inject
} from '@angular/core';
import {
	CdkDragDrop,
	moveItemInArray
} from '@angular/cdk/drag-drop';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceBoolean,
	DefaultValue,
	calculateOrder,
	untilCmpDestroyed
} from '@core';

import {
	DataType,
	Field,
	IFieldExtra
} from '@main/common/field/interfaces';
import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	ExpressionEditorComponent,
	IParsedValue
} from '@main/common/logic-editor/components';
import {
	setFilterLogical
} from '@main/workspace/modules/base/modules/board/modules/filter/helpers/filter.helper';
import {
	ExcludeFields
} from '@main/common/field/modules/comparison/components';
import {
	EventAdvance,
	ComparisonSource
} from '@main/common/field/modules/comparison/interfaces';

import {
	TriggerType
} from '../../trigger/resources';

import {
	LogicalOperator
} from './constant';
import {
	Option
} from './conditional-base.interface';

export enum NewOptionType {
	First = 1,
	Before,
	After,
}

export const dataTypeEmpty: ReadonlySet<DataType> = new Set([
	DataType.Paragraph,
	DataType.Link,
	DataType.Attachment,
	DataType.Lookup,
]);

@Directive()
export abstract class ConditionalBase<O = Option, C = any>
implements OnChanges {

	@ViewChild( ExpressionEditorComponent )
	public expressionEditorComp: ExpressionEditorComponent;

	// TODO
	@Input() @CoerceBoolean()
	public isEditingForm: boolean;
	@Input() @CoerceArray()
	public options: O[];
	@Input() @CoerceArray()
	public eventAdvance: EventAdvance[];
	@Input() @DefaultValue() @CoerceBoolean()
	public mustHaveOption: boolean = true;
	@Input() public hideAddCondition: boolean;
	@Input() @DefaultValue()
	public comparisonModule: ComparisonSource = ComparisonSource.Workflow;
	@Input() public boardID: ULID;
	@Input() public fields: IFieldExtra[];
	@Input() public fieldOfNewOption: IFieldExtra;
	@Input() public excludeFields: ExcludeFields;
	@Input() public label: string;
	@Input() public addConditionLabel: string;
	@Input() public logicalExpression: string;
	@Input() public logicalOperator: LogicalOperator;
	@Input() public conditions: C;
	@Input() @DefaultValue()
	public customIndexNewOption: NewOptionType = NewOptionType.First;

	@Output() public optionsChange: EventEmitter<O[]>
		= new EventEmitter<O[]>();
	@Output() public logicalOperatorChange: EventEmitter<LogicalOperator>
		= new EventEmitter<LogicalOperator>();
	@Output() public logicalExpressionChange: EventEmitter<string>
		= new EventEmitter<string>();
	@Output() public conditionsChange: EventEmitter<C>
		= new EventEmitter<C>();
	@Output() public conditionalChange: EventEmitter<void>
		= new EventEmitter<void>();

	public dirtied: boolean;

	protected readonly logicalOperatorControl: FormControl
		= new FormControl( undefined );
	protected readonly LOGICAL_OPERATOR: typeof LogicalOperator
		= LogicalOperator;
	protected readonly TRIGGER_TYPE: typeof TriggerType
		= TriggerType;

	protected filterOptionsAnnotation: number[];
	protected ignoreDataType: ReadonlySet<DataType>;
	protected fieldsMap: Map<ULID, Field>; // TEMP for group conditional
	protected expressionValue: string;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.fields?.currentValue ) {
			this._initField( this.fields );
		}
		if ( changes.boardID?.currentValue ) {
			this._getFields();
		}
		if (
			changes.options?.firstChange
			&& changes.options.currentValue?.length
		) {
			this._setFilterOptionsAnnotation();
		}
		if (
			changes.logicalOperator?.currentValue === LogicalOperator.CUSTOM
		) {
			setTimeout(
				() => {
					this.expressionValue
						= this.expressionEditorComp?.parse()?.value;
				},
				10
			);
		}
	}

	/**
	 * @return {void}
	 */
	public addCondition() {
		switch( this.customIndexNewOption ) {
			case NewOptionType.First:
				this.addOption( this.fields[ 0 ] );
				break;

			case NewOptionType.Before:
				this.addOption( this.fieldOfNewOption );
				break;
		}
	}

	/**
	 * @param {LogicalOperator} e
	 * @return {void}
	 */
	protected onLogicalOperatorChange( e: LogicalOperator ) {
		if ( this.logicalOperator === e ) return;

		if ( e === LogicalOperator.CUSTOM ) {
			this.logicalExpression = setFilterLogical({
				conditions: this.conditions,
				logicalExpression: this.logicalExpression,
				logicalOperator: this.logicalOperator,
				options: this.options as any,
			});

			this._setExpressionValue();
		} else {
			this.logicalExpression = '';

			this._setExpressionValue();
		}

		this.logicalOperator = e;

		setTimeout(() => {
			this
			.logicalExpressionChange
			.emit( this.logicalExpression );
			this
			.logicalOperatorChange
			.emit( e );
		});
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	protected removeFilterOption( index: number ) {
		this.filterChanged();

		this.options.splice(
			index,
			1
		);

		this.filterOptionsAnnotation.splice(
			this.filterOptionsAnnotation.length - 1,
			1
		);

		if ( !this.options?.length ) {
			this.onLogicalOperatorChange( LogicalOperator.AND );
		}

		this.optionsChange.emit( this.options );
	}

	/**
	 * @return {void}
	 */
	protected removeAllFilterOption() {
		this.filterChanged();

		this.options = [];

		this._resetEditor();

		this.optionsChange.emit(this.options);
		this
		.logicalOperatorChange
		.emit( this.logicalOperator );
	}

	/**
	 * @return {void}
	 */
	protected onEditorContentChange() {
		if ( !this.expressionEditorComp ) return;

		const expressionValue: IParsedValue
			= this.expressionEditorComp.parse();

		if ( !expressionValue ) return;

		this.logicalExpression = expressionValue.content;
		this.expressionValue = expressionValue.value;

		this.logicalExpressionChange.emit(
			this.logicalExpression
		);

		this.filterChanged();
	}

	/**
	 * @param {CdkDragDrop} event
	 * @return {void}
	 */
	protected onFilterOptionArrange( event: CdkDragDrop<Option[]> ) {
		if ( event.previousIndex === event.currentIndex ) return;

		moveItemInArray(
			event.container.data,
			event.previousIndex,
			event.currentIndex
		);

		const preOrder: number
			= event
			.container
			.data[ event.currentIndex - 1 ]
			?.order;
		const nextOrder: number
			= event
			.container
			.data[ event.currentIndex + 1 ]
			?.order;
		const newOrder: number
			= calculateOrder( preOrder, nextOrder );

		event.item.data.order = newOrder;

		this.filterChanged();
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	private _getFields() {
		this._boardFieldService
		.get( this.boardID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				this._initField( fields );

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _setExpressionValue() {
		setTimeout(
			() => {
				this.expressionValue
					= this.expressionEditorComp?.parse()?.value;

				this.filterChanged();
			},
			10
		);
	}

	/**
	 * @return {void}
	 */
	private _setFilterOptionsAnnotation() {
		if ( !this.options?.length ) return;

		this.filterOptionsAnnotation ||= [];

		for (
			let index: number = 1;
			index <= this.options.length;
			++index
		) {
			this.filterOptionsAnnotation.push( index );
		}
	}

	/**
	 * @return {void}
	 */
	private _resetEditor() {
		this.logicalOperator = LogicalOperator.AND;
		this.logicalExpression = undefined;
		this.filterOptionsAnnotation = [];
	}

	/**
	 * @param {IFieldExtra[]} fields
	 * @return {void}
	 */
	private _initField(
		fields: IFieldExtra[]
	) {
		const _fields: IFieldExtra[]
			= this.ignoreDataType
				? _.filter(
					fields,
					( field: IFieldExtra ) => {
						return !this
						.ignoreDataType
						.has( field.dataType );
					}
				)
				: fields;

		this.fields = _.map(
			_fields,
			( f: BoardField ) => this._fieldHelper.createField( f )
		);

		const primaryField: Field
			= _.find( this.fields, ( field: Field ) => {
				return field.extra.isPrimary;
			} );

		if ( primaryField
			&& this.mustHaveOption
			&& !this.options?.length ) {
			this.addOption( primaryField );
		};

		this.fieldsMap = new Map(
			Object.entries(
				_.keyBy(
					this.fields,
					( field: Field ) => { return field.extra.id; }
				)
			)
		);
	}

	/**
	 * @param {O=} option
	 * @return {void}
	 */
	protected abstract filterChanged(
		option?: O
	);

	/**
	 * @param {Field} field
	 * @return {void}
	 */
	protected abstract addOption(
		field: Field
	);

}
