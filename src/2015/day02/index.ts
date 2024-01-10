import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const input = parseInput(rawInput);

	if (isPart1) {
		return input.reduce((total, line) => {
			const [l, w, h] = line.split("x").map(x => parseInt(x));
			const sides = [l * w, w * h, h * l];
			const smallestSide = Math.min(...sides);
			return (
				total +
				sides.reduce((total, side) => total + 2 * side, 0) +
				smallestSide
			);
		}, 0);
	} else {
		return input.reduce((total, line) => {
			const [l, w, h] = line.split("x").map(x => parseInt(x));
			const perimeters = [2 * (l + w), 2 * (w + h), 2 * (h + l)];
			const smallestPerimeter = Math.min(...perimeters);
			return total + smallestPerimeter + l * w * h;
		}, 0);
	}
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `2x3x4`,
				expected: 58,
			},
			{
				input: `1x1x10`,
				expected: 43,
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `2x3x4`,
				expected: 34,
			},
			{
				input: `1x1x10`,
				expected: 14,
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
});
