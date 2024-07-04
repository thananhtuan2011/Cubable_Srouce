import {
	ChangeDetectionStrategy,
	Component,
	ChangeDetectorRef,
	Input,
	Output,
	EventEmitter,
	OnInit,
	inject
} from '@angular/core';

import {
	DefaultValue,
	Unsubscriber,
	CoerceNumber,
	CoerceBoolean,
	PageService
} from '@core';

import {
	IWorkspace
} from '@main/workspace/interfaces';

@Unsubscriber()
@Component({
	selector: 'auto-access-workspace',
	templateUrl: '../templates/auto-access-workspace.pug',
	styleUrls: [ '../styles/auto-access-workspace.scss' ],
	host: { class: 'auto-access-workspace' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoAccessWorkspaceComponent implements OnInit {

	@Input() @DefaultValue() @CoerceNumber()
	public maxCount: number = 3;
	@Input() @CoerceBoolean()
	public disabled: boolean;
	@Input() public title: string;
	@Input() public workspace: IWorkspace;

	@Output() public switchWorkspace: EventEmitter<void>
		= new EventEmitter<void>();
	@Output() public redirected: EventEmitter<void>
		= new EventEmitter<void>();

	protected countdown: number = 0;

	private _interval: ReturnType<typeof setInterval>;
	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );
	private readonly _pageService: PageService
		= inject( PageService );

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._startCountdown();
	}

	/**
	 * @return {void}
	 */
	public switch() {
		this._pageService.setCurrentURL( null );

		this.switchWorkspace.emit();
	}

	/**
	 * @return {void}
	 */
	private _startCountdown() {
		this.countdown = 0;
		this._interval = setInterval( () => {
			this.countdown++;

			this._cdRef.markForCheck();

			this.countdown === this.maxCount && this._endCountdown();
		}, 1000 );
	}

	/**
	 * @return {void}
	 */
	private _endCountdown() {
		clearInterval( this._interval );

		this.redirected.emit();
	}

}
