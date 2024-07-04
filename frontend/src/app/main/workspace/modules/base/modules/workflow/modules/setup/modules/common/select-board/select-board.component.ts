import {
	ChangeDetectionStrategy,
	Component,
	ChangeDetectorRef,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	OnInit,
	inject
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';

import {
	BoardService
} from '@main/workspace/modules/base/modules/board/services';
import {
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';

@Unsubscriber()
@Component({
	selector: 'select-board',
	templateUrl: 'select-board.pug',
	host: { class: 'select-board' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectBoardComponent
implements OnInit {

	@ViewChild( 'boardPicker' )
	public boardPicker: CUBDropdownComponent;

	@Input() public boardID: ULID;
	@Input() public baseID: ULID;

	@Output() public boardIDChange: EventEmitter<ULID>
		= new EventEmitter<ULID>();

	public readonly boardIDControl: FormControl
		= new FormControl( undefined );

	protected boards: IBoard[];

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _boardService: BoardService
		= inject( BoardService );

	ngOnInit() {
		this._boardService
		.get( this.baseID )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( boards: IBoard[] ) => {
				this.boards = boards;

				this._cdRef.detectChanges();
			},
		});
	}

	/**
	 * @return {void}
	 */
	protected onBoardChange() {
		this.boardIDChange.emit( this.boardID );
	}

}
