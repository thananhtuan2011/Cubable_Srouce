import {
	CountryCallingCode,
	CountryCode,
	getCountries
} from 'libphonenumber-js';
import metadata
	from 'libphonenumber-js/metadata.full.json';
import _ from 'lodash';

const regionNames: Intl.DisplayNames
	= new Intl.DisplayNames(
		[ 'en' ],
		{ type: 'region' }
	);

export type PhoneCountry = {
	name: string;
	code: CountryCode;
	dialCode: CountryCallingCode;
};

export const PHONE_COUNTRIES: PhoneCountry[]
	= _
	.chain(
		getCountries()
	)
	.without(
		'AC', 'AI', 'AS', 'AX',
		'BL', 'BM', 'BQ',
		'CC', 'CK', 'CX',
		'EH',
		'FK', 'FO',
		'GF', 'GG', 'GI', 'GL', 'GP', 'GU',
		'IM', 'IO',
		'JE',
		'KN', 'KY',
		'MF', 'MO', 'MP', 'MQ', 'MS',
		'NC', 'NF', 'NU',
		'PF', 'PM', 'PR',
		'RE',
		'SH', 'SJ',
		'TA', 'TC', 'TK', 'TW',
		'VG',
		'WF',
		'XK',
		'YT'
	)
	.map(
		(
			code: CountryCode
		): PhoneCountry => ({
			code,
			name: regionNames
			.of( code ),
			dialCode: metadata
			.countries[ code ][ 0 ],
		})
	)
	.value();
