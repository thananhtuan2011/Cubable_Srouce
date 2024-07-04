import {
	ChangeDetectorRef,
	Directive,
	HostListener,
	Injectable,
	OnDestroy,
	OnInit,
	inject
} from '@angular/core';
import {
	ActivatedRouteSnapshot,
	NavigationStart,
	Router,
	RouterStateSnapshot
} from '@angular/router';
import {
	Observable } from 'rxjs';
import {
	filter,
	map,
	switchMap,
	take,
	tap
} from 'rxjs/operators';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';
import { CUBConfirmService } from '@cub/material';

/*
 * Route guard
 * Component that is applied this route guard, should be extended from UnloadChecker class
 */
@Injectable({ providedIn: 'root' })
export class UnloadCheckerService {

	private _component: UnloadChecker;

	/**
	 * Register a component that is not a routing component scope, to be checked in route guard
	 * @param {UnloadChecker} component
	 * @return {void}
	 */
	public register( component: UnloadChecker ) {
		this._component = component;
	}

	/**
	 * @return {void}
	 */
	public unregister() {
		this._component = null;
	}

	/**
	 * @param {any} component
	 * @param {ActivatedRouteSnapshot} _currentRoute
	 * @param {RouterStateSnapshot} _currentState
	 * @param {RouterStateSnapshot} _nextState
	 * @return {Observable | boolean}
	 */
	public canDeactivate(
		component: any,
		_currentRoute: ActivatedRouteSnapshot,
		_currentState: RouterStateSnapshot,
		_nextState: RouterStateSnapshot
	): Observable<boolean> | boolean {
		component = component as UnloadChecker;

		return _.isFunction( component?.canDeactivate )
			? component.canDeactivate()
			: this._component
				? this._component.canDeactivate()
				: true;
	}
}

@Unsubscriber()
@Directive()
export abstract class UnloadChecker
implements OnInit, OnDestroy {

	public isNavigateAfterChecked: boolean = true;

	protected readonly cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	protected readonly router: Router
		= inject( Router );

	private readonly _unloadCheckerService: UnloadCheckerService
		= inject( UnloadCheckerService );

	private _isChanged: boolean;

	/*
	 * Guard on browser's refresh, close button
	 */
	@HostListener( 'window:beforeunload', [ '$event' ] )
	public windowBeforeUnload() {
		return !this._isChanged;
	}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._unloadCheckerService.register( this );

		let event: NavigationStart;

		// Guard on browser's back, next button
		this.router.events
		.pipe(
			filter( ( _event: NavigationStart ) => this._isChanged && _event.navigationTrigger === 'popstate' ),
			tap( ( _event: NavigationStart ) => {
				event = _event;

				this.router.navigateByUrl( this.router.url );
			} ),
			switchMap( () => this.subscribeConfirmSave() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( isNavigate: boolean ) => {
				isNavigate && this.router.navigateByUrl( event.url );
			},
		});
	}

	/**
	 * @constructor
	 */
	ngOnDestroy() {
		this._unloadCheckerService.unregister();
	}

	/**
	 * @return {void}
	 */
	public markAsChanged() {
		this._isChanged = true;
	}

	/**
	 * @return {void}
	 */
	public unmarkAsChanged() {
		this._isChanged = false;

		this.cdRef.markForCheck();
	}

	/**
	 * @param {ObjectType=} data
	 * @return {Observable | boolean}
	 */
	public canDeactivate( data?: ObjectType ): Observable<boolean> | boolean {
		return !this._isChanged || this.subscribeConfirmSave( data );
	}

	/**
	 * @return {Observable}
	 */
	protected confirmSave(): Observable<boolean> {
		const cubConfirmService: CUBConfirmService
			= inject( CUBConfirmService );

		return cubConfirmService
		.open(
			'APP.MESSAGE.ASK_TO_SAVE_CHANGES',
			'APP.LABEL.CHANGES_NOT_SAVED'
		)
		.afterClosed();
	}

	/**
	 * @param {ObjectType=} data
	 * @return {Observable<boolean>}
	 */
	protected subscribeConfirmSave( data?: ObjectType ): Observable<boolean> {
		return this.confirmSave()
		.pipe(
			tap(
				( answer: boolean ) => {
					answer
						? this.save( data )
						: this.cancel( data );
				}
			),
			map(
				( answer: boolean ) => this.isNavigateAfterChecked || answer
			),
			take( 1 )
		);
	}

	/**
	 * @param {ObjectType=} data
	 * @return {void}
	 */
	public abstract save( data?: ObjectType );

	/**
	 * @param {ObjectType=} data
	 * @return {void}
	 */
	public abstract cancel( data?: ObjectType );

}
