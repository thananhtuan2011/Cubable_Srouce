import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	Input,
	OnInit,
	ViewChild,
	inject
} from '@angular/core';
import {
	FormControl,
	Validators
} from '@angular/forms';
import {
	ActivatedRoute,
	Router
} from '@angular/router';
import {
	finalize
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	DetectScrollDirective,
	EqualValidators,
	Unsubscriber,
	generateUniqueName,
	untilCmpDestroyed
} from '@core';

import {
	CUBSearchBoxComponent
} from '@cub/material/search-box';
import {
	CUBConfirmService
} from '@cub/material/confirm';
import {
	CUBToastService
} from '@cub/material/toast';
import {
	CUBPopupService
} from '@cub/material/popup';

import {
	IError
} from '@error/interfaces';

import {
	IBase
} from '@main/workspace/modules/base/interfaces';

import {
	PopupImportComponent
} from '../modules/import/components/popup-import.component';

import {
	BoardCreate,
	BoardDuplicate,
	IBoard
} from '../interfaces';
import {
	BoardService
} from '../services';

export interface IBoardExtra extends IBoard {
	focusing?: boolean;
}

@Unsubscriber()
@Component({
	selector		: 'board',
	templateUrl		: '../templates/board.pug',
	styleUrls		: [ '../styles/board.scss' ],
	host			: { class: 'board' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit {

	@ViewChild( CUBSearchBoxComponent )
	public searchBox: CUBSearchBoxComponent;
	@ViewChild( DetectScrollDirective )
	public scroller: DetectScrollDirective;
	@Input() public base: IBase;

	public readonly boardNameFormControl: FormControl = new FormControl(
		undefined,
		[
			Validators.required,
			Validators.maxLength( 255 ),
			EqualValidators.uniqueNameValidator(
				() => _.reject( this.boards, { name: this.boardName } ),
				false,
				'name'
			),
		]
	);

	public isDrawerOpen: boolean = true;
	public boardName: string;
	public boardID: string;
	public activeBoard: IBoard;
	public boards: IBoardExtra[];
	public filteredBoards: IBoardExtra[];

	private readonly _activatedRoute: ActivatedRoute
		= inject( ActivatedRoute );
	private readonly _router: Router
		= inject( Router );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _boardService: BoardService
		= inject( BoardService );
	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );
	private readonly _toastService: CUBToastService
		= inject( CUBToastService );
	private readonly _popupService: CUBPopupService
		= inject( CUBPopupService );

	ngOnInit() {
		this._boardService
		.get(
			this.base.id,
			true
		)
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( boards: IBoard[] ) => {
				if ( !boards?.length ) return;

				this.boards = boards;

				const boardID: ULID
					= this._activatedRoute.snapshot.queryParams.boardID;
				const activeBoard: IBoard
					= ( boardID
						? _.find( boards, { id: boardID } )
						: undefined )
						|| _.head( boards );

				this.changeBoard( activeBoard, !!boardID );

				this._cdRef.markForCheck();
			},
			error: ( err: IError ) => {
				if ( err.error.message !== 'no shared base/board(s)' ) return;

				this._toastService
				.info(
					'BASE.BOARD.MESSAGE.BASE_NOT_AVAILABLE',
					{
						translate: { name: this.base.name },
					}
				);

				this
				._router
				.navigate(
					[ '../..' ],
					{ relativeTo: this._activatedRoute }
				);
			},
		});
	}

	/**
	 * @return {void}
	 */
	public create() {
		const boardsBk: IBoard[] = _.cloneDeep( this.boards );

		this.boards ||= [];

		const createData: BoardCreate = {
			baseID	: this.base.id,
			name	: generateUniqueName( _.map( this.boards, 'name' ), 'Board' ),
		};

		this.boards = [ ...this.boards, createData as IBoard ];

		this._boardService
		.create( createData )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: IBoard ) => {
				_.assign( createData, result );

				this.changeBoard( result );
			},
			error: () => this.boards = boardsBk,
		});
	}

	/**
	 * @param {IBoard} board
	 * @return {void}
	 */
	public duplicate( board: IBoard ) {
		const boardsBk: IBoard[] = _.cloneDeep( this.boards );

		this.boards ||= [];

		let i: number = 0;

		do { i++; }
		while ( _.find( this.boards, { name: `${board.name} (Copy ${i})` } ) );

		const data: BoardDuplicate = { name	: `${board.name} (Copy ${i})` };

		this.boards = [ ...this.boards, data as IBoard ];

		this._boardService
		.duplicate( board.id, data, this.base.id )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: IBoard ) => {
				_.assign( data, result );

				this.changeBoard( result );
			},
			error: () => this.boards = boardsBk,
		});
	}

	/**
	 * @param {IBoard} board
	 * @return {void}
	 */
	public deleteBoard( board: IBoard ) {
		this._confirmService
		.open(
			'BASE.BOARD.MESSAGE.DELETE_BOARD_CONFIRM',
			'BASE.BOARD.LABEL.DELETE_BOARD',
			{
				warning			: true,
				buttonDiscard	: 'BASE.BOARD.LABEL.KEEP',
				translate		: { boardName: board.name },
				buttonApply: {
					text: 'BASE.BOARD.LABEL.DELETE',
					type: 'destructive',
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;
				const boardBk: IBoardExtra[] = _.cloneDeep( this.boards );
				const activeBoardIdBk: ULID = this.activeBoard?.id;

				this.boards
					= _.filter(
						this.boards,
						( _board: IBoardExtra ) => _board.id !== board.id
					);

				if ( this.activeBoard?.id === board.id ) {
					this.changeBoard( _.head( this.boards ) );
				}

				this._cdRef.markForCheck();

				this._boardService
				.delete( board.id, this.base.id )
				.pipe(
					finalize( () => this._cdRef.markForCheck() ),
					untilCmpDestroyed( this )
				)
				.subscribe({
					error: () => {
						this.boards = _.cloneDeep( boardBk );

						if ( activeBoardIdBk === board.id ) {
							this.changeBoard( board );
						}
					},
				});
			},
		});
	}

	/**
	 * @param {IBoard} board
	 * @param {boolean=} isCloseMenu
	 * @return {void}
	 */
	public updateBoardName( board: IBoardExtra, isCloseMenu?: boolean ) {
		if ( this.boardName === board.name
			|| this.boardNameFormControl.invalid
			|| isCloseMenu ) return;

		const boardNameBk: string = board.name;

		board.name = this.boardName;

		this._boardService
		.update( board.id, { name: this.boardName } )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: () => this._boardService.updateBoardName$.next( board ),
			error: () => board.name = boardNameBk,
		});
	}

	/**
	 * @param {IBoardExtra} board
	 * @return {void}
	 */
	public onBoardActionMenuClosed( board: IBoardExtra ) {
		board.focusing = false;

		this.updateBoardName( board, true );
	}

	/**
	 * @param {IBoard} board
	 * @param {boolean=} keepUrl
	 * @return {void}
	 */
	public changeBoard( board: IBoard, keepUrl?: boolean ) {
		if ( !board ) {
			this.activeBoard = this.boardID = null;
			this._router.navigate( [] );
			return;
		};

		if ( !board.id || this.activeBoard?.id === board.id ) return;

		this.activeBoard = this.boardID = null;

		this._cdRef.detectChanges();

		if ( !keepUrl ) {
			this._router.navigate(
				[],
				{ queryParams: { boardID: board.id } }
			);
		}

		this.activeBoard = board;
		this.boardID = board.id;

		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected openPopupImport() {
		this._popupService.open(
			null,
			PopupImportComponent,
			{
				boardID: this.boardID,
				boards: this.boards,
			},
			{
				hasBackdrop: 'transparent',
				position: 'start-below',
				offsetX: 0,
			}
		);
	}

}
