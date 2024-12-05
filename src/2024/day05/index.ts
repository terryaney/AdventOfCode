import run from "aoc-automation";
import * as util from "../../utils/index.js";

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	
	const rules: Record<string, Array<string>> = {};
	const updates: Array<Array<string>> = [];

	let addUpdates = false;

	for (const line of lines) {
		if (line == "") {
			addUpdates = true;
			continue
		}

		if (!addUpdates) {
			const [before, after] = line.split("|");
			const dependencies = rules[before] ?? ( rules[before] = [] );
			dependencies.push(after);
		} else {
			updates.push(line.split(","));
		}
	}

	return { rules, updates };
};

const solve = (rawInput: string, isPart1: boolean) => {
	const input = parseInput(rawInput);
	
	let total = 0;
	for (const updates of input.updates) {
		let visited: Array<string> = [];
		let isInOrder = true;

		for (const update of updates) {
			visited.push(update);

			if (visited.length == 1) continue;

			var dependencies = input.rules[update] ?? [];

			if (visited.some(v => dependencies.includes(v))) {
				isInOrder = false;
				break;
			}
		}

		if (isPart1 && isInOrder ) {
			total += +updates[ Math.floor(updates.length / 2) ];
		}
		else if (!isPart1 && !isInOrder ) {
			// console.log("Not in order", updates);
			visited = [];

			for (let i = 0; i < updates.length; i++) {
				const update = updates[i];
				visited.push(update);
				if (visited.length == 1) continue;

				var dependencies = input.rules[update] ?? [];
				var newIndex = visited.findIndex(v => dependencies.includes(v));

				if (newIndex != -1) {
					visited.splice(i, 1);
					visited.splice(newIndex, 0, update);
				}
			}
			// console.log("In order", visited);
			total += +visited[ Math.floor(visited.length / 2) ];
		}
	}

	return total;
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	part1: {
		tests: [
			{
				input: `
				47|53
				97|13
				97|61
				97|47
				75|29
				61|13
				75|53
				29|13
				97|29
				53|29
				61|53
				97|53
				61|29
				47|13
				75|47
				97|75
				47|61
				75|61
				47|29
				75|13
				53|13

				75,47,61,53,29
				97,61,53,29,13
				75,29,13
				75,97,47,61,53
				61,13,29
				97,13,75,29,47
				`,
				expected: 143
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				47|53
				97|13
				97|61
				97|47
				75|29
				61|13
				75|53
				29|13
				97|29
				53|29
				61|53
				97|53
				61|29
				47|13
				75|47
				97|75
				47|61
				75|61
				47|29
				75|13
				53|13

				75,47,61,53,29
				97,61,53,29,13
				75,29,13
				75,97,47,61,53
				61,13,29
				97,13,75,29,47
				`,
				expected: 123
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
