import { Moment } from 'moment-timezone';

import { WGCIMember } from '@wgc/wgc-member-picker';

import { IFieldExtra } from '@main/common/field/interfaces';
// import { IDocumentStatus } from '@main/workspace/modules/document/resources';

export interface ITransferAssets {
	collections: ITransferCollectionsAsset[];
	documents: ITransferDocumentsAsset[];
}

export interface ITransferAssetsBase {
	id: string;
	name: string;
	owner: WGCIMember;
	status: boolean;
	createdAt: Moment;
	updatedAt: Moment;
}

export interface ITransferCollectionsAsset extends ITransferAssetsBase {
	boards: number;
	publicBoards: number;
	subOwners?: WGCIMember[];
}

export interface ITransferDocumentsAsset extends ITransferAssetsBase {
	subPages: number;
	sharedTo: any;
}

export interface ITransferData {
	collections: ITransferCollection[];
	documents: ITransferDocument[];
}

export interface ITransferCollection {
	collectionID: string;
	newOwnerID: string;
}

export interface ITransferDocument {
	documentID: string;
	newOwnerID: string;
}

export type ITranferField = Pick<
	IFieldExtra,
	'id' | 'name' | 'dataType' | 'isPrimary' | 'order' | 'params'
> & { selections?: ObjectType[] };
