import { IFieldExtra } from '@main/common/field/interfaces';
import { INotificationSetting } from '@main/workspace/modules/settings/modules/common/modules/notification/interfaces';

// export interface IUserPreferencesFieldRef extends Pick<IFieldExtra, 'id' | 'name' | 'uniqName' | 'dataType'> {}
export interface IUserPreferencesFieldRef extends Pick<IFieldExtra, 'id' | 'name' | 'dataType'> {}

export interface IUserPreferencesSettings {
	notification?: { settings: INotificationSetting[] };
}
