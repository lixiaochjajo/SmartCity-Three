import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

/**
 * 移动小车
 * @param  options.road 路径
 * @param  options.time 跑完整个路径的时间
 * @param  options.url 模型地址gltf格式
 * @param  options.scale 模型缩放比例
 * @param  options.scene 场景

 * @example
 */
THREE.GLTFLoader = GLTFLoader;
class Runcar {
  constructor(option) {
    this.road = option.road;
    this.time = option.time;
    this.url = option.url;
    this.scale = option.scale;
    this.scene = option.scene;
    this.creatcar(option);
  }

  creatcar(option) {
    const loader = new THREE.GLTFLoader();
    loader.load(option.url, (gltf) => {
      // gltf.scene 拿到这个可以处理模型
      gltf.scene.scale.set(option.scale, option.scale, option.scale);
      gltf.scene.position.set(option.road[0][0], option.road[0][1], option.road[0][2]);
      this.car = gltf.scene;
      this.scene.add(this.car);
    });

    const road = [];
    for (let i = 0; i < option.road.length; i += 1) {
      road.push(new THREE.Vector3(option.road[i][0], option.road[i][1], option.road[i][2]));
    }
    this.rodess = 0;
    this.curve = new THREE.CatmullRomCurve3(road); // 曲线路径
    this.thing = setInterval(() => {
      if (this.car) {
        this.rodess += 1 / (option.time * 100);
        // this.curve.getPoint(this.rodess);
        this.car.position.set(
          this.curve.getPoint(this.rodess).x,
          this.curve.getPoint(this.rodess).y,
          this.curve.getPoint(this.rodess).z,
        );
        this.car.lookAt(
          this.curve.getPoint(this.rodess + 0.01).x,
          this.curve.getPoint(this.rodess + 0.01).y,
          this.curve.getPoint(this.rodess + 0.01).z,
        );
      }
    }, 10);
  }

  delect() {
    if (this.car) { this.scene.remove(this.car); }
    if (this.thing) { clearInterval(this.thing); }
  }
}
export default Runcar;
