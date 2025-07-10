function drawTriangle(ctx, p0, p1, p2, color) {
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();         // optional outline
}

const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');
const width  = canvas.width, height = canvas.height;
const d = 400; // projection distance

// A simple cube model
const vertices = [
  {x:-1, y:-1, z:-1}, {x:1, y:-1, z:-1},
  {x:1, y:1, z:-1},   {x:-1, y:1, z:-1},
  {x:-1, y:-1, z:1},  {x:1, y:-1, z:1},
  {x:1, y:1, z:1},    {x:-1, y:1, z:1},
];
const faces = [
  [0,1,2,3], [4,5,6,7], // front/back
  [0,1,5,4], [2,3,7,6], // top/bottom
  [1,2,6,5], [0,3,7,4]  // sides
];

let angle = 0;

function project(v) {
  const scale = d / (v.z + d);
  return { x: v.x * scale + width/2, y: v.y * scale + height/2 };
}

function rotate(v, ax, ay, az) {
  // simple Euler rotations around x, y, z axes
  let {x,y,z} = v;
  // rotate X
  let cos = Math.cos(ax), sin = Math.sin(ax);
  [y,z] = [y*cos - z*sin, y*sin + z*cos];
  // rotate Y
  cos = Math.cos(ay); sin = Math.sin(ay);
  [x,z] = [x*cos - z*sin, x*sin + z*cos];
  // rotate Z
  cos = Math.cos(az); sin = Math.sin(az);
  [x,y] = [x*cos - y*sin, x*sin + y*cos];
  return {x,y,z};
}

function loop() {
  ctx.clearRect(0,0,width,height);
  const transformed = vertices.map(v => {
    // spin the model
    return rotate(v, angle, angle * 0.7, angle * 1.3);
  });

  // build triangles with projected 2D points + depth average
  const tris = faces.flatMap(face => {
    // split quads into two triangles
    const [a,b,c,d] = face;
    return [
      [a,b,c], [a,c,d]
    ];
  }).map(idxs => {
    const pts3 = idxs.map(i => transformed[i]);
    const depth = pts3.reduce((sum, p) => sum + p.z, 0)/3;
    const pts2  = pts3.map(project);
    return { pts2, depth };
  });

  // Painter’s algorithm
  tris.sort((t1,t2) => t2.depth - t1.depth);

  // draw
  tris.forEach(tri => {
    drawTriangle(ctx, tri.pts2[0], tri.pts2[1], tri.pts2[2], '#6699CC');
  });

  angle += 0.01;
  requestAnimationFrame(loop);
}

loop();

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp')    heliPos.z -= 0.1;
  if (e.key === 'ArrowDown')  heliPos.z += 0.1;
  if (e.key === 'ArrowLeft')  heliAngle -= 0.05;
  if (e.key === 'ArrowRight') heliAngle += 0.05;
});
