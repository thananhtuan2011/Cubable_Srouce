import {
	Component,
	ChangeDetectionStrategy,
	Input,
	OnInit,
	inject
} from '@angular/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceBoolean,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	DataType,
	Field,
	FieldList
} from '@main/common/field/interfaces';
import {
	FormulaField,
	ReferenceField
} from '@main/common/field/objects';

import {
	RecordUpdate
} from '../../../interfaces';
import {
	RecordService
} from '../../../services';

@Unsubscriber()
@Component({
	selector: 'field-information',
	templateUrl: '../templates/field-information.pug',
	styleUrls: [ '../styles/field-information.scss' ],
	host: { class: 'field-information' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldInformationComponent
implements OnInit {

	@Input() @CoerceBoolean()
	public editable: boolean;
	@Input() public field: Field;
	@Input() public recordID: ULID;
	@Input() public boardID: ULID;
	@Input() public itemName: string;
	@Input() public cellValue: any;
	@Input() public otherFields: FieldList;
	@Input() public lookupContext: any;

	protected readonly DATA_TYPE: typeof DataType
		= DataType;

	protected metadata: ObjectType;

	private readonly _recordService: RecordService
		= inject( RecordService );

	ngOnInit() {
		this.metadata ||= {};

		switch ( this.field.dataType ) {
			case ReferenceField.dataType:
			case FormulaField.dataType:
				this.metadata.otherFields = this.otherFields;
				break;
		}
	}

	/**
	 * @param {any=} value
	 * @return {void}
	 */
	protected onCellDataEdited(
		value: any = this.cellValue
	) {
		this.cellValue = value;

		const updateData: RecordUpdate = {
			boardID: this.boardID,
			records: [
				{
					id: this.recordID,
					cells: {
						[ this.field.extra.id ]: value,
					},
				},
			],
		};

		this._recordService
		.bulkUpdate( updateData )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			complete: () => {
				if ( this.field.extra.isPrimary ) {
					this._recordService.itemName$.next( this.cellValue );
				}

				this._recordService
				.detailItemChange$
				.next({
					type: 'update',
					data: {
						recordID: this.lookupContext
							? this.lookupContext.id
							: this.recordID,
						fieldID: this.lookupContext
							? this.lookupContext.fieldID
							: this.field.extra.id,
						cellValue: this.cellValue,
						index: this.lookupContext?.index,
					},
				});
			},
		});
	}

}
