/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import Embed from 'quill/blots/embed';

export enum MentionBlotAttachedSource {
	Insertion = 'insertion',
	Unknown = 'unknown',
}

export type MentionBlotValue = {
	id: any;
	name: string;
	denotationChar?: string;
	attachedSource?: MentionBlotAttachedSource;
};

export default class MentionBlot extends Embed {

	static blotName: string = 'mention';
	static tagName: string = 'b';
	static className: string = 'ql-mention';

	static create(
		value: MentionBlotValue
	): Node {
		const node: HTMLElement
			= super.create() as HTMLElement;

		node.dataset.id = value.id;
		node.dataset.name = value.name;
		node.dataset.denotationChar
			= value.denotationChar || '';
		node.dataset.attachedSource
			= value.attachedSource
				|| MentionBlotAttachedSource.Unknown;

		node.textContent
			= value.denotationChar
				+ value.name;

		return node;
	}

	static value(
		{ dataset }: HTMLElement
	): MentionBlotValue {
		const value: MentionBlotValue = {
			id: dataset.id,
			name: dataset.name,
		};

		if ( dataset.denotationChar ) {
			value.denotationChar
				= dataset.denotationChar;
		}

		return value;
	}

	static formats(): boolean {
		return false;
	}

	attach() {
		super.attach();

		const rootNode: Node
			= this.scroll.domNode;
		const node: HTMLElement
			= this.domNode as HTMLElement;

		rootNode.dispatchEvent(
			new CustomEvent(
				`${MentionBlot.blotName}-attached`,
				{
					bubbles: true,
					detail: {
						blot: this,
						attachedSource:
							node.dataset.attachedSource,
					},
				}
			)
		);

		node.addEventListener(
			'click',
			( event: MouseEvent ) => {
				rootNode.dispatchEvent(
					new CustomEvent(
						`${MentionBlot.blotName}-clicked`,
						{
							bubbles: true,
							detail: {
								blot: this,
								event,
							},
						}
					)
				);
			}
		);

		node.addEventListener(
			'mousemove',
			( event: MouseEvent ) => {
				rootNode.dispatchEvent(
					new CustomEvent(
						`${MentionBlot.blotName}-hovered`,
						{
							bubbles: true,
							detail: {
								blot: this,
								event,
							},
						}
					)
				);
			}
		);
	}

	detach() {
		super.detach();

		setTimeout(() => {
			this
			.scroll
			.domNode
			.dispatchEvent(
				new CustomEvent(
					`${MentionBlot.blotName}-detached`,
					{
						bubbles: true,
						detail: this,
					}
				)
			);
		});
	}

	html(): string {
		const node: HTMLElement
			= this.domNode as HTMLElement;

		return node.dataset.denotationChar
			+ node.dataset.name;
	}

}
