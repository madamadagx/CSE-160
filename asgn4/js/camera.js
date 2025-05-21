// js/camera.js
import { Vector3, Matrix4 } from './cuon-matrix.js';

export class Camera {
  constructor(canvas) {
    this.eye = new Vector3([0, 2, 5]);
    this.at  = new Vector3([0, 2, 0]);
    this.up  = new Vector3([0, 1, 0]);

    this.viewMatrix = new Matrix4().setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
      this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
    );
    this.projMatrix = new Matrix4().setPerspective(
      60,                         
      canvas.width / canvas.height,
      0.1, 1000
    );

    this.speed     = 0.2;     
    this.turnSpeed = 0.2;      
  }

  _updateView() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
      this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
      this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
    );
  }

  moveForward() {
    const f = new Vector3(this.at.elements)
                  .sub(this.eye)
                  .normalize()
                  .mul(this.speed);
    this.eye.add(f);
    this.at .add(f);
    this._updateView();
  }

  moveBack() {
    const b = new Vector3(this.eye.elements)
                  .sub(this.at)
                  .normalize()
                  .mul(this.speed);
    this.eye.add(b);
    this.at .add(b);
    this._updateView();
  }

  moveLeft() {
    const fwd = new Vector3(this.at.elements).sub(this.eye);
    const s = Vector3.cross(this.up, fwd)
                   .normalize()
                   .mul(this.speed);
    this.eye.add(s);
    this.at .add(s);
    this._updateView();
  }

  moveRight() {
    const fwd = new Vector3(this.at.elements).sub(this.eye);
    const s = Vector3.cross(fwd, this.up)
                   .normalize()
                   .mul(this.speed);
    this.eye.add(s);
    this.at .add(s);
    this._updateView();
  }
  panLeft(degrees = 5) {
    this.pan(-degrees);
  }

  panRight(degrees = 5) {
    this.pan(degrees);
  }

  pan(deltaX) {
    const angle = deltaX * this.turnSpeed;
    const f     = new Vector3(this.at.elements).sub(this.eye);
    const rotM  = new Matrix4().setRotate(
                     angle,
                     this.up.elements[0],
                     this.up.elements[1],
                     this.up.elements[2]
                   );
    const f2    = rotM.multiplyVector3(f);

    this.at = new Vector3(this.eye.elements).add(f2);
    this._updateView();
  }
  tilt(deltaY) {
    const f = new Vector3(this.at.elements).sub(this.eye);
    const r = Vector3.cross(f, this.up).normalize();
    const rotM = new Matrix4().setRotate(
      deltaY * this.turnSpeed,  
      r.elements[0], r.elements[1], r.elements[2]
    );
    const f2 = rotM.multiplyVector3(f);
    this.at = new Vector3(this.eye.elements).add(f2);
    this._updateView();
  }
}
