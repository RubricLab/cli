import type { ZodBoolean, ZodEnum, ZodNumber, ZodString, ZodType, z } from 'zod/v4'

export function kebabToCamel(str: string): string {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

type Supported = ZodString /*  */ | ZodNumber  | ZodEnum /* select */ | ZodBoolean | 

export function prompt<Schema extends ZodType>(schema: Schema): Promise<z.infer<Schema>> {
	console.log('Prompting for:')
	return ''
}
