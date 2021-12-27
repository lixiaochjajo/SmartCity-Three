/* eslint-disable */
import * as THREE from "three";
/**
 * 波纹散射图层
 * @param  options.scene three场景
 * @param  options.width 线宽度
 * @param  options.img 存储材质
 * @param  options.position 圆的位置
 * @param  options.speed 速度
 * @param  options.line 存储模型
 * @example
 */

class PipeLine {
  constructor(option) {
    this.scene = option.scene;
    this.speed = option.speed / 100 || 0.01;
    this.width = option.width||8;
    this.position = option.position;
    this.img = option.img;
    this.line = [];
    this.CreatRing();
  }
  CreatRing() {
    for(let i=0;i< this.position.length;i++)
    {
      const l = [];
      this.position[i].forEach(e => l.push(new THREE.Vector3(e[0], e[1], e[2])));
      var curve = new THREE.CatmullRomCurve3(l); // 曲线路径
      console.log(curve)
      var geometry = new THREE.TubeGeometry(curve, 20,  this.width, 8, false);
      const textureLoader = new THREE.TextureLoader();
      this.texture = textureLoader.load(this.img);
      this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping; //每个都重复
      this.texture.repeat.set(1, 1);
  
      const material = new THREE.MeshBasicMaterial({
        map: this.texture,
        side: THREE.BackSide,
        transparent: true
      });
      this.line.push( new THREE.Mesh(geometry, material))
      this.scene.add(this.line[i]);
      console.log(this.mesh);
      setInterval(() => {
        this.line[i].material.map.offset.x -= this.speed;
      }, 20);
    }
    
  }
  delete() {
    for (let index = 0; index < this.line.length; index++) {
      this.scene.remove(this.line[index]);
    }
  }
}
export default PipeLine;
