import { OnInit, Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { Observable, isObservable } from 'rxjs';
import _ from 'lodash';

import { Unsubscriber, untilCmpDestroyed } from '@core';

import { WGCIDialogRef, WGC_DIALOG_DATA, WGC_DIALOG_REF } from '../../wgc-dialog';

import { WGCIComment } from '../interfaces';

@Unsubscriber()
@Component({
	selector		: 'wgc-dialog-comment-history',
	templateUrl		: './wgc-dialog-comment-history.pug',
	styleUrls		: [ './wgc-dialog-comment-history.scss' ],
	host			: { class: 'wgc-dialog-comment-history' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})

export class WGCDialogCommentHistoryComponent implements OnInit {

	public commentsHistory: WGCIComment[];

	/**
	 * @constructor
	 * @param {ObjectType} data
	 * @param {WGCIDialogRef} dialogRef
	 */
	constructor(
		@Inject( WGC_DIALOG_DATA ) public data: {
			historyComments: Observable<WGCIComment[]> | WGCIComment[];
			limitContentHeight: string;
		},
		@Inject( WGC_DIALOG_REF ) public dialogRef: WGCIDialogRef
	) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._initDialog( this.data?.historyComments );
	}

	/**
	 * @param {Observable<WGCIComment[]> | WGCIComment[] } historySource
	 * @return {void}
	 */
	private _initDialog( historySource: Observable<WGCIComment[]> | WGCIComment[] ) {
		if ( isObservable( historySource ) ) {
			historySource
			.pipe( untilCmpDestroyed( this ) )
			.subscribe( ( comments: WGCIComment[] ) => this.commentsHistory = comments );
		}
	}

}
