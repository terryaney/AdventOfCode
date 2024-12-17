# 🎄 Advent of Code 2024 - Day 6 - Guard Gallivant 🎄

## Info

Task description: [link](https://adventofcode.com/2024/day/6)

## Results

```
Time part 1: 5.447ms
Time part 2: 2863.142ms
Both parts: 2868.589ms
```

## Notes

Currently, part 2 is simply brute force.  After walking grid once and marking all the visited positions, for each of those positions that the Guard would have walked, I toggle from a `.` to a `#` and try to walk grid again and see if Guard ends up in a loop.

Will watch for videos/tips for people who solved it with a proper algorithm.