import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnChanges,
	OnInit,
	SimpleChanges,
	inject
} from '@angular/core';
import {
	filter
} from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import { IBoard } from '../../../interfaces';

import {
	FormView
} from '../../view/modules/form-view/interfaces';
import {
	FormViewService
} from '../../view/modules/form-view/services';

@Unsubscriber()
@Component({
	selector		: 'board-form',
	templateUrl		: '../templates/form.pug',
	styleUrls		: [ '../styles/form.scss' ],
	host			: { class: 'board-form' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class BoardFormComponent
implements OnChanges, OnInit {

	@Input() public editing: boolean;
	@Input() public form: FormView;
	@Input() public board: IBoard;

	protected isFormBuilder: boolean;

	private readonly _formViewService: FormViewService
		= inject( FormViewService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.editing ) {
			this.isFormBuilder
				= this.editing || false;
		}
	}

	ngOnInit() {
		this._formViewService.editing$
		.pipe(
			filter( () => !this.isFormBuilder ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => {
				this.isFormBuilder = true;

				this._cdRef.markForCheck();
			},
		});
	}

}
