import { ULID } from 'ulidx';

import { DataType } from '@main/common/field/interfaces';

import { FormView } from '../../view/modules/form-view/interfaces';
import { Filter } from '../../filter/interfaces';

import { BoardField } from '../../../interfaces';

export type BoardForm = Pick<
	FormView,
	'id'| 'name' | 'isPublic' | 'sharingStatus' | 'boardID'>
& {
	hasCoverImage?: boolean;
	hasRecaptcha?: boolean;
	hasAvatar?: boolean;
	title?: string;
	coverImage?: string;
	avatar?: string;
	description?: string;
	submitButtonName?: string;
	fields?: BoardFormField[];
	settings?: BoardFormSetting;
};

export type BoardFormField = {
	id: ULID;
	isRequired: boolean;
	descriptionField?: string;
	customFieldName?: string;
	question?: string;
	description?: string;
	dataType: DataType;
	hasConditions?: boolean;
	isErrorCondition?: boolean;
	filter?: Filter;
	params?: any;
};

export type BoardFormSetting = {
	hintSendOtherAnswer?: boolean;
	completeMessage?: string;
	invalidFormMessage?: string;
};

export type FormSubmit = {
	id?: ULID;
	cells?: Record<BoardField[ 'id' ], any>;
};
