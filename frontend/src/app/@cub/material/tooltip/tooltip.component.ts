import {
	ChangeDetectionStrategy,
	Component,
	HostBinding,
	TemplateRef,
	ViewEncapsulation
} from '@angular/core';
import _ from 'lodash';

export type CUBTooltipType = 'default' | 'error';

@Component({
	selector: 'cub-tooltip',
	templateUrl: './tooltip.pug',
	styleUrls: [ './tooltip.scss' ],
	host: { class: 'cub-tooltip' },
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CUBTooltipComponent {

	public context: ObjectType;
	public type: CUBTooltipType = 'default';

	@HostBinding( 'class.cub-tooltip-error' )
	get classError(): boolean {
		return this.type === 'error';
	}

	protected isMessageString: boolean;

	private _message: string | TemplateRef<any>;

	get message(): string | TemplateRef<any> {
		return this._message;
	}
	set message( m: string | TemplateRef<any> ) {
		this.isMessageString = _.isString(
			this._message = m
		);
	}

}
