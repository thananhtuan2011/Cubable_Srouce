import {
	Component, ChangeDetectionStrategy, ChangeDetectorRef,
	Input, OnInit, Output,
	EventEmitter, AfterViewInit
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';

import { Unsubscriber, LocaleService, untilCmpDestroyed } from '@core';

import { IAccount, IOnBoardingFlow } from '@main/account/interfaces';
import { INDUSTRY, NEEDING, ROLE, SIZE, TEAM } from '@main/account/resources';
import { AccountService } from '@main/account/services/account.service';
// import { OnboardingService } from '@main/workspace/modules/onboarding/services';

import { AuthService } from '../services';

interface IOption {
	name: string;
	value: number;
}

interface INeedingsOfTeam {
	team: number;
	needings: number[];
}

@Unsubscriber()
@Component({
	selector		: 'general-info',
	templateUrl		: '../templates/general-info.pug',
	styleUrls		: [ '../styles/auth.scss', '../styles/general-info.scss' ],
	host			: { class: 'auth general-info' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class GeneralInfoComponent implements OnInit, AfterViewInit {

	@Input() public isFromSignUp: boolean;

	@Output() public nextStep: EventEmitter<Event> = new EventEmitter<Event>();

	public readonly ROLE: typeof ROLE = ROLE;
	public readonly TEAM: typeof TEAM = TEAM;
	public readonly NEEDING: typeof NEEDING = NEEDING;
	public readonly SIZE: typeof SIZE = SIZE;
	public readonly INDUSTRY: typeof INDUSTRY = INDUSTRY;

	public isSubmitting: boolean;
	public collectForm: FormGroup;
	public account: IAccount;

	public onBoardingFlow: IOnBoardingFlow;
	public roles: IOption[];
	public teams: IOption[];
	public rootNeedings: IOption[];
	public needings: IOption[];
	public sizes: IOption[];
	public industries: IOption[];
	public needingsOfTeam: INeedingsOfTeam[];

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {LocaleService} _localeService
	 * @param {TranslateService} _translateService
	 * @param {FormBuilder} _fb
	 * @param {AccountService} _accountService
	 * @param {AuthService} _authService
	 */
	constructor(
		private _cdRef: ChangeDetectorRef,
		private _localeService: LocaleService,
		private _translateService: TranslateService,
		private _fb: FormBuilder,
		private _accountService: AccountService,
		private _authService: AuthService
	) {
		this._localeService.localeChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => {
			this.roles = [
				this.getInformationOption( 'STAFF', ROLE.STAFF ),
				this.getInformationOption( 'LEADER', ROLE.LEADER ),
				this.getInformationOption( 'MANAGER', ROLE.MANAGER ),
				this.getInformationOption( 'C_LEVEL', ROLE.C_LEVEL ),
				this.getInformationOption( 'OWNER', ROLE.OWNER ),
				this.getInformationOption( 'FREELANCER', ROLE.FREELANCER ),
			];

			this.teams = [
				this.getInformationOption( 'MARKETING', TEAM.MARKETING ),
				this.getInformationOption( 'HR_LEGAL', TEAM.HR_LEGAL ),
				this.getInformationOption( 'SALES_ACCOUNT', TEAM.SALES_ACCOUNT ),
				this.getInformationOption( 'FINANCE', TEAM.FINANCE ),
				this.getInformationOption( 'CUSTOMER_SERVICE', TEAM.CUSTOMER_SERVICE ),
				this.getInformationOption( 'OPERATION', TEAM.OPERATION ),
				this.getInformationOption( 'PRODUCT', TEAM.PRODUCT ),
				this.getInformationOption( 'ENGINEERING', TEAM.ENGINEERING ),
				this.getInformationOption( 'IT_SUPPORT', TEAM.IT_SUPPORT ),
				this.getInformationOption( 'MANUFACTURING', TEAM.MANUFACTURING ),
				this.getInformationOption( 'PERSONAL_USE', TEAM.PERSONAL_USE ),
				this.getInformationOption( 'OTHER', TEAM.OTHER ),
			];

			this.industries = [
				this.getInformationOption( 'MARKETING_ADVERTISING', INDUSTRY.MARKETING_ADVERTISING ),
				this.getInformationOption( 'ENTERTAINMENT', INDUSTRY.ENTERTAINMENT ),
				this.getInformationOption( 'EDUCATION', INDUSTRY.EDUCATION ),
				this.getInformationOption( 'HUMAN_RESOURCES', INDUSTRY.HUMAN_RESOURCES ),
				this.getInformationOption( 'FINANCIAL_SERVICES', INDUSTRY.FINANCIAL_SERVICES ),
				this.getInformationOption( 'ACCOUNTING', INDUSTRY.ACCOUNTING ),
				this.getInformationOption( 'LAW', INDUSTRY.LAW ),
				this.getInformationOption( 'TECHNOLOGY', INDUSTRY.TECHNOLOGY ),
				this.getInformationOption( 'HOSPITALITY', INDUSTRY.HOSPITALITY ),
				this.getInformationOption( 'RETAIL', INDUSTRY.RETAIL ),
				this.getInformationOption( 'REAL_ESTATE', INDUSTRY.REAL_ESTATE ),
				this.getInformationOption( 'F_B', INDUSTRY.F_B ),
				this.getInformationOption( 'PERSONAL_USE', INDUSTRY.PERSONAL_USE ),
				this.getInformationOption( 'OTHER', INDUSTRY.OTHER ),
			];

			this.needings = [
				this.getInformationOption( 'PROJECT', NEEDING.PROJECT ),
				this.getInformationOption( 'TASK', NEEDING.TASK ),
				this.getInformationOption( 'CONTENT', NEEDING.CONTENT ),
				this.getInformationOption( 'MEDIA_PERFORMANCE', NEEDING.MEDIA_PERFORMANCE ),
				this.getInformationOption( 'CUSTOMER_RELATIONSHIP', NEEDING.CUSTOMER_RELATIONSHIP ),
				this.getInformationOption( 'ADMISSION', NEEDING.ADMISSION ),
				this.getInformationOption( 'STUDENT', NEEDING.STUDENT ),
				this.getInformationOption( 'CLASS', NEEDING.CLASS ),
				this.getInformationOption( 'EDUCATION_QUALITY', NEEDING.EDUCATION_QUALITY ),
				this.getInformationOption( 'EMPLOYEE_INFORMATION', NEEDING.EMPLOYEE_INFORMATION ),
				this.getInformationOption( 'LEAVE', NEEDING.LEAVE ),
				this.getInformationOption( 'SALARY', NEEDING.SALARY ),
				this.getInformationOption( 'EDUCATION_MANAGEMENT', NEEDING.EDUCATION_MANAGEMENT ),
				this.getInformationOption( 'REVENUE_EXPENDITURE', NEEDING.REVENUE_EXPENDITURE ),
				this.getInformationOption( 'BUDGET', NEEDING.BUDGET ),
				this.getInformationOption( 'ACCOUNT_PAYABLE_RECEIVABLE', NEEDING.ACCOUNT_PAYABLE_RECEIVABLE ),
				this.getInformationOption( 'CONSULTING_SCHEDULE', NEEDING.CONSULTING_SCHEDULE ),
				this.getInformationOption( 'CONSULTANT_PERFORMANCE', NEEDING.CONSULTANT_PERFORMANCE ),
				this.getInformationOption( 'WAREHOUSE', NEEDING.WAREHOUSE ),
				this.getInformationOption( 'SALES', NEEDING.SALES ),
				this.getInformationOption( 'KPI', NEEDING.KPI ),
				this.getInformationOption( 'OTHER', NEEDING.OTHER ),
			];

			this.rootNeedings = _.cloneDeep( this.needings );
		} );

		this.sizes = [
			this.getSizeOption( '2 - 5', '2_5' ),
			this.getSizeOption( '6 - 10', '6_10' ),
			this.getSizeOption( '11 - 25', '11_25' ),
			this.getSizeOption( '26 - 50', '26_50' ),
			this.getSizeOption( '51 - 200', '51_200' ),
			this.getSizeOption( '201 - 500', '201_500' ),
			this.getSizeOption( '500+', '500' ),
		];

		this.needingsOfTeam = [
			this.getNeedingsOfTeam( TEAM.MARKETING, [ NEEDING.PROJECT, NEEDING.TASK, NEEDING.CONTENT, NEEDING.MEDIA_PERFORMANCE ] ),
			this.getNeedingsOfTeam( TEAM.HR_LEGAL, [ NEEDING.CUSTOMER_RELATIONSHIP, NEEDING.LEAVE, NEEDING.SALARY, NEEDING.EDUCATION_MANAGEMENT ] ),
			this.getNeedingsOfTeam(
				TEAM.SALES_ACCOUNT,
				[
					NEEDING.CUSTOMER_RELATIONSHIP, NEEDING.ADMISSION, NEEDING.CONSULTING_SCHEDULE,
					NEEDING.SALES, NEEDING.KPI, NEEDING.PROJECT, NEEDING.TASK,
				]
			),
			this.getNeedingsOfTeam( TEAM.FINANCE, [ NEEDING.REVENUE_EXPENDITURE, NEEDING.BUDGET, NEEDING.ACCOUNT_PAYABLE_RECEIVABLE ] ),
			this.getNeedingsOfTeam( TEAM.CUSTOMER_SERVICE, [ NEEDING.EDUCATION_QUALITY ] ),
			this.getNeedingsOfTeam( TEAM.OPERATION, [ NEEDING.STUDENT, NEEDING.CLASS, NEEDING.CONSULTANT_PERFORMANCE ] ),
			this.getNeedingsOfTeam( TEAM.PRODUCT, [ NEEDING.PROJECT, NEEDING.TASK ] ),
			this.getNeedingsOfTeam( TEAM.ENGINEERING, [ NEEDING.PROJECT, NEEDING.TASK ] ),
			this.getNeedingsOfTeam( TEAM.IT_SUPPORT, [ NEEDING.PROJECT, NEEDING.TASK ] ),
			this.getNeedingsOfTeam( TEAM.MANUFACTURING, [ NEEDING.WAREHOUSE, NEEDING.PROJECT, NEEDING.TASK ] ),
			this.getNeedingsOfTeam( TEAM.PERSONAL_USE, [ NEEDING.PROJECT, NEEDING.TASK, NEEDING.CONTENT ] ),
			this.getNeedingsOfTeam( TEAM.OTHER, [ NEEDING.PROJECT, NEEDING.TASK, NEEDING.CONTENT ] ),
		];
	}

	/**
	 * @constructor
	 */
	ngOnInit() {
		if ( this.isFromSignUp ) {
			this.collectForm = this._fb.group({
				role		: [ undefined, Validators.required ],
				team		: [ undefined, Validators.required ],
				size		: [ undefined, Validators.required ],
				needing		: [ undefined, Validators.required ],
				industry	: [ undefined, Validators.required ],
			});
		} else {
			this.collectForm = this._fb.group({
				role		: [ undefined ],
				team		: [ undefined ],
				size		: [ undefined ],
				needing		: [ undefined ],
				industry	: [ undefined ],
			});
		}
	}

	/**
	 * @constructor
	 */
	ngAfterViewInit() {
		this._authService
		.accountInfo()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(() => {
			this.account = this._accountService.storedAccount;

			if ( !this.account ) return;

			this.onBoardingFlow = this.account.onBoardingFlow;

			if ( !this.onBoardingFlow ) this.onBoardingFlow = { isSkipped: false };

			const onboardingFlowTemp: IOnBoardingFlow = _.cloneDeep( this.onBoardingFlow );

			onboardingFlowTemp.isSkipped = true;
			// this._onboardingService.updateCollectedInformation( onboardingFlowTemp ).subscribe();
		});
	}

	/**
	 * @param {number} team
	 * @param {number[]} needings
	 * @return {INeedingsOfTeam}
	 */
	public getNeedingsOfTeam( team: number, needings: number[] ): INeedingsOfTeam {
		return { team, needings };
	}

	/**
	 * @param {string} name
	 * @param {number} value
	 * @return {IOption}
	 */
	public getInformationOption( name: string, value: number ): IOption {
		return {
			name: this._translateService.instant( `AUTH.LABEL.${name}` ),
			value,
		};
	}

	/**
	 * @param {string} name
	 * @param {string} stringValue
	 * @return {IOption}
	 */
	public getSizeOption( name: string, stringValue: string ): IOption {
		return { name, value: SIZE[ `${stringValue}` ] };
	}

	/**
	 * @param {IOption} optionSelected
	 * @return {void}
	 */
	public submitInformation() {
		this.onBoardingFlow = {
			isSkipped: true,
			collectInformation: {
				role: this.collectForm.controls.role.value,
				team: this.collectForm.controls.team.value,
				needing: this.collectForm.controls.needing.value,
				size: this.collectForm.controls.size.value,
				industry: this.collectForm.controls.industry.value,
			},
		};

		// this._onboardingService.updateCollectedInformation( this.onBoardingFlow ).subscribe( () => {
		// 	this.account.onBoardingFlow = this.onBoardingFlow;
		// 	this._accountService.storedAccount = this.account;
		// 	this.nextStep.emit();
		// } );
		this._cdRef.markForCheck();
	}

	/**
	 * @param {IOption} optionSelected
	 * @return {void}
	 */
	public onTeamSelected( optionSelected: IOption ) {
		this.needings = _.cloneDeep( this.rootNeedings );

		const teamIndex: number = _.findIndex( this.needingsOfTeam, { team: optionSelected.value } );
		let tempNeeds: IOption[] = _.cloneDeep( this.needings );

		_.forEach( this.needingsOfTeam[ teamIndex ].needings, ( needingIndex: number ) => {
			tempNeeds = _.concat( _.pullAt( tempNeeds, needingIndex - 1 ), tempNeeds );
		} );

		this.needings = tempNeeds;

		this._cdRef.markForCheck();
	}

}
