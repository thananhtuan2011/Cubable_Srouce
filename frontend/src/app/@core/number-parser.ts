const NUMBER_REPLACER: RegExp
	= /^(-)|^e|^([0-9]+)([.e])[.e]*([0-9]*)[.e]*|[^0-9.e\n]+/gm;
const INTEGER_REPLACER: RegExp
	= /^(-)|^e|^([0-9]+)(e)e*([0-9]*)e*|[^0-9e\n]+/gm;
const POSITIVE_NUMBER_REPLACER: RegExp
	= /^e|^([0-9]+)([.e])[.e]*([0-9]*)[.e]*|[^0-9.e\n]+/gm;
const POSITIVE_INTEGER_REPLACER: RegExp
	= /^e|^([0-9]+)(e)e*([0-9]*)e*|[^0-9e\n]+/gm;

export function omitNonNumericChars(
	text: string,
	allowNegative: boolean = true,
	isInteger: boolean = false
): string {
	return allowNegative
		? text.replace(
			isInteger
				? INTEGER_REPLACER
				: NUMBER_REPLACER,
			`$1$2$3$4`
		)
		: text.replace(
			isInteger
				? POSITIVE_INTEGER_REPLACER
				: POSITIVE_NUMBER_REPLACER,
			`$1$2$3`
		);
}

export function parseNumber(
	text: string,
	allowNegative: boolean = true,
	isInteger: boolean = false
): number {
	text = omitNonNumericChars(
		text,
		allowNegative,
		isInteger
	);

	return parseFloat( text );
}
