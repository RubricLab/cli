export function kebabToCamel(str: string): string {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}
