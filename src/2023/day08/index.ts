import run from "aocrunner";
import * as util from '../../utils/index.js';
import { lcm } from "mathjs";

class Node {
	public readonly left: string;
	public readonly right: string;
	public readonly key: string;
	public stepsToZNode: number = 0;

	constructor(key: string, left: string, right: string) {
		this.key = key;
		this.left = left;
		this.right = right;
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	const nodeDictionary: { [key: string]: Node } = {};
	const nodesEndingInA: Node[] = [];
	
	for (let index = 2; index < lines.length; index++) {
		const line = lines[index];
		const key = line.substring(0, 3);
		const left = line.substring(7, 10);
		const right = line.substring(12, 15);
		nodeDictionary[key] = new Node(key, left, right);

		if (key.endsWith("A")) {
			nodesEndingInA.push(nodeDictionary[key]);
		}
	}
	
	return {
		directions: lines[0],
		nodes: nodeDictionary,
		nodesEndingInA: nodesEndingInA
	}
};

function getNextNode(node: Node, direction: string, nodeDictionary: { [key: string]: Node }): Node {
	if (direction === "L") {
		return nodeDictionary[node.left];
	}
	else {
		return nodeDictionary[node.right];
	}
}


const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput);

	if ( !isPart2 ) {
		let numberOfSteps = 0;
		let directionsIndex = 0;
		let currentNode = input.nodes["AAA"];
		
		while (currentNode.key !== "ZZZ") {
			const direction = input.directions[directionsIndex % input.directions.length];
			currentNode = getNextNode(currentNode, direction, input.nodes);
			numberOfSteps++;
			directionsIndex++;
		}

		return numberOfSteps;
	}
	else {
		let currentNode = input.nodes["AAA"];

		for (let index = 0; index < input.nodesEndingInA.length; index++) {
			currentNode = input.nodesEndingInA[index];
			const nodeKey = currentNode.key;
			let numberOfSteps = 0;
			let directionsIndex = 0;
			
			while (input.nodesEndingInA[index].stepsToZNode == 0) {
				const direction = input.directions[directionsIndex % input.directions.length];
				currentNode = getNextNode(currentNode, direction, input.nodes);
		
				numberOfSteps++;
				directionsIndex++;
		
				if (currentNode.key.endsWith("Z")) {
					input.nodes[nodeKey].stepsToZNode = numberOfSteps;
				}
			}	
		}
		
		var intervals = input.nodesEndingInA.map(n => n.stepsToZNode);
		
		const leastCommonMultiple = intervals.reduce((prev, curr) => lcm(prev, curr));
		return leastCommonMultiple;
	}
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
					RL

					AAA = (BBB, CCC)
					BBB = (DDD, EEE)
					CCC = (ZZZ, GGG)
					DDD = (DDD, DDD)
					EEE = (EEE, EEE)
					GGG = (GGG, GGG)
					ZZZ = (ZZZ, ZZZ)
				`,
				expected: 2,
			},
			{
				input: `
					LLR

					AAA = (BBB, BBB)
					BBB = (AAA, ZZZ)
					ZZZ = (ZZZ, ZZZ)
				`,
				expected: 6,
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
					LR

					11A = (11B, XXX)
					11B = (XXX, 11Z)
					11Z = (11B, XXX)
					22A = (22B, XXX)
					22B = (22C, 22C)
					22C = (22Z, 22Z)
					22Z = (22B, 22B)
					XXX = (XXX, XXX)
				`,
				expected: 6,
			}
		],
		solution: part2,
	},
	trimTestInputs: true
});