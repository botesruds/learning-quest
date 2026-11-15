/* Renders little 3D pictures of each piece for the build tray (once, at start-up). */
import { THREE } from "./gfx.js";
import { makePiece } from "./pieces.js";

let r = null;
export function pieceThumb(type, lv = 1, size = 112) {
  if (!r) {
    r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(1); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
  }
  r.setSize(size, size, false);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x667755, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(3, 5, 4); scene.add(sun);
  const n = type === "wall" ? { e: true, w: true } : {};
  const obj = makePiece(type, lv, n); scene.add(obj);
  const box = new THREE.Box3().setFromObject(obj), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  const big = Math.max(s.x, s.y * 1.1, s.z, 0.9);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  const d = big * 2.6; cam.position.set(c.x + d * 0.62, c.y + d * 0.55, c.z + d * 0.75); cam.lookAt(c);
  r.render(scene, cam);
  const url = r.domElement.toDataURL("image/png");
  return url;
}
