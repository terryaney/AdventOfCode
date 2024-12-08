# 🎄 Advent of Code 2024 - Day 7 - Bridge Repair 🎄

## Info

Task description: [link](https://adventofcode.com/2024/day/7)

## Results

```
Time part 1: 47.939ms
Time part 2: 5299.224ms
Both parts: 5347.163ms
```

## Notes

I didn't read story properly and assumed operator precedence and wrote that first.  Just putting here for reference.

```javascript
for (const permutation of permutations) {
	const values = [...equation.values];
	let opIndex = -1;
	while( ( opIndex = permutation.findIndex(p => p === "*") ) > -1 ) {
		const result = values[opIndex] * values[opIndex + 1];
		if (result > equation.result) {
			values.length = 0;
			break;
		}
		values.splice(opIndex, 2, result);
		permutation.splice(opIndex, 1);
	}
	const result = values.reduce((acc, val) => acc + val, 0);
	if (result === equation.result) {
		equation.valid = true;
		break;
	}
}
```