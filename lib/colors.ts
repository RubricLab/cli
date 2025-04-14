const colors = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m'
}

export const format = {
	error: (text: string) => `${colors.red}${colors.bold}${text}${colors.reset}`,
	success: (text: string) => `${colors.green}${colors.bold}${text}${colors.reset}`,
	warning: (text: string) => `${colors.yellow}${colors.bold}${text}${colors.reset}`,
	info: (text: string) => `${colors.blue}${colors.bold}${text}${colors.reset}`,
	command: (text: string) => `${colors.cyan}${text}${colors.reset}`,
	parameter: (text: string) => `${colors.magenta}${text}${colors.reset}`,
	title: (text: string) => `${colors.bold}${text}${colors.reset}`
}
