import {
	Directive,
	OnInit,
	Injector,
	ElementRef,
	inject,
	ViewChild,
	TemplateRef
} from '@angular/core';
import {
	Params,
	Router
} from '@angular/router';
import _ from 'lodash';

import {
	PageService,
	untilCmpDestroyed
} from '@core';

import {
	CUBTooltipRef,
	CUBTooltipService
} from '@cub/material/tooltip';

import {
	IWorkspaceAccess
} from '@main/workspace/interfaces';
import {
	WorkspaceService
} from '@main/workspace/services';
import {
	IAccount
} from '@main/account/interfaces';

import {
	AuthService
} from '../services';
import {
	COLOR
} from '../resources';

type PasswordRule = {
	minlength: boolean;
	numberOrSymbol: boolean;
	uppercase: boolean;
	lowercase: boolean;
	percent: number;
};

const NUMBER_OR_SYMBOL_REGEX: RegExp = /[0-9$-/:-?{-~!@#"^_`\[\]\\]/g;
const LOWERCASE_REGEX: RegExp = /[a-z]+/g;
const UPPERCASE_REGEX: RegExp = /[A-Z]+/g;

@Directive()
export class AuthBase<T> implements OnInit {

	@ViewChild( 'checkWeekPassword')
	protected checkWeekPassword: TemplateRef<any>;

	protected isSubmitting: boolean;
	protected hiddenPassword: boolean;
	protected hiddenConfirm: boolean;
	protected token: string;
	protected step: T;
	protected passwordRule: PasswordRule;
	protected account: Partial<IAccount>
		= {};
	protected passwordHighlight: ObjectType<{ color: string; message: string }>;


	protected tooltipRef: CUBTooltipRef;

	protected readonly tooltipService: CUBTooltipService
		= inject( CUBTooltipService );

	constructor( protected injector: Injector ) {
		this.passwordRule
			= {
				minlength: false,
				numberOrSymbol: false,
				uppercase: false,
				lowercase: false,
				percent: 0,
			};

		this.passwordHighlight
			= {
				25: {
					color: COLOR.DANGER,
					message: 'AUTH.MESSAGE.PASSWORD_WEEK',
				},
				50: {
					color: COLOR.WARNING,
					message: 'AUTH.MESSAGE.PASSWORD_MEDIUM_WEEK',
				},
				75: {
					color: COLOR.INFO,
					message: 'AUTH.MESSAGE.PASSWORD_MEDIUM',
				},
				100: {
					color: COLOR.SUCCESS,
					message: 'AUTH.MESSAGE.PASSWORD_STRONG',
				},
			};
	}

	ngOnInit() {
		const workspaceService: WorkspaceService =
			this.injector.get( WorkspaceService );

		workspaceService
		.storedWorkspaceInitChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( workspace: IWorkspaceAccess ) => {
			if ( !workspace ) return;

			const authService: AuthService
				= this.injector.get( AuthService );

			if ( !authService.isWorkspaceAccessed ) return;

			const pageService: PageService
				= this.injector.get( PageService );

			pageService.navigateToCurrentURL();
		} );
	}

	/**
	 * @param {string[]} commands
	 * @param {Params=} params
	 * @return {void}
	 */
	public stateNavigate(
		commands: string[] = [],
		params?: Params
	) {
		const router: Router
			= this.injector.get( Router );

		router.navigate(
			commands,
			{ queryParams: { ...params } }
		);
	}

	/**
	 * @param {ElementRef} origin
	 * @return {void}
	 */
	protected openTooltip(
		origin: ElementRef
	) {
		if (
			this.tooltipRef?.isOpened
			|| !this.account.password?.length
		) {
			return;
		}

		this.tooltipRef
			= this.tooltipService
			.open(
				origin,
				this.checkWeekPassword,
				undefined,
				{
					position: 'start-below',
					width: 376,
					panelClass: 'tooltip-custom',
				}
			);
	}

	/**
	 * @param {string} password
	 * @param {ElementRef} origin
	 * @return {void}
	 */
	protected changePassword(
		password: string,
		origin: ElementRef
	) {
		if ( !password ) {
			this.passwordRule = {
				minlength: false,
				numberOrSymbol: false,
				uppercase: false,
				lowercase: false,
				percent: 0,
			};

			this.closeTooltip();
			return;
		}

		if ( password ) {
			this.openTooltip( origin );

			const minlength: boolean = password?.length >= 8;
			const numberOrSymbol: boolean =
				!!password.match( NUMBER_OR_SYMBOL_REGEX );
			const uppercase: boolean =
				!!password.match( UPPERCASE_REGEX );
			const lowercase: boolean =
				!!password.match( LOWERCASE_REGEX );
			const percent: number =
				_.chain([
					minlength,
					numberOrSymbol,
					uppercase,
					lowercase,
				])
				.groupBy()
				.get( 'true' )
				.value()?.length * 25;

			this.passwordRule = {
				minlength,
				numberOrSymbol,
				uppercase,
				lowercase,
				percent,
			};
		}
	}

	/**
	 * @return {void}
	 */
	protected closeTooltip(){
		this.tooltipRef?.close();
	}

}
