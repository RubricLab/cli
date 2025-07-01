const colors = {
	blue: '\x1b[34m',
	bold: '\x1b[1m',
	cyan: '\x1b[36m',
	green: '\x1b[32m',
	magenta: '\x1b[35m',
	red: '\x1b[31m',
	reset: '\x1b[0m',
	yellow: '\x1b[33m'
}

export const format = {
	command: (text: string) => `${colors.cyan}${text}${colors.reset}`,
	error: (text: string) => `${colors.red}${colors.bold}${text}${colors.reset}`,
	info: (text: string) => `${colors.blue}${colors.bold}${text}${colors.reset}`,
	parameter: (text: string) => `${colors.magenta}${text}${colors.reset}`,
	success: (text: string) => `${colors.green}${colors.bold}${text}${colors.reset}`,
	title: (text: string) => `${colors.bold}${text}${colors.reset}`,
	warning: (text: string) => `${colors.yellow}${colors.bold}${text}${colors.reset}`
}
