import {
	Injectable,
	inject
} from '@angular/core';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	BehaviorSubject,
	Observable,
	Observer,
	Subject
} from 'rxjs';
import {
	map,
	tap
} from 'rxjs/operators';
import _ from 'lodash';

import {
	CUBMemberStatus,
	CUBMember
} from '@cub/material/member-picker';

import {
	ITransfer
} from '@main/workspace/modules/settings/modules/common/modules/transfer-assets/services';
import {
	WorkspaceApiService
} from '@main/workspace/services';
import {
	IPeopleParam,
	IPeopleScopeSetting
} from '@main/common/field/interfaces/people-field.interface';

import {
	CONSTANT as DISPENSATION_CONSTANT
} from '../../dispensation/resources';

import {
	IInviteExpiration,
	IInviteUserData,
	IResendInviteUserData,
	IUser,
	IUserData,
	IUserFieldExtra,
	IUserTable,
	IUserValue
} from '../interfaces';
import {
	CONSTANT
} from '../resources';

type InitialUserStored = {
	includeSetting: IPeopleScopeSetting;
	excludeSetting: IPeopleScopeSetting;
	users?: IUser[];
};

@Injectable({providedIn: 'root'})
export class UserService {

	public INVITE_EXPIRATION: readonly IInviteExpiration[];

	private readonly _endPoint: string
		= '/api/user';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );
	private readonly _translateService: TranslateService
		= inject( TranslateService );
	private readonly _storedUserChange$: BehaviorSubject<IUserData>
		= new BehaviorSubject<IUserData>(
			// this._userID ? { user: { id: this._userID } as IUserInfo } as IUserData : undefined
			undefined
		);

	public userChange$: Subject<void>
		= new Subject<void>();

	private _isOwner: boolean;
	private _isAdmin: boolean;
	private _isAdministrator: boolean;
	private _storedUser: IUserData;
	private _users: IUser[];
	private _initialUsers: InitialUserStored[];

	get storedUser(): IUserData { return this._storedUser; }
	set storedUser( user: IUserData ) {
		this._storedUser = user;
		this._isOwner
			= this.hasRoles([
				DISPENSATION_CONSTANT.ROLE_UNIQ_NAME.OWNER,
			]);
		this._isAdmin
			= this.hasRoles([
				DISPENSATION_CONSTANT.ROLE_UNIQ_NAME.ADMIN,
			]);
		this._isAdministrator
			= this.hasRoles([
				DISPENSATION_CONSTANT.ROLE_UNIQ_NAME.OWNER,
				DISPENSATION_CONSTANT.ROLE_UNIQ_NAME.ADMIN,
			]);

		this.storedUserChange$.next( this._storedUser );
	}

	get users(): IUser[] {
		return this._users;
	}
	set users( users: IUser[] ) {
		this._users = users;
	};

	get initialUsers(): InitialUserStored[] {
		return this._initialUsers;
	}
	set initialUsers( initialUserStored: InitialUserStored[] ) {
		this._initialUsers = initialUserStored;
	};

	get storedUserChange$(): BehaviorSubject<IUserData> {
		return this._storedUserChange$;
	}

	/**
	 * @return {IInviteExpiration[]}
	 */
	public getInviteExpiration(): IInviteExpiration[] {
		return [
			{
				value: CONSTANT.INVITE_EXPIRATION_VALUE.ONE_DAY,
				name: this._translateService.instant(
					'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.DAY',
					{ amount: 1 }
				),
			},
			{
				value: CONSTANT.INVITE_EXPIRATION_VALUE.THREE_DAYS,
				name: this._translateService.instant(
					'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.DAYS',
					{ amount: 3 }
				),
			},
			{
				value: CONSTANT.INVITE_EXPIRATION_VALUE.SEVEN_DAYS,
				name: this._translateService.instant(
					'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.DAYS',
					{ amount: 7 }
				),
			},
			{
				value: CONSTANT.INVITE_EXPIRATION_VALUE.NEVER,
				name: this._translateService.instant(
					'SETTINGS.WORKSPACE.USER_SYSTEM.USER.LABEL.NEVER'
				),
			},
		];
	}

	/**
	 * @return {Observable}
	 */
	public getFields(): Observable<IUserFieldExtra[]> {
		return this
		._apiService
		.call(
			`${this._endPoint}/fields`,
			'GET'
		);
	}

	/**
	 * @return {Observable}
	 */
	public getUserResource(): Observable<IUserTable[]> {
		return this
		._apiService
		.call(
			`${this._endPoint}/list`,
			'GET'
		);
	}

	/**
	 * @param {Partial<{ availableStatus: CUBMemberStatus[] }} params
	 * @param {boolean=} forceReload
	 * @return {Observable}
	 */
	public getAvailableUser(
		params?: Partial<{ availableStatus: CUBMemberStatus[] } >,
		forceReload?: boolean
	): Observable<IUser[]> {
		if ( !_.isNil( this.users?.length ) && !forceReload ) {
			return new Observable(
				( observer: Observer<IUser[]> ) => {
					observer.next( this._redoUsers( params?.availableStatus ) );
					observer.complete();
				}
			);
		}

		return this
		._apiService
		.call(
			`${this._endPoint}/resources`,
			'GET'
		)
		.pipe( map( ( users: IUser[] ) => {
			this.users = _.isArray( users ) ? users : [];

			return this._redoUsers( params?.availableStatus );
		} ) );
	}

	/**
	 * @return {Observable}
	 */
	public getActiveUsers(): Observable<IUser[]> {
		return new Observable(
			( observer: Observer<IUser[]> ) => {
				observer.next(
					this._redoUsers([ CUBMember.MEMBER_STATUS.ACTIVE ])
				);
				observer.complete();
			}
		);
	}

	/**
	 * @return {Observable}
	 */
	public getWaitingUsers(): Observable<IUser[]> {
		return new Observable(
			( observer: Observer<IUser[]> ) => {
				observer.next(
					this._redoUsers([ CUBMember.MEMBER_STATUS.WAITING ])
				);
				observer.complete();
			}
		);
	}

	/**
	 * @return {Observable}
	 */
	public getInactiveUsers(): Observable<IUser[]> {
		return new Observable(
			( observer: Observer<IUser[]> ) => {
				observer.next(
					this._redoUsers([ CUBMember.MEMBER_STATUS.INACTIVE ])
				);
				observer.complete();
			}
		);
	}

	/**
	 * @param {} params
	 * @return {Observable}
	 */
	public getUsersFromPeopleField(
		data: Pick<IPeopleParam, 'includeSetting' | 'excludeSetting'>
	): Observable<IUser[]> {
		let isCache: boolean;
		let observable: Observable<IUser[]>;

		_.forEach(
			this.initialUsers,
			( initialUser: InitialUserStored ) => {
				if (
					_.isEqual(
						data.includeSetting,
						initialUser.includeSetting
					)
					&& _.isEqual(
						data.excludeSetting,
						initialUser.excludeSetting
					)
				) {
					isCache = true;

					observable
						= new Observable(
							( observer: Observer<IUser[]> ) => {
								observer.next( initialUser.users );
								observer.complete();
							}
						);

					return;
				}
			}
		);

		if ( isCache ) return observable;

		return this
		._apiService
		.call(
			`${this._endPoint}/list-by-params`,
			'POST',
			data?.excludeSetting?.type
				? data
				: { includeSetting: data.includeSetting }
		).pipe(
			map(
				( users: IUser[] ) => {
					this.initialUsers ||= [];
					this.initialUsers.push({
						includeSetting: data.includeSetting,
						excludeSetting: data.excludeSetting,
						users,
					});
					this.initialUsers = _.clone( this.initialUsers );

					return users;
				}
			)
		);
	}

	/**
	 * @param {string[]} emails
	 * @return {Observable}
	 */
	public checkExistEmails( emails: string[] ) {
		return this
		._apiService
		.call(
			`${this._endPoint}/check-emails-exists`,
			'POST',
			{ emails }
		);
	}

	/**
	 * @param {IInviteUserData} data
	 * @return {Observable}
	 */
	public bulkInvite(
		data: IInviteUserData
	): Observable<IUser[]> {
		return this
		._apiService
		.call(
			`${this._endPoint}/bulk-invite`,
			'POST',
			data
		)
		.pipe(
			tap(
				( users: IUser[] ) => {
					if ( !users?.length ) return;

					this.users = [
						...this.users,
						...users,
					];
				}
			)
		);
	}

	/**
	 * @param {IResendInviteUserData} data
	 * @return {Observable}
	 */
	public resendInvitation(
		data: IResendInviteUserData
	): Observable<void> {
		return this
		._apiService
		.call(
			`${this._endPoint}/resend-invite`,
			'POST',
			data
		);
	}

	/**
	 * @param {string[]} userIDs
	 * @param {ITransfer=}transfer
	 * @return {Observable}
	 */
	public bulkDelete(
		emails: string[],
		transfer?: ITransfer
	): Observable<void> {
		if ( transfer ) {
			transfer.recheckPassword
				 = _.aesEncrypt( transfer.recheckPassword );
		}

		return this
		._apiService
		.call(
			`${this._endPoint}/remove-user-workspace`,
			'PUT',
			{
				emails,
				...( transfer ? transfer : {} ),
			}
		);
	}

	/**
	 * @param {string[]} userIDs
	 * @return {Observable}
	 */
	public activate(
		emails: string[]
	): Observable<IUserValue[]> {
		return this
		._apiService
		.call(
			`${this._endPoint}/activate`,
			'PATCH',
			{ emails }
		);
	}

	/**
	 * @param {string[]} userIDs
	 * @return {Observable}
	 */
	public deactivate(
		emails: string[]
	): Observable<void> {
		return this
		._apiService
		.call(
			`${this._endPoint}/deactivate`,
			'PATCH',
			{ emails }
		);
	}

	/**
	 * @return {Observable}
	 */
	public checkMembersLimit(): Observable<void> {
		return this
		._apiService
		.call(
			`${this._endPoint}/check-members-limit`,
			'PUT'
		);
	}

	/**
	 * @param {string[]} roles
	 * @return {boolean}
	 */
	public hasRoles( roles: string[] ): boolean {
		if ( !this._storedUser ) return false;

		return	!!_.chain(
			this._storedUser.user.roles
		).map( 'uniqName' )
		.intersection( roles )
		.value().length;
	}

	/**
	 * @return {void}
	 */
	public clearStoredUser() {
		this.storedUser
			= this.users
			= this._isOwner
			= this._isAdmin
			= this._isAdministrator
			= undefined;
	}

	/**
	 * @return {boolean}
	 */
	public isOwner(): boolean {
		return this._isOwner;
	}

	/**
	 * @return {boolean}
	 */
	public isAdmin(): boolean {
		return this._isAdmin;
	}

	/**
	 * @return {boolean}
	 */
	public isAdministrator(): boolean {
		return this._isAdministrator;
	}

	/**
	 * @param {CUBMemberStatus[]} availableStatus
	 * @return {IUser[]}
	 */
	private _redoUsers( availableStatus: CUBMemberStatus[] ): IUser[] {
		return availableStatus
			? _.filter(
				this.users,
				( user: IUser ) => _.includes( availableStatus, user.status )
			)
			: _.cloneDeep( this.users );
	}

}
