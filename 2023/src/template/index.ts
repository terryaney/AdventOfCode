import run from "aocrunner";
import * as util from '../utils/index.js';

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines;
};

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput);

	if ( !isPart2 ) {
	}
	else {
	}

	console.log(input);
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: true,
	part1: {
		tests: [
			{
				input: `
				`,
				expected: 0
			}
		],
		solution: part1
	},
	part2: {
		solution: part2
	},
	trimTestInputs: true
});