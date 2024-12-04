import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	console.log(lines);
	return lines;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const input = parseInput(rawInput);
	
	if (isPart1) {
		const left: number[] = [];
		const right: number[] = [];
		
		input.forEach((line) => {
			const [l, r] = line.split(/\s+/).map(Number);
			left.push(l);
			right.push(r);
		});
	
		left.sort((a, b) => a - b);
		right.sort((a, b) => a - b);

		let total = 0;
		for (let i = 0; i < left.length; i++) {
			total += Math.abs(left[i] - right[i]);
		}
		return total;
	} else {
		const left: Record<number, number> = {};
		const right: Record<number, number> = {};

		input.forEach((line) => {
			const [l, r] = line.split(/\s+/).map(Number);
			left[l] = (left[l] || 0) + 1;
			right[r] = (right[r] || 0) + 1;
		});

		const total = Object.keys(left).map(Number).reduce((acc, key) => {
			const leftValue = key;
			const leftCount = left[key];
			const rightCount = right[key] || 0;
			return acc + leftValue * leftCount * rightCount;
		}, 0);

		return total;
	}
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
				3   4
				4   3
				2   5
				1   3
				3   9
				3   3
				`,
				expected: 11
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				3   4
				4   3
				2   5
				1   3
				3   9
				3   3
				`,
				expected: 31
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
});
