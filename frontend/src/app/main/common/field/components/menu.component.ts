import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Inject,
	OnInit,
	Optional,
	ViewChild
} from '@angular/core';
import {
	isObservable
} from 'rxjs';
import _ from 'lodash';

import {
	generateUniqueName,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUB_MENU_CONTEXT,
	CUB_MENU_REF,
	CUBMenuItemComponent,
	CUBMenuRef
} from '@cub/material/menu';
import {
	CUBPopupConfig,
	CUBPopupRef
} from '@cub/material/popup';
import {
	CUBSearchBoxComponent
} from '@cub/material/search-box';

import {
	FieldHelper
} from '../helpers';
import {
	DataType,
	FieldList
} from '../interfaces';
import {
	Field,

	AttachmentField,
	CheckboxField,
	CreatedByField,
	CreatedTimeField,
	CurrencyField,
	DateField,
	DropdownField,
	EmailField,
	FormulaField,
	LastModifiedByField,
	LastModifiedTimeField,
	LinkField,
	LookupField,
	NumberField,
	ParagraphField,
	PeopleField,
	PhoneField,
	ProgressField,
	RatingField,
	ReferenceField,
	TextField
} from '../objects';

import {
	FieldBuilderService
} from '../modules/builder/services';

// eslint-disable-next-line @typescript-eslint/typedef
const STRICT_FIELD_LIST = [
	FormulaField,
	LastModifiedByField,
	LastModifiedTimeField,
	LookupField,
	ReferenceField,
] as const;
// eslint-disable-next-line @typescript-eslint/typedef
const FIELD_LIST = {
	BASIC: [
		TextField,
		CheckboxField,
		ParagraphField,
		AttachmentField,
		DropdownField,
		NumberField,
		DateField,
	],
	BUSINESS_ESSENTIAL: [
		PhoneField,
		LinkField,
		EmailField,
		CurrencyField,
		PeopleField,
		RatingField,
		ProgressField,
	],
	ADVANCED: [
		ReferenceField,
		LastModifiedByField,
		LastModifiedTimeField,
		LookupField,
		CreatedByField,
		FormulaField,
		CreatedTimeField,
	],
} as const;

export type FieldMenuContext = {
	strictMode?: boolean;
	otherFields?: FieldList;
	unsupportDataTypes?: DataType[];
	context?: ObjectType;
	config?: CUBPopupConfig;
	onFieldBuilding?: ( isBuilding: boolean ) => void;
	onDone?: ( field: Field ) => void;
	onCancel?: () => void;
};

@Unsubscriber()
@Component({
	selector: 'field-menu',
	templateUrl: './menu.pug',
	host: { class: 'field-menu' },
	providers: [ FieldBuilderService ],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldMenuComponent
implements OnInit {

	@ViewChild( CUBSearchBoxComponent )
	protected readonly searchBox: CUBSearchBoxComponent;

	// eslint-disable-next-line @typescript-eslint/typedef
	protected readonly FIELD_LIST = FIELD_LIST;

	private readonly _fieldBuilder: FieldBuilderService
		= inject( FieldBuilderService );
	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();

	protected unsupportDataTypes: Set<DataType>;

	private _otherFields: Field[];

	/**
	 * @constructor
	 * @param {CUBMenuRef} menuRef
	 * @param {FieldMenuContext} menuContext
	 */
	constructor(
		@Optional() @Inject( CUB_MENU_REF )
		protected menuRef: CUBMenuRef,
		@Optional() @Inject( CUB_MENU_CONTEXT )
		protected menuContext: FieldMenuContext
	) {
		this.unsupportDataTypes = new Set(
			this.menuContext?.unsupportDataTypes
		);
	}

	ngOnInit() {
		this._loadOtherFields();
	}

	/**
	 * @param {DataType} dataType
	 * @param {string=} name
	 * @return {void}
	 */
	public buildField(
		dataType: DataType,
		name?: string
	) {
		this.menuRef.close();

		const {
			strictMode,
			context,
			onFieldBuilding,
			onDone,
			onCancel,
			config,
		}: FieldMenuContext
			= this.menuContext;
		const field: Field
			= this
			._fieldHelper
			.createField({
				dataType,
				name: generateUniqueName(
					_.map( this._otherFields, 'name' ),
					name,
					80
				) || name,
			});

		if (
			strictMode
				|| _.find(
					STRICT_FIELD_LIST,
					{ dataType }
				)
		) {
			const popupRef: CUBPopupRef
				= this
				._fieldBuilder
				.build(
					field,
					this.menuRef.origin,
					this._otherFields,
					context,
					onDone,
					onCancel,
					{
						...config,
						maxHeight: 500,
					}
				);

			popupRef
			.afterOpened()
			.pipe(
				untilCmpDestroyed( this )
			)
			.subscribe(() => {
				onFieldBuilding?.( true );
			});

			popupRef
			.afterClosed()
			.pipe(
				untilCmpDestroyed( this )
			)
			.subscribe(() => {
				onFieldBuilding?.( false );
			});

			const closeFn: () => void
				= this.menuRef.close;

			this.menuRef.close
				= () => {
					popupRef.close();
					closeFn();
				};
			return;
		}

		onDone?.( field );
	}

	/**
	 * @param {CUBMenuItemComponent} item
	 * @param {string} searchQuery
	 * @return {boolean}
	 */
	protected filterPredicate(
		item: CUBMenuItemComponent,
		searchQuery: string
	): boolean {
		return _.search(
			item.context.label,
			searchQuery
		);
	}

	/**
	 * @return {void}
	 */
	private _loadOtherFields() {
		const {
			otherFields,
		}: FieldMenuContext
			= this.menuContext;

		if ( !otherFields ) {
			return;
		}

		if ( isObservable( otherFields ) ) {
			otherFields
			.pipe(
				untilCmpDestroyed( this )
			)
			.subscribe(
				( fields: Field[] ) => {
					this._otherFields = fields;
				}
			);
			return;
		}

		this._otherFields
			= otherFields as Field[];
	}

}
