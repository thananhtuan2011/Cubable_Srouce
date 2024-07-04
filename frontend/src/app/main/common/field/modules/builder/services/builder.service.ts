import {
	ElementRef,
	inject,
	Injectable
} from '@angular/core';
import _ from 'lodash';

import {
	CUBPopupConfig,
	CUBPopupRef,
	CUBPopupService
} from '@cub/material/popup';

import {
	DataType,
	FieldList
} from '../../../interfaces';
import {
	Field,
	FormulaField,
	LookupField
} from '../../../objects';

import {
	AttachmentFieldBuilderComponent
} from '../components/attachment/builder.component';
import {
	CheckboxFieldBuilderComponent
} from '../components/checkbox/builder.component';
import {
	CreatedByFieldBuilderComponent
} from '../components/created-by/builder.component';
import {
	CreatedTimeFieldBuilderComponent
} from '../components/created-time/builder.component';
import {
	CurrencyFieldBuilderComponent
} from '../components/currency/builder.component';
import {
	DateFieldBuilderComponent
} from '../components/date/builder.component';
import {
	DropdownFieldBuilderComponent
} from '../components/dropdown/builder.component';
import {
	EmailFieldBuilderComponent
} from '../components/email/builder.component';
import {
	FormulaFieldBuilderComponent
} from '../components/formula/builder.component';
import {
	LastModifiedByFieldBuilderComponent
} from '../components/last-modified-by/builder.component';
import {
	LastModifiedTimeFieldBuilderComponent
} from '../components/last-modified-time/builder.component';
import {
	NumberFieldBuilderComponent
} from '../components/number/builder.component';
import {
	ParagraphFieldBuilderComponent
} from '../components/paragraph/builder.component';
import {
	PhoneFieldBuilderComponent
} from '../components/phone/builder.component';
import {
	ProgressFieldBuilderComponent
} from '../components/progress/builder.component';
import {
	RatingFieldBuilderComponent
} from '../components/rating/builder.component';
import {
	ReferenceFieldBuilderComponent
} from '../components/reference/builder.component';
import {
	TextFieldBuilderComponent
} from '../components/text/builder.component';
import {
	LinkFieldBuilderComponent
} from '../components/link/builder.component';
import {
	PeopleFieldBuilderComponent
} from '../components/people/builder.component';
import {
	LookupFieldBuilderComponent
} from '../components/lookup/builder.component';
import {
	FieldBuilder,
	FieldBuilderContext
} from '../components/builder';

const FIELD_BUILDER_COMPONENT_MAP: ReadonlyMap<
	DataType,
	FieldBuilder
> = new Map([
	[ DataType.Attachment, AttachmentFieldBuilderComponent as any ],
	[ DataType.Checkbox, CheckboxFieldBuilderComponent ],
	[ DataType.CreatedBy, CreatedByFieldBuilderComponent ],
	[ DataType.CreatedTime, CreatedTimeFieldBuilderComponent ],
	[ DataType.Currency, CurrencyFieldBuilderComponent ],
	[ DataType.Date, DateFieldBuilderComponent ],
	[ DataType.Dropdown, DropdownFieldBuilderComponent ],
	[ DataType.Email, EmailFieldBuilderComponent ],
	[ DataType.Formula, FormulaFieldBuilderComponent ],
	[ DataType.LastModifiedBy, LastModifiedByFieldBuilderComponent ],
	[ DataType.LastModifiedTime, LastModifiedTimeFieldBuilderComponent ],
	[ DataType.Link, LinkFieldBuilderComponent ],
	[ DataType.Lookup, LookupFieldBuilderComponent ],
	[ DataType.Number, NumberFieldBuilderComponent ],
	[ DataType.Paragraph, ParagraphFieldBuilderComponent ],
	[ DataType.People, PeopleFieldBuilderComponent ],
	[ DataType.Phone, PhoneFieldBuilderComponent ],
	[ DataType.Progress, ProgressFieldBuilderComponent ],
	[ DataType.Rating, RatingFieldBuilderComponent ],
	[ DataType.Reference, ReferenceFieldBuilderComponent ],
	[ DataType.Text, TextFieldBuilderComponent ],
]);

@Injectable({ providedIn: 'any' })
export class FieldBuilderService {

	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	/**
	 * @param {Field} field
	 * @param {ElementRef | HTMLElement} origin
	 * @param {FieldList=} otherFields
	 * @param {ObjectType=} context
	 * @param {Function=} onDone
	 * @param {Function=} onCancel
	 * @param {CUBPopupConfig=} config
	 * @return {CUBPopupRef}
	 */
	public build(
		field: Field,
		origin: ElementRef | HTMLElement,
		otherFields?: FieldList,
		context?: ObjectType,
		onDone?: ( field: Field ) => void,
		onCancel?: () => void,
		config?: CUBPopupConfig
	): CUBPopupRef {
		const builderComp: FieldBuilder
			= FIELD_BUILDER_COMPONENT_MAP
			.get( field.dataType );
		const builderContext: FieldBuilderContext
			= {
				field,
				otherFields,
				context,
				onDone,
				onCancel,
			};

		config = {
			...config,
			width: 400,
			maxHeight: 500,
			hasBackdrop: 'transparent',
		};

		if ( field.dataType
			=== LookupField.dataType ) {
			origin = null;

			config.width = null;
			config.maxHeight = 556;
			config.minWidth = 580;
			config.maxWidth = 'min-content';
			config.disableClose = true;
		}

		if ( field.dataType
				=== FormulaField.dataType ) {
			origin = null;

			config.width = null;
			config.maxHeight = null;
			config.minWidth = 500;
			config.maxWidth = 'min-content';
			config.disableClose = true;
		}

		return this._popupService.open(
			origin,
			builderComp,
			builderContext,
			config
		);
	}

}
