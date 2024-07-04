import _ from 'lodash';

import {
	FieldInputFactoryDirective
} from '@main/common/field/modules/input/components';
import {
	FieldInputEditable
} from '@main/common/field/modules/input/components/input-editable';
import {
	FieldValidationErrors
} from '@main/common/field/objects';
import {
	FieldHelper
} from '@main/common/field/helpers';

import {
	 ChangeValueSetting,
	 CreateRowSetting,
	 FieldValueSetting
} from '../../interfaces';
import {
	ValueType
} from '../../resources';

import {
	SetRowContentComponent
} from './set-row-content.component';

export const setRowContentValidate = (
	settings: CreateRowSetting | ChangeValueSetting,
	showInvalidState?: boolean,
	comp?: SetRowContentComponent
): boolean => {
	let isValid: boolean = true;

	if ( !settings?.fields?.length ) {
		isValid = false;
	} else {
		if ( comp ) {
			_.forEach(
				comp?.fieldInput.toArray(),
				( input: FieldInputFactoryDirective ) => {
					isValid = !(
						input
						.componentRef
						.instance as FieldInputEditable
					)
					.validate(
						undefined,
						false,
						showInvalidState
					) && isValid;
				}
			);
		} else {
			const fieldHelper: FieldHelper
				= new FieldHelper();

			_.forEach(
				settings?.fields,
				( f: FieldValueSetting ) => {
					if (
						_.isStrictEmpty( f.value )
					) {
						isValid = false;
						return false;
					}

					let errors: FieldValidationErrors;

					// Default no dynamic value
					if ( !( f.value as any ) ?.valueType ) {
						errors
							= fieldHelper
							.createField( f.field )
							.validate( f.value );

					// Has dynamic value
					} else {

						switch( ( f.value as any )?.valueType ) {
							case ValueType.DYNAMIC:
								errors
									= _.isStrictEmpty(
										( f.value as any )?.data
									)
										? { required: true }
										: null;

								break;
							case ValueType.EMPTY:
								errors
									= null;

								break;
							default:
								errors
									= fieldHelper
									.createField( f.field )
									.validate( ( f.value as any )?.data );
						}

					}

					if ( !errors ) return;

					isValid = false;

					return false;
				}
			);
		}
	}

	if ( comp ) {
		comp.showInvalidState = showInvalidState;

		comp.cdRef.markForCheck();
	}

	return isValid;
};
