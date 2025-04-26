# @rubriclab/cli

A lightweight, type-safe CLI framework built with Zod for creating command-line applications with minimal boilerplate.

## Features

- Type-safe command and argument definitions with Zod schemas
- Automatic help text generation
- Colored terminal output formatting
- Simple API for defining commands and handlers

## Installation

```bash
npm install @rubriclab/cli
```

## Usage

### Basic Example

```typescript
import { createCLI } from '@rubriclab/cli';
import { z } from 'zod';

const cli = createCLI({
  name: 'mycli',
  version: '1.0.0',
  description: 'My CLI tool',
  commands: [
    {
      name: 'greet',
      description: 'Greet someone',
      args: z.object({
        name: z.string().describe('Name to greet'),
        uppercase: z.boolean().default(false).describe('Uppercase the greeting')
      }),
      handler: ({ name, uppercase }) => {
        const greeting = `Hello, ${name}!`;
        console.log(uppercase ? greeting.toUpperCase() : greeting);
      }
    }
  ]
});

cli.parse();
```

### Running the CLI

```bash
# Show help
mycli --help

# Run a command
mycli greet --name "World"

# With a boolean flag
mycli greet --name "World" --uppercase
```

## API Reference

### `createCLI(config)`

Creates a new CLI instance with the specified configuration.

```typescript
type CLIConfig = {
  name: string;        // Name of your CLI tool
  version: string;     // Version number
  description: string; // Brief description
  commands: Command[]; // Array of command definitions
};
```

### `Command` Interface

```typescript
type Command<TArgs extends z.ZodType = z.ZodObject<any>> = {
  name: string;        // Command name used in CLI
  description: string; // Command description shown in help
  args: TArgs;         // Zod schema for command arguments
  handler: (args: z.infer<TArgs>) => void | Promise<void>; // Command implementation
};
```

### Formatting Output

The library provides utilities for formatting terminal output:

```typescript
import { format } from '@rubriclab/cli';

console.log(format.success('Operation completed!'));
console.log(format.error('Something went wrong'));
console.log(format.warning('Proceed with caution'));
console.log(format.info('Did you know?'));
console.log(format.command('command-name'));
console.log(format.parameter('--flag'));
console.log(format.title('SECTION TITLE'));
```

## Argument Parsing

Arguments are automatically parsed from command line flags:

- `--flag value` for string/number values
- `--flag` for boolean flags (true if present)
- Validation and default values from Zod schemas

## License

MIT
