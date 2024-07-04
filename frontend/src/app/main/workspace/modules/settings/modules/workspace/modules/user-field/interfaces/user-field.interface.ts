import { DataType } from '@main/common/field/interfaces';

export interface IUserField {
	isRequired: boolean;
	isDisabled: boolean;
	isHidden: boolean;
	isCoreField: boolean;
	order: number;
	id: string;
	name: string;
	dataType: DataType;
}

export interface IUserFieldUpdate {
	fields: IUserField[];
}
