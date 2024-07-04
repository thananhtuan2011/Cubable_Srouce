import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	inject
} from '@angular/core';
import {
	Observable
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	FormView
} from '../../view/modules/form-view/interfaces';
import {
	FormViewService
} from '../../view/modules/form-view/services';

import {
	FormMode
} from '../resources';
import {
	BoardForm,
	FormSubmit
} from '../interfaces';

@Unsubscriber()
@Component({
	selector		: 'internal',
	templateUrl		: '../templates/internal.pug',
	styleUrls		: [ '../styles/internal.scss' ],
	host			: { class: 'internal' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class InternalComponent
implements OnInit {

	@Input() public form: FormView;
	@Input() public boardID: ULID;

	@Output() public formBuilderChange: EventEmitter<void>
		= new EventEmitter<void>();

	protected internalMode: number = FormMode.INTERNAL;
	protected isFormDetailChange: boolean;
	protected formDetail: BoardForm;

	private readonly _formViewService: FormViewService
		= inject( FormViewService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	ngOnInit() {
		this._initInternalFormView();
	}

	/**
	 * @return {void}
	 */
	protected submit(
		submitData: FormSubmit
	): Observable<void> {
		return this._formViewService
		.submit( submitData );
	}

	/**
	 * @return {void}
	 */
	private _initInternalFormView() {
		this._formViewService
		.getDetail( this.form.id )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( formDetail: BoardForm ) => {
				this.formDetail = formDetail;

				if ( !formDetail.title ) {
					this.formDetail.title = this.form.name;
				}

				this._cdRef.markForCheck();
			},
		});
	}

}
