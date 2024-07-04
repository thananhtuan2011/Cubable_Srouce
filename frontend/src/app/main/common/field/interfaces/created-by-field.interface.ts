import {
	IField
} from './field.interface';

import {
	PeopleData
} from './people-field.interface';

export type CreatedByData
	= PeopleData;

export interface ICreatedByField
	extends IField<CreatedByData> {}
