import run from "aocrunner";
import * as util from '../utils/index.js';

class Part {
	public x: number;
	public m: number;
	public a: number;
	public s: number;
	
	constructor(x: number, m: number, a: number, s: number) {
		this.x = x;
		this.m = m;
		this.a = a;
		this.s = s;
	}
}

interface Part1Function {
	(x: number, m: number, a: number, s: number): string
}
const createPart1Function = (code: string): Part1Function => {
	return new Function('x', 'm', 'a', 's', code) as Part1Function;
};

class Part2Part {
	public xMin: number;
	public mMin: number;
	public aMin: number;
	public sMin: number;

	public xMax: number;
	public mMax: number;
	public aMax: number;
	public sMax: number;

	constructor(xMin?: number, xMax?: number, mMin?: number, mMax?: number, aMin?: number, aMax?: number, sMin?: number, sMax?: number) {
		this.xMin = xMin ?? 1;
		this.xMax = xMax ?? 4000;
		this.mMin = mMin ?? 1;
		this.mMax = mMax ?? 4000;
		this.aMin = aMin ?? 1;
		this.aMax = aMax ?? 4000;
		this.sMin = sMin ?? 1;
		this.sMax = sMax ?? 4000;
	}

	public get x() {
		return this.xMax - this.xMin + 1;
	}
	public get m() {
		return this.mMax - this.mMin + 1;
	}
	public get a() {
		return this.aMax - this.aMin + 1;
	}
	public get s() {
		return this.sMax - this.sMin + 1;
	}

	public get isValid() {
		return this.xMin <= this.xMax && this.mMin <= this.mMax && this.aMin <= this.aMax && this.sMin <= this.sMax;
	}
}

const parseInput = (rawInput: string, isPart2: boolean) => {
	const [instructions, parts] = rawInput.split("\n\n").map(info => info.split("\n"));

	const part1Workflows: Map<string, Part1Function> = new Map();
	const part2Workflows: Map<string, Array<{ varName: string, operator: string, value: number, result: string }>> = new Map();
	
	instructions.forEach(line => {
		const info = line.split("{");
		const name = info[0];	
	
		if (!isPart2) {
			const part1Expressions =
				info[1].substring(0, info[1].length - 1).split(",")
					.map(expression => {
						if (expression.indexOf(":") == -1) {
							return `return '${expression}';`
						}
						else {
							const parts = expression.split(":");
							return `if (${parts[0]}) return '${parts[1]}';`;
						}
					});
			// expressions.forEach(e => console.log(e));
			part1Workflows.set(name, createPart1Function(part1Expressions.join("\r\n")));
		}
		else {
			const part2Expressions = info[1].substring(0, info[1].length - 1).split(",");
	
			// expressions.forEach(e => console.log(e));
			part2Workflows.set(name, part2Expressions.map(e => {
				const eParts = e.split(":");
				return eParts.length == 1
					? {
						varName: "",
						operator: "",
						value: 0,
						result: eParts[0]
					}
					: {
						varName: eParts[0][0],
						operator: eParts[0][1],
						value: Number(eParts[0].substring(2)),
						result: eParts[1]
					}
			}));
		}
	});

	return { part1Workflows, part2Workflows, parts };
};

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput, isPart2);

	if (!isPart2) {
		const accepted: Array<Part> = new Array();
		const rejected: Array<Part> = new Array();
		input.parts.forEach(p => {
			const partInfo = p.substring(1, p.length - 1).split(",").map( i => Number(i.split("=")[1]));
			const part = new Part(
				Number(partInfo[0]),
				Number(partInfo[1]),
				Number(partInfo[2]),
				Number(partInfo[3])
			);
		
			let workflow = input.part1Workflows.get("in");
			while (workflow != undefined) {
				const result = workflow(part.x, part.m, part.a, part.s);
				if (result == "A") {
					accepted.push(part);
					break;
				}
				else if (result == "R") {
					rejected.push(part);
					break;
				}
				else {
					workflow = input.part1Workflows.get(result);
				}
			}
		});
		
		return accepted.reduce((acc, part) => acc + part.x + part.m + part.a + part.s, 0);
	}
	else {
		let part2Answer = 0;
		let currentPart2: { result: string, part: Part2Part };
		const part2Queue = [{ result: "in", part: new Part2Part() }];
		
		while ( (currentPart2 = part2Queue.shift()! ) != undefined ) {
			if (currentPart2.result == "A") {
				part2Answer += currentPart2.part.x * currentPart2.part.m  * currentPart2.part.a * currentPart2.part.s;
			}
			else if ( currentPart2.part.isValid && currentPart2.result != "R" ) {
				const conditions = input.part2Workflows.get(currentPart2.result)!;
				conditions.forEach(e => {
					const newPart = new Part2Part(
						currentPart2.part.xMin,
						currentPart2.part.xMax,
						currentPart2.part.mMin,
						currentPart2.part.mMax,
						currentPart2.part.aMin,
						currentPart2.part.aMax,
						currentPart2.part.sMin,
						currentPart2.part.sMax
					);
		
					if (e.operator == "<") {
						( newPart as any )[e.varName + "Max"] = Math.min(( newPart as any )[e.varName + "Max"], e.value - 1);
						( currentPart2.part as any )[e.varName + "Min"] = Math.max(( currentPart2.part as any )[e.varName + "Min"], e.value);
					}
					else if (e.operator == ">") {
						( newPart as any )[e.varName + "Min"] = Math.max(( newPart as any )[e.varName + "Min"], e.value + 1);
						( currentPart2.part as any )[e.varName + "Max"] = Math.min(( currentPart2.part as any )[e.varName + "Max"], e.value);
					}
		
					part2Queue.push({ result: e.result, part: newPart });
				});
			}
		}
		return part2Answer;		
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
				px{a<2006:qkq,m>2090:A,rfg}
				pv{a>1716:R,A}
				lnx{m>1548:A,A}
				rfg{s<537:gd,x>2440:R,A}
				qs{s>3448:A,lnx}
				qkq{x<1416:A,crn}
				crn{x>2662:A,R}
				in{s<1351:px,qqz}
				qqz{s>2770:qs,m<1801:hdj,R}
				gd{a>3333:R,R}
				hdj{m>838:A,pv}
				
				{x=787,m=2655,a=1222,s=2876}
				{x=1679,m=44,a=2067,s=496}
				{x=2036,m=264,a=79,s=2244}
				{x=2461,m=1339,a=466,s=291}
				{x=2127,m=1623,a=2188,s=1013}
				`,
				expected: 19114
			}
		],
		solution: part1
	},
	part2: {
		tests: [
			{
				input: `
				px{a<2006:qkq,m>2090:A,rfg}
				pv{a>1716:R,A}
				lnx{m>1548:A,A}
				rfg{s<537:gd,x>2440:R,A}
				qs{s>3448:A,lnx}
				qkq{x<1416:A,crn}
				crn{x>2662:A,R}
				in{s<1351:px,qqz}
				qqz{s>2770:qs,m<1801:hdj,R}
				gd{a>3333:R,R}
				hdj{m>838:A,pv}
				
				{x=787,m=2655,a=1222,s=2876}
				{x=1679,m=44,a=2067,s=496}
				{x=2036,m=264,a=79,s=2244}
				{x=2461,m=1339,a=466,s=291}
				{x=2127,m=1623,a=2188,s=1013}
				`,
				expected: 167409079868000
			}
		],
		solution: part2
	},
	trimTestInputs: true
});