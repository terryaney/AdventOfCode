import run from "aocrunner";
import * as util from '../utils/index.js';

const solve = (rawInput: string, isPart2: boolean) => {
	const lines = util.parseLines(rawInput);
	return;
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	part1: {
		tests: [
			{
				input: `
				`,
				expected: 0,
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				`,
				expected: 0,
			}
		],
		solution: part2,
	},
	trimTestInputs: true,
	onlyTests: true,
});