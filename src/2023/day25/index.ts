import run from "aoc-automation";
import * as util from "../../utils/index.js";

class Graph {
	private readonly _verticesCount: number;
	private readonly _edges: Array<{ from: string; to: string }>;
	private readonly _random: () => number;

	constructor(
		edges: Array<{ from: string; to: string }>,
		random: () => number,
	) {
		this._verticesCount = Array.from(
			new Set(edges.flatMap(x => [x.from, x.to])),
		).length;
		this._edges = edges;
		this._random = random;
	}

	public cut() {
		let contractedEdges = [...this._edges];
		let contractedVerticesCount = this._verticesCount;
		let contracted: { [key: string]: string[] } = {};

		while (contractedVerticesCount > 2) {
			const edgeToContract =
				contractedEdges[
					Math.floor(this._random() * contractedEdges.length)
				];

			if (contracted[edgeToContract.from]) {
				contracted[edgeToContract.from].push(edgeToContract.to);
			} else {
				contracted[edgeToContract.from] = [edgeToContract.to];
			}

			if (contracted[edgeToContract.to]) {
				contracted[edgeToContract.from].push(
					...contracted[edgeToContract.to],
				);
				delete contracted[edgeToContract.to];
			}

			let newEdges: Array<{ from: string; to: string }> = [];
			for (let edge of contractedEdges) {
				if (edge.to === edgeToContract.to) {
					newEdges.push({ from: edge.from, to: edgeToContract.from });
				} else if (edge.from === edgeToContract.to) {
					newEdges.push({ from: edgeToContract.from, to: edge.to });
				} else {
					newEdges.push(edge);
				}
			}

			contractedEdges = newEdges.filter(x => x.from !== x.to);
			contractedVerticesCount--;
		}

		const counts = Object.values(contracted).map(x => x.length + 1);
		return {
			minCut: contractedEdges.length,
			vertices1Count: counts[0],
			vertices2Count: counts[1],
		};
	}
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);

	const edges = lines.flatMap(row => {
		const split = row.replace(":", "").split(" ");
		const fr = split[0];
		return split.slice(1).map(to => ({ from: fr, to: to }));
	});

	return edges;
};

const solve = (rawInput: string, isPart1: boolean) => {
	const edges = parseInput(rawInput);

	if (isPart1) {
		const graph = new Graph(edges, Math.random);

		let minCut = Number.MAX_VALUE;
		let count1 = 0;
		let count2 = 0;
		while (minCut !== 3) {
			const {
				minCut: newMinCut,
				vertices1Count,
				vertices2Count,
			} = graph.cut();
			minCut = newMinCut;
			count1 = vertices1Count;
			count2 = vertices2Count;
		}

		return count1 * count2;
	} else {
		// Part 2 solution goes here
	}
};

const part1 = (rawInput: string) => solve(rawInput, true);
const part2 = (rawInput: string) => solve(rawInput, false);

run({
	onlyTests: true,
	part1: {
		tests: [
			{
				input: `
				jqt: rhn xhk nvd
				rsh: frs pzl lsr
				xhk: hfx
				cmg: qnr nvd lhk bvb
				rhn: xhk bvb hfx
				bvb: xhk hfx
				pzl: lsr hfx nvd
				qnr: nvd
				ntq: jqt hfx bvb xhk
				nvd: lhk
				lsr: lhk
				rzs: qnr cmg lsr rsh
				frs: qnr lhk lsr
				`,
				expected: 54,
			},
		],
		solution: part1,
	},
	part2: {
		solution: part2,
	},
	trimTestInputs: true,
});
