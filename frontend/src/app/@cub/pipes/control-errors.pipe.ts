import {
	inject,
	Pipe,
	PipeTransform
} from '@angular/core';
import {
	ValidationErrors
} from '@angular/forms';
import {
	TranslateService
} from '@ngx-translate/core';
import _ from 'lodash';

type ErrorType = {
	key: string;
	message: string;
};

const TRANSLATE_KEY_LOOKUP: ObjectType = {
	email: 'EMAIL',
	max	: 'MAX',
	maxlength: 'MAXLENGTH',
	min: 'MIN',
	minlength: 'MINLENGTH',
	pattern: 'PATTERN',
	phone: 'PHONE',
	required: 'REQUIRED',
	url: 'URL',

	disallowSimilarPassword: 'DISALLOW_SIMILAR_PASSWORD',
	duplicateName: 'DUPLICATE_NAME',
	matchPassword: 'MATCH_PASSWORD',
} as const;

@Pipe({
	name: 'cubControlErrors',
	standalone: true,
})
export class CUBControlErrorsPipe implements PipeTransform {

	private readonly _translateService: TranslateService
		= inject( TranslateService );

	/**
	 * Gets translated error messages
	 * with form control error keys
	 * @param errors
	 * @param field
	 * @param multiple
	 * @return A array of errors
	 */
	public transform(
		errors: ValidationErrors,
		field: string,
		multiple?: boolean
	): ErrorType[] {
		if ( !errors ) {
			return;
		}

		const errorKeys: string[]
			= _.keys( errors );

		if ( !errorKeys?.length ) {
			return;
		}

		return _.reduce(
			multiple
				? errorKeys
				: [ errorKeys[ 0 ] ],
			(
				memo: ErrorType[],
				key: string
			): ErrorType[] => {
				const errorKey: string
					= _.toUpper( TRANSLATE_KEY_LOOKUP[ key ] );

				if ( errorKey ) {
					const error: ObjectType
						= errors[ key ];
					const translateKey: string
						= `CUB.VALIDATION_MESSAGE.${errorKey}`;

					memo.push({
						key,
						message: this
						._translateService
						.instant(
							translateKey,
							{ ...error, field }
						),
					});
				}

				return memo;
			},
			[]
		);
	}

}
