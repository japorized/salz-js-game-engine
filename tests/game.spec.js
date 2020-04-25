import Grid from "../index";

describe("game grid", () => {
  const grid = new Grid(25);

  it("can construct a grid of size 25", () => {
    expect(grid.size === 25).toBeTruthy();
    expect(grid.size !== 24).toBeTruthy();
  });

  it("starts with an empty collection of cells", () => {
    expect(grid.cells.length === 0).toBeTruthy();
  });

  it("can mount a snapshot with 3 cells", () => {
    grid.mountSnapshot([
      { x: 3, y: 3, playerid: 1 },
      { x: 2, y: 3, playerid: 1 },
      { x: 4, y: 3, playerid: 1 }
    ]);
    expect(grid.cells.length === 3).toBeTruthy();
  });
});

describe("game rules basic tests", () => {
  const grid = new Grid(50);
  grid.mountSnapshot([
    { x: 2, y: 3, playerid: 1 },
    { x: 3, y: 3, playerid: 1 },
    { x: 4, y: 3, playerid: 1 }
  ]);

  it("properly iterates to the first step", () => {
    grid.next([
      { x: 10, y: 10, playerid: 1 },
      { x: 15, y: 15, playerid: 1 },
      { x: 25, y: 25, playerid: 1 }
    ]);
    expect(grid.cells.length === 3).toBeTruthy();
  });

  it("properly iterates to the second step", () => {
    grid.next([
      { x: 5, y: 2, playerid: 1 },
      { x: 1, y: 4, playerid: 1 },
      { x: 25, y: 25, playerid: 1 }
    ]);
    expect(grid.cells.length === 3).toBeTruthy();
    expect(
      grid.cells.filter(cell => cell.equals({ x: 4, y: 2 })).length !== 0
    ).toBeTruthy();
    expect(
      grid.cells.filter(cell => cell.equals({ x: 2, y: 4 })).length !== 0
    ).toBeTruthy();
  });

  it("properly iterates to the third step (without new moves)", () => {
    grid.next([]);
    expect(grid.cells.length === 1).toBeTruthy();
  });

  it("properly iterates to the fourth step (without new moves), and have no cells left", () => {
    grid.next([]);
    expect(grid.cells.length === 0).toBeTruthy();
  });

  it("no new cells are made when no flipping is done on an empty grid", () => {
    grid.next([]);
    expect(grid.cells.length === 0).toBeTruthy();
  });
});

describe("game rules edge tests", () => {
  const grid = new Grid(5, 5);
  grid.mountSnapshot([
    { x: 1, y: 2, playerid: 1 },
    { x: 2, y: 2, playerid: 1 },
    { x: 3, y: 2, playerid: 1 }
  ]);

  it("brings empty cells with wrapped neighbours alive when GoL's conditions are met", () => {
    grid.next([
      { x: 4, y: 1, playerid: 1 },
      { x: 4, y: 3, playerid: 1 }
    ]);
    expect(
      grid.cells.findIndex(cell => cell.equals({ x: 0, y: 2 })).length !== -1
    ).toBeTruthy();
    expect(grid.cells.length === 8).toBeTruthy();
    grid.next([
      { x: 0, y: 1, playerid: 1 },
      { x: 4, y: 1, playerid: 1 }
    ]);
    expect(
      grid.cells.findIndex(cell => cell.equals({ x: 4, y: 0 })).length !== -1
    ).toBeTruthy();
    expect(grid.cells.length === 7).toBeTruthy();
    grid.next([{ x: 4, y: 3, playerid: 1 }]);
    expect(
      grid.cells.findIndex(cell => cell.equals({ x: 4, y: 4 })).length !== -1
    ).toBeTruthy();
    expect(
      grid.cells.findIndex(cell => cell.equals({ x: 0, y: 4 })).length !== -1
    ).toBeTruthy();
    expect(grid.cells.length === 14).toBeTruthy();
  });
});
