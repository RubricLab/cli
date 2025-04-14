import { parseCommand } from './parse'
import type { CLI, Command } from './types'
export { format } from './colors'
export type { Command, CLI }

export function createCLI(config: {
	name: string
	version: string
	description: string
	commands: Command[]
}): CLI {
	return {
		commands: config.commands,
		parse: async (argv = process.argv.slice(2)) => {
			await parseCommand({
				commands: config.commands,
				argv,
				cliName: config.name,
				version: config.version
			})
		}
	}
}
