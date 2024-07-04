import {
	Observable
} from 'rxjs';
import {
	ULID
} from 'ulidx';

export enum DataType {
	Text = 1,
	Checkbox = 2,
	Paragraph = 3,
	Attachment = 4,
	Dropdown = 5,
	Number = 6,
	Date = 7,
	Phone = 8,
	Link = 9,
	Email = 10,
	Currency = 11,
	People = 12,
	Rating = 13,
	Progress = 14,
	Reference = 15,
	Formula = 16,
	Lookup = 18,
	LastModifiedBy = 19,
	LastModifiedTime = 20,
	CreatedBy = 21,
	CreatedTime = 22,
};

export interface IField<T = any> {
	name: string;
	dataType: DataType;

	data?: T;

	description?: string;
	isRequired?: boolean;
	initialData?: T;

	extra?: FieldExtra<T>;
}

export interface IFieldExtra<T = any>
	extends IField<T> {
	id?: ULID;
	isPrimary?: boolean;
	isInvalid?: boolean;
	params?: ObjectType;

	width?: number; // Temp
	order?: number; // Temp
}

export type Field<T = any>
	= IField<T>;
export type FieldExtra<T = any>
	= IFieldExtra<T>;
export type FieldList
	= Field[] | Observable<Field[]>;

export interface IFieldData<T = any> { // Temp
	value: T;
	params?: any;
	fieldID?: ULID;
}
