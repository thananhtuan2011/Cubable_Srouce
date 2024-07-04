import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ViewChild,
	inject
} from '@angular/core';
import { ULID } from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	IBoard,
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	View,
	ViewLayout
} from '../../view/interfaces';
import { ViewLayoutService } from '../../view/services';

import { DisplayType } from '../resources';
import { ContextData } from '../interfaces';

import { RecordBase } from './record-base';

@Unsubscriber()
@Component({
	selector		: 'record',
	templateUrl		: '../templates/record.pug',
	styleUrls		: [ '../styles/record.scss' ],
	host			: { class: 'record' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class RecordComponent implements AfterViewInit, OnChanges {

	@ViewChild( 'recordDisplay' ) public recordDisplay: RecordBase;

	@Input() public baseID: ULID;
	@Input() public board: IBoard;
	@Input() public view: View;

	public readonly DISPLAY_TYPE: typeof DisplayType = DisplayType;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _viewLayoutService: ViewLayoutService
		= inject( ViewLayoutService );

	public viewLayout: ViewLayout;
	public displayBy: DisplayType = DisplayType.SPREADSHEET;
	public context: ContextData;
	public fields: BoardField[];

	/**
	 * @constructor
	 * @param {SimpleChanges} changes
	 */
	ngOnChanges( changes: SimpleChanges ) {
		if ( _.isStrictEmpty( changes ) ) return;

		if ( changes.baseID?.currentValue ) {
			this.context = _.assign(
				this.context,
				{ baseID: changes.baseID.currentValue }
			);
		}

		if ( changes.board?.currentValue ) {
			this.context = _.assign(
				this.context,
				{
					boardID: changes.board.currentValue.id,
					boardName: changes.board.currentValue.name,
				}
			);
		}

		if ( changes.view?.currentValue ) {
			this.viewLayout = null;
			this.context = _.assign(
				this.context,
				{ viewID: changes.view.currentValue.id }
			);

			this._viewLayoutService
			.getPersonalLayout( this.view.id )
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( layout: ViewLayout ) => {
					this.viewLayout = _.defaultsDeep(
						_.cloneDeep( this._viewLayoutService.defaultLayout ),
						layout
					);

					this._cdRef.markForCheck();
				},
			});
		}
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this._cdRef.markForCheck();
	}

}
