import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Inject,
	OnInit,
	Optional,
	ViewChild,
	ViewChildren,
	QueryList,
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
	Observable,
	isObservable
} from 'rxjs';
import _ from 'lodash';

import {
	untilCmpDestroyed,
	calculateOrder
} from '@core';

import {
	CUBPopupRef,
	CUB_POPUP_REF,
	CUB_POPUP_CONTEXT,
	CUBPopupComponent
} from '@cub/material/popup';
import {
	CUBConfirmService
} from '@cub/material/confirm';

import {
	DataType,
	Field
} from '@main/common/field/interfaces';
import {
	ComparisonDefault,
	ValidateFnType
} from '@main/common/field/modules/comparison/interfaces';
import {
	ComparisonComponent,
	DataValidate,
	getDefaultOptions,
	getValidateFn
} from '@main/common/field/modules/comparison/components';
import {
	ExpressionEditorComponent,
	IParsedValue
} from '@main/common/logic-editor/components';

import {
	Filter,
	FilterCondition,
	Option
} from '../interfaces';
import {
	LogicalOperator
} from '../resources';
import {
	buildMemoDepth,
	processSiblingItems,
	setFilterLogical
} from '../helpers/filter.helper';

export type FilterContext = {
	isRealtime: boolean;
	filter: Filter | Observable<Filter>;
	fields: Field[] | Observable<Field[]>;
	onSave: ( filter: Filter ) => void;
};

const dataTypeEmpty: ReadonlySet<DataType> = new Set([
	DataType.Paragraph,
	DataType.Link,
	DataType.Attachment,
	DataType.Lookup,
]);

@Component({
	selector: 'filter',
	templateUrl: '../templates/filter.pug',
	styleUrls: [ '../styles/filter.scss' ],
	host: { class: 'filter' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent
implements OnInit {

	@ViewChild( ExpressionEditorComponent )
	private _expressionEditorComp: ExpressionEditorComponent;
	@ViewChild( CUBPopupComponent )
	private _popupComponent: CUBPopupComponent;
	@ViewChildren( ComparisonComponent )
	private _comparisonComps: QueryList<ComparisonComponent>;

	protected readonly LOGICAL_OPERATOR: typeof LogicalOperator
		= LogicalOperator;
	protected readonly logicalOperatorControl: FormControl
		= new FormControl( undefined );

	protected loaded: boolean = true;
	protected isChanged: boolean;
	protected isRealtime: boolean;
	protected filter: Filter;
	protected fields: Field[];

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	// Expression editor
	protected filterOptionsAnnotation: number[];

	private _expressionValue: string;

	get canSubmit(): boolean {
		if ( !this.filter ) {
			return this.isChanged;
		}

		let isValid: boolean
			= this.filter.logicalOperator !== LogicalOperator.CUSTOM
				|| !!this.filter.logicalExpression?.length;

		if ( isValid ) {
			_.forEach( this.filter.options, ( o: Option ) => {
				if ( !o.error ) return;

				isValid = !( o.error.data
					|| o.error.field
					|| o.error.otherField );

				if ( !isValid ) return false;
			} );
		}

		return this.isChanged && isValid;
	}

	constructor(
		@Optional() @Inject( CUB_POPUP_REF )
		protected popupRef: CUBPopupRef,
		@Optional() @Inject( CUB_POPUP_CONTEXT )
		protected filterContext: FilterContext,
		private _confirmService: CUBConfirmService
	) {}

	ngOnInit() {
		this.isRealtime = this.filterContext.isRealtime;

		this._loadFilter();
	}

	/**
	 * @return {void}
	 */
	protected close() {
		this.popupRef.close();
	}

	/**
	 * @return {void}
	 */
	protected addCondition() {
		if ( _.isStrictEmpty( this.filter?.options ) ) {
			this.filter = {
				options: [],
				logicalOperator: LogicalOperator.AND,
			} as Filter;
		}

		const newOption: Option = {
			fieldID: this.fields[ 0 ].extra.id,
			order: this.filter.options?.length + 1,
			field: {
				...this.fields[ 0 ],
				dataType: this.fields[ 0 ].dataType,
			},
		} as Option;

		const {
			operator,
			compareType,
			formulaType,
		}: ComparisonDefault
			= getDefaultOptions(
				this.fields[ 0 ].dataType
			);

		newOption.operator = operator;

		if (
			compareType
			|| formulaType
		) {
			newOption.data ||= {};

			if ( compareType ) {
				newOption.data.compareType = compareType;
			}
			if ( formulaType ) {
				newOption.data.formulaType = formulaType;
			}
		}

		this.filter.options.push( newOption );

		this.filterChanged( newOption );
		this._realtimeFilter();

		this.filterOptionsAnnotation ||= [];

		this.filterOptionsAnnotation.push(
			this.filterOptionsAnnotation.length + 1
		);

		setTimeout(
			() => {
				this._comparisonComps.last.openComparisonField();
				this._popupComponent.scrollBar?.scrollToBottom();
			}
		);
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	protected removeFilterOption( index: number ) {
		this.filterChanged();

		this.filter.options.splice(
			index,
			1
		);
		this.filterOptionsAnnotation.splice(
			this.filterOptionsAnnotation.length - 1,
			1
		);

		if ( !this.filter.options?.length ) this._resetEditor();

		this._realtimeFilter();
	}

	/**
	 * @return {void}
	 */
	protected removeAllFilterOption() {
		this.filterChanged();

		this.filter.options = [];

		this._resetEditor();
		this._realtimeFilter();
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
			= event.container.data[ event.currentIndex - 1 ]?.order;
		const nextOrder: number
			= event.container.data[ event.currentIndex + 1 ]?.order;
		const newOrder: number
			= calculateOrder( preOrder, nextOrder );

		event.item.data.order = newOrder;

		this.filterChanged();
		this._cdRef.markForCheck();
	}

	/**
	 * @param {Option=} option
	 * @return {void}
	 */
	protected filterChanged( option?: Option ) {
		this.isChanged = true;

		if (
			!this.popupRef.isCloseDisabled
			&& !this.isRealtime
		) {
			this.popupRef.disableClose();
		}

		if ( !option ) return;

		const validate: ValidateFnType
			= getValidateFn( option.field.dataType );

		setTimeout(
			() => {
				option.error
					= {
						...option.error,
						...validate(
							option as DataValidate<any>,
							this.fields
						),
					};

				this._cdRef.markForCheck();
			},
			10
		);
	}

	/**
	 * @return {void}
	 */
	protected onEditorContentChange() {
		if ( !this._expressionEditorComp ) return;

		const expressionValue: IParsedValue
			= this._expressionEditorComp.parse();

		if ( !expressionValue ) return;

		this.filter.logicalExpression = expressionValue.content;
		this._expressionValue = expressionValue.value;

		this.filterChanged();
		this._realtimeFilter();
	}

	/**
	 * @return {void}
	 */
	protected cancel() {
		if ( !this.isChanged ) {
			this.popupRef.close();

			return;
		};

		this._confirmService
		.open(
			'BASE.BOARD.FILTER.MESSAGE.CANCEL_MESSAGE',
			'BASE.BOARD.FILTER.LABEL.BACK_CONFIRM',
			{
				warning			: true,
				buttonDiscard	: 'BASE.BOARD.FILTER.LABEL.KEEP',
				buttonApply: {
					text: 'BASE.BOARD.FILTER.LABEL.CANCEL_CONFIRM',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				this.popupRef.close();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected save() {
		if (
			this.filter.logicalOperator === LogicalOperator.CUSTOM
			&& !this._expressionValue?.length
			&& this.isRealtime
		) {
			this.filterContext.onSave( this.filter );
			return;
		}

		if ( !!this._expressionEditorComp?.checkSyntax() ) return;

		if ( !_.isStrictEmpty( this.filter.options ) ) {
			let conditions: FilterCondition = {};
			const logicalOperatorName: ObjectType<string>
				= _.invert( LogicalOperator );

			if ( this.filter.logicalOperator !== LogicalOperator.CUSTOM ) {
				conditions[
				logicalOperatorName[ this.filter.logicalOperator ]
				.toLowerCase() ]
					= this.isRealtime
						? _.map(
							this.filter.options,
							( o: Option ) => {
								return o.error.data
									|| o.error.field
									|| o.error.otherField
									|| _.pick( o, [ 'fieldID', 'operator', 'data', 'order' ] );
							}
						)
						: this.filter.options;
			} else {
				conditions
					= processSiblingItems(
						buildMemoDepth(
							this._expressionValue.match( new RegExp( /(AND|OR|\(|\)|\d{1,})/g ) )
						),
						this.filter,
						this.isRealtime
					);
			}

			this.filter.conditions = conditions;
		} else {
			this.filter = null;
		}

		this.filterContext.onSave( this.filter );

		if ( this.isRealtime ) return;

		this.close();
	}

	/**
	 * @param {Option=} option
	 * @return {void}
	 */
	protected onOperatorChange( option?: Option ) {
		this.filterChanged( option );

		if ( !dataTypeEmpty.has( option.field.dataType ) ) return;

		setTimeout(
			() => {
				if ( option.error?.data
					|| option.error?.field
					|| option.error?.otherField ) return;

				this._realtimeFilter();
			},
			10
		);
	}

	/**
	 * @param {Option=} option
	 * @return {void}
	 */
	protected onDataChange( option?: Option ) {
		this.filterChanged( option );

		setTimeout(
			() => {
				if ( option.error?.data
					|| option.error?.field
					|| option.error?.otherField ) return;

				this._realtimeFilter();
			},
			10
		);
	}

	/**
	 * @param {LogicalOperator} event
	 * @return {void}
	 */
	protected onLogicalOperatorChange( event: LogicalOperator ) {
		if ( this.filter.logicalOperator === event ) return;

		if ( event === LogicalOperator.CUSTOM ) {
			this.filter.logicalExpression
				= setFilterLogical( this.filter );

			this._setExpressionValue();
		} else {
			this.filter.logicalExpression = '';

			this._setExpressionValue();
		}

		this.filter.logicalOperator = event;

		this.filterChanged();
		this._realtimeFilter();
	}

	/**
	 * @return {void}
	 */
	private _resetEditor() {
		this.filter.logicalOperator = LogicalOperator.AND;
		this.filter.logicalExpression = undefined;
		this.filterOptionsAnnotation = [];
	}

	/**
	 * @return {void}
	 */
	private _loadFilter() {
		if ( isObservable( this.filterContext.filter ) ) {
			this.loaded = false;

			( this.filterContext.filter as unknown as Observable<Filter> )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( filter: Filter ) => {
					this.filter = filter;

					this._loadField();
					this._setFilterOptionsAnnotation();
				},
				error: () => {
					this.loaded = true;

					this._cdRef.markForCheck();
				},
			});
		} else {
			this.filter = _.cloneDeep( this.filterContext.filter );

			this._loadField();
			this._setFilterOptionsAnnotation();
		}
	}

	/**
	 * @return {void}
	 */
	private _loadField() {
		if ( isObservable( this.filterContext.fields ) ) {
			this.loaded = false;

			this._cdRef.markForCheck();

			( this.filterContext.fields as unknown as Observable<Field[]> )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( fields: Field[] ) => {
					this._setFields( fields );
					this._setExpressionValue();
					this._fieldValidate();
				},
				error: () => {
					this.loaded = true;

					this._cdRef.markForCheck();
				},
			});
		} else {
			this._setFields( this.filterContext.fields );
			this._setExpressionValue();
			this._fieldValidate();
		}
	}

	/**
	 * @return {void}
	 */
	private _setFilterOptionsAnnotation() {
		if ( !this.filter?.options?.length ) return;

		this.filterOptionsAnnotation ||= [];

		for (
			let index: number = 1;
			index <= this.filter.options.length;
			++index
		) {
			this.filterOptionsAnnotation.push( index );
		}
	}

	/**
	 * @return {void}
	 */
	private _setExpressionValue() {
		setTimeout( () => {
			this._expressionValue = this._expressionEditorComp?.parse()?.value;
		}, 100 );
	}

	/**
	 * @return {void}
	 */
	private _realtimeFilter() {
		if ( !this.isRealtime ) return;

		setTimeout(
			() => this.save(),
			10
		);
	}

	/**
	 * @param {Field[]} fields
	 * @return {void}
	 */
	private _setFields( fields: Field[] ) {
		this.fields = fields;
		this.loaded = true;

		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	private _fieldValidate() {
		if ( !this.filter ) return;

		setTimeout(
			() => {
				_.forEach(
					this.filter.options,
					( option: Option ) => {
						const validate: ValidateFnType
							= getValidateFn( option.field.dataType );

						option.error = validate(
							option as DataValidate<any>,
							this.fields
						);
					}
				);

				this._cdRef.markForCheck();
			},
			50
		);
	}

}
