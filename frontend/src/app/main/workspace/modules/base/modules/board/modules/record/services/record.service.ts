import {
	Injectable,
	inject
} from '@angular/core';
import {
	Observable,
	Subject
} from 'rxjs';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	ReferenceItem
} from '@main/common/field/interfaces';
import {
	WorkspaceApiService
} from '@main/workspace/services';

import {
	BoardField
} from '../../../interfaces';

import {
	RecordCreate,
	RecordUpdate,
	RecordDuplicate,
	RecordPermission,
	RecordData,
	RecordDetail,
	RecordIDByView
} from '../interfaces';
import {
	DialogItemChange
} from '../modules/detail/interfaces';

@Injectable()
export class RecordService {

	public readonly deleteRecords$: Subject<ULID[]>
		= new Subject<ULID[]>();
	public readonly detailItemChange$: Subject<DialogItemChange>
		= new Subject<DialogItemChange>();
	public readonly itemName$: Subject<string>
		= new Subject<string>();
	public exportFile$: Subject<string>
		= new Subject<string>();

	private readonly _endPoint: string = '/api/record';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );

	/**
	 * @param {ULID} viewID
	 * @return {Observable}
	 */
	public listIDByView(
		viewID: ULID
	): Observable<RecordIDByView> {
		return this._apiService.call(
			`${this._endPoint}/list-id-by-view`,
			'GET',
			{ viewID }
		);
	}

	/**
	 * @param {ULID} viewID
	 * @param {ULID[]} fieldIDs
	 * @return {Observable}
	 */
	public listDataByView(
		viewID: ULID,
		fieldIDs: ULID[]
	): Observable<RecordData[]> {
		return this._apiService.call(
			`${this._endPoint}/list-data-by-view`,
			'POST',
			{ viewID, fieldIDs }
		);
	}

	/**
	 * @param {ULID} boardID
	 * @param {ULID[]} fieldIDs
	 * @param {ULID[]=} ids
	 * @return {Observable}
	 */
	public listDataByBoard(
		boardID: ULID,
		fieldIDs: ULID[],
		ids?: ULID[]
	): Observable<RecordData[]> {
		return this._apiService.call(
			`${this._endPoint}/list-data-by-board`,
			'POST',
			{
				boardID,
				fieldIDs,
				ids,
			}
		);
	}

	/**
	 * @param {ULID[]} fieldIDs
	 * @param {ULID=} viewID
	 * @param {ULID=} recordID
	 * @return {Observable}
	 */
	public listEditable(
		fieldIDs: ULID[],
		viewID?: ULID,
		recordID?: ULID
	): Observable<Record<BoardField[ 'id' ], RecordPermission>> {
		return this._apiService.call(
			`${this._endPoint}/list-editable`,
			'POST',
			{
				fieldIDs,
				...( viewID ? { viewID } : {} ),
				...( recordID ? { recordID } : {} ),
			}
		);
	}

	/**
	 * @param {RecordCreate} data
	 * @return {Observable}
	 */
	public bulkCreate(
		data: RecordCreate
	): Observable<void> {
		return this
		._apiService
		.call(
			`${this._endPoint}/bulk-create`,
			'POST',
			data
		);
	}

	/**
	 * @param {RecordDuplicate} data
	 * @return {Observable}
	 */
	public bulkDuplicate(
		data: RecordDuplicate
	): Observable<void> {
		return this
		._apiService
		.call(
			`${this._endPoint}/bulk-duplicate`,
			'POST',
			data
		);
	}

	/**
	 * @param {RecordUpdate} data
	 * @return {Observable}
	 */
	public bulkUpdate(
		data: RecordUpdate
	): Observable<void> {
		return this
		._apiService
		.call(
			`${this._endPoint}/bulk-update`,
			'PUT',
			data
		);
	}

	/**
	 * @param {ULID} boardID
	 * @param {ULID[]} recordIDs
	 * @return {Observable}
	 */
	public bulkDelete(
		boardID: ULID,
		recordIDs: ULID[]
	): Observable<void> {
		return this._apiService
		.call(
			`${this._endPoint}/bulk-delete`,
			'PUT',
			{ boardID, recordIDs }
		);
	}

	/**
	 * @param {ULID[]} viewID
	 * @return {Observable}
	 */
	public getListReferenceByView(
		viewID: ULID
	): Observable<ReferenceItem[]> {
		return this._apiService.call(
			`${this._endPoint}/list-reference-by-view`,
			'GET',
			{ viewID }
		);
	}

	/**
	 * @param {ULID} recordID
	 * @return {Observable}
	 */
	public getDetail(
		recordID: ULID
	): Observable<RecordDetail> {
		return this._apiService.call(
			`${this._endPoint}/detail/${recordID}`,
			'GET'
		);
	}

}
