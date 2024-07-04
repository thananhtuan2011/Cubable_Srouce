/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/naming-convention */
import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	OnChanges,
	inject,
	SimpleChanges
} from '@angular/core';
import {
	DomSanitizer
} from '@angular/platform-browser';
import {
	TranslateService
} from '@ngx-translate/core';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';
import {
	forkJoin
} from 'rxjs';
import { QuillOptions } from 'quill';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	COLOR
} from '@resources';

import {
	AvatarType,
	CUBBasicEditorComponent,
	CUBBasicEditorContent,
	CUBTMember,
	TypeOfMember
} from '@cub/material';
import TagModule from '@cub/material/editor/basic-editor/modules/tag/module';

import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	DataType,
	ReferenceItemsByView
} from '@main/common/field/interfaces';
import {
	IUser, IUserFieldExtra
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/interfaces';
import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	ITeam
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/interfaces';
import {
	TeamService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/team/services';
import {
	FIELD_METADATA
} from '@main/common/field/resources';

import {
	findBoardId
} from '../../../../../helpers';

import {
	NotifySetting
} from '../interfaces';
import {
	ContentMenuState,
	ReceiverType,
	RowActionType
} from '../resources';

import {
	ActionBase
} from './action-base';

type BoardFieldExtra = BoardField & {
	isAdded?: boolean;
};

type CUBTMemberExtend = CUBTMember & {
	memberType: ReceiverType;
	dataType?: DataType;
};

@Unsubscriber()
@Component({
	selector		: 'notify',
	templateUrl		: '../templates/notify.pug',
	styleUrls		: [ '../styles/notify.scss' ],
	host			: { class: 'notify' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class NotifyComponent
	extends ActionBase
	implements OnInit, OnChanges {

	@ViewChild( 'subject' )
	private _subjectComp: CUBBasicEditorComponent;
	@ViewChild( 'message' )
	private _messageComp: CUBBasicEditorComponent;

	@Input() public baseID: ULID;
	@Input() public settings: NotifySetting;

	@Output() public settingsChange: EventEmitter<NotifySetting>
		= new EventEmitter<NotifySetting>();

	public isMessageChange: boolean;

	protected readonly ROW_ACTION_TYPE: typeof RowActionType
		= RowActionType;
	protected readonly DATA_TYPE: typeof DataType
		= DataType;
	protected readonly RECEIVER_TYPE: typeof ReceiverType
		= ReceiverType;
	protected readonly CONTENT_MENU_STATE: typeof ContentMenuState
		= ContentMenuState;
	protected readonly TYPE_OF_MEMBER: typeof TypeOfMember
		= TypeOfMember;
	protected readonly AVATAR_TYPE: typeof AvatarType
		= AvatarType;

	protected isExistBoardID: boolean = true;
	protected isEmptyFirst: boolean = true;
	protected isSearched: boolean = true;
	protected isReceiversChange: boolean;
	protected isSubjectChange: boolean;
	protected selectedAllMembers: boolean;
	protected keySearch: string;
	protected textSubject: string;
	protected textMessage: string;
	protected userFields: IUserFieldExtra[];
	protected optionAll: CUBTMemberExtend;
	protected users: IUser[];
	protected teams: ITeam[];
	protected selectedUserIDs: ULID[];
	protected selectedTeamIDs: ULID[];
	protected fields: BoardFieldExtra[];
	protected fieldsMap: Map<ULID, BoardFieldExtra>;
	protected recordItems: ReferenceItemsByView[];
	protected receiverMenuState: ReceiverType;
	protected messageMenuState: ContentMenuState;
	protected members: CUBTMemberExtend[];
	protected options: QuillOptions;
	protected subjectContent: CUBBasicEditorContent;
	protected messageContent: CUBBasicEditorContent;

	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _teamService: TeamService
		= inject( TeamService );
	private readonly _domSanitizer: DomSanitizer
		= inject( DomSanitizer );
	private readonly _translateService: TranslateService
		= inject( TranslateService );

	private _fieldsBK: BoardFieldExtra[];
	private _allFieldsBK: BoardFieldExtra[];
	private _usersBK: IUser[];
	private _teamsBK: ITeam[];

	constructor() {
		super();

		this.options = {
			modules: {
				[ TagModule.moduleName ]: {
					spaceAfterInsert: false,
				},
			},
		};
	}

	ngOnInit() {
		if (
			this.settings.subject?.length
			&& this.settings.message?.length
		) {
			this._getRawText();
		}

		this._loadFieldsOfUser();
		this.loadData();
	}

	ngOnChanges( changes: SimpleChanges ) {
		if (
			changes.settings?.currentValue
		) {
			this.subjectContent
				= this.settings.metadata?.subject;
			this.messageContent
				= this.settings.metadata?.message;
		}
	}

	/**
	 * @return {void}
	 */
	public markMessageDirty() {
		this._messageComp.focus();
		this._messageComp.blur();
	}

	/**
	 * @return {void}
	 */
	protected onSubjectContentChange() {
		this.isSubjectChange = true;

		this._setSubjectValue();
		this._emitSettings();
	}

	/**
	 * @return {void}
	 */
	protected onMessageContentChange() {
		this._setMessageValue();
		this._emitSettings();
	}

	/**
	 * @return {void}
	 */
	protected clearMembers() {
		this.members = [];
		this.selectedUserIDs = [];
		this.selectedTeamIDs = [];
		this.selectedAllMembers = false;

		this.settings.receivers = null;

		this._emitSettings();
	}

	/**
	 * @param {number} index
	 * @param {CUBTMember} member
	 * @return {void}
	 */
	protected clearMember( index: number, member: CUBTMemberExtend ) {
		setTimeout(() => {
			this.members.splice( index, 1 );

			switch ( member?.type ) {
				case TypeOfMember.ALL:
					this.selectedAllMembers
						= false;

					this.settings.receivers.baseID
						= null;

					break;
				case TypeOfMember.USER:
					_.pull( this.selectedUserIDs, member.id );

					this.settings.receivers.userIDs
						= this.selectedUserIDs;

					break;
				case TypeOfMember.TEAM:
					_.pull( this.selectedTeamIDs, member.id );

					this.settings.receivers.teamIDs
						= this.selectedTeamIDs;

					break;
			}

			if ( member.memberType === ReceiverType.FIELD ) {
				_.forEach( this.fields, ( bf: BoardFieldExtra ) => {
					if ( bf.id === member.id ) {
						bf.isAdded = false;
					}
				} );

				_.pull(
					this.settings.receivers.fieldIDs,
					member.id
				);
			}

			this._emitSettings();
		});
	}

	/**
	 * @param {CUBTMember} users
	 * @return {void}
	 */
	protected addedUserIDs( ids: ULID[] ) {
		this.selectedUserIDs ||= [];
		this.members ||= [];

		const id: ULID
			= _.difference( ids, this.selectedUserIDs )?.[ 0 ];

		if ( !id ) return;

		const addedUser: IUser
			= _.find( this.users, { id } );

		this.members.push({
			...addedUser,
			type: TypeOfMember.USER,
			memberType: ReceiverType.PEOPLE,
		});

		this.selectedUserIDs.push( id );

		this.settings.receivers ||= {};
		this.settings.receivers.userIDs
			= this.selectedUserIDs;

		this._emitSettings();
	}

	/**
	 * @param {ULID[]} ids
	 * @return {void}
	 */
	protected addedTeamIDs( ids: ULID[] ) {
		this.selectedTeamIDs ||= [];
		this.members ||= [];

		const id: ULID
			= _.difference( ids, this.selectedTeamIDs )?.[ 0 ];

		if ( !id ) return;

		const addedTeam: ITeam
			= _.find( this.teams, { id } );

		this.members.push({
			...addedTeam,
			type: TypeOfMember.TEAM,
			memberType: ReceiverType.PEOPLE,
		});

		this.selectedTeamIDs.push( id );

		this.settings.receivers ||= {};
		this.settings.receivers.teamIDs
			= this.selectedTeamIDs;

		this._emitSettings();
	}

	/**
	 * @return {void}
	 */
	protected onAddedOptionAll() {
		this.members ||= [];
		this.members.push( this.optionAll );
		this.selectedAllMembers
			= true;

		this.settings.receivers ||= {};
		this.settings.receivers.baseID
			= this.baseID;

		this._emitSettings();
	}

	/**
	 * @param {string} keySearch
	 * @param {boolean} isMessage
	 * @param {boolean=} isField
	 * @return {void}
	 */
	protected onMessageSearching(
		keySearch: string,
		isMessage: boolean,
		isField?: boolean
	) {
		this.keySearch
			= keySearch;

		// Message
		if ( isMessage ) {
			if ( isField ) {
				this._searchFieldOfMessage();
			} else {
				// TODO
			}

		// Subject
		} else {
			if ( isField ) {
				this._searchFieldOfMessage();
			} else {
				// TODO
			}
		}
	}

	/**
	 * @param {string} keySearch
	 * @param {boolean=} isPeople
	 * @return {void}
	 */
	protected onSearching( keySearch: string, isPeople?: boolean ) {
		this.keySearch
			= keySearch;

		if ( isPeople ) {
			this.users = _.filter(
				this._usersBK,
				( user: IUser ) => {
					return _.search( user.name, this.keySearch )
						&& !_.includes( this.selectedUserIDs, user.id );
				}
			);

			this.teams = _.filter(
				this._teamsBK,
				( team: ITeam ) => {
					return _.search( team.name, this.keySearch )
						&& !_.includes( this.selectedTeamIDs, team.id );
				}
			);

			if ( this.keySearch ) {
				if ( !this.selectedAllMembers
					&& _.search(
						this._translateService.instant(
							'BASE.WORKFLOW.SETUP.ACTION.LABEL.ALL'
						),
						this.keySearch
					)
				) {
					this._setOptionAll();
				} else {
					this.optionAll
						= null;
				}
			} else {
				this._setOptionAll();
			}

			this._cdRef.detectChanges();
		} else {
			if ( !this.keySearch ) {
				this.fields
					= this._getReceiverFields( this._fieldsBK );
			} else {
				const fields: BoardFieldExtra[] = _.filter(
					this._fieldsBK,
					( field: BoardFieldExtra ) => {
						return _.search( field.name, this.keySearch )
							&& !_.includes( this.settings.receivers?.fieldIDs, field.id );
					}
				);

				this.fields = _.cloneDeep( fields );
			}

			this._cdRef.detectChanges();
		}
	}

	/**
	 * @return {void}
	 */
	protected loadData() {
		const boardID: ULID
			= findBoardId( this.blockSetup );

		if ( !boardID ) {
			this.isExistBoardID = false;
		} else {
			this._initData( boardID );

			this.isExistBoardID = true;
		}
	}

	/**
	 * @return {void}
	 */
	protected onRowChange() {
		this._emitSettings();
	}

	/**
	 * @param {BoardFieldExtra} bf
	 * @return {void}
	 */
	protected addReceiverFieldID( bf: BoardFieldExtra ) {
		bf.isAdded = true;

		this.members ||= [];
		this.members.push({
			id: bf.id,
			name: bf.name,
			dataType: bf.dataType,
			memberType: ReceiverType.FIELD,
		});

		this.settings.receivers ||= {};
		this.settings.receivers.fieldIDs ||= [];

		this.settings.receivers.fieldIDs
		.push( bf.id );

		this._emitSettings();
	}

	/**
	 * @param {boolean} isMessage
	 * @param {BoardFieldExtra} bf
	 * @return {void}
	 */
	protected addFieldID(
		isMessage: boolean,
		bf: BoardFieldExtra
	) {
		if ( isMessage ) {
			this
			._messageComp
			.insertTag(
				{
					tag: `#{board_field_${bf.id}}`,
					name: bf.name,
					icon: FIELD_METADATA.get( bf.dataType )?.icon,
					buttonRemove: true,
				}
			);
		} else {
			this
			._subjectComp
			.insertTag(
				{
					tag: `#{board_field_${bf.id}}`,
					name: bf.name,
					icon: FIELD_METADATA.get( bf.dataType )?.icon,
					buttonRemove: true,
				}
			);
		}
	}

	/**
	 * @param {boolean} isMessage
	 * @param {BoardFieldExtra} uf
	 * @return {void}
	 */
	protected addUserFieldID(
		_isMessage: boolean,
		_uf: IUserFieldExtra
	) {
		this._emitSettings();
	}

	/**
	 * @return {void}
	 */
	protected resetField() {
		this.onSearching( null );

		this.fields
			= this._getReceiverFields( this._fieldsBK );
	}

	/**
	 * @return {void}
	 */
	protected resetPeople() {
		this.onSearching( null, true );

		this.users
			= _.cloneDeep( this._usersBK );
		this.teams
			= _.cloneDeep( this._teamsBK );
	}

	/**
	 * @return {void}
	 */
	protected onReceiverMenuOpened() {
		this.resetPeople();
		this.resetField();

		this._checkFieldIdValid();

		this._cdRef.markForCheck();
	}

	// /**
	//  * @return {void}
	//  */
	// protected resetContentUserField( isMessage ) {
	// 	this.onMessageSearching( null, isMessage );
	// 	this.userFields = _.cloneDeep( this._userFields );
	// }

	/**
	 * @param {boolean=} isMessage
	 * @return {void}
	 */
	protected resetMessageField( isMessage?: boolean ) {
		this.onMessageSearching( null, isMessage, true );

		this.fields
			= _.cloneDeep( this._allFieldsBK );
	}

	/**
	 * @return {void}
	 */
	protected onMessageMenuOpened( isMessage?: boolean ) {
		this.resetMessageField( isMessage );
		// this.resetMessageUserField( isMessage );
	}

	/**
	 * @param {boolean=} isMessage
	 * @return {void}
	 */
	protected onMessageMenuClosed( isMessage?: boolean ) {
		this.messageMenuState = null;

		if ( !isMessage ) {
			this.isSubjectChange = true;
			return;
		}

		this._messageComp.focus();
	}

	/**
	 * @param {ULID} boardID
	 * @return {void}
	 */
	protected _initData( boardID: ULID ) {
		this.selectedUserIDs = this.settings.receivers?.userIDs || [];
		this.selectedTeamIDs = this.settings.receivers?.teamIDs || [];
		this.members ||= [];

		forkJoin([
			this._userService.getAvailableUser(),
			this._teamService.getAvailableTeams(),
			this._boardFieldService.get( boardID ),
		])
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( ( [ users, teams, fields ]: [ IUser[], ITeam[], BoardField[] ] ) => {
			// Users
			const usersMap: Map<ULID, IUser>
				= new Map(
					Object.entries(
						_.keyBy(
							users,
							( user: IUser ) => { return user.id; }
						)
					)
				);

			this.users
				= users;
			this._usersBK
				= users;
			this.selectedUserIDs
				= this.settings.receivers?.userIDs || null;

			if ( this.selectedUserIDs ) {
				_.forEach( this.selectedUserIDs, ( id: ULID ) => {
					if ( !usersMap.has( id ) ) return;

					this.members.push({
						...usersMap.get( id ),
						type: TypeOfMember.USER,
						memberType: ReceiverType.PEOPLE,
					});
				} );
			}

			// Teams
			const teamsMap: Map<ULID, ITeam>
				= new Map(
					Object.entries(
						_.keyBy(
							teams,
							( team: ITeam ) => { return team.id; }
						)
					)
				);

			this.teams
				= teams;
			this._teamsBK
				= teams;
			this.selectedTeamIDs
				= this.settings.receivers?.teamIDs || null;

			if ( this.selectedTeamIDs ) {
				_.forEach( this.selectedTeamIDs, ( id: ULID ) => {
					if ( !teamsMap.has( id ) ) return;

					this.members.push({
						..._.find( this.teams, { id } ),
						type: TypeOfMember.TEAM,
						memberType: ReceiverType.PEOPLE,
					});
				});
			}

			// Option All
			this._setOptionAll();
			this.selectedAllMembers
				= !!this.settings.receivers?.baseID;

			if ( this.selectedAllMembers ) {
				this.members.push( this.optionAll );
			}

			// Fields
			this._allFieldsBK
				= _.cloneDeep( fields );
			fields
				= _.filter( fields, ( field: BoardField ) => {
					return field.dataType === DataType.People;
				} );
			this.fields = this._getReceiverFields( fields );
			this._fieldsBK = _.cloneDeep( this.fields );
			;

			_.forEach( this.fields, ( field: BoardFieldExtra ) => {
				if ( !field.isAdded ) return;

				this.members.push({
					id: field.id,
					name: field.name,
					dataType: field.dataType,
					memberType: ReceiverType.FIELD,
				});
			});

			this._cdRef.markForCheck();
		} );
	}

	/**
	 * @return {void}
	 */
	private _setOptionAll() {
		this.optionAll
			= {
				id: this.baseID,
				name: this._translateService.instant(
					'BASE.WORKFLOW.SETUP.ACTION.LABEL.ALL'
				),
				avatar: {
					color: '#fdb022',
					label: {
						text: 'ALL',
						color: COLOR.WHITE,
					},
				},
				type: TypeOfMember.ALL,
				memberType: ReceiverType.PEOPLE,
			};
	}

	/**
	 * @return {void}
	 */
	private _setSubjectValue() {
		const content: CUBBasicEditorContent
			= this._subjectComp.parse();

		this.settings.subject
			= content.html;
		this.settings.rawSubject
			= content.text;
		this.settings.metadata
			||= {};
		this.settings.metadata.subject
			= content;
	}

	/**
	 * @return {void}
	 */
	private _setMessageValue() {
		const content: CUBBasicEditorContent
			= this._messageComp.parse();

		this.settings.message
			= content.html;
		this.settings.metadata
			||= {};
		this.settings.metadata.message
			= content;
	}

	/**
	 * @return {void}
	 */
	private _loadFieldsOfUser() {
		return;
		this._userService
		.getFields()
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( userFields: IUserFieldExtra[] ) => {
				this.userFields = userFields;
			},
		});
	}

	/**
	 * @param {BoardFieldExtra[]} fields
	 * @return {void}
	 */
	private _getReceiverFields( fields: BoardFieldExtra[] ) {
		let results: BoardFieldExtra[];

		_.forEach( fields, ( bf: BoardField ) => {
			const isExist: boolean
				= !!_.find(
					this.settings.receivers?.fieldIDs,
					( id: ULID ) => {
						return id === bf.id;
					}
				);

			results ||= [];

			results.push(
				{
					...bf,
					isAdded: isExist,
				}
			);
		} );

		return results;
	}

	/**
	 * @return {void}
	 */
	private _emitSettings() {
		this.settings.subject
			= ( this._domSanitizer.bypassSecurityTrustHtml(
				this.settings.subject
			) as any ).changingThisBreaksApplicationSecurity;

		this.settings.message
			= ( this._domSanitizer.bypassSecurityTrustHtml(
				this.settings.message
			) as any ).changingThisBreaksApplicationSecurity;

		this.settingsChange.emit( this.settings );

		this._getRawText();
	}

	/**
	 * @return {void}
	 */
	private _checkFieldIdValid() {
		if (
			this.settings.receivers?.fieldIDs?.length
			&& !_.some( this.fields, [ 'isAdded', true ] )
		) {
			this.settings.receivers.fieldIDs = [];
		}
	}

	/**
	 * @return {void}
	 */
	private _getRawText() {
		this.textSubject
			= _.stripHtml( this.settings.subject );
		this.textMessage
			= _.stripHtml( this.settings.message );
	}

	/**
	 * @return {void}
	 */
	private _searchFieldOfMessage() {
		if ( !this.keySearch ) {
			this.fields
				= this._fieldsBK;
		} else {
			this.fields = _.filter(
				this.fields,
				( field: BoardFieldExtra ) => {
					return _.search( field.name, this.keySearch );
				}
			);
		}

		this._cdRef.detectChanges();
	}

}
