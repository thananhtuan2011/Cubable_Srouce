import {
	ChangeDetectionStrategy,
	Component,
	inject,
	Input
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CUBPopupRef,
	CUBPopupService
} from '@cub/material';

import {
	ReferenceData,
	ReferenceItem,
	ReferenceItemID
} from '@main/common/field/interfaces';
import {
	ReferenceField
} from '@main/common/field/objects';

import {
	FieldCellEditable
} from '../field-cell-editable';

import {
	ReferenceExpanderComponent
} from './reference-expander.component';

@Component({
	selector: 'reference-field-cell-full',
	templateUrl: './cell-full.pug',
	styleUrls: [ '../field-cell.scss' ],
	host: {
		class: `
			reference-field-cell
			reference-field-cell-full
		`,
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceFieldCellFullComponent
	extends FieldCellEditable<ReferenceData> {

	@Input() public field: ReferenceField;

	protected expanderRef: CUBPopupRef;

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	/**
	 * @param {MouseEvent} event
	 * @return {void}
	 */
	protected override onTouch( event: MouseEvent ) {
		if (
			event instanceof KeyboardEvent
		) return;

		this.openExpander();
	}

	/**
	 * @param {ReferenceItem[]} items
	 * @return {void}
	 */
	protected addValue( items: ReferenceItem[] ) {
		if ( !items ) return;

		const _value: ULID[] = _.map( items, 'id' );

		if ( _.isEqual( this.data?.value, _value ) ) return;

		if ( !this.data?.value ) this.data = { value: [] };

		this.data = {
			value: _value,
			selected: items,
		};

		this.save(
			_.isStrictEmpty( this.data.value )
				? null
				: this.data
		);
	}

	/**
	 * @param {ReferenceItemID} item
	 * @return {void}
	 */
	protected onItemRemoved( item: ReferenceItemID ) {
		_.pull(
			this.data?.value,
			item
		);

		_.remove(
			this.data.selected,
			{ id: item }
		);

		this.save(
			_.isStrictEmpty( this.data.value )
				? null
				: this.data
		);
	}

	/**
	 * @param {boolean=} isExpand
	 * @return {void}
	 */
	protected openExpander( isExpand?: boolean ) {
		let _itemName: string;

		if ( this.context?.primaryColumn ) {
			_itemName
				= this.context.row.data?.[ this.context.primaryColumn.id ];
		}

		this._popupService.open(
			null,
			ReferenceExpanderComponent,
			{
				isExpand,
				fieldParams:
				{
					reference: this.field.reference,
					isMultipleSelect: this.field.isMultipleSelect,
				},
				readonly: this.readonly,
				itemName: _itemName,
				itemIDs: this.data?.value
					? this.data?.value
					: [],
				onItemSelected: this._onItemsSelected.bind( this ),
			},
			{
				hasBackdrop: 'transparent',
				disableClose: true,
			}
		);
	}

	/**
	 * @param {ReferenceItem[]} items
	 * @return {void}
	 */
	private _onItemsSelected( items: ReferenceItem[] ) {
		this.addValue( items );
	}

}
