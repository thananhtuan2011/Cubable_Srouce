import {
	CUBCountryCode
} from '@cub/material/phone-field';

import {
	IField
} from './field.interface';

export type PhoneData = {
	phone: string;
	countryCode?: CUBCountryCode;
};

export interface IPhoneField
	extends IField<PhoneData> {
	countryCode: CUBCountryCode;
}
