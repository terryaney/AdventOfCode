import run from "aoc-automation";
import * as util from '../../utils/index.js';

type Point = { x: number, y: number };
type Segment = { start: Point, end: Point };

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

const move = (location: Point, direction: string, distance: number): Point => {
	switch (direction) {
		case "N": return { x: location.x, y: location.y + distance };
		case "E": return { x: location.x + distance, y: location.y };
		case "S": return { x: location.x, y: location.y - distance };
		case "W": return { x: location.x - distance, y: location.y };
	}

	throw new Error(`Invalid move direction: ${direction}`);
};

function intersection(segment1: Segment, segment2: Segment): Point | undefined {
    const a1 = segment1.end.y - segment1.start.y;
    const b1 = segment1.start.x - segment1.end.x;
    const c1 = a1 * segment1.start.x + b1 * segment1.start.y;

    const a2 = segment2.end.y - segment2.start.y;
    const b2 = segment2.start.x - segment2.end.x;
    const c2 = a2 * segment2.start.x + b2 * segment2.start.y;

    const delta = a1 * b2 - a2 * b1;

    if (delta === 0) { // The lines are parallel
        return undefined;
    }

    const x = (b2 * c1 - b1 * c2) / delta;
    const y = (a1 * c2 - a2 * c1) / delta;

    const withinSegment1 = (Math.min(segment1.start.x, segment1.end.x) <= x && x <= Math.max(segment1.start.x, segment1.end.x)) &&
                           (Math.min(segment1.start.y, segment1.end.y) <= y && y <= Math.max(segment1.start.y, segment1.end.y));

    const withinSegment2 = (Math.min(segment2.start.x, segment2.end.x) <= x && x <= Math.max(segment2.start.x, segment2.end.x)) &&
                           (Math.min(segment2.start.y, segment2.end.y) <= y && y <= Math.max(segment2.start.y, segment2.end.y));

    if (withinSegment1 && withinSegment2) {
        return { x, y };
    }

    return undefined;
}

const solve = (rawInput: string, isPart1: boolean) => {
	const input = rawInput;
	let location = { x: 0, y: 0 };
	let direction = "N";

	const segments = new Array<Segment>();
	const instructions = input.split(', ');

	for (let i = 0; i < instructions.length; i++) {
		const instruction = instructions[i];
		direction = turn(direction, instruction[0]);
		
		const start = location;
		location = move(start, direction, parseInt(instruction.substring(1)));
		
		if (!isPart1) {
			const segment = { start, end: location };

			for (let s = 0; s < segments.length - 1; s++) {
				const intersectionPoint = intersection(segment, segments[s]);

				if (intersectionPoint !== undefined) {
					return Math.abs(intersectionPoint.x) + Math.abs(intersectionPoint.y);
				}
			}

			segments.push(segment);
		}
	}

	return Math.abs(location.x) + Math.abs(location.y);
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: false,
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