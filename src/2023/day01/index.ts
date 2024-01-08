import run from "aoc-automation";
import * as util from '../../utils/index.js';

const parseInput = (rawInput: string): { lines: Array<string>, patterns: Array<{ value: string, word: string }> } => {
	return {
		lines: util.parseLines(rawInput),
		patterns: [
			{ value: "1", word: "one" },
			{ value: "2", word: "two" },
			{ value: "3", word: "three" },
			{ value: "4", word: "four" },
			{ value: "5", word: "five" },
			{ value: "6", word: "six" },
			{ value: "7", word: "seven" },
			{ value: "8", word: "eight" },
			{ value: "9", word: "nine" }
		]
	}
};

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput);	
	return input.lines.reduce((sum, i) => {
		let positions = input.patterns.map(p => ({ item: p.value, position: i.indexOf(p.value), lastPosition: i.lastIndexOf(p.value), value: Number(p.value) }));

		if ( isPart2 )
		{
			positions = positions.concat(
				input.patterns.map(p => ({ item: p.value, position: i.indexOf(p.word), lastPosition: i.lastIndexOf(p.word), value: Number(p.value) }))
			);
		}

		const numbersFound = positions.filter(p => p.position > -1);
		
		if (numbersFound.length === 0) return sum;
		
		const first = numbersFound.sort((a, b) => a.position - b.position)[0];
		const last = numbersFound.sort((a, b) => b.lastPosition - a.lastPosition)[0];
		const increment = first.value * 10 + last.value;

		return sum + increment;
	}, 0);
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	part1: {
		tests: [
			{
				input: `
					1abc2
					pqr3stu8vwx
					a1b2c3d4e5f
					treb7uchet
				`,
				expected: 142,
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
					two1nine
					eightwothree
					abcone2threexyz
					xtwone3four
					4nineeightseven2
					zoneight234
					7pqrstsixteen
				`,
				expected: 281,
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
	onlyTests: false,
});