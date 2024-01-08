import run from "aoc-automation";
import * as util from '../../utils/index.js';

class CamelHand {
	public readonly cards: number[];
	public readonly bid: number;
	public readonly type: number;

	constructor(cards: string[], bid: number, isPart1: boolean) {
		this.bid = bid;

		// Convert cards to numbers...
		this.cards = cards.map(card => {
			let value: number;
			if (card === "A") {
				value = 14;
			} else if (card === "K") {
				value = 13;
			} else if (card === "Q") {
				value = 12;
			} else if (card === "J" && isPart1) {
				value = 11;
			} else if (card === "J") {
				value = 1;
			} else if (card === "T") {
				value = 10;
			} else {
				value = Number(card);
			}
			return value;
		});

		// Determine hand 'type'...
		this.type = 1; // Default to High Card...
		let consecutiveCards = 0;
		let currentCard = 0;

		const numberOfJokers = this.cards.filter(card => card == 1).length;
		// Don't process jokers...
		const orderedCards = [...this.cards.filter(card => card != 1)].sort((a, b) => a - b);

		for (let index = 0; index < orderedCards.length; index++) {
			let card = orderedCards[index];
			
			if ( card == currentCard ) {
				consecutiveCards++;
			}
			else {
				this.type = this.getCurrentType(consecutiveCards, this.type);
				consecutiveCards = 1;
				currentCard = card;
			}
		}
		// (EXPLAIN TO LUKE) One last time to process the last card...
		this.type = this.getCurrentType(consecutiveCards, this.type);

		// Handle jokers...this will NOT change the type while doing 'Part 1'
		this.type = this.getCurrentTypeWithJokers(numberOfJokers, this.type);
	}

	getCurrentTypeWithJokers(numberOfJokers: number, currentType: number) {
		/*
		7 - Five of Kind
		6 - Four of Kind
		5 - Full House
		4 - Three of Kind
		3 - Two Pair
		2 - One Pair
		1 - High Card
		*/

		if ( numberOfJokers == 5 || numberOfJokers == 4 ) {
			return 7; // Five of Kind
		}
		else if ( numberOfJokers == 3 ) {
			if ( currentType == 2 ) { // One Pair
				return 7; // Five of Kind
			}
			else {
				return 6; // Four of Kind
			}
		}
		else if (numberOfJokers == 2) {
			if ( currentType == 4 ) { // Three of Kind
				return 7; // Five of Kind
			}
			else if ( currentType == 2 ) { // One Pair
				return 6; // Four of Kind
			}
			else {
				return 4; // Three of Kind
			}
		}
		else if (numberOfJokers == 1) {
			if (currentType == 6) { // Four of Kind
				return 7; // Five of Kind
			}
			else if ( currentType == 4 ) { // Three of Kind
				return 6; // Four of Kind
			}
			else if ( currentType == 3 ) { // Two Pair
				return 5; // Full House
			}
			else if ( currentType == 2 ) { // One Pair
				return 4; // Three of Kind
			}
			else {
				return 2; // One Pair
			}
		}

		return currentType;
	}

	getCurrentType(consecutiveCards: number, currentType: number): number {
		/*
		7 - Five of Kind
		6 - Four of Kind
		5 - Full House
		4 - Three of Kind
		3 - Two Pair
		2 - One Pair
		1 - High Card
		*/
		if ( consecutiveCards == 5 ) {
			return 7; // five of kind
		}
		else if ( consecutiveCards == 4 ) {
			return 6; // four of kind
		}
		else if ( consecutiveCards == 3 ) {
			if ( currentType == 2 ) { // one pair
				return 5; // full house
			}
			else {
				return 4; // three of kind
			}
		}
		else if ( consecutiveCards == 2 ) {
			if ( currentType == 4 ) { // three of kind
				return 5; // full house
			}
			else if ( currentType == 2 ) { // one pair
				return 3; // two pair
			}
			else {
				return 2; // one pair
			}
		}
		else {
			// Just return current type
			return currentType;
		}
	}
}

function compareHands(handA: CamelHand, handB: CamelHand): number {
	// Compare hand types...
	if (handA.type == handB.type) {
		for (let index = 0; index < handA.cards.length; index++) {
			if (handA.cards[index] != handB.cards[index]) {
				return handA.cards[index] - handB.cards[index];
			}			
		}
	}

	return handA.type - handB.type;
}

const parseInput = (rawInput: string) => {
	const lines = util.parseLines(rawInput);
	return lines;
};

const solve = (rawInput: string, isPart2: boolean) => {
	const input = parseInput(rawInput);

	const hands =
		input.map(line => line.split(" "))
			.map(info => new CamelHand(info[0].split(""), Number(info[1].trim()), !isPart2));

	hands.sort(compareHands);

	return hands.reduce((acc, hand, index) => {
		return acc + hand.bid * (index + 1);
	}, 0);
};

const part1 = (rawInput: string) => solve(rawInput, false);
const part2 = (rawInput: string) => solve(rawInput, true);

run({
	onlyTests: false,
	part1: {
		tests: [
			{
				input: `
					32T3K 765
					T55J5 684
					KK677 28
					KTJJT 220
					QQQJA 483
				`,
				expected: 6440,
			}
		],
		solution: part1,
	},
	part2: {
		tests: [
			{
				input: `
					32T3K 765
					T55J5 684
					KK677 28
					KTJJT 220
					QQQJA 483
				`,
				expected: 5905,
	}
		],
		solution: part2,
	},
	trimTestInputs: true
});