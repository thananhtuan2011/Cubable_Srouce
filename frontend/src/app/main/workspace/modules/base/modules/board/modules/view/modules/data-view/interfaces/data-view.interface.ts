import { Filter } from '@main/workspace/modules/base/modules/board/modules/filter/interfaces';

import { View } from '../../../interfaces';

export type DataViewUpdate = Partial<Pick<
	DataView,
	'filter'
>>;

export type DataView = View & {
	filter: Filter;
};

export type DataViewDetail = DataView & {
	baseName: string;
	boardName: string;
	permissionOnView: boolean;
};
