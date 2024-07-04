import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	inject,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	FormBuilder,
	FormControlStatus,
	FormGroup
} from '@angular/forms';
import {
	finalize
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	CUBDropdownComponent
} from '@cub/material/dropdown';
import {
	CUBMenuTriggerForDirective
} from '@cub/material/menu';

import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	RecordService
} from '@main/workspace/modules/base/modules/board/modules/record/services';

import {
	ReferenceField
} from '../../../../objects';
import {
	ListBoardReference,
	ListViewReference,
	ReferenceItem
} from '../../../../interfaces';

import {
	FieldBuilder
} from '../builder';

type ISearchData = {
	boards?: ListBoardReference[];
	views?: ListViewReference[];
};

@Unsubscriber()
@Component({
	selector: 'reference-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'reference-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferenceFieldBuilderComponent
	extends FieldBuilder<ReferenceField>
	implements OnInit {

	@ViewChild( 'boardDropdown' )
	protected boardDropdown: CUBDropdownComponent;
	@ViewChild( 'viewDropdown' )
	protected viewDropdown: CUBDropdownComponent;
	@ViewChild( CUBMenuTriggerForDirective )
	protected searchMenu: CUBMenuTriggerForDirective;

	protected isLoading: boolean;
	protected searchName: string;
	protected referenceForm: FormGroup;
	protected internalField: ReferenceField;
	protected searchData: ISearchData;
	protected listBoardreference: ListBoardReference[];
	protected views: ListViewReference[];
	protected recordItems: ReferenceItem[];

	private readonly _fb: FormBuilder
		= inject( FormBuilder );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _recordService: RecordService
		= inject( RecordService );

	private _bkSearchData: ISearchData;
	private _initDefaultValueOnce: ReturnType<typeof _.once>
		= _.once( () => this._initDefaultValue() );

	override ngOnInit() {
		super.ngOnInit();

		if ( this.internalField.initialData ) {
			this._initDefaultValue();
		}

		this.referenceForm = this._fb.group({
			board: undefined,
			view: undefined,
		});

		this._initData();

		this.canSubmit$.next(
			!_.isStrictEmpty( this.internalField.reference )
		);

		this.referenceForm.statusChanges
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( status: FormControlStatus ) => {
				this.canSubmit$.next( status === 'VALID' );
			},
		});

	}

	/**
	 * @param {string} data
	 * @return {void}
	 */
	protected search( data: string ) {
		this.searchName = data;

		if ( !data ) {
			this.searchMenu.close();

			this.searchData = _.cloneDeep( this._bkSearchData );

			this._cdRef.markForCheck();

			return;
		}

		if ( !_.isStrictEmpty( this.searchData ) ) {
			this.searchData.boards = _.filter(
				this._bkSearchData.boards,
				( board: ListBoardReference ) => _.search(
					board.name,
					this.searchName
				)
			);
			this.searchData.views = _.filter(
				this._bkSearchData.views,
				( view: ListViewReference ) => _.search(
					view.name,
					this.searchName
				)
			);
		}

		this.searchMenu.open();
		this._cdRef.markForCheck();
	}

	/**
	 * @return {void}
	 */
	protected openDropdownDefaultValue() {
		if ( !this.internalField.reference?.viewID ) return;

		this._initDefaultValueOnce();
	}

	/**
	 * @param {ULID | ULID[]} event
	 * @return {void}
	 */
	protected onInitialDataChanged( event: ULID | ULID[] ) {
		if ( _.isStrictEmpty( event ) ) {
			this.initialData = null;
		} else {
			this.initialData = {
				value: !_.isArray( event )
					? [ event ]
					: event,
			};
		}

		super.onInitialDataChanged( this.initialData );
	}

	/**
	 * @param {boolean} isMultipleSelect
	 * @return {void}
	 */
	protected onSelectionModeSwitched( isMultipleSelect: boolean ) {
		if ( isMultipleSelect ) return;

		this.initialData = this.initialData?.slice( 0, 1 );

		super.onInitialDataChanged( this.initialData );
	}

	/**
	 * @param {ULID=} boardID
	 * @param {ULID=} baseID
	 * @return {void}
	 */
	protected onReferenceBoardIDChanged(
		boardID?: ULID
	) {
		this.internalField.reference = {
			...this.internalField.reference,
			boardID,
		};
		this.internalField.reference.viewID = undefined;

		if ( !boardID ) return;

		if ( this.searchName ) {
			this.canSubmit$.next( false );

			this.searchName = null;

			this.searchMenu.close();
		}

		this._setViewArray();

		setTimeout(
			() => this.viewDropdown?.open(),
			10
		);
	}

	/**
	 * @param {ULID=} viewID
	 * @param {ULID=} boardID
	 * @return {void}
	 */
	protected onReferenceViewIDChanged(
		viewID?: ULID,
		boardID?: ULID
	) {
		this.internalField.reference = {
			...this.internalField.reference,
			viewID,
		};

		if ( !this.searchName ) return;

		this.searchName = null;

		if ( boardID ) {
			this.internalField.reference.boardID = boardID;

			this.canSubmit$.next( true );
		}

		this._setViewArray();

		this.searchMenu.close();
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		this.isLoading = true;

		this._boardFieldService
		.getListReference(
			this.popupContext.context.baseID
		)
		.pipe(
			finalize( () => {
				this.isLoading = false;

				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( res: ListBoardReference[] ) => {
				if (
					_.isStrictEmpty( res )
				) return;

				this.listBoardreference = res;
				this.searchData ||= {};

				this.searchData.boards = res;

				_.forEach(
					this.searchData.boards,
					( board: ListBoardReference ) => {
						let _views: ListViewReference[] = [];

						_views = _.map(
							board.views,
							( view: ListViewReference ) => {
								return {
									boardID: board.id,
									id: view.id,
									name: view.name,
								};
							}
						);

						this.searchData.views ||= [];
						this.searchData.views
							= [
								...this.searchData.views,
								..._views,
							];
					}
				);

				this._bkSearchData = _.cloneDeep( this.searchData );

				this._setViewArray();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _initDefaultValue() {
		if ( !this.internalField.reference ) return;

		this._recordService
		.getListReferenceByView(
			this.internalField.reference.viewID
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( res: ReferenceItem[] ) => {
				this.recordItems = res;

				this._cdRef.detectChanges();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _setViewArray() {
		const indexOfBoard: number
			= _.findIndex(
				this.listBoardreference,
				{ id: this.internalField.reference?.boardID }
			);

		this.views = this.listBoardreference[ indexOfBoard ]?.views;
	}

}
