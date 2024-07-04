import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	OnInit,
	QueryList,
	TemplateRef,
	ViewChild,
	ViewChildren,
	inject
} from '@angular/core';
import {
	Router,
	ActivatedRoute
} from '@angular/router';
import {
	Observable,
	isObservable
} from 'rxjs';
import {
	startWith
} from 'rxjs/operators';
import _, {
	List
} from 'lodash';

import {
	UnloadChecker
} from '@main/unload-checker';

import {
	LocaleService,
	PageService,
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	IUserData
} from '../modules/user-system/modules/user/interfaces';
import {
	UserService
} from '../modules/user-system/modules/user/services';
import {
	CONSTANT
} from '../resources';

@Unsubscriber()
@Component({
	selector: 'workspace-setting',
	templateUrl: '../templates/workspace-setting.pug',
	styleUrls: [ '../styles/workspace-setting.scss' ],
	host: { class: 'workspace-setting' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceSettingComponent
implements AfterViewInit, OnInit {

	@ViewChild( 'compChild' )
	protected _compChild: UnloadChecker;
	@ViewChildren( 'compTemplate', { read: TemplateRef } )
	protected _compTemplates: QueryList<TemplateRef<any>>;

	protected selectedCompIndex: number = 0;
	protected currentCompTemplate: TemplateRef<any>;
	protected compTemplatesArr: List<TemplateRef<any>>;

	private _activatedRoute: ActivatedRoute
		= inject( ActivatedRoute );
	private _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private _localeService: LocaleService
		= inject( LocaleService );
	private _pageService: PageService
		= inject( PageService );
	private _router: Router
		= inject( Router );
	private _userService: UserService
		= inject( UserService );

	/**
	 * @constructor
	 */
	ngOnInit() {
		this.selectedCompIndex
			= +this._activatedRoute.snapshot.fragment || 0;

		this._userService
		.storedUserChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( userData: IUserData ) => {
				if (
					userData?.user === undefined
					|| this._userService.isAdministrator()
				) return;

				setTimeout(
					() => {
						this._pageService.setCurrentURL( null );
						this._router.navigate([ '403' ]);
					}
				);
			},
		});

		this._localeService.localeChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: () => {
				_.forEach(
					this.compTemplatesArr,
					( item: TemplateRef<any> ) => {
						( item as ObjectType ).label
							= ( item as ObjectType )
							._declarationTContainer.attrs[ 3 ];
					}
				);
			},
		});
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this._compTemplates
		.changes
		.pipe(
			startWith( this._compTemplates ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( items: QueryList<TemplateRef<any>> ) => {
				this.compTemplatesArr
					= ( items as ObjectType )?._results;

				this.currentCompTemplate
					= this.compTemplatesArr[ this.selectedCompIndex ];

				this._navigate( this.currentCompTemplate );

				_.forEach(
					this.compTemplatesArr,
					( item: TemplateRef<any> ) => {
						( item as ObjectType ).icon
							= ( item as ObjectType )
							._declarationTContainer
							.attrs[ 1 ];
						( item as ObjectType ).label
							= ( item as ObjectType )
							._declarationTContainer
							.attrs[ 3 ];
					}
				);

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {TemplateRef} compTemplate
	 * @return {void}
	 */
	public selectCompTemplate( compTemplate: TemplateRef<any> ) {
		if ( this.currentCompTemplate === compTemplate ) return;

		const confirmDialog: Observable<boolean> | boolean
			= this._compChild?.canDeactivate?.();

		if ( isObservable( confirmDialog ) ) {
			confirmDialog
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: () => this._changeCompTemplate( compTemplate ),
			});

			return;
		}

		this._changeCompTemplate( compTemplate );
	}

	/**
	 * @param {TemplateRef<any>} compTemplate
	 * @return {void}
	 */
	private _navigate( compTemplate: TemplateRef<any> ) {
		this._router.navigate(
			[],
			{
				relativeTo: this._activatedRoute,
				fragment: CONSTANT
				.TEMPLATE_KEY[ ( compTemplate as ObjectType )
				._declarationTContainer
				.attrs[ 5 ] ],
				replaceUrl: true,
			}
		);
	}

	/**
	 * @param {TemplateRef<any>} compTemplate
	 * @return {void}
	 */
	private _changeCompTemplate( compTemplate: TemplateRef<any> ) {
		const index: number
			= _.indexOf( this.compTemplatesArr, compTemplate );

		this.currentCompTemplate
			= compTemplate;
		this.selectedCompIndex
			= index;

		this._cdRef.markForCheck();
		this._navigate( compTemplate );
	}

}
