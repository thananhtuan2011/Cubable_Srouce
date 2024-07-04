import { CONSTANT } from './constant';
import { PHONE_COUNTRIES } from './phone-countries';

export type ICountryCode = typeof PHONE_COUNTRIES[ number ][ 'code' ];
export type IDialogType = MapObjectValue<typeof CONSTANT.DIALOG_UNIQ_KEY>;
