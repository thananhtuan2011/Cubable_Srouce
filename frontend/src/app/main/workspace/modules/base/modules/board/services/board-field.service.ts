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
	map,
	tap
} from 'rxjs/operators';
import { ULID } from 'ulidx';
import _ from 'lodash';

import {
	DropdownOption,
	ListBoardReference
} from '@main/common/field/interfaces';
import {
	WorkspaceApiService
} from '@main/workspace/services';

import {
	BoardField,
	BoardFieldCreate,
	BoardFieldUpdate,
	FieldsOfBoard,
	BoardFieldDuplicate,
	IBoard,
	FieldDetail,
	ActionAffectFieldInvalid
} from '../interfaces';

@Injectable()
export class BoardFieldService {

	public fieldsAdded$: Subject<BoardField[]>
		= new Subject<BoardField[]>();
	public actionAffectFieldInvalid$: Subject<ActionAffectFieldInvalid>
		= new Subject<ActionAffectFieldInvalid>();

	private readonly _endPoint: string = '/api/field';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	private _fields: Record<IBoard[ 'id' ], BoardField[]>;
	private _dropdownFieldOptions: Map<ULID, DropdownOption[]>;

	get fields(): Record<IBoard[ 'id' ], BoardField[]> {
		return this._fields || {};
	}
	set fields( data: Record<IBoard[ 'id' ], BoardField[]> ) {
		this._fields = { ...this.fields, ...data };
	}

	/**
	 * @param {ULID} boardID
	 * @param {boolean=} forceReload
	 * @return {Observable}
	 */
	public get(
		boardID: ULID,
		forceReload?: boolean
	): Observable<BoardField[]> {
		if ( this.fields[ boardID ]?.length && !forceReload ) {
			return new Observable( ( observer: Observer<BoardField[]> ) => {
				observer.next( _.cloneDeep( this.fields[ boardID ] ) );
				observer.complete();
			} );
		}

		return this._apiService
		.call( `${this._endPoint}/list`, 'GET', { boardID } )
		.pipe( map( ( fields: BoardField[] ) => {
			this.fields = {
				[ boardID ]: _.isArray( fields )
					? fields
					: [],
			};

			return _.cloneDeep( this.fields[ boardID ] );
		} ) );
	}

	/**
	 * @param {ULID} baseID
	 * @return {Observable}
	 */
	public getDropdownByBase(
		baseID: ULID
	): Observable<FieldsOfBoard[]> {
		return this._apiService
		.call(
			`${this._endPoint}/list-dropdown-by-base`,
			'GET',
			{ baseID }
		);
	}

	/**
	 * @param {ULID} id
	 * @param {boolean=} forceReload
	 * @return {Observable}
	 */
	public getDropdownOptions(
		id: ULID,
		forceReload?: boolean
	): Observable<DropdownOption[]> {
		if (
			this._dropdownFieldOptions?.get( id )
			&& !forceReload
		) {
			return new Observable(
				( observer: Observer<DropdownOption[]> ) => {
					observer.next( this._dropdownFieldOptions.get( id ) );
					observer.complete();
				}
			);
		}

		return this._apiService
		.call(
			`${this._endPoint}/dropdown-options/${id}`,
			'GET'
		)
		.pipe(
			tap( ( options: DropdownOption[] ) => {
				this._dropdownFieldOptions ||= new Map();
				this._dropdownFieldOptions.set( id, options || [] );

				return this._dropdownFieldOptions.get( id );
			} )
		);
	}

	/**
	 * @param {ULID} fieldID
	 * @return {Observable}
	 */
	public getFieldBySourceLookup(
		fieldID: ULID
	): Observable<BoardField[]> {
		return this._apiService
		.call(
			`${this._endPoint}/list-lookup-by-source-field`,
			'GET',
			{ fieldID }
		);
	}

	/**
	 * @param {BoardFieldCreate} data
	 * @return {Observable}
	 */
	public create(
		data: BoardFieldCreate
	): Observable<BoardField> {
		return this._apiService
		.call( `${this._endPoint}/create`, 'POST', data )
		.pipe(
			tap(
				( field: BoardField ) =>
					this.fields = {
						[ data.boardID ]: [
							...( this.fields[ data.boardID ] || [] ),
							{ ...data, ...field },
						],
					}
			)
		);
	}

	/**
	 * @param {ULID} fieldID
	 * @param {BoardFieldDuplicate} data
	 * @return {Observable}
	 */
	public duplicate(
		fieldID: ULID,
		data: BoardFieldDuplicate
	): Observable<BoardField> {
		return this._apiService
		.call(
			`${this._endPoint}/duplicate/${fieldID}`,
			'POST',
			data
		);
	}

	/**
	 * @param {ULID} id
	 * @param {BoardFieldUpdate} data
	 * @return {Observable}
	 */
	public update(
		id: ULID,
		data: BoardFieldUpdate
	): Observable<BoardField> {
		return this._apiService
		.call(
			`${this._endPoint}/update/${id}`, 'PUT', data );
	}

	/**
	 * @param {ULID[]} ids
	 * @param {BoardFieldUpdate} data
	 * @return {Observable}
	 */
	public bulkUpdate(
		ids: ULID[],
		data: BoardFieldUpdate
	): Observable<BoardField[]> {
		return this._apiService
		.call(
			`${this._endPoint}/bulk-update`,
			'PUT',
			{ ...data, ids }
		);
	}

	/**
	 * @param {ULID[]} ids
	 * @param {ULID} boardID
	 * @return {Observable}
	 */
	public bulkDelete(
		ids: ULID[],
		boardID: ULID
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/bulk-delete`,
			'PUT',
			{ ids }
		)
		.pipe( tap( () => {
			const fields: BoardField[]
				= _.filter(
					this.fields[ boardID ],
					( field: BoardField ) => !_.includes( ids, field.id )
				);

			this.fields = { [ boardID ]: fields };
		} ) );
	}

	/**
	 * @return {Observable}
	 */
	public getListReference( baseID: ULID ): Observable<ListBoardReference[]> {
		return this._apiService
		.call(
			`${this._endPoint}/list-reference-by-user?baseID=${baseID}`,
			'GET'
		);
	}

	/**
	 * @param {ULID} fieldID
	 * @return {Observable}
	 */
	public fieldDetail( fieldID: ULID ): Observable<FieldDetail> {
		return this._apiService
		.call(
			`${this._endPoint}/detail/${fieldID}`,
			'GET'
		);
	}

}
