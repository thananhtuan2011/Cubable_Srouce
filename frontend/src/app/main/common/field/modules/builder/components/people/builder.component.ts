import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject
} from '@angular/core';
import {
	FormBuilder,
	FormGroup
} from '@angular/forms';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	finalize,
	forkJoin
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	ITeam
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/interfaces';
import {
	TeamService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/services';
import {
	IUser,
	IUserData
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';

import {
	CUBTMember,
	CUBMemberData
} from '@cub/material/member-picker';

import {
	PeopleTypeConfig,
	PeopleData
} from '../../../../interfaces';
import {
	PeopleField
} from '../../../../objects';

import {
	FieldBuilder
} from '../builder';

type IPeopleConfig = {
	id: number;
	label: string;
};

@Unsubscriber()
@Component({
	selector: 'people-field-builder',
	templateUrl: './builder.pug',
	styleUrls: [ '../builder.scss' ],
	host: { class: 'people-field-builder' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeopleFieldBuilderComponent
	extends FieldBuilder<PeopleField>
	implements OnInit {

	public readonly PEOPLE_TYPE_CONFIG: typeof PeopleTypeConfig
		= PeopleTypeConfig;

	public loaded: boolean;
	public userID: ULID;
	public fieldForm: FormGroup;
	public internalField: PeopleField;
	public peopleConfigInclude: IPeopleConfig[];
	public peopleConfigExclude: IPeopleConfig[];
	public includeUsers: IUser[];
	public excludeUsers: IUser[];
	public includeTeams: ITeam[];
	public excludeTeams: ITeam[];
	public selectedIncludeUserIDs: ULID[];
	public selectedIncludeTeamIDs: ULID[];
	public selectedExcludeUserIDs: ULID[];
	public selectedExcludeTeamIDs: ULID[];

	public initialUsers: IUser[];
	public selectedInitialUserIDs: ULID[];

	private readonly _fb: FormBuilder
		= inject( FormBuilder );

	private _users: IUser[];

	private _translateService: TranslateService
		= inject( TranslateService );
	private _userService: UserService
		= inject( UserService );
	private _teamService: TeamService
		= inject( TeamService );

	/**
	 * @constructor
	 */
	override ngOnInit() {
		super.ngOnInit();

		this._init();

		this._userService.storedUserChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe(( userData: IUserData ) => {
			this.userID = userData.user.id;
		} );

		this.fieldForm = this._fb.group({
			includeSetting	: undefined,
			excludeSetting	: undefined,
			isNotifyAdded	: undefined,
			isMultipleSelect: undefined,
		});

		const peopleConfig: IPeopleConfig[] = [
			{
				id		: PeopleTypeConfig.CURRENT_VIEWER,
				label	: this._translateService.instant(
					'FIELD.BUILDER.LABEL.CURRENT_VIEWER' ),
			},
			{
				id		: PeopleTypeConfig.MEMBER_SAME_TEAM,
				label	: this._translateService.instant(
					'FIELD.BUILDER.LABEL.MEMBER_SAME_TEAM_WITH_VIEWER' ),
			},
			{
				id		: PeopleTypeConfig.INDIVIDUALS,
				label	: this._translateService.instant(
					'FIELD.BUILDER.LABEL.INDIVIDUALS' ),
			},
			{
				id		: PeopleTypeConfig.TEAM,
				label	: this._translateService.instant(
					'FIELD.BUILDER.LABEL.TEAM' ),
			},
		];

		this.peopleConfigInclude = [
			{
				id		: PeopleTypeConfig.ALL_WORKSPACE_MEMBER,
				label	: this._translateService.instant(
					'FIELD.BUILDER.LABEL.ALL_WORKSPACE_MEMBER' ),
			},
			...peopleConfig,
		];
		this.peopleConfigExclude = peopleConfig;

		forkJoin([
			this._userService.getAvailableUser(),
			this._teamService.getAvailableTeams(),
		])
		.pipe(
			finalize(() => {
				this.loaded = true;
				this.cdRef.markForCheck();
			}),
			untilCmpDestroyed( this )
		)
		.subscribe( ([ users, teams ]: [ IUser[], ITeam[] ] ) => {
			this.includeUsers = users;
			this.excludeUsers = users;
			this._users = users;

			this.includeTeams = teams as ITeam[];
			this.excludeTeams = teams as ITeam[];

			if ( this.internalField.includeSetting ) {
				this.onSettingsChange(
					this.internalField.includeSetting.type,
					true,
					true
				);

				if (
					this.internalField.includeSetting.type
					=== PeopleTypeConfig.INDIVIDUALS
				) {
					this.selectedIncludeUserIDs
						= this.internalField.includeSetting.value;
				}

				if (
					this.internalField.includeSetting.type
					=== PeopleTypeConfig.TEAM
				) {
					this.selectedIncludeTeamIDs
						= this.internalField.includeSetting.value;
				}
			}

			if (
				this.internalField.excludeSetting
			) {
				this.onSettingsChange(
					this.internalField.excludeSetting.type,
					false,
					true
				);

				if (
					this.internalField.excludeSetting.type
					=== PeopleTypeConfig.INDIVIDUALS
				) {
					this.selectedExcludeUserIDs
						= this.internalField.excludeSetting.value;
				}

				if (
					this.internalField.excludeSetting.type
					=== PeopleTypeConfig.TEAM
				) {
					this.selectedExcludeTeamIDs
						= this.internalField.excludeSetting.value;
				}
			}
		} );
	}

	/**
	 * @param {PeopleTypeConfig} event
	 * @param {boolean=} isIncludeSetting
	 * @param {boolean=} isFirstLoad
	 * @return {void}
	 */
	public onSettingsChange(
		event: PeopleTypeConfig,
		isIncludeSetting?: boolean,
		isFirstLoad?: boolean
	) {
		if ( isIncludeSetting ) {
			this.selectedIncludeUserIDs = [];
			this.selectedIncludeTeamIDs = [];

			this.internalField.includeSetting
				? this.internalField.includeSetting.type = event
				: this.internalField.includeSetting = { type: event };

			switch ( event ) {
				case PeopleTypeConfig.ALL_WORKSPACE_MEMBER:
					this.internalField.includeSetting.value
						= _.map( this._users, 'id' ) as string[];

					break;
				case PeopleTypeConfig.CURRENT_VIEWER:
					this.internalField.includeSetting.value = [ this.userID ];

					break;
				case PeopleTypeConfig.INDIVIDUALS:
				case PeopleTypeConfig.TEAM:
					isFirstLoad
						? this.internalField.includeSetting.value ||= []
						: this.internalField.includeSetting.value = [];

					break;
			}
		} else {
			this.selectedInitialUserIDs = [];
			this.selectedExcludeUserIDs = [];
			this.selectedExcludeTeamIDs = [];

			if ( !event ) {
				this.internalField.excludeSetting = null;
				return;
			}

			this.internalField.excludeSetting
				? this.internalField.excludeSetting.type = event
				: this.internalField.excludeSetting = { type: event };

			switch ( event ) {
				case PeopleTypeConfig.CURRENT_VIEWER:
					this.internalField.excludeSetting.value = [ this.userID ];

					break;
				case PeopleTypeConfig.INDIVIDUALS:
				case PeopleTypeConfig.TEAM:
					isFirstLoad
						? this.internalField.excludeSetting.value ||= []
						: this.internalField.excludeSetting.value = [];

					break;
			}
		}
	}

	/**
	 * @param {CUBMemberData<CUBTMember[]>} event
	 * @param {boolean} isInclude
	 * @return {void}
	 */
	public addUsers(
		event: CUBMemberData<CUBTMember[]>,
		isInclude: boolean
	) {
		if ( !event.users ) return;

		if ( isInclude ) {
			this.selectedIncludeUserIDs= _.concat(
				this.selectedIncludeUserIDs,
				_.map( event.users, 'id' )
			);
			this.internalField.includeSetting.value
				= _.chain( this.internalField.includeSetting.value )
				.concat( this.selectedIncludeUserIDs )
				.compact()
				.uniq()
				.value();
		} else {
			this.selectedExcludeUserIDs = _.concat(
				this.selectedExcludeUserIDs,
				_.map( event.users, 'id' )
			);
			this.internalField.excludeSetting.value
				= _.chain( this.internalField.excludeSetting.value )
				.concat( this.selectedExcludeUserIDs )
				.compact()
				.uniq()
				.value();
		}
	}

	/**
	 * @param {CUBMemberData<CUBTMember[]>} event
	 * @param {boolean} isInclude
	 * @return {void}
	 */
	public removeUsers(
		event: CUBMemberData<CUBTMember[]>,
		isInclude: boolean
	) {
		if ( !event.users ) return;

		if ( isInclude ) {
			const includeUsersRemove: ObjectType<{ id: ULID }> = _.keyBy( event.users, 'id' );

			_.forEach(
				this.internalField.includeSetting.value,
				( id: ULID, index: number ) => {
					if ( includeUsersRemove[ id ] ) {
						_.pullAt(
							this.internalField.includeSetting.value,
							index
						);
						_.pullAt(
							this.selectedIncludeUserIDs,
							index
						);
					}
				} );
		} else {
			const excludeUsersRemove: ObjectType<{ id: ULID }>
				= _.keyBy( event.users, 'id' );

			_.forEach(
				this.internalField.excludeSetting.value,
				( id: ULID, index: number ) => {
					if ( excludeUsersRemove[ id ] ) {
						_.pullAt(
							this.internalField.excludeSetting.value,
							index
						);
						_.pullAt(
							this.selectedExcludeUserIDs,
							index
						);
					}
				} );
		}
	}

	/**
	 * @param {CUBMemberData<CUBTMember[]>} event
	 * @param {boolean} isIncludeSetting
	 * @return {void}
	 */
	public addTeams(
		event: CUBMemberData<CUBTMember[]>,
		isIncludeSetting: boolean
	) {
		if ( !event.teams ) return;

		this.selectedIncludeTeamIDs ||= [];
		this.selectedExcludeTeamIDs ||= [];

		if ( isIncludeSetting ) {
			this.selectedIncludeTeamIDs = _.concat(
				this.selectedIncludeTeamIDs,
				_.map( event.teams, 'id' ) as string[]
			);
			this.internalField.includeSetting.value
				= _.cloneDeep( this.selectedIncludeTeamIDs );
		} else {
			this.selectedExcludeTeamIDs = _.concat(
				this.selectedExcludeTeamIDs,
				_.map( event.teams, 'id' ) as string[]
			);
			this.internalField.excludeSetting.value =
				_.cloneDeep( this.selectedExcludeTeamIDs );
		}
	}

	/**
	 * @param {CUBMemberData<CUBTMember[]>} event
	 * @param {boolean} isInclude
	 * @return {void}
	 */
	public removeTeams(
		event: CUBMemberData<CUBTMember[]>,
		isInclude: boolean
	) {
		if ( !event ) return;

		if ( isInclude ) {
			_.forEach(
				_.map( event.teams, 'id' ),
				( id: ULID ) => {
					this.internalField.includeSetting.value
						= _.filter(
							this.selectedIncludeTeamIDs,
							( _id: ULID ) => _id !== id );
					this.selectedIncludeTeamIDs
						= _.cloneDeep(
							this.internalField.includeSetting.value
						);
				});
		} else {
			_.forEach(
				_.map( event.teams, 'id' ),
				( id: ULID ) => {
					this.internalField.excludeSetting.value
						= _.filter(
							this.selectedExcludeTeamIDs,
							( _id: ULID ) => _id !== id
						);
					this.selectedExcludeTeamIDs
						= _.cloneDeep(
							this.internalField.excludeSetting.value
						);
				});
		}
	}

	/**
	 * @param {CUBMemberData<CUBTMember[]>} event
	 * @return {void}
	 */
	public addInitialUsers(
		event: CUBMemberData<CUBTMember[]>
	) {
		this.selectedInitialUserIDs = _.compact(
			_.concat(
				this.selectedInitialUserIDs,
				_.map( event.users, 'id' ) as string[] )
		);
		this.onInitialDataChanged({
			value: this.selectedInitialUserIDs,
			selected: _.filter(
				this.initialUsers,
				( user: IUser ) =>
					_.includes(
						this.selectedInitialUserIDs,
						user.id
					)
			),
		});
	}

	public override onInitialDataChanged(
		initialData: PeopleData
	) {
		this.initialData = initialData;

		super.onInitialDataChanged( this.initialData );
	}

	/**
	 * @param {CUBMemberData<CUBTMember[]>} event
	 * @return {void}
	 */
	public removeInitialUsers(
		event: CUBMemberData<CUBTMember[]>
	) {
		const includeUsersRemove: ObjectType<{ id: ULID }>
			= _.keyBy( event.users, 'id' );

		_.forEach(
			this.internalField.includeSetting.value,
			( id: ULID, index: number ) => {
				if ( includeUsersRemove[ id ] ) {
					_.pullAt(
						this.internalField.includeSetting.value,
						index
					);
					_.pullAt(
						this.selectedInitialUserIDs,
						index
					);
				}
			} );

		if ( this.selectedInitialUserIDs?.length > 0 ) {
			this.onInitialDataChanged({
				value: this.selectedInitialUserIDs,
				selected: _.filter(
					this.initialUsers,
					( user: IUser ) =>
						_.includes(
							this.selectedInitialUserIDs,
							user.id
						)
				),
			});
		} else {
			this.onInitialDataChanged( null );
		}
	}

	/**
	 * @return {void}
	 */
	public checkMultipleOption() {
		if (
			this.selectedInitialUserIDs?.length > 0
			&& !this.internalField.isMultipleSelect
		) {
			this.onInitialDataChanged({
				value: [
					this.internalField.initialData.value[ 0 ],
				],
				selected: [
					this.internalField.initialData.selected[ 0 ],
				],
			});

			this.selectedInitialUserIDs = this.internalField.initialData.value;
		}
	}

	/**
	 * @param {number} index
	 * @return {void}
	 */
	public onTabChange(
		index: number
	) {
		if ( index === 1 ) {
			this._userService
			.getUsersFromPeopleField(
				_.pick(
					this.internalField,
					'includeSetting',
					'excludeSetting'
				)
			)
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: ( users: IUser[] ) => {
					const availableIDs: ULID[] = _.map( users, 'id' );
					const availableUserIDs: { id: ULID }[]
						= _.map(
							availableIDs,
							( id: ULID ) => ({ id })
						);
					const idsObject: ObjectType<{ id: ULID }>
						= _.keyBy( availableUserIDs, 'id' );

					this.initialUsers
						= _.filter(
							_.cloneDeep( this._users ),
							( user: IUser ) =>
								idsObject[ user.id ] ) as IUser[];
					this.selectedInitialUserIDs
						= _.intersection(
							this.selectedInitialUserIDs,
							availableIDs
						);

					this.checkMultipleOption();
					this.cdRef.markForCheck();
				},
			});
		}
	}

	/**
	 * @return {void}
	 */
	private _init() {
		if ( this.internalField.includeSetting ) {
			this.selectedIncludeUserIDs
				= this.internalField.includeSetting.value;
		}

		if ( this.internalField.excludeSetting ) {
			this.selectedExcludeTeamIDs
				= this.internalField.excludeSetting.value;
		}

		if ( this.internalField.initialData ) {
			this.selectedInitialUserIDs
				= this.internalField.initialData.value;
		}
	}
}
