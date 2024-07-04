import {
	ChangeDetectionStrategy,
	Component,
	inject,
	OnInit
} from '@angular/core';
import {
	ActivatedRoute,
	Router,
	NavigationEnd
} from '@angular/router';
import {
	FormControl,
	Validators
} from '@angular/forms';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	forkJoin
} from 'rxjs';
import {
	filter,
	finalize,
	switchMap
} from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber,
	EqualValidators,
	untilCmpDestroyed
} from '@core';

import {
	MainComponent
} from '@main/main.component';

import {
	IUser
} from '../../settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	UserService
} from '../../settings/modules/workspace/modules/user-system/modules/user/services';

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

@Unsubscriber()
@Component({
	selector: 'base',
	templateUrl: '../templates/base.pug',
	styleUrls: [ '../styles/base.scss' ],
	host: { class: 'base' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseComponent
	extends MainComponent
	implements OnInit {

	protected readonly DISPLAY: typeof DisplayType = DisplayType;
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

	protected isShowSearchBox: boolean;
	protected isCreating: boolean;
	protected displayBy: DisplayType = DisplayType.GRID;
	protected category: IBaseCategory;
	protected baseMap: Record<IBase[ 'id' ], IBase[]> = {};
	protected newCategoryName: string;
	protected bases: IBase[];
	protected categories: IBaseCategory[];

	private readonly _userService: UserService
		= inject( UserService );
	private readonly _router: Router
		= inject( Router );
	private readonly _activatedRoute: ActivatedRoute
		= inject( ActivatedRoute );
	private readonly _translateService: TranslateService
		= inject( TranslateService );
	private readonly _baseService: BaseService
		= inject( BaseService );
	private readonly _baseCategoryService: BaseCategoryService
		= inject( BaseCategoryService );

	private _searchStr: string;
	private _users: IUser[];
	private _basesClone: IBase[];

	ngOnInit() {
		this._initData();
	}

	/**
	 * @return {void}
	 */
	public createBase() {
		this.isCreating = true;

		const basesBk: IBase[] = _.cloneDeep( this.bases );
		const newBase: IBase = {
			name: this._translateService.instant( 'BASE.LABEL.BASE_UN_NAME' ),
			categoryID: this._activatedRoute
			.snapshot
			.queryParams
			.categoryID || null,
		} as IBase;

		this.bases?.length
			? this.bases.push( newBase )
			: this.bases = [ newBase ];

		this._basesClone = _.cloneDeep( this.bases );

		if ( this._searchStr ) {
			this.bases = _.filter(
				this.bases,
				( base: IBase ) => _.search( base.name, this._searchStr )
			);
		}

		this.baseMap
			= _.groupBy( this.bases, 'categoryID' );

		this._baseService
		.create( newBase )
		.pipe(
			finalize( () => {
				this.isCreating = false;

				this.cdRef.markForCheck();
			} ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( _base: IBase ) => {
				_.assign( newBase, { ..._base, isAdmin: true } );

				this.baseMap = _.groupBy( this.bases, 'categoryID' );

				this._router.navigate(
					[ CONSTANT.PATH.DETAIL, _base.id ],
					{ relativeTo: this._activatedRoute }
				);
			},
			error: () => {
				this.bases = _.cloneDeep( basesBk );
				this.baseMap = _.groupBy( this.bases, 'categoryID' );
				this._basesClone = _.cloneDeep( this.bases );
			},
		});
	}

	/**
	 * @param {IBaseCategory=} category
	 * @return {void}
	 */
	public onCategoryChange( category?: IBaseCategory ) {
		category?.id
			? this._router.navigate(
				[],
				{ queryParams: { categoryID: category?.id } }
			)
			: this._router.navigate( [] );
	}

	/**
	 * @param {IBaseCategory=} category
	 * @return {void}
	 */
	public removeCategory(
		category: IBaseCategory = this.category
	) {
		const categoriesBk: IBaseCategory[]
			= _.cloneDeep( this.categories );
		const basesBk: IBase[]
			= _.cloneDeep( this.bases );

		this.categories
			= _.filter(
				this.categories,
				( _category: IBaseCategory ) => _category.id !== category.id
			);

		_.forEach( this.bases, ( base: IBase ) => {
			if ( base.categoryID === category.id ) base.categoryID = null;
		} );

		this.baseMap = _.groupBy( this.bases, 'categoryID' );

		this.onCategoryChange();

		this._baseCategoryService
		.delete( category.id )
		.pipe(
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			error: () => {
				this.categories = _.cloneDeep( categoriesBk );
				this.bases = _.cloneDeep( basesBk );
				this.baseMap = _.groupBy( this.bases, 'categoryID' );
			},
		});
	}

	/**
	 * @param {IBaseCategory=} category
	 * @return {void}
	 */
	public renameCategory(
		category: IBaseCategory = this.category
	) {
		if ( this.categoryNameFormControl.invalid ) return;

		if (
			!this.newCategoryName
			|| category.name === this.newCategoryName
		) {
			this.newCategoryName = '';
			return;
		};

		const categoryBk: IBaseCategory = _.cloneDeep( category );

		category.name = this.newCategoryName;

		this._baseCategoryService
		.update( category.id, { name: category.name } )
		.pipe(
			finalize( () => {
				this.newCategoryName = '';

				this.cdRef.markForCheck();
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
	 * @param {boolean} isShowSearchBox
	 * @return {void}
	 */
	public changeSearchBoxVisibility(
		isShowSearchBox: boolean
	) {
		this.isShowSearchBox = isShowSearchBox;
	}

	/**
	 * @param {string} event
	 * @return {void}
	 */
	public searchingChanged( event: string ) {
		if (
			this._searchStr === event
			|| ( !this._searchStr && !event )
		) return;

		this._searchStr = event;

		this.bases = event
			? _.filter(
				this._basesClone,
				( base: IBase ) => _.search( base.name, event )
			)
			: _.cloneDeep( this._basesClone );

		this.baseMap = _.groupBy( this.bases, 'categoryID' );

		this.cdRef.detectChanges();
	}

	/**
	 * @return {void}
	 */
	public refresh() {
		this._initData();
	}

	/**
	 * @return {void}
	 */
	public onBasesChange() {
		this._basesClone = _.cloneDeep( this.bases );
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		forkJoin([
			this._baseService.get( true ),
			this._userService.getAvailableUser(),
		])
		.pipe(
			switchMap(
				( [ _bases, users ]: [ IBase[], IUser[] ] ) => {
					this._users = users;

					const usersLk: Record<IUser[ 'id' ], IUser>
						= _.keyBy( this._users, 'id' );

					_.forEach( _bases, ( base: IBase ) => {
						base.createdByUser = usersLk[ base.createdBy ];

						if ( !base.categoryID ) base.categoryID = null;
					} );

					this.bases = _bases;
					this._basesClone = _.cloneDeep( this.bases );

					if ( this._searchStr ) {
						this.bases
							= _.filter(
								this.bases,
								( base: IBase ) => {
									return _.search(
										base.name,
										this._searchStr
									);
								}
							);
					}

					this.baseMap = _.groupBy( this.bases, 'categoryID' );

					return this._baseCategoryService.getAll();
				}
			),
			finalize( () => this.cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( _categories: IBaseCategory[] ) => {
				const usersLk: Record<IUser[ 'id' ], IUser>
					= _.keyBy( this._users, 'id' );

				_.forEach(
					_categories,
					( category: IBaseCategory ) => {
						category.createdByUser = usersLk[ category.createdBy ];
					}
				);

				this.categories = _categories;

				this._getDetailCategory();
				this._routerEventsCatcher();
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _routerEventsCatcher() {
		this._router.events
		.pipe(
			filter(
				( event: NavigationEnd ) => event instanceof NavigationEnd
			),
			untilCmpDestroyed( this )
		)
		.subscribe( () => this._getDetailCategory() );
	}

	/**
	 * @return {void}
	 */
	private _getDetailCategory() {
		this.category
			= _.find(
				this.categories,
				{ id: this._activatedRoute.snapshot.queryParams.categoryID }
			) || null;

		this.cdRef.markForCheck();
	}

}
