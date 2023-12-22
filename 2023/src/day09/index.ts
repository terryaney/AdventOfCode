import run from "aocrunner";
import * as util from '../utils/index.js';

class Sequence
{
	public numbers: Array<number>;
	public leftExtrapolation: number | undefined;
	public rightExtrapolation: number | undefined;

	constructor(numbers: Array<number>) {
		this.numbers = numbers;
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines;
};

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput);

	return input.reduce((acc, line) => {
		const history = line.split(" ").map(Number);
		const sequences: Array<Sequence> = [new Sequence(history)];

		let sequence = sequences[sequences.length - 1];
		let numbers = sequence.numbers;
	
		// Generate sequences until all values are 0...
		while (numbers.some(n => n != 0)) {
			const nextSequence: Array<number> = [];
			for (let i = 0; i < numbers.length - 1; i++) {
				nextSequence.push(numbers[i + 1] - numbers[i]);
			}
			sequences.push(new Sequence(nextSequence));
			
			sequence = sequences[sequences.length - 1];
			numbers = sequence.numbers;
		}

		// Extrapolate next number in sequence...

		// Add 0 to end of last sequence..
		sequence = sequences[sequences.length - 1];
		sequence.leftExtrapolation = 0;
		sequence.rightExtrapolation = 0;

		// For all other sequences, determine the next number by finding what value would
		// be needed so that the difference of numbers is equal to the number appended during extrapolation...
		
		// Start from the second last sequence...
		for (let index = sequences.length - 2; index >= 0; index--) {
			const previous = sequences[index + 1];
			const current = sequences[index];
			
			const previousLeftExtrapolation = previous.leftExtrapolation;
			const firstNumberInCurrent = current.numbers[0];
			current.leftExtrapolation = firstNumberInCurrent - previousLeftExtrapolation!;

			const previousRightExtrapolation = previous.rightExtrapolation;
			const lastNumberInCurrent = current.numbers[current.numbers.length - 1];		
			current.rightExtrapolation = lastNumberInCurrent + previousRightExtrapolation!;
		}

		return !isPart2
			? acc + sequences[0].rightExtrapolation!
			: acc + sequences[0].leftExtrapolation!;
	}, 0);
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
					0 3 6 9 12 15
					1 3 6 10 15 21
					10 13 16 21 30 45
				`,
				expected: 114,
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
					0 3 6 9 12 15
					1 3 6 10 15 21
					10 13 16 21 30 45
				`,
				expected: 2,
			}
		],
		solution: part2,
	},
	trimTestInputs: true
});