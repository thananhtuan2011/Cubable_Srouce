/* eslint-disable */
import { ulid } from 'ulidx';

import {
	ChangeDetectionStrategy,
	Component,
	ViewChild
} from '@angular/core';
import moment, { Moment } from 'moment-timezone';
import _ from 'lodash';

import {
	Column,
	Config,
	ROW_SIZES,
	Row,
	SpreadsheetComponent,
	SpreadsheetMode
} from '@main/common/spreadsheet/components';
import {
	AttachmentField,
	CheckboxField,
	CurrencyField,
	DateField,
	DropdownField,
	EmailField,
	FormulaField,
	LinkField,
	// LookupField,
	NumberField,
	ParagraphField,
	// PeopleField,
	PhoneField,
	ProgressField,
	RatingField,
	// ReferenceField,
	TextField
} from '@main/common/field/objects';
import { CalculatingType } from '@main/common/spreadsheet/helpers/calculate';

import files from './files.json';

@Component({
	selector		: 'spreadsheet-demo',
	templateUrl		: './spreadsheet-demo.pug',
	host			: { class: 'layout-column flex' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SpreadsheetDemoComponent {

	@ViewChild( SpreadsheetComponent, { static: true } )
	public spreadsheet: SpreadsheetComponent;

	public readonly ROW_SIZES = ROW_SIZES;

	public console: typeof console = console;
	public columns: Column[] = [
		{
			id		: ulid(),
			field	: new TextField(
				'Text',
				undefined,
				undefined,
				true,
				undefined,
				{ isPrimary: true, isInvalid: false } as any
			),
		},
		{
			id		: ulid(),
			field	: new ParagraphField( 'Paragraph' ),
		},
		{
			id		: ulid(),
			field	: new NumberField( 'Number' ),
			calculatingType: CalculatingType.Sum,
		},
		{
			id		: ulid(),
			field	: new EmailField( 'Email' ),
			calculatingType: CalculatingType.Empty,
		},
		{
			id		: ulid(),
			field	: new LinkField( 'Link' ),
		},
		{
			id		: ulid(),
			field	: new CheckboxField( 'Checkbox' ),
		},
		{
			id		: ulid(),
			field	: new CurrencyField( 'Currency' ),
		},
		{
			id		: ulid(),
			field	: new DropdownField(
				'Dropdown',
				undefined,
				[
					{ name: 'Option 1', value: ulid() },
					{ name: 'Option 2', value: ulid() },
					{ name: 'Option 3', value: ulid() },
					{ name: 'Option 4', value: ulid() },
					{ name: 'Option 5', value: ulid() },
					{ name: 'Option 6', value: ulid() },
				]
			),
		},
		{
			id		: ulid(),
			field	: new RatingField( 'Rating' ),
		},
		{
			id		: ulid(),
			field	: new PhoneField( 'Phone' ),
		},
		{
			id		: ulid(),
			field	: new ProgressField( 'Progress' ),
		},
		{
			id		: ulid(),
			field	: new AttachmentField( 'Attachment' ),
		},
		{
			id		: ulid(),
			field	: new DateField( 'Date' ),
		},
		{
			id		: ulid(),
			field	: new FormulaField( 'Formula' ),
		},
		// {
		// 	id		: ulid(),
		// 	field	: new PeopleField( 'People', this._getPeople() ),
		// },
		// {
		// 	id		: ulid(),
		// 	field	: new ReferenceField( 'Reference', { id: '1', name: 'View 1' }, this._getReferenceItems() ),
		// },
		// {
		// 	id		: ulid(),
		// 	field	: new LookupField( 'Lookup' ),
		// },
	];
	public rows: Row[];
	public config: Config = {
		mode: SpreadsheetMode.Editor,
		// actions: [
		// 	{ icon: 'print', label: 'Print' },
		// 	{ icon: 'export', label: 'Export' },
		// ],
	};

	ngOnInit() {
		_.forEach( this.columns, ( column: Column ) => {
			column.field.extra = {
				...column.field.extra,
				id: column.id,
			};
		} );

		this.generateRow( 10 );
	}

	public generateRow( length: number ) {
		this.rows = _.map( this._generateRowData( length ), ( item: ObjectType ) => {
			const newRow: Row = {
				id: item.id,
				data: item.data,
			};

			return newRow;
		} );
	}

	private _generateRowData( length: number ): ObjectType[] {
		const currentMoment: Moment = moment();
		const dropdownField: DropdownField = this.columns[ 7 ].field as DropdownField;
		const dropdownValue: any = _.map( dropdownField.options, 'value' );

		return _.map( _.range( 1, length + 1 ), ( index: number ) => {
			return {
				id: ulid(),
				order: index,
				data: {
					[ this.columns[ 0 ].id ]: 'Lorem Ipsum', // Text
					[ this.columns[ 1 ].id ]: { // Paragraph
						text: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
						html: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
					},
					[ this.columns[ 2 ].id ]:  _.random( 0, length ), // Number
					[ this.columns[ 3 ].id ]: `email${_.random( 1, length )}@gmail.com`, // Email
					[ this.columns[ 4 ].id ]: { // Link
						text: 'Cubable',
						link: 'www.cubable.com',
					},
					[ this.columns[ 5 ].id ]: !_.random( 0, 1 ), // Checkbox
					[ this.columns[ 6 ].id ]: _.random( 0, length * 1e6 ), // Currency
					[ this.columns[ 7 ].id ]: { value: dropdownValue, selected: dropdownField.options }, // Dropdown
					[ this.columns[ 8 ].id ]: _.random( 1, 5 ), // Rating
					[ this.columns[ 9 ].id ]: { // Phone
						phone: '0349114878',
						countryCode: 'VN',
					},
					[ this.columns[ 10 ].id ]: _.random( 0, 100 ) / 100, // Progress
					[ this.columns[ 11 ].id ]: _.clone( files ), // Attachment
					[ this.columns[ 12 ].id ]: currentMoment.clone().add( _.random( 0, length ), 'd' ), // Date
					[ this.columns[ 13 ].id ]: { // Formula
						value: '#{field_01HQ01PA3VQ8Q9YN02288YE6E8}',
						params: {
							advanced: true,
							resultFormatType: 'number',
							resultFormatConfig: {
								format: 'commas-separator',
								decimalPlaces: null
							}
						},
						calculated: {
							data: 123123123,
							resultType: 6
						}
					},
					// [ this.columns[ 14 ].id ]: { // People
					// 	value: _.range( 1, _.random( 1, 6 ) ),
					// 	params: {
					// 		// selected: [],
					// 	},
					// },
					// [ this.columns[ 15 ].id ]: { // Reference
					// 	value: _.range( 1, _.random( 1, 5 ) ),
					// 	params: {
					// 		// selected: [],
					// 	},
					// },
				}
			};
		} );
	}

}
/* eslint-enable */
