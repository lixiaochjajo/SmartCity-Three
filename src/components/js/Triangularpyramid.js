/* eslint-disable */
import * as THREE from "three";
/**
 * 波纹散射图层
 * @param  options.scene three场景
 * @param  options.scale 缩放比例
 * @param  options.cone 存储圆形数据
 * @param  options.position 圆的位置
 * @param  options.speed 速度
 * @example
 */

class Triangularpyramid {
  constructor(option) {
    this.scene = option.scene;
    this.scale = option.scale||1;
    this.position = option.position;
    this.speed = option.speed / 100 || 0.01;
    this.cone = [];
    this.cone2 = [];
    this.cone3 = [];
    this.CreatRing();
  }
  CreatRing() {
    var geometry = new THREE.ConeGeometry(200, 400, 4);
    var geometry2 = new THREE.ConeGeometry(100, 1, 4);
    var geometry3 = new THREE.ConeGeometry(175, 1, 4);
    var material = new THREE.MeshPhysicalMaterial({
      color: "red",
      // metalness: 0.5,
      // roughness: 0.1,
      transmission: 0.6,
      transparent: true
    });
    var material2 = new THREE.MeshPhysicalMaterial({
        color: 'rgba(100,0,0)',
        // metalness: 0.5,
        // roughness: 0.1,
        transparent: false
      });
    for (let i = 0; i < this.position.length; i += 1) {
      const meshring = new THREE.Mesh(geometry, material);
      meshring.rotateX(Math.PI);
      meshring.scale.set( this.scale,  this.scale,  this.scale);
      meshring.position.set(this.position[i][0], this.position[i][1], this.position[i][2]);
      const meshring2 = new THREE.Mesh(geometry2, material2);
      meshring2.rotateX(Math.PI);
      meshring2.scale.set( this.scale,  this.scale,  this.scale);
      meshring2.position.set(this.position[i][0], this.position[i][1], this.position[i][2]);
      const meshring3 = new THREE.Mesh(geometry3, material2);
      meshring3.rotateX(Math.PI);
      meshring3.scale.set( this.scale,  this.scale,  this.scale);
      meshring3.position.set(this.position[i][0], this.position[i][1]+150, this.position[i][2]);
      this.cone.push(meshring);
      this.scene.add(this.cone[i]);
      this.cone2.push(meshring2);
      this.scene.add(this.cone2[i]);
      this.cone3.push(meshring3);
      this.scene.add(this.cone3[i]);


      // var spotLight = new THREE.SpotLight( 0xffffff );
      // spotLight.intensity = 20;
      // spotLight.angle = 0.1;
      // spotLight.castShadow = true;
      // spotLight.distance = 3000;
  
      // spotLight.position.set(this.position[i][0], this.position[i][1]+150, this.position[i][2] );
      // this.scene.add(spotLight);
      
      // var spotLightHelper = new THREE.SpotLightHelper( spotLight );

      // this.scene.add( spotLightHelper );
      // const point = new THREE.PointLight(0xffffff);
      // point.position.set(this.position[i][0], this.position[i][1]+150, this.position[i][2]); // 点光源位置
      // this.scene.add(point); // 点光源添加到场景中
    }
    this.thing = setInterval(() => {
      for (let i = 0; i < this.position.length; i += 1) {
        if (this.cone[i]) {
          this.cone[i].rotateY(this.speed );
          this.cone2[i].rotateY(this.speed );
          this.cone3 [i].rotateY(this.speed );
        }
      }
    }, 30);
  }
  delete() {
      for (let index = 0; index < this.cone.length; index++) {
         this.scene.remove(this.cone[index]);
         this.scene.remove(this.cone3[index]);
         this.scene.remove(this.cone2[index]);

      }
 
  }
}
export default Triangularpyramid;
