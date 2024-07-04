import moment from 'moment';

import {
	PHONE_COUNTRIES
} from '@resources';

export function getCountryByDialCode(
	phoneNumber: string
): string {
	if (typeof phoneNumber !== 'string' || !phoneNumber) return null;

	const foundItem: any
		= PHONE_COUNTRIES.find(
			(item: any) => typeof item.dialCode === 'string' && phoneNumber.startsWith(item.dialCode));

	return foundItem ? foundItem.code : null;
};

export function dateToJSDate(serial: number): string {
	const utcDays: number = Math.floor(serial - 25569);
	const utcValue: number = utcDays * 86400;
	const dateInfo: Date = new Date(utcValue * 1000);

	const fractionalDay: number = serial - Math.floor(serial) + 0.0000001;

	let totalSeconds: number = Math.floor(86400 * fractionalDay);

	const seconds: number = totalSeconds % 60;

	totalSeconds -= seconds;

	const hours: number = Math.floor(totalSeconds / (60 * 60));
	const minutes: number = Math.floor(totalSeconds / 60) % 60;
	const newDate: Date
		= new Date(
			dateInfo.getFullYear(),
			dateInfo.getMonth(),
			dateInfo.getDate(),
			hours,
			minutes,
			seconds
		);

	return moment(newDate).format('YYYY-MM-DD HH:mm');
}

