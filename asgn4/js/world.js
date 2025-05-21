import { Cube } from './cube.js';
import { Sphere } from './sphere.js';

export function buildWorld(gl, textures, lightPos, spotlightPos) {

const objs = [];

  // Ground
  const ground = new Cube(gl, 0, 0.0, [0.2, 0.8, 0.2, 1.0]);
  ground.modelMatrix.translate(0, -0.05, 0).scale(10, 0.1, 10);
  objs.push(ground);

  // Main cube
  const cube = new Cube(gl, 0, 1.0, [1, 1, 1, 1]);
  cube.modelMatrix.translate(-1, 0.5, 0);
  objs.push(cube);

  // Sphere
  const sphere = new Sphere(gl, 24, 16, 0, 0.0, [0.8, 0.4, 1.0, 1.0]);
  sphere.modelMatrix.translate(1, 1, 0);
  objs.push(sphere);

  // Yellow light marker (do NOT push into objs)
  const lightMarker = new Cube(gl, 0, 0.0, [1, 1, 0, 1]);
  lightMarker.modelMatrix.setTranslate(lightPos[0], lightPos[1], lightPos[2]);
  lightMarker.modelMatrix.scale(0.1, 0.1, 0.1);
  const spotMarker = new Cube(gl, 0, 0.0, [1.0, 0.5, 0.0, 1.0]); // orange
  spotMarker.modelMatrix.setTranslate(spotlightPos[0], spotlightPos[1], spotlightPos[2]);
  spotMarker.modelMatrix.scale(0.1, 0.1, 0.1);

  return { objs, lightMarker, spotMarker };

}