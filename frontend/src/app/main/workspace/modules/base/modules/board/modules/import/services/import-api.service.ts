
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
	WebSocketService,
	untilCmpDestroyed
} from '@core';

import {
	WorkspaceApiService
} from '@main/workspace/services';

import {
	ImportFields,
	ImportRecords
} from '../interfaces';

@Injectable()
export class ImportApiService {

	private _percentImport: Subject<number>
		= new Subject<number>();

	private readonly _endPoint: string
		= '/api/board-import';
	private readonly _apiService: WorkspaceApiService
		= inject( WorkspaceApiService );
	private readonly _webSocketService: WebSocketService
		= inject( WebSocketService );

	get percentSuccess(): Subject<number> {
		return this._percentImport;
	}

	/**
	 * @param {ImportFields} data
	 * @return {Observable}
	 */
	public importFields(
		data: ImportFields
	): Observable<any> {
		return this._apiService
		.call(
			`${this._endPoint}/create`,
			'POST',
			data
		);
	}

	/**
	 * @param {ImportRecords} data
	 * @return {Observable}
	 */
	public importRecords(
		data: ImportRecords
	): Observable<any> {
		return this._apiService
		.call(
			`${this._endPoint}/save`,
			'POST',
			data
		);
	}

	/**
	 * @param {string} importID
	 * @param {number} totalRows
	 * @return {Observable<boolean>}
	 */
	public sendSocket(
		importID: string,
		totalRows: number
	): Observable<boolean> {
		return new Observable<boolean>(
			(observer: Observer<boolean>) => {
				let totalSuccess: number = 0;
				let percentSuccess: number = 0;

				this._webSocketService
				.on(importID)
				.pipe(untilCmpDestroyed(this))
				.subscribe({
					next: (res: any) => {
						totalSuccess += +res?.importedRecords;
						percentSuccess = (totalSuccess / totalRows) * 100;
						const roundedPercentSuccess: number
							= Math.round(percentSuccess);

						if (roundedPercentSuccess % 5 === 0) {
							this._percentImport.next(roundedPercentSuccess);
						}
						if (totalSuccess === totalRows) {
							observer.next(true);
							observer.complete();
						}

						if(res?.error){
							observer.error(false);
							observer.complete();
						}
					},
					error: (err: Error) => {
						observer.error(err);
					},
				});
			});
	}

}
