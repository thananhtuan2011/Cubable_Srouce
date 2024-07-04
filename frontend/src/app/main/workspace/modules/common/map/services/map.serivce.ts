import { Injectable } from '@angular/core';
import _ from 'lodash';

import { DISTRICTS, PROVINCES, WARDS } from '@resources';

import { IDistrict, IProvince, IWard } from '../interfaces';

@Injectable()
export class MapService {

	/**
	 * @return {IProvince[]}
	 */
	public getProvinces(): IProvince[] {
		return PROVINCES as any;
	}

	/**
	 * @param {number} provinceID
	 * @return {IDistrict[]}
	 */
	public getDistricts( provinceID: number ): IDistrict[] {
		if ( !provinceID ) return [];

		return _.filter( DISTRICTS, ( district: IDistrict ) => district.provinceID === provinceID );
	}

	/**
	 * @param {number} districtID
	 * @return {IWard[]}
	 */
	public getWards( districtID: number ): IWard[] {
		if ( !districtID ) return [];

		return _.filter( WARDS, ( ward: IWard ) => ward.districtID === districtID );
	}

	/**
	 * @param {number} provinceID
	 * @return {string}
	 */
	public getProvinceName( provinceID: number ): string {
		return ( _.find( PROVINCES, { id: provinceID } ) as IProvince )?.name;
	}

	/**
	 * @param {number} districtID
	 * @return {string}
	 */
	public getDistrictName( districtID: number ): string {
		return ( _.find( DISTRICTS, { id: districtID } ) as IDistrict )?.name;
	}

	/**
	 * @param {number} wardID
	 * @return {string}
	 */
	public getWardName( wardID: number ): string {
		return ( _.find( WARDS, { id: wardID } ) as IWard )?.name;
	}

}
