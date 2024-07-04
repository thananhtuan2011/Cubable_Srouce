import {
	Component, Input, ViewEncapsulation,
	Output, EventEmitter, ChangeDetectionStrategy,
	HostBinding, OnInit, ChangeDetectorRef
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EmojiData } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import _ from 'lodash';

import { DefaultValue, CoerceNumber, LocaleService, untilCmpDestroyed } from '@core';

export type WGCIEmojiPickerMode = 'default' | 'inline';
export type WGCIEmojiPickerPosition = 'above' | 'below';
export type WGCIEmojiData = EmojiData;

@Component({
	selector		: 'wgc-emoji-picker',
	templateUrl		: './wgc-emoji-picker.pug',
	styleUrls		: [ './wgc-emoji-picker.scss' ],
	host			: { class: 'wgc-emoji-picker' },
	encapsulation	: ViewEncapsulation.None,
	changeDetection	: ChangeDetectionStrategy.OnPush,
})
export class WGCEmojiPickerComponent implements OnInit {

	@HostBinding( 'class.wgc-emoji-picker--inline' )
	get classInline(): boolean { return this.mode === 'inline'; }

	@Input() @DefaultValue() @CoerceNumber() public perLine: number = 12;
	@Input() @DefaultValue() public mode: WGCIEmojiPickerMode = 'default';

	@Output() public picked: EventEmitter<WGCIEmojiData> = new EventEmitter<WGCIEmojiData>();

	public close: ( event?: Event ) => void;
	public onPicked: ( event: WGCIEmojiData ) => void;
	public i18n: ObjectType;

	/**
	 * @constructor
	 * @param {ChangeDetectorRef} _cdRef
	 * @param {LocaleService} _localeService
	 * @param {TranslateService} _translateService
	 */
	constructor(
		private _cdRef: ChangeDetectorRef,
		private _localeService: LocaleService,
		private _translateService: TranslateService
	) {}

	/**
	 * @constructor
	 */
	ngOnInit() {
		this._localeService.localeChange$
		.pipe( untilCmpDestroyed( this ) )
		.subscribe( () => {
			if ( this._localeService.locale === 'en' ) {
				this.i18n = {
					search	: 'Search',
					notfound: 'No Emoji Found',
					categories: {
						search	: 'Search Results',
						recent	: 'Frequently Used',
						people	: 'Smileys & People',
						nature	: 'Animals & Nature',
						foods	: 'Food & Drink',
						activity: 'Activity',
						places	: 'Travel & Places',
						objects	: 'Objects',
						symbols	: 'Symbols',
						flags	: 'Flags',
					},
				};

				this._cdRef.markForCheck();
				return;
			}

			this.i18n = {
				search	: this._translateService.instant( 'WGC.PLACEHOLDER.SEARCH' ),
				notfound: this._translateService.instant( 'WGC.MESSAGE.NO_EMOJI_FOUND' ),
				categories: {
					search	: this._translateService.instant( 'WGC.LABEL.SEARCH_RESULTS' ),
					recent	: this._translateService.instant( 'WGC.LABEL.FREQUENTLY_USED' ),
					people	: this._translateService.instant( 'WGC.LABEL.SMILEYS_PEOPLE' ),
					nature	: this._translateService.instant( 'WGC.LABEL.ANIMALS_NATURE' ),
					foods	: this._translateService.instant( 'WGC.LABEL.FOOD_DRINK' ),
					activity: this._translateService.instant( 'WGC.LABEL.ACTIVITY' ),
					places	: this._translateService.instant( 'WGC.LABEL.TRAVEL_PLACES' ),
					objects	: this._translateService.instant( 'WGC.LABEL.OBJECTS' ),
					symbols	: this._translateService.instant( 'WGC.LABEL.SYMBOLS' ),
					flags	: this._translateService.instant( 'WGC.LABEL.FLAGS' ),
				},
			};

			this._cdRef.markForCheck();
		} );
	}

	/**
	 * @param {WGCIEmojiData} emoji
	 * @return {void}
	 */
	public pick( emoji: WGCIEmojiData ) {
		this.picked.emit( emoji );
		_.isFunction( this.onPicked ) && this.onPicked( emoji );
	}

}
