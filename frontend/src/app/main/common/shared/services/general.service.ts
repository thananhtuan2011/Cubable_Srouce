import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

import { HASH } from '@environments/hash';

import { ApiService, ApiHeaders, ApiParams } from '@core';

import { WGCILinkService } from '@wgc/wgc-comment';

@Injectable()
export class GeneralService implements WGCILinkService {

	private _endPoint: string = '/shared/general';
	// eslint-disable-next-line @typescript-eslint/naming-convention
	private _headers: ApiHeaders = { Authorization: `Bearer ${HASH.SHARED_TOKEN}` };

	/**
	 * @constructor
	 * @param {ApiService} _apiService
	 */
	constructor( private _apiService: ApiService ) {}

	/**
	 * @param {string} link
	 * @return {Observable}
	 */
	public preview( link: string ): Observable<any> {
		return this.getLinkPreview( link );
	}

	/**
	 * @param {string} link
	 * @return {Observable}
	 */
	public getLinkPreview( link: string ): Observable<any> {
		const params: ApiParams = { link };

		return this._apiService
		.call( `${this._endPoint}/link-preview`, 'POST', params, this._headers )
		.pipe( timeout( 5000 ) );
	}

	/**
	 * @param {string} searchQuery
	 * @param {string} language
	 * @param {string[]} countries
	 * @param {number} hitsPerPage
	 * @param {string} aroundLatLng
	 * @param {string} type
	 * @return {Observable}
	 */
	public getAddressSuggestions(
		searchQuery: string,
		language?: string,
		countries?: string[],
		hitsPerPage?: number,
		aroundLatLng?: string,
		type?: string
	): Observable<any> {
		const params: ApiParams = { searchQuery };

		if ( language ) params.language = language;
		if ( countries ) params.countries = countries;
		if ( hitsPerPage ) params.hitsPerPage = hitsPerPage;
		if ( aroundLatLng ) params.aroundLatLng = aroundLatLng;
		if ( type ) params.type = type;

		return this._apiService
		.call( `${this._endPoint}/address-suggestions`, 'POST', params, this._headers )
		.pipe( timeout( 5000 ) );
	}

}
