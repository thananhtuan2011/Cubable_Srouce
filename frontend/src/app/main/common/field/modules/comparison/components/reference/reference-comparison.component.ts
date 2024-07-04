import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	ViewChild,
	OnChanges,
	inject,
	SimpleChanges
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	untilCmpDestroyed
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';
import {
	CUBFormFieldInputDirective
} from '@cub/material/form-field';

import {
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	ReferenceField
} from '@main/common/field/objects';
import {
	ReferenceRecord,
	ReferenceItem
} from '@main/common/field/interfaces';
import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	RecordData
} from '@main/workspace/modules/base/modules/board/modules/record/interfaces';
import {
	RecordService
} from '@main/workspace/modules/base/modules/board/modules/record/services';
import {
	DataViewService
} from '@main/workspace/modules/base/modules/board/modules/view/modules/data-view/services';
import {
	DataViewDetail
} from '@main/workspace/modules/base/modules/board/modules/view/modules/data-view/interfaces';

import {
	ComparisonBase
} from '../../components';
import {
	AdvanceData,
	TComparisonOperator
} from '../../interfaces';

const comparisonTypeHasValue: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.IS_EXACTLY,
	ComparisonOperator.IS_NOT_EXACTLY,
	ComparisonOperator.IN,
	ComparisonOperator.NOT_IN,
]);

const comparisonEmpty: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.ANY,
	ComparisonOperator.IS_EMPTY,
	ComparisonOperator.IS_NOT_EMPTY,
]);

const comparisonNotCustomValue: ReadonlySet<ComparisonOperator>
= new Set([
	ComparisonOperator.CONTAINS,
	ComparisonOperator.DOES_NOT_CONTAINS,
	ComparisonOperator.STARTS_WITH,
	ComparisonOperator.ENDS_WITH,
]);

export type ReferenceData = AdvanceData & {
	// static
	recordIDs?: ULID[];
	selected?: ReferenceRecord[];

	// word count
	text?: string;
};

@Component({
	selector: 'reference-comparison',
	templateUrl: './reference-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'reference-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceComparisonComponent
	extends ComparisonBase<ReferenceData>
	implements OnChanges {

	@ViewChild( 'comparisonCustomField' )
	private _comparisonCustomField: CUBDropdownComponent;
	@ViewChild( 'textInput' )
	private _textInput: CUBFormFieldInputDirective;

	@Input() public field: ReferenceField;

	protected readonly comparisonOperators: TComparisonOperator[]
		= [
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EMPTY,
				'IS_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EMPTY,
				'IS_NOT_EMPTY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_EXACTLY,
				'IS_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IS_NOT_EXACTLY,
				'IS_NOT_EXACTLY'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.IN,
				'IN'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.NOT_IN,
				'NOT_IN'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.CONTAINS,
				'CONTAINS'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.DOES_NOT_CONTAINS,
				'DOES_NOT_CONTAINS'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.STARTS_WITH,
				'STARTS_WITH'
			),
			ComparisonBase.setComparisonOperator(
				ComparisonOperator.ENDS_WITH,
				'ENDS_WITH'
			),
		];
	protected readonly comparisonTypeHasValue: ReadonlySet<ComparisonOperator>
		= comparisonTypeHasValue;

	protected readonly comparisonNotCustomValue: ReadonlySet<ComparisonOperator>
		= comparisonNotCustomValue;

	protected availableItems: ReferenceItem[];

	private readonly _recordService: RecordService
		= inject( RecordService );
	private readonly _dataViewService: DataViewService
		= inject( DataViewService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	private _hasGetItems: boolean;
	private _itemsNotAvailable: ReferenceItem[];

	ngOnChanges(changes: SimpleChanges) {
		super.ngOnChanges( changes );

		if (
			changes.field?.currentValue?.id
				!== changes?.field?.previousValue?.id
		) {
			this._hasGetItems = false;
			this.availableItems = [];
		}

		if ( changes.data?.currentValue?.selected ) {
			this.availableItems = _.map(
				this.data?.selected,
				( selected: ReferenceRecord ) => {
					return {
						id: selected.id,
						data: selected.data,
					};
				}
			);
		}
	}

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		this.data = this.comparisonTypeHasValue.has( this.operator )
			? {
				compareType: ReferenceComparisonComponent.default.compareType,
			}
			: comparisonEmpty.has( this.operator )
			|| comparisonNotCustomValue.has( this.operator )
				? undefined
				: {};

		if ( comparisonNotCustomValue.has( this.operator ) ) {
			setTimeout(
				() => this._textInput.focus()
			);
		}

		if ( comparisonTypeHasValue.has( this.operator ) ) {
			setTimeout(
				() => this._comparisonCustomField.open()
			);
		}

		super.onDataChange();
		this.resetDataControl();
		super.onOperatorChange();
	}

	/**
	 * @param {ComparisonType} type
	 * @return {void}
	 */
	protected onTypeChange(
		type: ComparisonType
	) {
		super.onTypeChange(
			type
		);

		this.data = {
			...this.data,
			recordIDs: undefined,
			selected: undefined,
		};

		// switch ( this.data.compareType ) {
		// 	case ComparisonType.AUTO:
		// 		this.openComparisonSpecificField();
		// 		break;
		// 	case ComparisonType.STATIC:
		// 		setTimeout(
		// 			() => this._comparisonCustomField.open()
		// 		);
		// 		break;
		// }

		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @return {void}
	 */
	protected onItemChange() {
		const recordIDLk: ObjectType<ULID>
			= _.keyBy( this.data.recordIDs );

		_.forEach(
			this._itemsNotAvailable,
			( i: ReferenceItem ) => {
				if ( recordIDLk[ i.id ] ) return;

				_.remove( this.availableItems, { id: i.id } );
			}
		);

		this.data.selected = _.filter(
			this.availableItems,
			( item: ReferenceItem ) => recordIDLk[ item.id ]
		) as ReferenceItem[];

		this._cdRef.detectChanges();
		super.onDataChange();
	}


	/**
	 * @param {string} data
	 * @return {void}
	 */
	protected onTextDataChange( data: string ) {
		this.data = { text: data };

		this._cdRef.detectChanges();
		super.onDataChange();
	}

	/**
	 * @return {void}
	 */
	protected onDropdownPickerOpened() {
		if ( this._hasGetItems ) return;

		this._dataViewService
		.getDetail( this.field.reference.viewID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( viewDetails: DataViewDetail ) => {
				if ( !viewDetails.permissionOnView ) return;

				this._initRecordItems();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initRecordItems() {
		this.boardFieldService
		.get( this.field.reference.boardID, true )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				this._getRecordItems(
					_.map(
						fields.slice( 0, 4 ),
						'id'
					)
				);
			},
		});
	}

	/**
	 * @param {ULID[]} fieldIDs
	 * @return {void}
	 */
	private _getRecordItems( fieldIDs: ULID[] ) {
		this._recordService
		.listDataByView(
			this.field.reference.viewID,
			_.map( fieldIDs )
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( records: RecordData[] ) => {
				const availableItems: ReferenceItem[] = _.map(
					records,
					( item: RecordData ) => {
						return {
							id: item.id,
							data:  item.cells[ fieldIDs[ 0 ] ],
						};
					}
				);
				this._itemsNotAvailable = _.differenceBy(
					_.map(
						this.data.selected,
						( selected: ReferenceRecord ) => {
							return {
								id: selected.id,
								data:  selected.data,
							};
						}
					),
					availableItems,
					'id'
				);
				this.availableItems = _.unionBy(
					availableItems,
					this.availableItems,
					'id'
				);
				this._hasGetItems = true;

				this._cdRef.detectChanges();
			},
		});
	}

}
