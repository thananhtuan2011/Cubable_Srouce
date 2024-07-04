import {
 	ChangeDetectionStrategy,
	Component,
	OnInit,
	inject
} from '@angular/core';
import {
	Observable,
	isObservable
} from 'rxjs';

import {
	Unsubscriber,
	untilCmpDestroyed
} from '@core';

import {
	UnloadChecker
} from '@main/unload-checker';
import {
	SettingsDialogService
} from '@main/workspace/modules/settings/services';

import {
	UserSystemService
} from '../services';

@Unsubscriber()
@Component({
	selector: 'user-system',
	templateUrl: '../templates/user-system.pug',
	styleUrls: [ '../styles/user-system.scss' ],
	host: { class: 'user-system' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSystemComponent
	extends UnloadChecker
	implements OnInit {

	public static readonly TABS: ObjectType<number>
		= {
			USER: 0,
			TEAM: 1,
			ROLE_PERMISSION: 2,
		};

	protected readonly TABS: typeof UserSystemComponent.TABS
		= UserSystemComponent.TABS;

	protected selectedIndex: number = UserSystemComponent.TABS.USER;
	protected settingsDialogService: SettingsDialogService
		= inject( SettingsDialogService );

	private readonly _userSystemService: UserSystemService
		= inject( UserSystemService );

	/**
	 * @constructor
	 */
	ngOnInit() {
		super.ngOnInit();

		this._initSubscription();
	}

	/**
	 * @return {void}
	 */
	public save() {
		this._userSystemService.save?.();
	}

	/**
	 * @return {void}
	 */
	public cancel() {
		this._userSystemService.cancel?.();
	}

	/**
	 * @param {number} event
	 * @return {void}
	 */
	public selectedIndexChange( event: number ) {
		const confirmDialog: Observable<boolean> | boolean
			= this.canDeactivate();

		if (
			isObservable( confirmDialog )
		) {
			confirmDialog
			.pipe( untilCmpDestroyed( this ) )
			.subscribe({
				next: () => {
					this.selectedIndex = event;

					this.cdRef.markForCheck();
				},
			});
			return;
		}

		this.selectedIndex = event;
	}

	/**
	 * @return {void}
	 */
	private _initSubscription() {
		this._userSystemService.markAsChanged$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => this.markAsChanged() );

		this._userSystemService.unMarkAsChanged$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => this.unmarkAsChanged() );
	}

}
