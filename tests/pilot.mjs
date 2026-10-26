// A deterministic test pilot uses only the same frame inputs as a human.
// It does not teleport, alter health, remove barrels or award points.
export function pilot(snapshot) {
  const p = snapshot.player;
  if (p.ladder !== null) return { move: 0, climb: -1, jump: false };
  const floor = p.floor ?? p.lastFloor;
  const target = floor === 4 ? 850 : floor % 2 === 0 ? 816 : 144;
  const move = Math.abs(target - p.x) < 10 ? 0 : Math.sign(target - p.x);
  const danger = snapshot.barrels.some(b => b.floor === floor && Math.abs(b.y - p.y) < 28
    && Math.abs(b.x - p.x) < 85 && (b.x - p.x) * (b.direction * 84 - p.vx) < 0);
  return { move, climb: floor < 4 ? -1 : 0, jump: p.floor !== null && danger };
}
