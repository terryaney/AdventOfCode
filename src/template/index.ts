import run from "aoc-automation";
import * as util from '../../utils/index.js';

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	console.log(lines);
	return lines;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const input = parseInput(rawInput);

	if ( isPart1 ) {
	}
	else {
	}
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: true,
	part1: {
		tests: [
			{
				input: `
				{testData}
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