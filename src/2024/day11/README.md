# 🎄 Advent of Code 2024 - Day 11 - Plutonian Pebbles 🎄

## Info

Task description: [link](https://adventofcode.com/2024/day/11)

## Results

```
Time part 1: 2.149ms
Time part 2: 79.734ms
Both parts: 81.883ms
```

## Notes

Couldn't figure out part 2.  Needed [HyperNeutrino's help](https://www.youtube.com/watch?v=pVfsmQSlVOQ), but I was on the right path.  My first part returns in 14ms, but the second part never seemed to return.  I started here:

```
let totalStones = 0;
while (stones.length > 0) {
	const stone = stones.pop()!;
	totalStones++;
	
	for (let i = stone.iteration; i < iterations; i++) {
		if ( stone.value == 0 ) {
			stone.value = 1;
		}
		else {
			var str = stone.value.toString();
			if (str.length % 2 == 0) {
				var half = Math.floor(str.length / 2);
				stone.value = Number(str.substring(0, half));
				stones.push({ value: Number(str.substring(half)), iteration: i + 1 });
			}
			else {
				stone.value *= 2024;
			}
		}
	}
}
return totalStones;
```

Must have still been a problem with allocation issues with too many stones.  So I listened to Hyper and coded her algorithm before viewing her code.

I didn't have a 'cacheable function call/result' coded right either.  Originally, I put the cache OUTSIDE the function declaration and it didn't work.  It was only slightly different that what is currently implemented, but I had to ask copilot how to write a 'cacheable function' to get this right.