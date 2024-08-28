import { Repo, DocHandle } from "@automerge/automerge-repo";
import * as Automerge from "@automerge/automerge";

// SETUP AUTOMERGE
const repo = new Repo({});

type Id = number;
type Inklet = { x: number; y: number };
type Stroke = { inklets: Id[] };

type DocType = {
  inklets: Record<Id, Inklet>;
  strokes: Record<Id, Stroke>;
};

const handle: DocHandle<DocType> = repo.create({
  strokes: {},
  inklets: {},
});

let doc = handle.docSync()!;

// Simulate drawing a stroke
// We're adding strokes of 1000 inklets each
const strokeLength = 1000;

// Typically, you'd want add a bunch of inklets each frame
// 20 is on the low end, 50 is on the high end depending on how fast you're drawing
// On my machine with 20 inklets per frame, changes initially take about (5ms)
// This gets progressively worse though,
// after ~ a minute of drawing it takes about (16ms) which is the entire frame budget

// On my machine, 50 inklets eats up the entire frame budget immediately (16ms)

const inkletsPerFrame = 20;

let ids = 0;
let currentStrokeId: number | undefined = undefined;
let currentInkletIndex = 0;

let frameCount = 0;

function frame() {
  const start = performance.now();
  handle.change((doc) => {
    for (let i = 0; i < inkletsPerFrame; i++) {
      if (currentStrokeId === undefined) {
        currentStrokeId = ids++;
        doc.strokes[currentStrokeId] = { inklets: [] };
        currentInkletIndex = 0;
      }

      const inkletId = ids++;
      doc.inklets[inkletId] = { x: Math.random(), y: Math.random() };
      doc.strokes[currentStrokeId].inklets.push(inkletId);

      currentInkletIndex++;

      if (currentInkletIndex === strokeLength) {
        currentStrokeId = undefined;
      }
    }
  });

  const end = performance.now();
  console.log(`Frame ${frameCount} time: ${end - start} ms`);
  frameCount++;
  window.requestAnimationFrame(frame);
}

window.requestAnimationFrame(frame);
