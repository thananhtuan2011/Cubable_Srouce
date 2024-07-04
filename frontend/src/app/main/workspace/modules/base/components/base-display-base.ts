import {
	Directive,
	Input,
	Output,
	EventEmitter,
	ElementRef,
	OnInit,
	Renderer2,
	ChangeDetectorRef,
	inject
} from '@angular/core';
import {
	FormControl,
	Validators
} from '@angular/forms';
import {
	finalize
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CoerceArray,
	EqualValidators,
	untilCmpDestroyed
} from '@core';
import {
	CUBConfirmService
} from '@cub/material/confirm';

import {
	IUser,
	IUserRole
} from '../../settings/modules/workspace/modules/user-system/modules/user/interfaces';

import {
	IBase,
	IBaseCategory
} from '../interfaces';
import {
	CONSTANT,
	DisplayType
} from '../resources';
import {
	BaseService,
	BaseCategoryService
} from '../services';
import {
	UserService
} from '../../settings/modules/workspace/modules/user-system/modules/user/services';

interface IBaseCategoryExtra extends IBaseCategory {
	focusing?: boolean;
}

interface IBaseExtra extends IBase {
	focusing?: boolean;
	selected?: boolean;
}

@Directive()
export class BaseDisplayBase
implements OnInit {

	@Input() public userRole: IUserRole;
	@Input() public category: IBaseCategory;
	@Input() public baseMap: Record<IBase[ 'id' ], IBase[]>;
	@Input() public displayBy: DisplayType;
	@Input() @CoerceArray()
	public bases: IBaseExtra[];
	@Input() @CoerceArray()
	public categories: IBaseCategoryExtra[];

	@Output() public baseMapChange: EventEmitter<Record<IBase[ 'id' ], IBase[]>>
		= new EventEmitter<Record<IBase[ 'id' ], IBase[]>>();
	@Output() public categoriesChange: EventEmitter<IBaseCategory[]>
		= new EventEmitter<IBaseCategory[]>();
	@Output() public basesChange: EventEmitter<IBase[]>
		= new EventEmitter<IBase[]>();
	@Output() public categoryChange: EventEmitter<IBaseCategory>
		= new EventEmitter<IBaseCategory>();
	@Output() public createBase: EventEmitter<void>
		= new EventEmitter<void>();

	protected readonly DETAIL_PATH: typeof CONSTANT.PATH.DETAIL
		= CONSTANT.PATH.DETAIL;
	protected readonly categoryNameFormControl: FormControl
		= new FormControl(
			undefined,
			[
				Validators.required,
				Validators.maxLength( 255 ),
				EqualValidators.uniqueNameValidator(
					() => _.reject(
						this.categories,
						{ name: this.newCategoryName }
					),
					false,
					'name'
				),
			]
		);
	protected readonly baseNameFormControl: FormControl
		= new FormControl(
			undefined,
			[ Validators.required, Validators.maxLength( 255 ) ]
		);

	protected isCreatingFolder: boolean;
	protected newBaseName: string;
	protected newCategoryName: string;
	protected newCategory: IBaseCategory = {} as IBaseCategory;
	protected uncategorized: IBaseCategory;
	protected selectedBases: IBaseExtra[];

	// actions
	public multipleActions: {
		canDelete: boolean;
		canSetFavorite: boolean;
		canSetUnFavorite: boolean;
	} = {
			canDelete		: true,
			canSetFavorite	: true,
			canSetUnFavorite: true,
		};

	private readonly _userService: UserService
		= inject( UserService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _elementRef: ElementRef
		= inject( ElementRef );
	private readonly _renderer: Renderer2
		= inject( Renderer2 );
	private readonly _baseService: BaseService
		= inject( BaseService );
	private readonly _baseCategoryService: BaseCategoryService
		= inject( BaseCategoryService );
	private readonly _cubConfirmService: CUBConfirmService
		= inject( CUBConfirmService );

	private _users: IUser[];

	ngOnInit() {
		this._userService
		.getAvailableUser()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( users: IUser[] ) => this._users = users,
		});

		setTimeout(
			() => {
				this.uncategorized
					= {
						id: null,
						name: 'BASE.LABEL.UNCATEGORIZED',
					} as IBaseCategory;
			}, 500
		);
	}

	/**
	 * @return {void}
	 */
	public deselectAllItems() {
		_.forEach(
			this.selectedBases,
			( base: IBaseExtra ) => { base.selected = false; }
		);

		this.selectedBases = [];
		this.multipleActions = _.mapValues(
			this.multipleActions, () => true
		);
	}

	/**
	 * @param {MouseEvent} event
	 * @return {void}
	 */
	public handleCardHover(
		event: MouseEvent
	) {
		const divElement: ElementRef =
			this._elementRef.nativeElement.querySelector( '#spinElement' );

		switch( event?.type ) {
			case 'mouseenter':
				switch ( this.displayBy ) {
					case DisplayType.GRID:
						this._spinIn( divElement );
						break;
					case DisplayType.TABLE:
						this._spinOut( divElement );
						break;
				}
				break;
			case 'mouseleave':
				switch ( this.displayBy ) {
					case DisplayType.GRID:
						this._spinOut( divElement );
						break;
					case DisplayType.TABLE:
						this._spinIn( divElement );
						break;
				}
				break;
		};
	}

	/**
	 * @param {boolean} isFavorite
	 * @param {IBaseExtra=} base
	 * @return {void}
	 */
	public setFavorite(
		isFavorite: boolean,
		base?: IBaseExtra
	) {
		const baseBk: IBaseExtra = _.cloneDeep( base );
		const selectedBasesBk: IBaseExtra[]
			=_.cloneDeep( this.selectedBases );

		if ( base ) {
			base.isFavorite = !base.isFavorite;

			_.find( this.bases, { id: base.id } ).isFavorite = base.isFavorite;
		} else if ( this.selectedBases?.length ) {
			this.selectedBases
				= _.map(
					this.selectedBases,
					( _base: IBaseExtra ) => {
						return {
							..._base,
							isFavorite: !_base.isFavorite,
						};
					}
				);

			const selectedBasesLk: Record<IBase[ 'id' ], IBaseExtra>
				= _.keyBy( this.selectedBases, 'id' );

			_.forEach( this.bases, ( _base: IBaseExtra ) => {
				if ( selectedBasesLk[ _base.id ] ) {
					_base.isFavorite = !_base.isFavorite;
				}
			} );
		}

		this.bases = [ ...this.bases ];
		this.baseMap = _.groupBy( this.bases, 'categoryID' );

		this._baseService
		.bulkUpdatePersonal(
			base
				? [ base.id ]
				: _.map( this.selectedBases, 'id' ), { isFavorite }
		)
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( _bases: IBase[] ) => {
				this.baseMapChange.emit( this.baseMap );
				this.basesChange.emit( this.bases );

				if ( base ) {
					_.assign( base, _.find( _bases, { id: base.id } ) );
					return;
				}

				const selectedBases: IBaseExtra[] = [];
				const selectedBasesLk: Record<IBase[ 'id' ], IBaseExtra>
					= _.keyBy( this.selectedBases, 'id' );

				_.forEach( this.bases, ( _base: IBaseExtra ) => {
					if ( !selectedBasesLk[ _base.id ] ) return;

					_.assign( _base, _.find( _bases, { id: _base.id } ) );

					selectedBases.push( _base );
				} );

				this.selectedBases = selectedBases;
				this.multipleActions
					= _.mapValues( this.multipleActions, () => true );

				_.forEach(
					this.selectedBases,
					( _base: IBaseExtra ) => {
						this._checkMultipleActionAvailable( _base );
					}
				);
			},
			error: () => {
				if ( baseBk ) base.isFavorite = baseBk.isFavorite;
				if ( selectedBasesBk ) {
					const selectedBasesLk: Record<IBase[ 'id' ], IBaseExtra>
						= _.keyBy( this.selectedBases, 'id' );
					const selectedBases: IBaseExtra[] = [];

					_.forEach( this.bases, ( _base: IBaseExtra ) => {
						if ( !selectedBasesLk[ _base.id ] ) return;

						_base.isFavorite = !_base.isFavorite;

						selectedBases.push( _base );
					} );

					this.selectedBases = selectedBases;
					this.multipleActions
						= _.mapValues( this.multipleActions, () => true );

					_.forEach(
						this.selectedBases,
						( _base: IBaseExtra ) => {
							this._checkMultipleActionAvailable( _base );
						}
					);

					this.baseMap = _.groupBy( this.bases, 'categoryID' );
				}
			},
		});
	}

	/**
	 * @param {IBase=} base
	 * @return {void}
	 */
	public removeBase(
		base?: IBase
	) {
		this._cubConfirmService
		.open(
			base ? 'BASE.MESSAGE.WILL_LOST' : 'BASE.MESSAGE.MULTI_BASE_LOSS',
			'BASE.MESSAGE.DELETE_BASE',
			{
				warning: true,
				buttonApply: {
					text: 'BASE.LABEL.DELETE',
					type: 'destructive',
				},
				buttonDiscard: 'BASE.LABEL.CANCEL',
				translate: {
					name: base?.name,
					count: this.selectedBases.length,
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				const ids: ULID[]
					= base ? [ base.id ] : _.map( this.selectedBases, 'id' );
				const basesBk: IBaseExtra[]
					= _.cloneDeep( this.bases );

				if ( base ) {
					this.bases = _.filter(
						this.bases,
						( _base: IBase ) => _base.id !== base.id
					);
				} else if (
					this.selectedBases?.length
				) {
					this.bases = _.filter(
						this.bases,
						( _base: IBase ) =>
							!_.includes(
								_.map( this.selectedBases, 'id' ),
								_base.id
							)
					);

					this.deselectAllItems();
				}

				this.baseMap = _.groupBy( this.bases, 'categoryID' );

				this._baseService
				.delete( ids )
				.pipe(
					finalize( () => this._cdRef.markForCheck() ),
					untilCmpDestroyed( this )
				)
				.subscribe({
					next: () => {
						this.basesChange.emit( this.bases );
						this.baseMapChange.emit( this.baseMap );
					},
					error: () => {
						if ( !basesBk ) return;

						_.forEach(
							basesBk,
							( baseBk: IBaseExtra ) => baseBk.selected = false
						);

						this.bases = _.cloneDeep( basesBk );
						this.baseMap = _.groupBy( this.bases, 'categoryID' );
					},
				});
			},
		});
	}

	/**
	 * @param {boolean} event
	 * @param {IBaseExtra} base
	 * @return {void}
	 */
	public selectBase(
		event: boolean,
		base: IBaseExtra
	) {
		if ( event ) {
			this.selectedBases ||= [];

			this.selectedBases.push( base );
			this._checkMultipleActionAvailable( base );
			return;
		}

		_.remove( this.selectedBases, base );

		this.multipleActions
			= _.mapValues( this.multipleActions, () => true );

		_.forEach(
			this.selectedBases,
			( _base: IBaseExtra ) => {
				this._checkMultipleActionAvailable( _base );
			}
		);
	}

	/**
	 * @param {IBaseExtra} base
	 * @return {void}
	 */
	public renameBase(
		base: IBaseExtra
	) {
		if ( this.baseNameFormControl.invalid ) return;

		if (
			!this.newBaseName
			|| base.name === this.newBaseName
		) {
			this.newBaseName = '';
			return;
		};

		const baseBk: IBaseExtra = _.cloneDeep( base );

		base.name = this.newBaseName;

		this._baseService
		.update( base.id, { name: base.name } )
		.pipe(
			finalize( () => {
				this.newBaseName = '';

				this.basesChange.emit( this.bases );
				this.baseMapChange.emit( this.baseMap );
				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( _base: IBase ) => _.assign( base, _base ),
			error: () => base.name = baseBk.name,
		});
	}

	/**
	 * @param {IBaseCategoryExtra} category
	 * @param {IBaseExtra=} base
	 * @return {void}
	 */
	public moveToCategory(
		category: IBaseCategoryExtra,
		base?: IBaseExtra
	) {
		const ids: ULID[]
			= base
				? [ base.id ]
				: _.map( this.selectedBases, 'id' );
		const baseBk: IBaseExtra
			= _.cloneDeep( base );
		const basesBk: IBaseExtra[]
			= _.cloneDeep( this.bases );

		if ( base ) {
			base.focusing = false;
			base.categoryID = category.id;
		} else if ( this.selectedBases?.length ) {
			const selectedBasesLk: Record<IBase[ 'id' ], IBaseExtra>
				= _.keyBy( this.selectedBases, 'id' );

			_.forEach( this.bases, ( _base: IBaseExtra ) => {
				if ( selectedBasesLk[ _base.id ] ) {
					_base.categoryID = category.id;
				}
			} );

			this.deselectAllItems();
		}

		this.baseMap = _.groupBy( this.bases, 'categoryID' );

		this._baseService
		.bulkUpdatePersonal( ids, { categoryID: category.id } )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( _bases: IBase[] ) => {
				this.basesChange.emit( this.bases );
				this.baseMapChange.emit( this.baseMap );

				if ( base ) _.assign( base, _.find( _bases, { id: base.id } ) );

				_.forEach( this.bases, ( _base: IBaseExtra ) => {
					if ( !_.includes( ids, _base.id ) ) return;

					_.assign( _base, _.find( _bases, { id: _base.id } ) );
				} );

				this.baseMap = _.groupBy( this.bases, 'categoryID' );
			},
			error: () => {
				if ( !basesBk || !baseBk ) return;

				if ( baseBk ) base.categoryID = baseBk.categoryID;

				if ( basesBk ) {
					this.bases = _.cloneDeep( basesBk );
					this.baseMap = _.groupBy( this.bases, 'categoryID' );
				}
			},
		});
	}

	/**
	 * @param {IBaseCategoryExtra} category
	 * @return {void}
	 */
	public renameCategory(
		category: IBaseCategoryExtra
	) {
		if ( this.categoryNameFormControl.invalid ) return;

		if ( !this.newCategoryName || category.name === this.newCategoryName ) {
			this.newCategoryName = '';
			return;
		};

		const categoryBk: IBaseCategoryExtra = _.cloneDeep( category );

		category.name = this.newCategoryName;

		this._baseCategoryService
		.update( category.id, { name: category.name } )
		.pipe(
			finalize( () => {
				this.newCategoryName = '';

				this.categoriesChange.emit( this.categories );
				this._cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( _category: IBaseCategory ) => {
				_.assign( category, _category );
			},
			error: () => category.name = categoryBk.name,
		});
	}

	/**
	 * @param {IBaseCategoryExtra} category
	 * @return {void}
	 */
	public removeCategory(
		category: IBaseCategoryExtra
	) {
		this._cubConfirmService
		.open(
			'BASE.MESSAGE.WILL_LOST',
			'BASE.MESSAGE.DELETE_CATEGORY',
			{
				warning: true,
				buttonApply: {
					text: 'BASE.WORKFLOW.CHART.LABEL.DELETE',
					type: 'destructive',
				},
				buttonDiscard: 'BASE.WORKFLOW.CHART.LABEL.CANCEL',
				translate: {
					name: category.name,
				},
			}
		)
		.afterClosed()
		.subscribe({
			next: ( answer: boolean ) => {
				if ( !answer ) return;

				const categoriesBk: IBaseCategoryExtra[]
					= _.cloneDeep( this.categories );
				const basesBk: IBaseExtra[] = _.cloneDeep( this.bases );

				this.categories = _.filter(
					this.categories,
					( _category: IBaseCategoryExtra ) =>
						_category.id !== category.id
				);

				_.forEach( this.bases, ( base: IBaseExtra ) => {
					if (
						base.categoryID === category.id
					) base.categoryID = null;
				} );

				this.baseMap = _.groupBy( this.bases, 'categoryID' );

				this._baseCategoryService
				.delete( category.id )
				.pipe(
					finalize( () => this._cdRef.markForCheck() ),
					untilCmpDestroyed( this )
				)
				.subscribe({
					next: () => {
						this.categoriesChange.emit( this.categories );
						this.baseMapChange.emit( this.baseMap );
						this.basesChange.emit( this.bases );
					},
					error: () => {
						this.categories = _.cloneDeep( categoriesBk );
						this.bases = _.cloneDeep( basesBk );
						this.baseMap = _.groupBy( this.bases, 'categoryID' );
					},
				});
			},
		});
	}

	/**
	 * @param {IBase} base
	 * @return {void}
	 */
	public createCategory(
		base: IBase
	) {
		if (
			_.isStrictEmpty( this.newCategory )
			|| this.categoryNameFormControl.invalid
			|| !this.isCreatingFolder
		) return;

		const categoriesBk: IBaseCategoryExtra[]
			= _.cloneDeep( this.categories );

		this.categories.push( this.newCategory );

		this.isCreatingFolder = false;

		this._baseCategoryService
		.create( this.newCategory )
		.pipe(
			finalize(
				() => {
					this.newCategory = {} as IBaseCategory;

					this._cdRef.markForCheck();
				}
			),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( category: IBaseCategory ) => {
				this.newCategory.createdByUser
					= _.find(
						this._users,
						{ id: category.createdBy }
					);

				_.assign( this.newCategory, category );

				this.moveToCategory(
					this.newCategory,
					base
				);
				this.categoriesChange.emit( this.categories );
			},
			error: () => this.categories = _.cloneDeep( categoriesBk ),
		});
	}

	/**
	 * @return {void}
	 */
	public cancelCreateCategory() {
		this.newCategory = {} as IBaseCategory;
		this.isCreatingFolder = false;
	}

	/**
	 * @return {void}
	 */
	public onFolderActionMenuClosed() {
		this.categoryNameFormControl.reset();
	}

	/**
	 * @param {IBaseCategory} category
	 * @return {void}
	 */
	public openCategory(
		category: IBaseCategory
	) {
		if ( !category.id ) return;

		this.categoryChange.emit( category );

		this.deselectAllItems();
	}

	/**
	 * @param {IBaseExtra} base
	 * @return {void}
	 */
	private _checkMultipleActionAvailable( base: IBaseExtra ) {
		this.multipleActions.canDelete
			= this.multipleActions.canDelete && base.isAdmin;
		this.multipleActions.canSetFavorite
			= this.multipleActions.canSetFavorite && !base.isFavorite;
		this.multipleActions.canSetUnFavorite
			= this.multipleActions.canSetUnFavorite && base.isFavorite;
	}

	/**
	 * @param {ElementRef} divElement
	 * @return {void}
	 */
	private _spinOut(
		divElement: ElementRef
	) {
		this._renderer.addClass( divElement, 'spin-out' );

		setTimeout(
			() => this._renderer.removeClass( divElement, 'spin-out' ),
			400
		);
	}

	/**
	 * @return {void}
	 */
	private _spinIn(
		divElement: ElementRef
	) {
		this._renderer.addClass( divElement, 'spin-in' );

		setTimeout(
			() => this._renderer.removeClass( divElement, 'spin-in' ),
			400
		);
	}

}
