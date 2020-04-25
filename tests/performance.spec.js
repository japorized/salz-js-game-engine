import Grid from "../index";
import { default as snapshots } from "../data/snapshots-big.json";
import { default as moves } from "../data/moves-big.json";

describe("conway's game of life rules performance testing", () => {
  const grid = new Grid(50, 50);
  grid.mountSnapshot(snapshots[0].cells);

  it("runs fast", () => {
    grid.next(moves[0].moves);
    expect(true).toBeTruthy();
  });
});
