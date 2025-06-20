import { describe, expect, it } from 'bun:test'
import { z } from 'zod/v4'
import { parseArgs } from './parse'

describe('parseArgs', () => {
	it('should parse long-form flags with values', () => {
		const schema = z.object({
			name: z.string()
		})
		const argv = ['--name', 'test']
		const result = parseArgs({ argv, schema })
		expect(result).toEqual({ name: 'test' })
	})

	it('should parse long-form boolean flags', () => {
		const schema = z.object({
			bool: z.boolean().optional()
		})
		const argv = ['--bool']
		const result = parseArgs({ argv, schema })
		expect(result).toEqual({ bool: true })
	})

	it('should parse long-form number flags', () => {
		const schema = z.object({
			number: z.number()
		})
		const argv = ['--number', '123']
		const result = parseArgs({ argv, schema })
		expect(result).toEqual({ number: 123 })
	})

	it('should parse short-form number flags', () => {
		const schema = z.object({
			number: z.number()
		})
		const argv = ['-n', '123']
		const result = parseArgs({ argv, schema })
		expect(result).toEqual({ number: 123 })
	})

	it('should convert kebab-case flags to camelCase', () => {
		const schema = z.object({
			kebabCase: z.boolean().optional()
		})
		const argv = ['--kebab-case']
		const result = parseArgs({ argv, schema })
		expect(result).toEqual({ kebabCase: true })
	})

	it('should parse short-form boolean flags', () => {
		const schema = z.object({
			bool: z.boolean().optional()
		})
		const argv = ['-b']
		const result = parseArgs({ argv, schema })
		expect(result).toEqual({ bool: true })
	})

	it('should parse short-form flags with values', () => {
		const schema = z.object({
			name: z.string()
		})
		const argv = ['-n', 'test']
		const result = parseArgs({ argv, schema })
		expect(result).toEqual({ name: 'test' })
	})

	it('should throw an error for a missing value for a long-form flag', () => {
		const schema = z.object({
			name: z.string()
		})
		const argv = ['--name']
		expect(() => {
			try {
				parseArgs({ argv, schema })
			} catch (error) {
				throw error.message
			}
		}).toThrow('Missing value for flag --name')
	})

	it.skip('should handle combined short-form boolean flags', () => {
		const schema = z.object({
			bool1: z.boolean().optional(),
			bool2: z.boolean().optional()
		})
		const argv = ['-vf']
		const result = parseArgs({ argv, schema })
		expect(result).toEqual({ bool1: true, bool2: true })
	})

	it.skip('should handle combined short-form flags with a value', () => {
		const schema = z.object({
			name: z.string(),
			bool: z.boolean().optional()
		})
		const argv = ['-nf', 'test']
		const result = parseArgs({ argv, schema })
		expect(result).toEqual({ name: 'test', bool: true })
	})
})
