import run from "aocrunner";
import * as util from '../../utils/index.js';

const maxes = {
	"red": 12,
	"green": 13,
	"blue": 14
};

const part1 = (rawInput: string) =>
	util.parseLines(rawInput)
		.reduce((sum, line) => {
			const lineParts = line.split(":");
			const draws = lineParts[1].split(";");
		
			const isValid = draws.map(d => d.split(',').map(m => m.trim().split(' ')).map(m => ({ Count: parseInt(m[0]), Color: m[1] })))
				.every(marbles => marbles.every(m => m.Count <= ( maxes as any )[m.Color]));
		
			const increment = isValid
				? parseInt(lineParts[0].split(" ")[1])
				: 0;
			
			return sum + increment;
		}, 0);

const part2 = (rawInput: string) =>
	util.parseLines(rawInput)
		.reduce((sum, line) => {
			var hands = line.split(':')[1].split(';');
			var marbles = hands.flatMap(h => h.split(',').map(m => m.trim()));
			var groups = marbles.reduce((acc, curr) => {
				var key = curr.split(' ')[1];
				var value = parseInt(curr.split(' ')[0]);
				acc[key] = acc[key] || [];
				acc[key].push(value);
				return acc;
			}, {} as any) as { [key: string]: number[] }; // Explicitly cast groups to { [key: string]: number[] }
		
			var minMarbles = Object.values(groups).map(g => Math.max(...g));
			return sum + minMarbles[0] * minMarbles[1] * minMarbles[2];
		}, 0);

run({
	part1: {
		tests: [
			{
				input: `
					Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
					Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
					Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
					Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
					Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
				`,
				expected: 8,
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
					Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
					Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
					Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
					Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
					Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green
				`,
				expected: 2286,
			}
		],
		solution: part2,
	},
	trimTestInputs: true,
	onlyTests: false,
});