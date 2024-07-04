import {
	ULID
} from 'ulidx';

import {
	CUBBasicEditorContent
} from '@cub/material';

import {
	RowAction
} from './action.interface';

export type NotifySetting = {
	boardID: ULID;
	row: RowAction;
	receivers: Receivers;
	subject: string;
	rawSubject: string;
	message: string;
	metadata: {
		subject?: CUBBasicEditorContent;
		message?: CUBBasicEditorContent;
	};
};

export type Receivers = {
	fieldIDs?: ULID[];
	userIDs?: ULID[];
	teamIDs?: ULID[];
	baseID?: ULID;
};

