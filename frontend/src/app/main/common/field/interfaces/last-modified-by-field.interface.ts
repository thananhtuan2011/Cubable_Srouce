import {
	IField
} from './field.interface';
import {
	PeopleData
} from './people-field.interface';

export type LastModifiedByData
	= PeopleData;

export interface ILastModifiedByField
	extends IField<LastModifiedByData> {
	targetFieldID: string;
}
