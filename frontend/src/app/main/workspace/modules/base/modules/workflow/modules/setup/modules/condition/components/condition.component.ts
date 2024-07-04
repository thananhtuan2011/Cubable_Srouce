import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output,
	ViewChild,
	inject
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
	CUBConfirmService
} from '@cub/material/confirm';

import {
	IBoard
} from '@main/workspace/modules/base/modules/board/interfaces';

import {
	Condition,
	ConditionSetting,
	ConditionType,
	ConditionTypeInfo
} from '../interfaces';

import {
	ConditionBase
} from './condition-base';
import {
	FindRecordComponent
} from './find-record.component';

@Unsubscriber()
@Component({
	selector: 'condition',
	templateUrl: '../templates/condition.pug',
	styleUrls: [ '../styles/condition.scss' ],
	host: { class: 'condition' },
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConditionComponent
implements OnInit {

	@ViewChild( 'conditionSetting' )
	public conditionSettingComp: ConditionBase;

	@Input() public baseID: ULID;
	@Input() public blockSetup: Condition;
	@Input() public type: ConditionType;
	@Input() public settings: ConditionSetting;
	@Input() public boardsLk: ObjectType<IBoard>;

	@Output() public typeChange: EventEmitter<ConditionType>
		= new EventEmitter<ConditionType>();
	@Output() public settingsChange: EventEmitter<ConditionSetting>
		= new EventEmitter<ConditionSetting>();

	protected readonly CONDITION_TYPE: typeof ConditionType
		= ConditionType;
	protected readonly typeControl: FormControl
		= new FormControl( undefined );

	protected conditionsType: ReadonlySet<ConditionTypeInfo>;
	protected onBeforeSelectType: () => boolean
		= this._onBeforeSelectType.bind( this );

	private readonly _confirmService: CUBConfirmService
		= inject( CUBConfirmService );

	private _conditionAddable: Record<ConditionType, boolean>;

	ngOnInit() {
		this._setConditionType();

		if ( !this.type ) {
			this.type = ConditionType.COMPARE_VALUE;

			this.typeChange.emit( this.type );
		}
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
	protected onConditionTypeChange(
		type: ConditionType
	) {
		if ( type === this.type ) return;

		this.type = type;
		this.settings = {} as ConditionSetting;

		this.typeChange.emit( this.type );

		setTimeout(
			() => ( this.conditionSettingComp as FindRecordComponent )
			?.selectBoardComp
			?.boardPicker
			?.open()
		);
	}

	/**
	 * @return {boolean | Promise}
	 */
	private _onBeforeSelectType(
	): boolean | Promise<boolean> {
		if ( this.type ) {
			return new Promise(
				( resolve: any ) => {
					this._confirmService
					.open(
						'BASE.WORKFLOW.SETUP.CONDITION.MESSAGE.CHANGE_EVENT',
						'BASE.WORKFLOW.SETUP.CONDITION.LABEL.CHANGE_EVENT',
						{
							warning: true,
							buttonApply: {
								text: 'BASE.WORKFLOW.SETUP.CONDITION.LABEL.CHANGE',
								type: 'destructive',
							},
						}
					)
					.afterClosed()
					.subscribe({
						next: ( answer: boolean ) => {
							if ( !answer ) {
								resolve();
								return;
							}

							resolve( true );
						},
					});
				}
			);
		} else {
			return true;
		}
	}

	/**
	 * @return {void}
	 */
	private _setConditionType() {
		this._conditionAddable = this._getConditionAddable();

		this.conditionsType
			= new Set([
				this._setConditionTypeInfo(
					ConditionType.COMPARE_VALUE,
					'COMPARE_VALUE',
					'COMPARE_VALUE_HINT'
				),
				this._setConditionTypeInfo(
					ConditionType.FIND_RECORD,
					'FIND_RECORD',
					'FIND_RECORD_HINT'
				),
			]);
	}

	/**
	 * @return {void}
	 */
	private _setConditionTypeInfo(
		value: ConditionType,
		name: string,
		description: string
	): ConditionTypeInfo {
		return {
			value,
			name,
			description,
			addable: this._conditionAddable[ value ],
		};
	}

	/**
	 * @return {Record<ConditionType, boolean>}
	 */
	private _getConditionAddable(): Record<ConditionType, boolean> {
		const conditionAddable: Record<ConditionType, boolean>
			= {} as Record<ConditionType, boolean>;

		conditionAddable[ ConditionType.COMPARE_VALUE ]
			= this._setCompareValueAddable();
		conditionAddable[ ConditionType.FIND_RECORD ]
			= this._setFindRecordAddable();

		return conditionAddable;
	}

	/**
	 * @return {boolean}
	 */
	private _setCompareValueAddable(): boolean {
		return true;
	}

	/**
	 * @return {boolean}
	 */
	private _setFindRecordAddable(): boolean {
		return true;
	}

}
