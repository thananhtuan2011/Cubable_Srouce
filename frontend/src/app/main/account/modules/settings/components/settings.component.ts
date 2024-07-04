import {
	AfterViewInit, Component, QueryList,
	TemplateRef, ViewChildren, ViewChild,
	ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, isObservable } from 'rxjs';
import { startWith } from 'rxjs/operators';
import _, { List } from 'lodash';

import { UnloadChecker } from '@main/unload-checker';

import { LocaleService, Unsubscriber, untilCmpDestroyed } from '@core';

import { CONSTANT as AUTH_CONSTANT } from '@main/auth/resources';
import { AuthService } from '@main/auth/services';

@Unsubscriber()
@Component({
	selector		: 'settings',
	templateUrl		: '../templates/settings.pug',
	styleUrls		: [ '../styles/settings.scss' ],
	host			: { class: 'settings' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, AfterViewInit {

	@ViewChild( 'compChild' ) public compChild: UnloadChecker;
	@ViewChildren( 'compTemplate', { read: TemplateRef } ) public compTemplates: QueryList<TemplateRef<any>>;

	public selectedCompIndex: number = 0;
	public currentCompTemplate: TemplateRef<any>;
	public compTemplatesArr: List<TemplateRef<any>>;

	/**
	 * @constructor
	 * @param {AuthService} authService
	 * @param {ActivatedRoute} _activatedRoute
	 * @param {Location} _location
	 * @param {Router} _router
	 * @param {TranslateService} _translateService
	 * @param {LocaleService} _localeService
	 */
	constructor(
		public authService: AuthService,
		private _activatedRoute: ActivatedRoute,
		private _location: Location,
		private _router: Router,
		private _translateService: TranslateService,
		private _localeService: LocaleService
	) {
		this.selectedCompIndex = +this._activatedRoute.snapshot.fragment || 0;
	}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._navigate();

		this._localeService.localeChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () =>
			_.forEach( this.compTemplatesArr, ( item: TemplateRef<any> ) =>
				( item as ObjectType ).label = this._translateService.instant( ( item as ObjectType )._declarationTContainer.attrs[ 3 ] )
			)
		);
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this.compTemplates
		.changes
		.pipe(
			startWith( this.compTemplates ),
			untilCmpDestroyed( this )
		)
		.subscribe( ( items: QueryList<TemplateRef<any>> ) => {
			this.compTemplatesArr = ( items as ObjectType )?._results;
			this.currentCompTemplate = this.compTemplatesArr[ this.selectedCompIndex ];

			_.forEach( this.compTemplatesArr, ( item: TemplateRef<any> ) => {
				( item as ObjectType ).icon = ( item as ObjectType )._declarationTContainer.attrs[ 1 ];
				( item as ObjectType ).label = this._translateService.instant( ( item as ObjectType )._declarationTContainer.attrs[ 3 ] );
			} );
		} );
	}

	/**
	 * @param {TemplateRef} compTemplate
	 * @return {void}
	 */
	public selectCompTemplate( compTemplate: TemplateRef<any> ) {
		const confirmDialog: Observable<boolean> | boolean = this.compChild?.canDeactivate();

		if ( isObservable( confirmDialog ) ) {
			confirmDialog
			.pipe( untilCmpDestroyed( this ) )
			.subscribe( () => this._changeCompTemplate( compTemplate ) );

			return;
		}

		this._changeCompTemplate( compTemplate );
	}

	/**
	 * @return {void}
	 */
	public back() {
		if ( this.authService.isWorkspaceAccessed ) {
			this._location.back();
			return;
		}

		this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_IN ]);
	}

	/**
	 * @return {void}
	 */
	private _navigate() {
		this._router.navigate(
			[],
			{
				relativeTo	: this._activatedRoute,
				fragment	: `${this.selectedCompIndex}`,
				replaceUrl	: true,
			}
		);
	}

	/**
	 * @return {void}
	 */
	private _changeCompTemplate( compTemplate: TemplateRef<any> ) {
		const index: number = _.indexOf( this.compTemplatesArr, compTemplate );

		this.currentCompTemplate = compTemplate;
		this.selectedCompIndex = index;

		this._navigate();
	}

}
