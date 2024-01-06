import run from "aocrunner";
import * as util from '../../utils/index.js';

const turn = (direction: string, turn: string) => {
	if (turn === "R") {
		switch (direction) {
			case "N": return "E";
			case "E": return "S";
			case "S": return "W";
			case "W": return "N";
		}
	} else {
		switch (direction) {
			case "N": return "W";
			case "E": return "N";
			case "S": return "E";
			case "W": return "S";
		}
	}

	throw new Error(`Invalid turn: ${turn}`);
};

const move = (location: { x: number, y: number }, direction: string, distance: number) => {
	switch (direction) {
		case "N": return { x: location.x, y: location.y + distance };
		case "E": return { x: location.x + distance, y: location.y };
		case "S": return { x: location.x, y: location.y - distance };
		case "W": return { x: location.x - distance, y: location.y };
	}

	throw new Error(`Invalid move direction: ${direction}`);
};

const solve = (rawInput: string, isPart1: boolean) => {
	const input = rawInput;
	let location = { x: 0, y: 0 };
	let direction = "N";

	const locations = new Set<string>();

	input.split(', ').forEach(instruction => {
		direction = turn(direction, instruction[0]);
		location = move(location, direction, parseInt(instruction.substring(1)));
		if (!isPart1) {
			const locationKey = `${location.x},${location.y}`;
			if (locations.has(locationKey)) {
				return;
			}
			locations.add(locationKey);
		}
	});

	return Math.abs(location.x) + Math.abs(location.y);
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: true,
	part1: {
		tests: [
			{
				input: `R5, L5, R5, R3`,
				expected: 12
			}
		],
		solution: part1
	},
	part2: {
		tests: [
			{
				input: `R8, R4, R4, R8`,
				expected: 4
			}
		],
		solution: part2
	},
	trimTestInputs: true
});