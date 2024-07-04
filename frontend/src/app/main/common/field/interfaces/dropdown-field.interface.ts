import {
	ULID
} from 'ulidx';

import {
	IField
} from './field.interface';

export type DropdownOptionValue
	= ULID;

export type DropdownData = {
	value: DropdownOptionValue[];
	selected?: DropdownOption[];
	newOptions?: DropdownOption[];
};

export type DropdownOption = {
	value: DropdownOptionValue;
	name?: string;
	color?: string;
	error?: boolean;
};

export type DropdownReference = {
	boardID: ULID;
	fieldID: ULID;
};

export interface IDropdownField
	extends IField<DropdownData> {
	options?: DropdownOption[];
	reference?: DropdownReference;
	isMultipleSelect?: boolean;
	allowAddSelections?: boolean;
}
