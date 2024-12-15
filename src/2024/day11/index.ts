import run from "aoc-automation";
import * as util from "../../utils/index.js";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const stones = parseInput(rawInput);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		console.log(stones);
		console.log("------");
	}

	// if 0, replace with 1
	// if even digits, replace with two elements, first is left half of digits, second is right half of digits (no zero padding)
	// otherwise, replace *2024
		
	const iterations = isPart1 ? 25 : 75;

	const count = (() => {
		const cache: { [key: string]: number } = {};
	
		return (value: number, iteration: number): number => {
			const key = `${value}-${iteration}`;
			if (cache[key] !== undefined) {
				return cache[key];
			}
	
			if (iteration === 0) {
				return (cache[key] = 1);
			}
	
			if (value === 0) {
				return (cache[key] = count(1, iteration - 1));
			}
	
			const str = value.toString();
			if (str.length % 2 === 0) {
				const half = Math.floor(str.length / 2);
				return (cache[key] = count(Number(str.substring(0, half)), iteration - 1) + count(Number(str.substring(half)), iteration - 1));
			}
	
			return (cache[key] = count(value * 2024, iteration - 1));
		};
	})();
	
	return stones.reduce((acc, stone) => acc + count(stone.value, iterations), 0);
};

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines[0].split(" ").map(x => ({ value: Number(x), iteration: 0 }));
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				125 17
				`,
				expected: 55312
			},
		],
		solution: part1,
	},
	part2: {
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
