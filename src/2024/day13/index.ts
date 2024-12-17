import run from "aoc-automation";
import * as util from "../../utils/index.js";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const games = parseInput(rawInput);

	if (testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		console.log(games);
		console.log("------");
	}

	let totalTokens = 0;
	let gamesWon = 0;

	for( let i = 0; i < games.length; i++ ) {
		const game = games[i];
		const { x: aX, y: aY } = game.buttonA;
		const { x: bX, y: bY }  = game.buttonB;
		let { x: prizeX, y: prizeY } = game.prize;

		if (!isPart1) {
			prizeX += 10000000000000;
			prizeY += 10000000000000;
		}
		else {
			if (100 * (aX + bX) < prizeX) continue;
			else if (100 * (aY + bY) < prizeY) continue;
		}

		// A - number of times button A is pressed
		// B - number of times button B is pressed
		
		// A * aX + B * bX == prizeX (*bY)
		// A * aY + B * bY == prizeY (*bX)

		// A * aXbY + B * bXbY == prizeX * bY
		// A * aYbX + B * bXbY == prizeY * bX (subtract linear equations)

		// A * (aXbY - aYbX) == prizeX * bY - prizeY * bX (solve for A)

		// A = (prizeX * bY - prizeY * bX) / (aXbY - aYbX) (solve for B)
		// B = (prizeX - A * aX) / bX

		const aNumerator = prizeX * bY - prizeY * bX;
		const aDenominator = aX * bY - aY * bX;
		if (aNumerator % aDenominator != 0) continue;
		const aPresses = aNumerator / aDenominator;
		const bNumerator = prizeX - aPresses * aX;
		if (bNumerator % bX != 0) continue;
		const bPresses = bNumerator / bX;

		gamesWon++;
		totalTokens += aPresses * 3 + bPresses;

		// Part 1 Brute Force
		/*
		let min = Number.POSITIVE_INFINITY;
		for (let a = 1; a <= 100; a++) {
			for (let b = 1; b <= 100; b++) {
				if (a * aX + b * bX == prizeX && a * aY + b * bY == prizeY) {
					min = Math.min(min, a * 3 + b);
				}
			}
		}

		if (min != Number.POSITIVE_INFINITY) {
			totalTokens += min;
			gamesWon++;
		}
		*/
	}

	return totalTokens;
};

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const games: Array<{ buttonA: { x: number, y: number }, buttonB: { x: number, y: number }, prize: { x: number, y: number }}> = [];

	const parseLine = (line: string, valSep: string) => {
		const [x, y] = line.split(", ");
		return { x: parseInt(x.split(valSep)[1]), y: parseInt(y.split(valSep)[1]) };
	};
	for (let i = 0; i < lines.length; i += 4) {
		games.push({
			buttonA: parseLine(lines[i], "+"),
			buttonB: parseLine(lines[i + 1], "+"),
			prize: parseLine(lines[i + 2], "=")
		});
	}
	return games;
};

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				Button A: X+94, Y+34
				Button B: X+22, Y+67
				Prize: X=8400, Y=5400

				Button A: X+26, Y+66
				Button B: X+67, Y+21
				Prize: X=12748, Y=12176

				Button A: X+17, Y+86
				Button B: X+84, Y+37
				Prize: X=7870, Y=6450

				Button A: X+69, Y+23
				Button B: X+27, Y+71
				Prize: X=18641, Y=10279
				`,
				expected: 480
			},
		],
		solution: part1
	},
	part2: {
		tests: [],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
