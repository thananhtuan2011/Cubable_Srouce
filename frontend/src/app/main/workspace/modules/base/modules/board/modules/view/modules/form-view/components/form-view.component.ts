import {
	Component,
	ChangeDetectionStrategy,
	ViewChild,
	inject
} from '@angular/core';
import _ from 'lodash';

import { BaseView } from '../../common/components';

import { FormView } from '../interfaces';
import { FormViewService } from '../services';

import { SharingFormDirective } from './sharing-form.directive';

@Component({
	selector		: 'form-view',
	templateUrl		: '../templates/form-view.pug',
	styleUrls		: [ '../../common/styles/common.scss' ],
	host			: { class: 'form-view' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class FormViewComponent
	extends BaseView<FormView> {

	@ViewChild( SharingFormDirective )
	public sharingForm: SharingFormDirective;

	private readonly _formViewService: FormViewService
		= inject( FormViewService );

	/**
	 * @return {void}
	 */
	protected editForm() {
		if ( this.activeView?.id === this.view.id ) {
			this._formViewService.editing$.next();
			return;
		}

		this.activeViewChange.emit({
			view: this.view,
			editingForm: true,
		});
	}

}
