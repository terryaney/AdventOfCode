/*******************************************************
 * Sample Map (11 rows x 5 columns):
 *
 *  0: #####
 *  1: ###E#
 *  2: ###.#
 *  3: #...#
 *  4: #.#.#
 *  5: #...#
 *  6: #.#.#
 *  7: #...#
 *  8: #.###
 *  9: #S###
 * 10: #####
 *
 *******************************************************/

const MAP_RAW = [
	"#####",
	"###E#",
	"###.#",
	"#...#",
	"#.#.#",
	"#...#",
	"#.#.#",
	"#...#",
	"#.###",
	"#S###",
	"#####",
  ];
  
  /** A convenient wrapper for the map. */
  class Grid {
	width: number;
	height: number;
	data: string[];
  
	constructor(lines: string[]) {
	  this.data = lines;
	  this.height = lines.length;
	  this.width = lines[0].length;
	}
  
	get(x: number, y: number): string {
	  return this.data[y][x];
	}
  
	inBounds(x: number, y: number): boolean {
	  return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}
  
	isWall(x: number, y: number): boolean {
	  return this.get(x, y) === "#";
	}
  }
  
  interface NodeState {
	x: number;
	y: number;
	dir: Direction; // 0=up,1=right,2=down,3=left
  }
  
  /** 
   * Directions encoded as 0=Up, 1=Right, 2=Down, 3=Left 
   * We'll define a helper for movement deltas.
   */
  const DIRECTION_VECTORS = [
	{ dx: 0, dy: -1 }, // Up
	{ dx: 1, dy: 0 },  // Right
	{ dx: 0, dy: 1 },  // Down
	{ dx: -1, dy: 0 }, // Left
  ];
  
  type Direction = 0 | 1 | 2 | 3;
  
  /**
   * Helper to turn left or right from the given direction.
   */
  function turnLeft(dir: Direction): Direction {
	return ((dir + 3) % 4) as Direction;
  }
  
  function turnRight(dir: Direction): Direction {
	return ((dir + 1) % 4) as Direction;
  }
  
  /**
   * A* priority queue entry
   */
  interface QueueEntry {
	state: NodeState;
	f: number; // = g + h
  }
  
  /**
   * We store for each (x,y,dir):
   *  - g (best distance from start)
   *  - parents (who lead to this node with that same cost)
   */
  class AStarSearch {
	private openSet: QueueEntry[] = [];
	private closedSet = new Set<string>(); // track visited states with final cost
  
	// best distance from start for (x,y,dir)
	private gScore: Map<string, number> = new Map();
  
	// for reconstructing *all* paths, we keep a list of parents
	// so if multiple paths lead to the same cost, we store them
	private parentMap: Map<string, NodeState[]> = new Map();
  
	constructor(private grid: Grid) {}
  
	private stateKey(x: number, y: number, dir: Direction): string {
	  return `${x},${y},${dir}`;
	}
  
	/**
	 * Heuristic: simple Manhattan distance ignoring orientation,
	 * because orientation can add extra cost, but we still keep it
	 * minimal. This is admissible but not always tight.
	 */
	private heuristic(x: number, y: number, goalX: number, goalY: number): number {
	  return Math.abs(goalX - x) + Math.abs(goalY - y);
	}
  
	/**
	 * Insert into the open set with priority
	 */
	private pushToOpenSet(state: NodeState, f: number): void {
	  const entry: QueueEntry = { state, f };
	  this.openSet.push(entry);
	  // We could use a real priority queue; for simplicity, we'll just sort
	  // after each push. For large grids, you'd want a binary heap.
	  this.openSet.sort((a, b) => a.f - b.f);
	}
  
	/**
	 * Pop from the open set (lowest f)
	 */
	private popFromOpenSet(): QueueEntry | undefined {
	  return this.openSet.shift();
	}
  
	/**
	 * Reconstruct all paths from the goal node back to the start using
	 * the `parentMap`.
	 */
	private reconstructAllPaths(endState: NodeState): NodeState[][] {
	  const paths: NodeState[][] = [];
	  const stack: NodeState[] = [];
  
	  const dfs = (current: NodeState) => {
		stack.push(current);
  
		const key = this.stateKey(current.x, current.y, current.dir);
		const parents = this.parentMap.get(key);
  
		if (!parents || parents.length === 0) {
		  // This is a start node with no parent
		  // The path is in reverse order => clone & reverse
		  paths.push([...stack].reverse());
		} else {
		  // Explore all parents
		  for (const p of parents) {
			dfs(p);
		  }
		}
  
		stack.pop();
	  };
  
	  dfs(endState);
	  return paths;
	}
  
	/**
	 * Main A* function. Returns the minimal cost
	 * and all distinct paths that achieve that cost.
	 */
	public findAllPaths(): { minCost: number; paths: NodeState[][][] } {
	  const { startX, startY, endX, endY } = this.findStartEnd();
  
	  // We start facing East => direction = 1
	  const startState: NodeState = { x: startX, y: startY, dir: 1 };
	  const startKey = this.stateKey(startX, startY, 1);
  
	  // Initialize
	  this.gScore.set(startKey, 0);
	  const h = this.heuristic(startX, startY, endX, endY);
	  this.pushToOpenSet(startState, 0 + h);
  
	  // Track the best cost to reach any orientation at (endX, endY)
	  let bestGoalCost = Number.POSITIVE_INFINITY;
	  // We'll collect the end states that reach the goal
	  const endStates: NodeState[] = [];
  
	  while (this.openSet.length > 0) {
		const currentEntry = this.popFromOpenSet();
		if (!currentEntry) break;
  
		const { state, f } = currentEntry;
		const key = this.stateKey(state.x, state.y, state.dir);
  
		// If f > bestGoalCost, we can't possibly find better or equal solutions
		if (f > bestGoalCost) {
		  break;
		}
  
		const currentG = this.gScore.get(key)!;
  
		// If we've reached the end cell (in any orientation), check if it's the best cost
		if (state.x === endX && state.y === endY) {
		  if (currentG < bestGoalCost) {
			bestGoalCost = currentG;
			endStates.length = 0; // clear
			endStates.push(state);
		  } else if (currentG === bestGoalCost) {
			// Another path with the same minimal cost
			endStates.push(state);
		  }
		  // We don't "return" yet because we want to gather all minimal paths.
		  continue;
		}
  
		// Mark this node as visited in the sense that we've popped it from the queue
		// (Though in typical A*, you'd store expansions in closedSet; here we do partial.)
		this.closedSet.add(key);
  
		// Explore neighbors:
		//
		// 1. Move forward
		// 2. Turn left + move
		// 3. Turn right + move
		//
		// (We assume we always move exactly 1 cell.)
		//
		// Also, watch out for walls or out-of-bounds.
  
		// ========== 1. Move forward (cost = 1) ==========
		{
		  const { dx, dy } = DIRECTION_VECTORS[state.dir];
		  const nx = state.x + dx;
		  const ny = state.y + dy;
		  if (this.grid.inBounds(nx, ny) && !this.grid.isWall(nx, ny)) {
			const nextKey = this.stateKey(nx, ny, state.dir);
			const tentativeG = currentG + 1;
			const existingG = this.gScore.get(nextKey);
			if (existingG === undefined || tentativeG < existingG) {
			  this.gScore.set(nextKey, tentativeG);
			  this.recordParent(nextKey, state);
			  const nh = this.heuristic(nx, ny, endX, endY);
			  this.pushToOpenSet({ x: nx, y: ny, dir: state.dir }, tentativeG + nh);
			} else if (existingG === tentativeG) {
			  // Another equally good parent
			  this.recordParent(nextKey, state);
			}
		  }
		}
  
		// ========== 2. Turn left + move (cost = 1001) ==========
		{
		  const newDir = turnLeft(state.dir);
		  const { dx, dy } = DIRECTION_VECTORS[newDir];
		  const nx = state.x + dx;
		  const ny = state.y + dy;
		  if (this.grid.inBounds(nx, ny) && !this.grid.isWall(nx, ny)) {
			const nextKey = this.stateKey(nx, ny, newDir);
			const tentativeG = currentG + 1001;
			const existingG = this.gScore.get(nextKey);
			if (existingG === undefined || tentativeG < existingG) {
			  this.gScore.set(nextKey, tentativeG);
			  this.recordParent(nextKey, state);
			  const nh = this.heuristic(nx, ny, endX, endY);
			  this.pushToOpenSet({ x: nx, y: ny, dir: newDir }, tentativeG + nh);
			} else if (existingG === tentativeG) {
			  this.recordParent(nextKey, state);
			}
		  }
		}
  
		// ========== 3. Turn right + move (cost = 1001) ==========
		{
		  const newDir = turnRight(state.dir);
		  const { dx, dy } = DIRECTION_VECTORS[newDir];
		  const nx = state.x + dx;
		  const ny = state.y + dy;
		  if (this.grid.inBounds(nx, ny) && !this.grid.isWall(nx, ny)) {
			const nextKey = this.stateKey(nx, ny, newDir);
			const tentativeG = currentG + 1001;
			const existingG = this.gScore.get(nextKey);
			if (existingG === undefined || tentativeG < existingG) {
			  this.gScore.set(nextKey, tentativeG);
			  this.recordParent(nextKey, state);
			  const nh = this.heuristic(nx, ny, endX, endY);
			  this.pushToOpenSet({ x: nx, y: ny, dir: newDir }, tentativeG + nh);
			} else if (existingG === tentativeG) {
			  this.recordParent(nextKey, state);
			}
		  }
		}
	  }
  
	  // Reconstruct all minimal paths
	  const allPaths: NodeState[][][] = endStates.map((endState) =>
		this.reconstructAllPaths(endState)
	  );
  
	  return { minCost: bestGoalCost, paths: allPaths };
	}
  
	/**
	 * Record that `childKey` can come from `parent`.
	 */
	private recordParent(childKey: string, parent: NodeState) {
	  let arr = this.parentMap.get(childKey);
	  if (!arr) {
		arr = [];
		this.parentMap.set(childKey, arr);
	  }
	  arr.push(parent);
	}
  
	/**
	 * Find S (start) and E (end) positions in the grid.
	 * We'll assume there's exactly one S and one E.
	 */
	private findStartEnd() {
	  let startX = -1,
		startY = -1;
	  let endX = -1,
		endY = -1;
  
	  for (let y = 0; y < this.grid.height; y++) {
		for (let x = 0; x < this.grid.width; x++) {
		  const c = this.grid.get(x, y);
		  if (c === "S") {
			startX = x;
			startY = y;
		  } else if (c === "E") {
			endX = x;
			endY = y;
		  }
		}
	  }
  
	  return { startX, startY, endX, endY };
	}
  }
  
  // ------------------ Usage Example ------------------ //
  
  function runExample() {
	const grid = new Grid(MAP_RAW);
	const search = new AStarSearch(grid);
	const { minCost, paths } = search.findAllPaths();
  
	console.log("Minimal Cost:", minCost);
  
	// `paths` is an array of arrays-of-paths,
	// because each distinct end orientation might yield multiple distinct path reconstructions.
	// Flatten them into a single array if desired:
	const allDistinctPaths = ([] as NodeState[][]).concat(...paths);
  
	console.log("Number of distinct minimal paths:", allDistinctPaths.length);
  
	allDistinctPaths.forEach((path, idx) => {
	  console.log(`Path #${idx + 1} (length = ${path.length})`);
	  console.log(
		path
		  .map(
			(s) => `(${s.x},${s.y},dir=${s.dir})`
		  )
		  .join(" -> ")
	  );
	});
  }
  
  // Run
  runExample();
  