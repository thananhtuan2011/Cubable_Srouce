import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import moment from 'moment-timezone';
import _ from 'lodash';

import {
	buildFieldReplacer,
	parseFieldIDFormReplacer
} from '@main/common/logic-editor/components';

import {
	Field,
	FormulaField
} from '../../../../objects';
import {
	FormulaBasicOperator,
	FormulaData,
	FormulaResultFormatConfig,
	FormulaResultFormatType,
	FormulaValueParams
} from '../../../../interfaces';

type FormulaValue = FormulaData[ 'value' ];

const BASIC_OPERATORS: FormulaBasicOperator[]
	= [
		FormulaBasicOperator.Plus,
		FormulaBasicOperator.Minus,
		FormulaBasicOperator.Multiply,
		FormulaBasicOperator.Divide,
	];

@Component({
	selector: 'formula-data-editor',
	templateUrl: './data-editor.pug',
	host: { class: 'formula-data-editor' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormulaDataEditorComponent implements OnChanges {

	@Input() public field: FormulaField;
	@Input() public data: FormulaData;
	@Input() public otherFields: Field[];

	@Output() public dataChange: EventEmitter<FormulaData>
		= new EventEmitter<FormulaData>();

	/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/typedef */
	protected readonly BASIC_OPERATORS
		= BASIC_OPERATORS;
	protected readonly FormulaBasicOperator
		= FormulaBasicOperator;
	protected readonly FormulaResultFormatType
		= FormulaResultFormatType;
	/* eslint-enable @typescript-eslint/naming-convention, @typescript-eslint/typedef */

	protected leftFieldID: ULID;
	protected rightFieldID: ULID;
	protected basicOperator: FormulaBasicOperator
		= FormulaBasicOperator.Plus;
	protected basicFormulaFields: Field[];
	protected advanceFormulaFields: Field[];

	get value(): FormulaValue {
		return this.data?.value;
	}

	get params(): FormulaValueParams {
		return this.data?.params;
	}

	get isAdvanced(): boolean {
		return !!this.params?.advanced;
	}

	ngOnChanges(
		changes: SimpleChanges
	) {
		if ( changes.field ) {
			if ( this.value
				&& !this.isAdvanced ) {
				const arr: string[]
					= this.value.split( /\s+/ );

				this.leftFieldID
					= parseFieldIDFormReplacer( arr[ 0 ] );
				this.rightFieldID
					= parseFieldIDFormReplacer( arr[ 2 ] );
				this.basicOperator
					= arr[ 1 ] as FormulaBasicOperator;
			}
		}

		if ( changes.otherFields ) {
			this.basicFormulaFields =
				_.chain( this.otherFields )
				.filter(
					( field: Field ) =>
						field.id !== this.field.id )
				.sortBy(
					( field: any ) =>
						moment( field.extra.createdAt ) )
				.value();

			this.advanceFormulaFields
				= _.filter(
					this.otherFields,
					( field: Field ) => {
						return field.id !== this.field.id;
					}
				);
		}
	}

	/**
	 * @return {void}
	 */
	protected onBasicFormulaChanged() {
		if ( !this.leftFieldID
			|| !this.rightFieldID
			|| !this.basicOperator ) {
			return;
		}

		const leftFieldIDReplacer: string
			= buildFieldReplacer( this.leftFieldID );
		const rightFieldIDReplacer: string
			= buildFieldReplacer( this.rightFieldID );

		this._markValueChanged(
			[
				leftFieldIDReplacer,
				this.basicOperator,
				rightFieldIDReplacer,
			].join( ' ' ),
			{
				...this.params,
				advanced: false,
			}
		);
	}

	/**
	 * @param {FormulaValue} formula
	 * @return {void}
	 */
	protected onAdvancedFormulaChanged(
		formula: FormulaValue
	) {
		this._markValueChanged(
			formula,
			{
				...this.params,
				advanced: true,
			}
		);
	}

	/**
	 * @param {FormulaResultFormatType} resultFormatType
	 * @return {void}
	 */
	protected onResultFormatTypeChanged(
		resultFormatType: FormulaResultFormatType
	) {
		this._markValueChanged(
			this.value,
			{
				...this.params,
				resultFormatType,
				resultFormatConfig: null,
			}
		);
	}

	/**
	 * @param {FormulaResultFormatConfig} resultFormat
	 * @return {void}
	 */
	protected onResultFormatConfigChanged(
		resultFormatConfig: FormulaResultFormatConfig
	) {
		this._markValueChanged(
			this.value,
			{
				...this.params,
				resultFormatConfig,
			}
		);
	}

	/**
	 * @param {FormulaValue=} value
	 * @param {FormulaValueParams=} params
	 * @return {void}
	 */
	private _markValueChanged(
		value: FormulaValue = this.value,
		params: FormulaValueParams = this.params
	) {
		if ( !this.data ) {
			this.data = {} as FormulaData;
		}

		this.data.value = value;
		this.data.params = params;

		this.dataChange.emit( this.data );
	}

}
