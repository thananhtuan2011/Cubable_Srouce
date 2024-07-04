import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	SimpleChanges,
	ViewChild,
	inject
} from '@angular/core';
import { ULID } from 'ulidx';
import _ from 'lodash';

import {
	CoerceArray,
	CoerceBoolean,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import { ViewComponent } from '../modules/view/components';
import {
	View,
	ViewActiveEmit
} from '../modules/view/interfaces';
import { ViewType } from '../modules/view/resources';
import { IBoard } from '../interfaces';
import { BoardService } from '../services';

import { IBoardExtra } from './board.component';

@Unsubscriber()
@Component({
	selector		: 'detail',
	templateUrl		: '../templates/detail.pug',
	styleUrls		: [ '../styles/detail.scss' ],
	host			: { class: 'detail' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class DetailComponent
implements OnChanges, OnInit {

	@ViewChild( 'viewComp' )
	protected viewComp: ViewComponent;

	@Input() @CoerceBoolean()
	public isDrawerOpen: boolean;
	@Input() @CoerceArray()
	public boards: IBoardExtra[];
	@Input() public boardID: ULID;
	@Input() public baseID: ULID;

	@Output() public boardChange: EventEmitter<IBoardExtra>
		= new EventEmitter<IBoardExtra>();

	protected readonly viewType: typeof ViewType = ViewType;

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _boardService: BoardService
		= inject( BoardService );

	protected isBorderRadiusAdd: boolean;
	protected notHasView: boolean;
	protected editingForm: boolean;
	protected allViewHidden: boolean;
	protected board: IBoard;
	protected activeView: View;
	protected formView: View;

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.boardID?.currentValue ) this._initData();
	}

	ngOnInit() {
		this._boardService.updateBoardName$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( board: IBoard ) => {
				this.board.name = board.name;

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {ViewActiveEmit} data
	 * @return {void}
	 */
	public onActiveViewChange( data: ViewActiveEmit<View> ) {
		this.formView = _.cloneDeep( data.view );

		if ( this.activeView?.id === data.view.id ) return;

		this.activeView = null;

		this._cdRef.detectChanges();

		this.activeView = data.view;

		this._cdRef.detectChanges();

		if ( data.view.type !== this.viewType.FORM ) return;

		this.editingForm = data.editingForm;
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		this._boardService
		.getDetail( this.boardID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( board: IBoard ) => {
				this.board = board;

				this._cdRef.markForCheck();
			},
		});
	}

}
