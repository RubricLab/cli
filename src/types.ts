import type { z } from 'zod'

export type Command<TArgs extends z.ZodType = z.AnyZodObject> = {
	name: string
	description: string
	args: TArgs
	handler: (args: z.infer<TArgs>) => void | Promise<void>
}

export type CLI = {
	commands: Command[]
	parse: (argv?: string[]) => Promise<void>
}
