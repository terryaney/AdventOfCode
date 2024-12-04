import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	// console.log(lines);
	return lines;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const memoryLines = parseInput(rawInput);
	const regex = isPart1 
		? /mul\((\d{1,3}),(\d{1,3})\)/g
		: /mul\((\d{1,3}),(\d{1,3})\)|do\(\)|don't\(\)/g;

	let isEnabled = true;

	const operations = memoryLines.map(line => {
		const instructions = [...line.matchAll(regex)];

		const validOperations: number[] = [];

		instructions.forEach(instruction => {
			if (instruction[0] == "do()") {
				isEnabled = true;
			} else if (instruction[0] == "don't()") {
				isEnabled = false;
			} else if (isEnabled) {
				const [_, a, b] = instruction;
				validOperations.push(Number(a) * Number(b));
			}
		});

		return validOperations;

	});
	return operations.flat().reduce((acc, val) => acc + val, 0);
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	part1: {
		tests: [
			{
				input: `
				xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))
				`,
				expected: 161
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))
				`,
				expected: 48
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
