import {
	ChangeDetectionStrategy,
	Component,
	TemplateRef,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

import {
	CUBButtonType
} from '../button';

import type {
	CUBConfirmRef
} from './confirm.service';

export type CUBConfirmButton = {
	text?: string;
	type?: CUBButtonType;
};

export type CUBConfirmConfig = {
	buttonApply?: string | CUBConfirmButton;
	buttonDiscard?: string | CUBConfirmButton;
	warning?: boolean | string;
	translate?: boolean | ObjectType;
};

@Component({
	selector: 'cub-confirm',
	templateUrl: './confirm.pug',
	styleUrls: [ './confirm.scss' ],
	host: { class: 'cub-confirm' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBConfirmComponent {

	public title: string;
	public message: string | TemplateRef<any>;
	public ref: CUBConfirmRef;

	get config(): CUBConfirmConfig {
		return this.ref.config;
	}

	get isMessageTemplate(): boolean {
		return this.message
			instanceof TemplateRef;
	}

	get warningMessage(): string {
		const { warning }: CUBConfirmConfig
			= this.config;

		return _.isString( warning )
			? warning
			: undefined;
	}

	get buttonApplyText(): string {
		const { buttonApply }: CUBConfirmConfig
			= this.config;

		if ( !buttonApply ) {
			return;
		}

		return _.isString( buttonApply )
			? buttonApply
			: buttonApply.text;
	}

	get buttonApplyType(): CUBButtonType {
		const { buttonApply }: CUBConfirmConfig
			= this.config;

		if ( !buttonApply
			|| _.isString( buttonApply ) ) {
			return this.config.warning
				? 'destructive'
				: 'primary';
		}

		return buttonApply.type;
	}

	get buttonDiscardText(): string {
		const { buttonDiscard }: CUBConfirmConfig
			= this.config;

		if ( !buttonDiscard ) {
			return;
		}

		return _.isString( buttonDiscard )
			? buttonDiscard
			: buttonDiscard.text;
	}

	get buttonDiscardType(): CUBButtonType {
		const { buttonDiscard }: CUBConfirmConfig
			= this.config;

		if ( !buttonDiscard
			|| _.isString( buttonDiscard ) ) {
			return 'secondary';
		}

		return buttonDiscard.type;
	}

}
