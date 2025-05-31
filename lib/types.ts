import type { z } from 'zod/v4'

export type Command<TArgs extends z.ZodSchema = z.ZodSchema> = {
	name: string
	description: string
	args: TArgs
	handler: (args: z.infer<TArgs>) => void | Promise<void>
}

export type CLI = {
	commands: Command[]
	parse: (argv?: string[]) => Promise<void>
}
