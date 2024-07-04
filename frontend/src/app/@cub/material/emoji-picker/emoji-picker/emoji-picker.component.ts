import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	Output,
	ViewEncapsulation
} from '@angular/core';
import {
	EmojiData
} from '@ctrl/ngx-emoji-mart/ngx-emoji';
import {
	CoerceBoolean,
	DefaultValue
} from 'angular-core';

export type CUBEmojiData = EmojiData;

@Component({
	selector: 'cub-emoji-picker',
	templateUrl: './emoji-picker.pug',
	styleUrls: [ './emoji-picker.scss' ],
	host: { class: 'cub-emoji-picker' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBEmojiPickerComponent {

	@Input() public picked: CUBEmojiData;
	@Input() @CoerceBoolean() @DefaultValue()
	public enableSearch: boolean = false;

	@Output() public pickedChange: EventEmitter<CUBEmojiData>
		= new EventEmitter<CUBEmojiData>();

	protected i18n: ObjectType;

	/**
	 * @param {CUBEmojiData} emoji
	 * @return {void}
	 */
	public pickEmoji( emoji: CUBEmojiData ) {
		this.pickedChange.emit(
			this.picked = emoji
		);
	}

}
