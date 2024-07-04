import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	ChangeDetectorRef,
	SimpleChanges,
	inject
} from '@angular/core';
import {
	FormControl
} from '@angular/forms';
import _ from 'lodash';

import {
	Unsubscriber
} from '@core';
import {
	BoardForm,
	BoardFormSetting
} from '../interfaces';

@Unsubscriber()
@Component({
	selector		: 'setting',
	templateUrl		: '../templates/setting.pug',
	styleUrls		: [ '../styles/setting.scss' ],
	host			: { class: 'setting' },
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class SettingComponent
implements OnChanges {

	@Input() public form: BoardForm;

	@Output() public formSetting: EventEmitter<BoardFormSetting>
		= new EventEmitter<BoardFormSetting>();
	@Output() public isChanged: EventEmitter<boolean>
		= new EventEmitter<boolean>();

	protected readonly switchControl: FormControl
		= new FormControl( undefined );
	protected readonly default: {
		completeMessage?: string;
		invalidFormMessage?: string;
	} = {};

	private readonly _cdRef: ChangeDetectorRef
		= inject( ChangeDetectorRef );

	ngOnChanges( changes: SimpleChanges ) {
		if ( changes.form ) {
			this.setDefaultCompleteMessage();
			this.setDefaultInvalidFormMessage();
		}
	}

	/**
	 * @return {void}
	 */
	protected setDefaultCompleteMessage() {
		if ( this.form.settings?.completeMessage?.length ) return;

		this.default.completeMessage &&= null;

		this._cdRef.detectChanges();

		this.default.completeMessage
			= 'BASE.BOARD.FORM.MESSAGE.COMPLETE_CUSTOM_MESSAGE_CONTENT';

		this._cdRef.detectChanges();
	}

	/**
	 * @return {void}
	 */
	protected setDefaultInvalidFormMessage() {
		if ( this.form.settings?.invalidFormMessage?.length ) return;

		this.default.invalidFormMessage &&= null;

		this._cdRef.detectChanges();

		this.default.invalidFormMessage
			= 'BASE.BOARD.FORM.MESSAGE.CUSTOMIZE_THE_SHARING_STATUS_MESSAGE_CONTENT';

		this._cdRef.detectChanges();
	}

	/**
	 * @param {string} message
	 * @return {void}
	 */
	protected setCompleteMessage( message: string ) {
		if ( !message?.length
			&& !this.form.settings?.completeMessage?.length
		) {
			return;
		}

		this.isChanged.emit( true );

		this.form.settings ||= {};
		this.form.settings.completeMessage = message || null;

		this.formSetting.emit( this.form.settings );
	}

	/**
	 * @param {string} message
	 * @return {void}
	 */
	protected setInvalidFormMessage( message: string ) {
		if ( !message?.length
			&& !this.form.settings?.invalidFormMessage?.length
		) {
			return;
		}

		this.isChanged.emit( true );

		this.form.settings ||= {};
		this.form.settings.invalidFormMessage = message || null;

		this.formSetting.emit( this.form.settings );
	}

	/**
	 * @param {boolean} e
	 * @return {void}
	 */
	protected hintSendOtherAnswerChange( e: boolean ) {
		this.isChanged.emit( true );

		this.form.settings ||= {};
		this.form.settings.hintSendOtherAnswer = e;

		this.formSetting.emit( this.form.settings );
	}

}
