import {
	Component,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	OnInit,
	inject
} from '@angular/core';
import {
	Router,
	ActivatedRoute
} from '@angular/router';
import {
	finalize
} from 'rxjs/operators';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber,
	untilCmpDestroyed,
	StorageService
} from '@core';

import {
	ENVIRONMENT
} from '@environments/environment';

import {
	IError
} from '@error/interfaces';
import {
	CONSTANT as ERROR_CONSTANT
} from '@error/resources';

import {
	AccountService
} from '@main/account/services';
import {
	IAuth
} from '@main/auth/interfaces';
import {
	AuthService
} from '@main/auth/services';
import {
	CONSTANT as AUTH_CONSTANT
} from '@main/auth/resources';
import {
	IWorkspace,
	IWorkspaceAccess
} from '@main/workspace/interfaces';
import {
	WorkspaceService
} from '@main/workspace/services';
import {
	CONSTANT as WORKSPACE_CONSTANT
} from '@main/workspace/resources';
import {
	CONSTANT as BASE_CONSTANT
} from '@main/workspace/modules/base/resources';
import {
	Field
} from '@main/common/field/interfaces';
import {
	FieldHelper
} from '@main/common/field/helpers';
import {
	UserService
} from '@main/workspace/modules/settings/modules/workspace/modules/user-system/modules/user/services';
import {
	BoardFieldService
} from '@main/workspace/modules/base/modules/board/services';
import {
	BoardField
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	RecordDetail, RecordPermission
} from '../../../interfaces';
import {
	RecordService
} from '../../../services';

@Unsubscriber()
@Component({
	selector: 'external',
	templateUrl: '../templates/external.pug',
	styleUrls: [ '../styles/external.scss' ],
	host: { class: 'external' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExternalComponent
implements OnInit {

	protected notHavePermission: boolean;
	protected item: RecordDetail;
	protected workspace: IWorkspace;
	protected primaryField: Field;
	protected editable: boolean | Record<ULID, boolean>;
	protected fields: Field[];

	private readonly _storageService: StorageService
		= inject( StorageService );
	private readonly _router: Router
		= inject( Router );
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _activeRoute: ActivatedRoute
		= inject( ActivatedRoute );
	private readonly _authService: AuthService
		= inject( AuthService );
	private readonly _workspaceService: WorkspaceService
		= inject( WorkspaceService );
	private readonly _userService: UserService
		= inject( UserService );
	private readonly _recordService: RecordService
		= inject( RecordService );
	private readonly _accountService: AccountService
		= inject( AccountService );
	private readonly _boardFieldService: BoardFieldService
		= inject( BoardFieldService );
	private readonly _fieldHelper: FieldHelper
		= new FieldHelper();

	ngOnInit() {
		const auth: IAuth = this._authService.getStoredAuth();

		if ( !auth?.workspaceID ) {
			this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_OUT ]);
			return;
		}

		this._accessWorkspace( auth.workspaceID );
	}

	/**
	 * @param {boolean=} redirectToBase
	 * @return {void}
	 */
	protected navigate( redirectToBase?: boolean ) {
		const path: string = `${ENVIRONMENT.APP_URL}
			/${WORKSPACE_CONSTANT.PATH.MAIN}
			/${this.workspace.id}
			/${BASE_CONSTANT.PATH.MAIN}
			/${BASE_CONSTANT.PATH.DETAIL}
			/${this.item.baseID}`;

		if ( redirectToBase ) {
			window.open( path );
		} else {
			window.open(
				path + `?boardID=${this.item.boardID}`
			);
		}
	}

	/**
	 * @return {void}
	 */
	private _initData() {
		const itemID: ULID = this._activeRoute.snapshot.paramMap.get( 'id' );

		this._recordService
		.getDetail( itemID )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( item: RecordDetail ) => {
				this.item = item;

				this._getField();
			},
			error: ( error: IError ) => {
				if ( !error ) return;

				this.notHavePermission = true;
			},
		});
	}

	/**
	 * @return {void}
	 */
	private _getField() {
		this._boardFieldService
		.get( this.item.boardID, true )
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( fields: BoardField[] ) => {
				const fieldIDs: ULID[] = _.reduce(
					fields,
					( ids: ULID[], f: BoardField ) => {
						if ( !f.canEditAllRow ) ids.push( f.id );

						return ids;
					},
					[]
				);

				if ( fieldIDs.length ) {
					this._getRowsPermission( fieldIDs );
				} else {
					this.editable = true;
				}

				this.fields = _.map(
					fields,
					( f: BoardField ) => {
						const newField: Field
							= this._fieldHelper.createField( f );

						if ( f.isPrimary ) {
							this.primaryField = newField;
						}

						return newField;
					}
				);

				this._cdRef.markForCheck();
			},
		});
	}

	/**
	 * @param {ULID} workspaceID
	 * @return {void}
	 */
	private _accessWorkspace( workspaceID: ULID ) {
		this._workspaceService
		.access( workspaceID )
		.pipe(
			finalize( () => this._cdRef.markForCheck() ),
			untilCmpDestroyed( this )
		)
		.subscribe({
			next: ( result: IWorkspaceAccess ) => {
				this._storageService.setLocal(
					AUTH_CONSTANT.RECENT_WORKSPACE_STORE_KEY,
					result.workspace
				);

				this.workspace = result.workspace;

				this._initData();
			},
			error: ( err: IError ) => {
				if ( err.error?.key === ERROR_CONSTANT.KEY.PERMISSION_DENIED ) {
					this._userService.clearStoredUser();
					this._workspaceService.clearStoredWorkspace();
					this._authService.setStoredAuth({
						accountID:
							this._accountService.storedAccount?.email,
						accountToken:
							this._authService.getStoredAuth()?.accountToken,
					});
				}

				this._router.navigate([ AUTH_CONSTANT.PATH.SIGN_IN ]);
			},
		});
	}

	/**
	 * @param {ULID[]} fieldIDs
	 * @return {void}
	 */
	private _getRowsPermission( fieldIDs: ULID[] ) {
		this._recordService
		.listEditable(
			fieldIDs,
			undefined,
			this.item.id
		)
		.pipe( untilCmpDestroyed( this ) )
		.subscribe({
			next: ( p: Record<BoardField[ 'id' ], RecordPermission> ) => {
				this.editable = _.isStrictEmpty( p[ this.item.id ] )
					? false
					: p[ this.item.id ];

				this._cdRef.markForCheck();
			},
		});
	}

}
