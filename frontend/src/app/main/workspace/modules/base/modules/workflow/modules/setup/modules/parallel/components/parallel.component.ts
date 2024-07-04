import {
	ChangeDetectionStrategy,
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ViewChild
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import {
	ULID
} from 'ulidx';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';
import {
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';
import {
	Parallel,
	ParallelSetting,
	ParallelType,
	ParallelTypeInfo
} from '../interfaces';
import {
	ParallelBase
} from './parallel-base';

@Unsubscriber()
@Component({
	selector: 'parallel',
	templateUrl: '../templates/parallel.pug',
	styleUrls: [ '../styles/parallel.scss' ],
	host: { class: 'parallel' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParallelComponent implements OnInit {

	@ViewChild( 'parallelSetting' )
	public parallelSettingComp: ParallelBase;

	public readonly typeControl: FormControl
		= new FormControl( undefined );

	@Input() public baseID: ULID;
	@Input() public blockSetup: Parallel;
	@Input() public boardsLk: ObjectType<IBoard>;
	@Input() public settings: ParallelSetting;

	@Output() public settingsChange: EventEmitter<ParallelSetting>
		= new EventEmitter<ParallelSetting>();

	protected readonly PARALLEL_TYPE: typeof ParallelType
		= ParallelType;

	protected parallelType: ReadonlySet<ParallelTypeInfo>;

	ngOnInit() {
		this._setParallelType();

		this.settings ||= {} as ParallelSetting;
		if ( !this.settings.type ) {
			this.settings.type = ParallelType.ALL;

			this.settingsChange.emit( this.settings );
		}
	}

	/**
	 * @return {void}
	 */
	protected onParallelTypeChange(
		type: ParallelType
	) {
		if ( type === this.settings.type ) return;

		this.settings = { type } as ParallelSetting;

		this.settingsChange.emit( this.settings );
		this.onSettingChanged();
	}

	/**
	 * @return {boolean}
	 */
	protected onSettingChanged() {
		this.settingsChange.emit( this.settings );
	}

	/**
	 * @return {void}
	 */
	private _setParallelType() {
		this.parallelType
			= new Set([
				this._setParallelTypeInfo(
					ParallelType.ALL,
					'ALL_BRANCHES_COMPLETED'
				),
				this._setParallelTypeInfo(
					ParallelType.ANY,
					'ANY_BRANCHES_COMPLETED',
					'INCOMPLETE_BRANCHES_STOP'
				),
			]);
	}

	/**
	 * @return {void}
	 */
	private _setParallelTypeInfo(
		value: ParallelType,
		name: string,
		description?: string
	): ParallelTypeInfo {
		return {
			value,
			name,
			description,
		};
	}
}
