import { cn } from "@/lib/utils";

const R = 24;
type Pt = { x: number; y: number };
const polar = (r: number, deg: number, c: Pt = { x: 0, y: 0 }): Pt => {
  const a = (deg * Math.PI) / 180;
  return { x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) };
};
const pentagon = (c: Pt, r: number, rot: number): Pt[] =>
  Array.from({ length: 5 }, (_, i) => polar(r, rot + i * 72, c));
const pts = (ps: Pt[]) => ps.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

// Face-on truncated icosahedron: a centre pentagon ringed by five hexagons, with
// the next five pentagons peeking in at the rim (between the centre's seams).
const CENTRE = pentagon({ x: 0, y: 0 }, 7.5, -90);
const SEAMS = [0, 1, 2, 3, 4].map((i) => {
  const angle = -90 + i * 72;
  return { from: polar(7.5, angle), to: polar(13.5, angle) };
});
const RIM = [0, 1, 2, 3, 4].map((i) => {
  const angle = -90 + 36 + i * 72;
  return pentagon(polar(24.5, angle), 7, angle + 180);
});
// Hexagon edges: each seam end joins the nearest corner of the two rim pentagons beside it.
const HEX_EDGES = SEAMS.flatMap(({ to }, i) =>
  [RIM[i], RIM[(i + 4) % 5]].map((rim) => ({
    from: to,
    to: rim.reduce((best, p) => (dist(p, to) < dist(best, to) ? p : best)),
  }))
);

function Football({ className }: { className?: string }) {
  return (
    <svg viewBox="-26 -26 52 52" className={className} aria-hidden>
      <defs>
        <clipPath id="ball-clip">
          <circle r={R} />
        </clipPath>
      </defs>
      <circle r={R} fill="#ffffff" />
      <g clipPath="url(#ball-clip)" fill="#010816" stroke="#010816" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        <polygon points={pts(CENTRE)} />
        {RIM.map((rim, i) => (
          <polygon key={i} points={pts(rim)} />
        ))}
        {[...SEAMS, ...HEX_EDGES].map((l, i) => (
          <line key={i} x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y} />
        ))}
      </g>
      <circle r={R} fill="none" stroke="#010816" strokeWidth="2.5" />
    </svg>
  );
}

/** A football bouncing on the spot, with a ground shadow. Static when reduced motion is on. */
export function BouncingBall({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-28 w-16 flex-col items-center justify-end", className)}>
      <div className="origin-bottom animate-ball-bounce motion-reduce:animate-none">
        <Football className="size-14 animate-ball-spin motion-reduce:animate-none" />
      </div>
      <div className="mt-1 h-2 w-12 animate-ball-shadow rounded-[50%] bg-ink motion-reduce:animate-none" />
    </div>
  );
}
