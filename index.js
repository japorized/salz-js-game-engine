/**
 * @function Cell
 *
 * @param {number} x    x-coordinate of the cell
 * @param {number} y    y-coordinate of the cell
 *
 * @return
 * A cell in the grid of Conway's Game of Life
 * { x, y, isAlive: boolean, equals: Function }
 */
export class Cell {
  constructor(x, y) {
    this.owner = -1;
    this.x = x;
    this.y = y;
    /**
     * @important
     * Should be cleared when not in use
     */
    this.tmpAliveNeighbours = [];
  }

  equals = cell => {
    if (cell.x === this.x) {
      if (cell.y === this.y) return true;
      return false;
    }
    return false;
  };
}

export const debugCell = cell => {
  return { x: cell.x, y: cell.y };
};

/**
 * @class Grid
 *
 * The playing field of Conway's Game of life
 */
export default class Grid {
  /**
   * @param {number} size    The width and height of grid
   */
  constructor(size) {
    const activeCells = [];

    this.size = size;
    this.cells = activeCells;
  }

  /**
   * Iterates the grid to the next state
   * turnMoves format is [move], where move.x is x and move.y is y
   *
   * @plan
   * 1. Flip cells (alive to dead, dead to alive)
   * 2. Find out if cells with alive neighbours will be born
   *    a. Get a unique list of cells with alive neighbours
   *    b. Check if each of these cells will be born next
   * 3. Find out if old cells will live or die
   */
  next(turnMoves = []) {
    /*
     * Apply Player Commands
     */
    for (const move of turnMoves) {
      const flip = new Cell(move.x, move.y);
      flip.owner = move.playerid;

      const flipIndex = this.cells.findIndex(cell => cell.equals(flip));
      if (flipIndex !== -1) {
        this.cells.splice(flipIndex, 1);
      } else {
        this.cells.push(flip);
      }
    }

    /*
     * Step Game of Life
     */
    const isAlive = cell => {
      return this.cells.findIndex(c => c.equals(cell)) !== -1;
    };

    const getNeighboursOf = cell => {
      const neighbours = [];
      for (const i of [-1, 0, 1]) {
        for (const j of [-1, 0, 1]) {
          if (i === 0 && j === 0) continue;
          const { x, y } = cell;
          const xShift = x + i;
          const yShift = y + j;
          const xMod = xShift < 0 ? xShift + this.size : xShift % this.size;
          const yMod = yShift < 0 ? yShift + this.size : yShift % this.size;
          const neighbourCell = new Cell(xMod, yMod);
          const gridCell = this.cells.filter(oldCell =>
            oldCell.equals(neighbourCell)
          );

          // We push an existing cell if there is any, as that passes the playerid info.
          // Otherwise, push the new neighbour who has -1 as playerid.
          if (gridCell.length !== 0) neighbours.push(...gridCell);
          else neighbours.push(neighbourCell);
        }
      }

      return neighbours;
    };

    const getAliveNeighboursOf = cell => {
      return getNeighboursOf(cell).filter(isAlive);
    };

    const most = aliveNeighbours => {
      const playersCount = {};
      aliveNeighbours.forEach(neighbour => {
        const { owner } = neighbour;
        if (owner !== -1)
          playersCount[owner] = playersCount[owner]
            ? playersCount[owner] + 1
            : 1;
      });

      // The game rules is such that players that join later have a priority
      // in gaining new cells, hence we need to reverse the array of keys
      return parseInt(
        Object.keys(playersCount)
          .reverse()
          .reduce((a, b) => {
            return playersCount[a] > playersCount[b] ? a : b;
          }),
        10
      );
    };

    const s = performance.now();
    const shouldBeBorn = neighbour => {
      let counter = 0;
      for (const i of [-1, 0, 1]) {
        for (const j of [-1, 0, 1]) {
          if (i === 0 && j === 0) continue;
          const xShift = neighbour.x + i;
          const yShift = neighbour.y + j;
          const xMod = xShift < 0 ? xShift + this.size : xShift % this.size;
          const yMod = yShift < 0 ? yShift + this.size : yShift % this.size;
          const neighbourCell = new Cell(xMod, yMod);

          // check if this neighbourCell is alive
          const neighbourCellIndex = this.cells.findIndex(cell =>
            cell.equals(neighbourCell)
          );
          if (neighbourCellIndex !== -1) {
            counter++;
            neighbour.tmpAliveNeighbours.push(this.cells[neighbourCellIndex]);
          }
        }
      }

      return counter === 3;
    };

    const setOwner = cell => {
      cell.owner = most(cell.tmpAliveNeighbours);
      cell.tmpAliveNeighbours = [];
      return cell;
    };

    const checked = {};
    const newBorns = [];
    for (let k = 0; k < this.cells.length; k++) {
      const currentCell = this.cells[k];

      for (const i of [-1, 0, 1]) {
        for (const j of [-1, 0, 1]) {
          if (i === 0 && j === 0) continue;
          const xShift = currentCell.x + i;
          const yShift = currentCell.y + j;
          const xMod = xShift < 0 ? xShift + this.size : xShift % this.size;
          const yMod = yShift < 0 ? yShift + this.size : yShift % this.size;
          const neighbour = new Cell(xMod, yMod);
          if (isAlive(neighbour)) continue;
          if (checked[`${neighbour.x},${neighbour.y}`] !== undefined) continue;

          checked[`${neighbour.x},${neighbour.y}`] = neighbour;
          if (shouldBeBorn(neighbour)) {
            setOwner(neighbour);
            newBorns.push(neighbour);
          }
        }
      }
    }

    const e = performance.now();
    console.log(`grid.next on ${this.cells.length}:`, e - s);

    const isHealthy = cell => {
      const numAliveNeighbours = getAliveNeighboursOf(cell).length;
      return [2, 3].includes(numAliveNeighbours);
    };

    const stillAliveCells = this.cells.filter(isHealthy);

    // step the turn
    this.cells = [...newBorns, ...stillAliveCells];
  }

  mountSnapshot = snapshot => {
    snapshot.forEach(cell => {
      const newCell = new Cell(cell.x, cell.y);
      newCell.owner = cell.playerid;
      this.cells.push(newCell);
    });
  };
}
