import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable,
	Observer,
	Subject
} from 'rxjs';
import {
	map
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	CUBMember
} from '@cub/material/member-picker';

import {
	WorkspaceApiService
} from '@main/workspace/services';

import {
	TeamDataUpdate,
	ITeam
} from '../interfaces';
import {
	CONSTANT
} from '../resources';

@Injectable()
export class TeamService {

	public readonly FIELD_ID: typeof CONSTANT.FIELD_ID
		= CONSTANT.FIELD_ID;

	public teamChange$: Subject<void>
		= new Subject<void>();

	private readonly _endPoint: string = '/api/team';

	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	private _teams: ITeam[];

	get teams(): ITeam[] {
		return this._teams;
	}
	set teams( teams: ITeam[] ) {
		this._teams = teams;
	};

	/**
	 * @return {Observable}
	 */
	public getTeams(): Observable<ITeam[]> {
		return this
		._apiService
		.call(
			`${this._endPoint}/list`,
			'GET'
		)
		.pipe(
			map(
				( teams: ITeam[] ): ITeam[] => {
					return this._initTeams( teams );
				}
			)
		);
	}

	/**
	 * @param {boolean=} isActive
	 * @param {boolean=} forceReload
	 * @return {Observable}
	 */
	public getAvailableTeams(
		isActive?: boolean,
		forceReload?: boolean
	): Observable<ITeam[]> {
		if ( !_.isNil( this.teams?.length ) && !forceReload ) {
			return new Observable( ( observer: Observer<ITeam[]> ) => {
				observer.next( this._redoTeams( isActive ) );
				observer.complete();
			} );
		}

		return this._apiService
		.call(
			`${this._endPoint}/resources`,
			'GET',
			_.isBoolean( isActive ) ? { isActive } : {}
		)
		.pipe( map( ( teams: ITeam[] ) => {
			this.teams = _.isArray( teams ) ? teams : [];

			return this._redoTeams( isActive );
		} ) );
	}

	/**
	 * @return {Observable}
	 */
	public getActiveTeams(): Observable<ITeam[]> {
		return new Observable(
			( observer: Observer<ITeam[]> ) => {
				observer.next( this._redoTeams( true ) );
				observer.complete();
			}
		);
	}

	/**
	 * @return {Observable}
	 */
	public getInactiveTeams(): Observable<ITeam[]> {
		return new Observable(
			( observer: Observer<ITeam[]> ) => {
				observer.next( this._redoTeams( false ) );
				observer.complete();
			}
		);
	}

	/**
	 * @param {TeamDataUpdate} data
	 * @return {Observable}
	 */
	public create( data: TeamDataUpdate ) {
		return this._apiService.call(
			`${this._endPoint}/create`,
			'POST',
			data
		);
	}

	/**
	 * @param {TeamDataUpdate} data
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public edit( id: ULID, data: TeamDataUpdate ) {
		return this._apiService.call(
			`${this._endPoint}/edit/${id}`,
			'PUT',
			data
		);
	}

	/**
	 * @param {ULID} id
	 * @return {Observable}
	 */
	public delete( id: ULID ): Observable<void> {
		return this._apiService.call(
			`${this._endPoint}/remove/${id}`,
			'DELETE'
		);
	}

	/**
	 * @param {boolean} isActive
	 * @return {ITeam[]}
	 */
	private _redoTeams( isActive: boolean ): ITeam[] {
		return this._initTeams(
			_.isBoolean( isActive )
				? _.filter(
					this.teams,
					( team: ITeam ) => team.isActive === isActive
				)
				: this.teams
		);
	}

	/**
	 * @param {ITeam[]} teams
	 * @return {ITeam[]}
	 */
	private _initTeams(
		teams: ITeam[]
	): ITeam[] {
		return _.map(
			teams,
			( team: ITeam ) => {
				team.status
					= team.isActive
						? CUBMember.MEMBER_STATUS.ACTIVE
						: CUBMember.MEMBER_STATUS.INACTIVE;

				return team;
			}
		);
	}

}
