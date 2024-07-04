import {
	WorkflowBlock
} from '../../../../../interfaces';

import {
	DelaySetting
} from '../interfaces';

export const delayValidation = (
	wfBlock: WorkflowBlock
): boolean => {
	if ( !( wfBlock.settings as DelaySetting )?.quantity ) return false;

	return true;
};
