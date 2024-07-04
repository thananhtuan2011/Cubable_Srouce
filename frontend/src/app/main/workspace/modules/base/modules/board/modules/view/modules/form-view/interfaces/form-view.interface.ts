import { BoardForm } from '@main/workspace/modules/base/modules/board/modules/form/interfaces';

import { View } from '../../../interfaces';

export type DataFormUpdate = Partial<Pick<
	BoardForm,
	'name'
	| 'hasCoverImage'
	| 'hasRecaptcha'
	| 'hasAvatar'
	| 'title'
	| 'coverImage'
	| 'avatar'
	| 'description'
	| 'submitButtonName'
	| 'fields'
	| 'settings'
>>;

export type FormView = View & {
	isPublic: boolean;
};

export type FormViewPublic = Pick<FormView, 'isPublic'> & {
	publicLink?: string;
};
