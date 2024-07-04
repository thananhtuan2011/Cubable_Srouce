import {
	ChangeDetectionStrategy,
	Component,
	Input,
	inject,
	ChangeDetectorRef
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	DefaultValue,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBPopupRef,
	CUBPopupService
} from '@cub/material/popup';

import {
	ReferenceExpanderComponent
} from '@main/common/spreadsheet/components';
import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces/board-field.interface';
import {
	ReferenceField
} from '@main/common/field/objects';
import {
	ReferenceData,
	ReferenceRecord,
	ReferenceItemsByView,
	ReferenceItem
} from '@main/common/field/interfaces';
import {
	RecordService
} from '@main/workspace/modules/base/modules/board/modules/record/services';
import {
	BoardFormService
} from '@main/workspace/modules/base/modules/board/modules/form/services/form-public.service';

import {
	FIELD_INPUT_FORWARD_REF
} from '../input';
import {
	FieldInputEditable
} from '../input-editable';

@Unsubscriber()
@Component({
	selector: 'reference-field-input',
	templateUrl: './input.pug',
	styleUrls: [ '../input.scss', './input.scss' ],
	host: { class: 'reference-field-input' },
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [
		FIELD_INPUT_FORWARD_REF(
			ReferenceFieldInputComponent
		),
		BoardFormService,
	],
})
export class ReferenceFieldInputComponent extends
	FieldInputEditable<ReferenceField, ReferenceData> {

	@Input() @DefaultValue()
	public itemName: string | null = null;
	@Input() public isFormView: boolean;
	@Input() public formID: ULID;
	@Input() public workspaceID: ULID;

	protected recordItems: ReferenceItem[];
	protected expanderRef: CUBPopupRef;

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );
	private readonly _recordService: RecordService
		= inject( RecordService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _boardFormService: BoardFormService
		= inject( BoardFormService );

	private _initDefaultValueOnce: ReturnType<typeof _.once>
		= _.once( () => this._initDefaultValue() );

	/**
	 * @return {void}
	 */
	protected onFocus() {
		this.cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected onBlur() {
		this.cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected openDropdownItem() {
		this._initDefaultValueOnce();
	}

	/**
	 * @param {ULID | ULID[]} event
	 * @param {ReferenceData} data
	 * @return {void}
	 */
	protected onPickItem( item: ULID | ULID[], _data: ReferenceData ) {
		if ( _.isStrictEmpty( item ) ) {
			_data = null;
		} else {
			_data = {
				value: !_.isArray( item )
					? [ item ]
					: item,
			};
		}

		this.onDataChanged( _data, true );
	}

	/**
	 * @param {boolean} isExpand
	 * @param {ReferenceData} _data
	 * @return {void}
	 */
	protected onOpenReferenceExpander(
		isExpand: boolean,
		_data: ReferenceData
	) {
		if (
			this.expanderRef?.isOpened
			|| this.readonly && !_data
		) {
			return;
		}

		this.expanderRef
			= this._popupService
			.open(
				null,
				ReferenceExpanderComponent,
				{
					isExpand,
					fieldParams: this.field.params,
					readonly: !( this.field.extra as BoardField ).canEditAllRow,
					itemName: this.itemName,
					itemIDs:
						_.cloneDeep(
							_data?.value
								? _data?.value
								: []
						),
					onItemSelected: this._itemsSelected.bind( this ),
				},
				{
					hasBackdrop: 'transparent',
					disableClose: true,
				}
			);

		this.expanderRef
		.afterClosed()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => this.cdRef.markForCheck(),
		});
	}

	/**
	 * @param {ReferenceData} value
	 * @param {ReferenceData} _data
	 * @return {void}
	 */
	protected onRemoveReferenceItem(
		value: ReferenceRecord,
		_data: ReferenceData
	) {
		let data: ReferenceData
			= _.cloneDeep( _data );

		_.pull(
			data.value,
			value.id
		);
		_.remove(
			data.selected,
			{ id: value.id }
		);

		if ( _.isStrictEmpty( data.value ) ) {
			data = null;
		}

		this.onDataChanged( data, true );
	}

	/**
	 * @param {ReferenceItem[]} items
	 * @return {void}
	 */
	private _itemsSelected(
		items: ReferenceRecord[]
	) {
		if ( _.isUndefined( items ) ) return;

		let data: ReferenceData;

		if ( items?.length ) {
			const _value: ULID[]
				= _.map( items, 'id' );

			data = {
				value: _value,
				selected: items,
			};
		} else {
			data = null;
		}

		this.onDataChanged( data, true );
	}

	/**
	 * @return {void}
	 */
	private _initDefaultValue() {
		if ( this.workspaceID ) {
			this._boardFormService
			.getListReferenceByView(
				this.field.id,
				this.formID,
				this.workspaceID
			)
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( res: ReferenceItemsByView ) => {
					this.recordItems = res.records as any;

					this._cdRef.detectChanges();
				},
			});

			return;
		}

		this._recordService
		.getListReferenceByView(
			this.field.reference.viewID
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( res: ReferenceItem[] ) => {
				this.recordItems = res;

				this._cdRef.detectChanges();
			},
		});
	}

}
