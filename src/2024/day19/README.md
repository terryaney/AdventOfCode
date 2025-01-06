# 🎄 Advent of Code 2024 - Day 19 - Linen Layout 🎄

## Info

Task description: [link](https://adventofcode.com/2024/day/19)

## Results

```
Time part 1: 10.596ms
Time part 2: 9.113ms
Both parts: 19.709ms
```

## Notes

Hypernuetrino reminded me of making my recursive function cacheable and also using a `Set` instead of array and looping through each element in array to see if current design 'started' with that.  Problem with my originally solution is that there were few hundred patterns I was looping through each time, versus using a `Set` where I could just loop through N iterations where N was the max length of largest pattern.