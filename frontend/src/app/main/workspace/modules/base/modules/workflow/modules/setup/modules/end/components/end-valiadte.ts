import {
	WorkflowBlock
} from '../../../../../interfaces';

import {
	End
} from '../interfaces';

export const endValidation = (
	wfBlock: WorkflowBlock
): boolean => {
	if ( !( wfBlock as End )?.type ) return false;

	return true;
};
