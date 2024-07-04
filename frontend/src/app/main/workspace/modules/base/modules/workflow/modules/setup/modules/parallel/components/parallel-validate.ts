import {
	WorkflowBlock
} from '../../../../../interfaces';
import {
	singleConditionalValidate
} from '../../common/conditional';
import {
	AnyBranchSetting,
	Parallel,
	ParallelType
} from '../interfaces';
import {
	AnyBranchComponent
} from './any-branch.component';
import {
	ParallelBase
} from './parallel-base';

export const parallelValidation = (
	wfBlock: WorkflowBlock,
	showInvalidState?: boolean,
	comp?: ParallelBase
): boolean => {
	if ( !wfBlock ) return false;

	if (
		!( wfBlock as Parallel ).settings.type
	) {
		return false;
	}

	switch (
		( wfBlock as Parallel ).settings.type
	) {
		case ParallelType.ALL:
			return true;
		case ParallelType.ANY:
			return anyBranch(
				wfBlock.settings as AnyBranchSetting,
				showInvalidState,
				comp as AnyBranchComponent
			);
	}
};

const anyBranch = (
	settings: AnyBranchSetting,
	showInvalidState?: boolean,
	comp?: AnyBranchComponent
): boolean => {
	if (
		!( comp instanceof AnyBranchComponent )
	) {
		comp = undefined;
	}

	let isValid: boolean = true;

	if (
		settings?.filter
	) {
		isValid = singleConditionalValidate(
			settings.filter.options,
			showInvalidState,
			comp?.parallelConditions
		) && isValid;
	}

	return isValid;
};
