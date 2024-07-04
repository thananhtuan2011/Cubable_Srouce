import {
	Component,
	ChangeDetectionStrategy,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	FormControl,
	FormControlStatus
} from '@angular/forms';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';
import _ from 'lodash';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';

import {
	DataType,
	Field,
	FieldList
} from '@main/common/field/interfaces';

import {
	LastModifiedByField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';


@Unsubscriber()
@Component({
	selector: 'last-modified-by-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'last-modified-by-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LastModifiedByFieldBuilderComponent
	extends FieldBuilder<LastModifiedByField>
	implements OnInit {

	@ViewChild( 'fieldDropdown' )
	protected readonly fieldDropdown: CUBDropdownComponent;

	protected readonly checkFieldFormControl: FormControl
		= new FormControl( undefined );

	protected internalField: LastModifiedByField;
	protected isTargetAllFields: boolean;

	override ngOnInit() {
		super.ngOnInit();

		const otherFields: FieldList
			= _.filter(
				this.otherFields,
				( fields: Field ) =>
					!_.includes( [
						DataType.Lookup,
						DataType.LastModifiedBy,
						DataType.LastModifiedTime,
						DataType.CreatedTime,
						DataType.CreatedBy,
					],
					fields.dataType )
			) as any;

		this.otherFields = otherFields;

		this.isTargetAllFields
			= !this.internalField.targetFieldID;

		this.checkFieldFormControl
		.statusChanges
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(( status: FormControlStatus ) => {
			this.canSubmit$.next(
				status === 'VALID'
			);
		});
	}

	/**
	 * @return {void}
	 */
	protected onTargetFieldChanged() {
		if ( this.isTargetAllFields ) {
			this.canSubmit$.next( true );

			return;
		}

		setTimeout(() => {
			this.fieldDropdown.open();
		});
	}

	/**
	 * @return {void}
	 */
	protected override done() {
		if ( this.isTargetAllFields ) {
			this.internalField.targetFieldID
				= null;
		}

		super.done();
	}

}
