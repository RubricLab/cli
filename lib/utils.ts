import type { ZodBoolean, ZodEnum, ZodNumber, ZodString, ZodType, z } from 'zod/v4'

export function kebabToCamel(str: string): string {
	return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

type Supported = ZodString /*  */ | ZodNumber  | ZodEnum /* select */ | ZodBoolean 