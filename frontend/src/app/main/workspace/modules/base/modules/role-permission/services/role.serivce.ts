import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Observer } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ULID } from 'ulidx';
import _ from 'lodash';

import { IUser } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import { ITeam } from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/interfaces';
import { WorkspaceApiService } from '@main/workspace/services';

import { IBase } from '../../../interfaces';

import { IRole, UpdateRoleMember, RoleCreate, RoleUpdate } from '../interfaces';
import { CONSTANT } from '../resources';

@Injectable()
export class RoleService {

	private readonly _endPoint: string = '/api/base-role';
	private readonly _apiService: WorkspaceApiService = inject( WorkspaceApiService );

	private _roles: Record<IBase[ 'id' ], IRole[]>;

	get roles(): Record<IBase[ 'id' ], IRole[]> { return this._roles || {}; }
	set roles( data: Record<IBase[ 'id' ], IRole[]> ) { this._roles = { ...this._roles, ...data }; }

	/**
	 * @constructor
	 * @param {TranslateService} _translateService
	 */
	constructor( private _translateService: TranslateService ) {}

	/**
	 * @return {IRole[]}
	 */
	public getDefaultRoles(): IRole[] {
		return [
			{
				name		: this._translateService.instant( 'BASE.ROLE_PERMISSION.LABEL.VIEWER' ),
				uniqName	: CONSTANT.ROLE_UNIQ_NAME.VIEWER,
				description	: this._translateService.instant( 'BASE.ROLE_PERMISSION.LABEL.VIEWER_DESCRIPTION' ),
			},
			{
				name		: this._translateService.instant( 'BASE.ROLE_PERMISSION.LABEL.MEMBER' ),
				uniqName	: CONSTANT.ROLE_UNIQ_NAME.MEMBER,
				description	: this._translateService.instant( 'BASE.ROLE_PERMISSION.LABEL.MEMBER_DESCRIPTION' ),
			},
			{
				name		: this._translateService.instant( 'BASE.ROLE_PERMISSION.LABEL.ADMIN' ),
				uniqName	: CONSTANT.ROLE_UNIQ_NAME.ADMIN,
				description	: this._translateService.instant( 'BASE.ROLE_PERMISSION.LABEL.ADMIN_DESCRIPTION' ),
			},
		] as IRole[];
	}

	/**
	 * @param {ULID} baseID
	 * @param {boolean=} forceReload
	 * @return {Observable}
	 */
	public get( baseID: ULID, forceReload?: boolean ): Observable<IRole[]> {
		if ( this.roles[ baseID ]?.length && !forceReload ) {
			return new Observable( ( observer: Observer<IRole[]> ) => {
				observer.next( _.cloneDeep( this.roles[ baseID ] ) );
				observer.complete();
			} );
		}

		return this._apiService
		.call( `${this._endPoint}/list`, 'GET', { baseID } )
		.pipe( map( ( roles: IRole[] ) => {
			this.roles = { [ baseID ]: _.isArray( roles ) ? roles: [] };

			return _.cloneDeep( this.roles[ baseID ] );
		} ) );
	}

	/**
	 * @param {RoleCreate} data
	 * @return {Observable}
	 */
	public create( data: RoleCreate ): Observable<IRole> {
		return this._apiService
		.call( `${this._endPoint}/create`, 'POST', data )
		.pipe( tap( ( role: IRole ) => this.roles = { [ data.baseID ]: [ ...this.roles[ data.baseID ], { ...data, ...role } ] } ) );
	}

	/**
	 * @param {ULID} roleID
	 * @param {RoleUpdate} data
	 * @return {void}
	 */
	public update( roleID: ULID, data: RoleUpdate ): Observable<void> {
		return this._apiService.call( `${this._endPoint}/update/${roleID}`, 'PUT', data );
	}

	/**
	 * @param {ULID} id
	 * @param {ULID} baseID
	 * @return {Observable}
	 */
	public delete( id: ULID, baseID: ULID ): Observable<void> {
		return this._apiService
		.call( `${this._endPoint}/delete/${id}`, 'DELETE' )
		.pipe( tap( () => {
			const roles: IRole[] = _.filter( this.roles[ baseID ], ( role: IRole ) => role.id !== id );

			this.roles = { [ baseID ]: roles };
		} ) );
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public availableUser( roleID: ULID ): Observable<IUser[]> {
		return this._apiService.call( `${this._endPoint}/available-user/${roleID}`, 'GET' );
	}

	/**
	 * @param {ULID} roleID
	 * @return {Observable}
	 */
	public availableTeam( roleID: ULID ): Observable<ITeam[]> {
		return this._apiService.call( `${this._endPoint}/available-team/${roleID}`, 'GET' );
	}

	/**
	 * @param {ULID} roleID
	 * @return {Observable}
	 */
	public getBaseRoleDetail( roleID: ULID ): Observable<IRole> {
		return this._apiService.call( `${this._endPoint}/detail/${roleID}`, 'GET' );
	}

	/**
	 * @param {ULID} roleID
	 * @param {UpdateRoleMember} data
	 * @return {void}
	 */
	public inviteMember( roleID: ULID, data: UpdateRoleMember ): Observable<void> {
		return this._apiService.call( `${this._endPoint}/invite-users-teams/${roleID}`, 'PUT', data );
	}

	/**
	 * @param {ULID} roleID
	 * @param {UpdateRoleMember} data
	 * @return {void}
	 */
	public removeMember( roleID: ULID, data: UpdateRoleMember ): Observable<void> {
		return this._apiService.call( `${this._endPoint}/remove-users-teams/${roleID}`, 'PUT', data );
	}

}
