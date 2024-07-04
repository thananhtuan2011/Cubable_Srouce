export interface IProvince {
	readonly id: number;
	readonly name: string;
}

export interface IDistrict {
	readonly id: number;
	readonly provinceID: number;
	readonly name: string;
}

export interface IWard {
	readonly id: number;
	readonly districtID: number;
	readonly name: string;
}
