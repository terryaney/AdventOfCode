import run from "aoc-automation";
import * as util from '../../utils/index.js';

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const input = rawInput;  // parseInput(rawInput);

	let floor = 0;
	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		if (char === '(') {
			floor++;
		}
		else if (char === ')') {
			floor--;
			if (floor === -1 && !isPart1) {
				return i + 1;
			}
		}
	}
	return floor;
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `(())`,
				expected: 0
			},
			{
				input: `()()`,
				expected: 0
			},
			{
				input: `(((`,
				expected: 3
			},
			{
				input: `(()(()(`,
				expected: 3
			},
			{
				input: `))(((((`,
				expected: 3
			},
			{
				input: `())`,
				expected: -1
			},
			{
				input: `))(`,
				expected: -1
			},
			{
				input: `)))`,
				expected: -3
			},
			{
				input: `)())())`,
				expected: -3
			}
		],
		solution: part1
	},
	part2: {
		solution: part2
	},
	trimTestInputs: true
});