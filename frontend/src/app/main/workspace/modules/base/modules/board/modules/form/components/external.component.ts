import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	inject
} from '@angular/core';
import {
	ActivatedRoute
} from '@angular/router';
import {
	ULID
} from 'ulidx';
import {
	Observable
} from 'rxjs';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	BoardForm,
	FormSubmit
} from '../interfaces';
import {
	BoardFormService
} from '../services/form-public.service';

@Unsubscriber()
@Component({
	selector: 'external',
	templateUrl: '../templates/external.pug',
	styleUrls: [ '../styles/external.scss' ],
	host: { class: 'external' },
	providers: [ BoardFormService ],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalComponent
implements OnInit {

	protected isLoading: boolean;
	protected workspaceID: ULID;
	protected formID: ULID;
	protected formDetail: BoardForm;

	private readonly _boardFormService: BoardFormService
		= inject( BoardFormService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _activatedRoute: ActivatedRoute
		= inject( ActivatedRoute );

	ngOnInit() {
		this.workspaceID
			= this._activatedRoute.snapshot.paramMap.get( 'workspaceID' );
		this.formID
			= this._activatedRoute.snapshot.paramMap.get( 'formID' );

		this._initInternalFormView();
	}

	/**
	 * @param {ULID} workspaceID
	 * @param {FormSubmit} submitData
	 * @return {void}
	 */
	protected submit(
		workspaceID: ULID,
		submitData: FormSubmit
	): Observable<void> {
		return this._boardFormService
		.submit(
			workspaceID,
			submitData
		);
	}

	/**
	 * @return {void}
	 */
	private _initInternalFormView() {
		this._boardFormService
		.access( this.workspaceID, this.formID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( formDetail: BoardForm ) => {
				this.formDetail = formDetail;
				this.isLoading = true;

				this._cdRef.markForCheck();
			},
		});
	}

}
