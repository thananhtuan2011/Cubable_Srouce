import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';

export class WGCCdkTableDataSource<T> extends DataSource<T> {

	public readonly _data$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>( [] );

	get data(): T[] { return this._data$.value; }
	set data( data: T[] ) { this._data$.next( data ); }

	/**
	 * @return {Observable}
	 */
	public connect(): Observable<any[]> {
		return this._data$;
	}

	/**
	 * @return {void}
	 */
	public disconnect() {}

}
