import Quill from 'quill';

const embed: any = Quill.import( 'blots/embed' );

export class CustomEmbedBlot
	extends embed {

	/**
	 * @param {any} value
	 * @return {HTMLElement}
	 */
	public static create(
		value: any
	): HTMLElement {
		const node: HTMLElement
			= super.create();

		node.innerHTML = value.content;

		return node;
	}

	/**
	 * @param {HTMLElement} node
	 * @return {any}
	 */
	public static value(
		node: HTMLElement
	): any {
		return {
			content: node.innerHTML,
		};
	}
}

CustomEmbedBlot.blotName = 'customEmbed';
CustomEmbedBlot.tagName = 'span'; // Use a div or any tag that suits your needs
CustomEmbedBlot.className = 'custom-embed'; // Optional: for styling

Quill.register(CustomEmbedBlot);
