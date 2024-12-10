import run from "aoc-automation";
import * as util from "../../utils/index.js";

const solve = (rawInput: string, isPart1: boolean, testName?: string) => {
	const segments = parseInput(rawInput);

	if (!isPart1 && testName != undefined) {
		console.log("");
		console.log("------");
		console.log(`${testName} Input`);
		logSegments(segments);
		console.log("------");
	}

	if (isPart1) {
		let destIndex = segments.findIndex(s => s.available > 0);
		let sourceIndex = segments.length - 1;
	
		while (sourceIndex > destIndex) {
			const destSegment = segments[destIndex];
	
			if (destSegment.available == 0) {
				destIndex++;
				continue;
			}
	
			const sourceSegment = segments[sourceIndex];
			const sourceBlock = sourceSegment.fileBlocks[0];
			const blocksTaken = Math.min(sourceBlock.size, destSegment.available);
	
			sourceBlock.size -= blocksTaken;
			sourceSegment.available += blocksTaken;
			
			if (sourceBlock.size == 0) {
				sourceSegment.fileBlocks.pop();
				sourceIndex--;
			}
	
			destSegment.available -= blocksTaken;
			destSegment.fileBlocks.push({ id: sourceBlock.id, size: blocksTaken, isEmpty: false });
		}
	} else {
		for (let i = segments.length - 1; i > 0; i--) {
			const segment = segments[i];
			const block = segment.fileBlocks[0];
			const destIndex = segments.findIndex(s => s.available >= block.size);

			if ( destIndex == -1 || destIndex >= i) continue;

			const destSegment = segments[destIndex];
			destSegment.fileBlocks.push({ id: block.id, size: block.size, isEmpty: false });
			destSegment.available -= block.size;

			segment.fileBlocks[0].isEmpty = true;
			segment.available += block.size;
		}
	}

	let checkSum = 0;
	let filePosition = 0;

	if (!isPart1 && testName != undefined) {
		logSegments(segments);
	}

	segments.forEach(segment => {
		segment.fileBlocks.forEach(block => {
			if (block.isEmpty) {
				filePosition += block.size;
				return;
			}

			for (let i = 0; i < block.size; i++) {
				checkSum += filePosition * block.id;
				filePosition++;
			}
		});
		const emptyBlocks = segment.fileBlocks.reduce((acc, b) => acc + (b.isEmpty ? b.size : 0), 0);
		filePosition += segment.available - emptyBlocks;
	});

	return checkSum;
};

const parseInput = (rawInput: string) => {
	const diskMap = util.parseLines(rawInput)[0];
	const segments: Array<{ size: number, available: number, fileBlocks: Array<{id: number, size: number, isEmpty: boolean}> }> = [];
	
	for (let i = 0; i < diskMap.length; i += 2) {
		const id = i / 2;
		const size = parseInt(diskMap[i]);
		const fileBlocks = [{ id, size, isEmpty: false }];
		const available = i + 1 < diskMap.length ? parseInt(diskMap[i + 1]) : 0;
		segments.push({ size: size + available, available, fileBlocks });
	}

	return segments;
};

const logSegments = (segments: Array<{ size: number, available: number, fileBlocks: Array<{ id: number, size: number, isEmpty: boolean }> }>) => {
	console.log(
		segments.map((s, i) => {
			const emptyBlocks = s.fileBlocks.reduce((acc, b) => acc + (b.isEmpty ? b.size : 0), 0);
			return `${s.fileBlocks.map(b => `${(b.isEmpty ? "." : b.id.toString()).repeat(b.size)}`).join("")}${".".repeat(s.available - emptyBlocks)}`;
		}).join(""));
}

const part1 = (rawInput: string, testName?: string) => solve(rawInput, true, testName);
const part2 = (rawInput: string, testName?: string) => solve(rawInput, false, testName);

run({
	part1: {
		tests: [
			{
				input: `
				2333133121414131402
				`,
				expected: 1928
			},
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
				2333133121414131402
				`,
				expected: 2858
			},
		],
		solution: part2
	},
	trimTestInputs: true,
	onlyTests: false
});
