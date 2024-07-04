import {
	ChangeDetectionStrategy,
	Component,
	Input,
	OnChanges,
	ViewChild,
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
	ComparisonOperator,
	ComparisonType
} from '@main/common/field/modules/comparison/resources/comparison';
import {
	DropdownField
} from '@main/common/field/objects';
import {
	DropdownOption
} from '@main/common/field/interfaces';

import {
	ComparisonBase
} from '../../components';
import {
	AdvanceData,
	TComparisonOperator
} from '../../interfaces';

const operatorHasComparisonType: ReadonlySet<ComparisonOperator> = new Set([
	ComparisonOperator.IS_EXACTLY,
	ComparisonOperator.IS_NOT_EXACTLY,
	ComparisonOperator.IN,
	ComparisonOperator.NOT_IN,
]);

export type DropdownData = AdvanceData & {
	// static
	value?: ULID[];
	selected?: DropdownOption[];
};

@Component({
	selector: 'dropdown-comparison',
	templateUrl: './dropdown-comparison.pug',
	styleUrls: [ '../../styles/comparison-base.scss' ],
	host: { class: 'dropdown-comparison' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComparisonComponent
	extends ComparisonBase<DropdownData>
	implements OnChanges {

	@ViewChild( 'dataDropdown' )
	private _dataDropdown: CUBDropdownComponent;

	@Input() public field: DropdownField;

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
		];
	protected readonly operatorHasComparisonType:
	ReadonlySet<ComparisonOperator>
		= operatorHasComparisonType;

	protected options: DropdownOption[];

	private _hasGetItems: boolean;
	private _optionsNotAvailable: DropdownOption[];

	ngOnChanges( changes: SimpleChanges ) {
		super.ngOnChanges( changes );

		if ( changes.field ) {
			this._hasGetItems = false;
			this.data ||= {} as DropdownData;

			if ( !changes.field.currentValue?.reference?.fieldID ) {
				this.options = _.unionBy(
					this.field?.options,
					this.data.selected,
					'value'
				);

				this._setOptionsNotAvailable();
			}
		};

		if ( changes.data ) {
			this.options = _.unionBy(
				this.options,
				this.data?.selected,
				'value'
			);
		}
	}

	/**
	 * @return {void}
	 */
	protected override onOperatorChange() {
		super.onOperatorChange();

		if ( operatorHasComparisonType.has( this.operator ) ) {
			this.data ||= {
				compareType: DropdownComparisonComponent.default.compareType,
				value: [],
				selected: [],
			};

			setTimeout(
				() => this._dataDropdown.open()
			);
		} else {
			this.data = undefined;
		}

		super.onDataChange();
		this.resetDataControl();
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
			...this.data as DropdownData,
			value: [],
			selected: [],
		};

		super.onDataChange();
		this.resetDataControl();
	}

	/**
	 * @return {void}
	 */
	protected override onDataChange() {
		if ( _.isString( this.data.value ) ) {
			this.data.value = [ this.data.value ];
		}

		const valueLk: ObjectType<ULID>
			= _.keyBy( this.data.value );

		_.forEach(
			this._optionsNotAvailable,
			( i: DropdownOption ) => {
				if ( valueLk[ i.value ] ) return;

				_.remove(
					this.options,
					{ value: i.value }
				);
			}
		);

		this.data.selected = _.filter(
			this.options,
			( item: DropdownOption ) => valueLk[ item.value ]
		) as DropdownOption[];

		super.onDataChange();
	}

	/**
	 * @return {void}
	 */
	protected onDropdownPickerOpened() {
		if (
			!this.field.reference?.fieldID
			|| this._hasGetItems
		) return;

		this.boardFieldService
		.getDropdownOptions( this.field.reference.fieldID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( options: DropdownOption[] ) => {
				this.options = _.unionBy(
					options,
					this.data.selected,
					'value'
				);

				this._setOptionsNotAvailable();
				this.cdRef.detectChanges();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _setOptionsNotAvailable() {
		this._optionsNotAvailable = _.differenceBy(
			this.data.selected,
			this.options,
			'value'
		);
	}

}
