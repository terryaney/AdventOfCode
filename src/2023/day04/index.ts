import run from "aoc-automation";
import * as util from "../../utils/index.js";

const part1 = (rawInput: string) =>
	util.parseLines(rawInput).reduce((total, line) => {
		const lineParts = line.split("|");
		const winningNumbers = lineParts[0]
			.split(":")[1]
			.trim()
			.split(" ")
			.filter(n => n != "")
			.map(n => Number(n.trim()));
		const myNumbers = lineParts[1]
			.trim()
			.split(" ")
			.filter(n => n != "")
			.map(n => Number(n.trim()));
		const matchingNumbers = winningNumbers.filter(n =>
			myNumbers.includes(n),
		);

		const increment =
			matchingNumbers.length > 0
				? Math.pow(2, matchingNumbers.length - 1)
				: 0;

		return total + increment;
	}, 0);

const part2 = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const cardPiles = lines.map(l => 1);

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		const lineParts = line.split("|");
		const winningNumbers = lineParts[0]
			.split(":")[1]
			.trim()
			.split(" ")
			.filter(n => n != "")
			.map(n => Number(n.trim()));
		const myNumbers = lineParts[1]
			.trim()
			.split(" ")
			.filter(n => n != "")
			.map(n => Number(n.trim()));
		const matchingNumbers = winningNumbers.filter(n =>
			myNumbers.includes(n),
		);

		/*
		cp[0] = 1 - 4 matches
		cp[1] = 2 - 2 matches
		cp[2] = 4 - 2 matches
		cp[3] = 8
		cp[4] = 6
		*/
		if (matchingNumbers.length > 0) {
			for (let match = 1; match <= matchingNumbers.length; match++) {
				cardPiles[index + match] += cardPiles[index];
			}
		}
	}

	return cardPiles.reduce((total, pile) => total + pile, 0);
};

run({
	part1: {
		tests: [
			{
				input: `
					Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
					Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
					Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
					Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
					Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
					Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
				`,
				expected: 13,
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
					Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
					Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
					Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
					Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
					Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
					Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
				`,
				expected: 30,
			},
		],
		solution: part2,
	},
	trimTestInputs: true,
	onlyTests: false,
});
