/* eslint-disable */
import * as THREE from 'three';
/**
 * 波纹散射图层
 * @param  options.img 照片地址
 * @param  options.speed 流动速度
 * @param  options.scene three场景
 * @param  options.radius 圆的半径
 * @param  options.thing 圆的位置
 * @param  options.meshrings 存储圆形数据
 * @example
 */

class RunRing {
  constructor(option) {
    this.img = option.img || '';
    this.speed = option.speed / 100 || 0.01;
    this.scene = option.scene;
    this.radius = option.radius || 100;
    this.position = option.position || [0, 0, 0];
    this.meshrings = [];
    this.CreatRing();
  }
  CreatRing() {
    //创建对象读取照片纹理
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(this.img, (texture) => {
      //创建圆圈结构
      const geometry = new THREE.RingGeometry(0, this.radius, 500);
      //创建材质 把读取到的图片赋给材质
      const material2 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        depthTest: true,
        blending: THREE.AdditiveBlending,
        map: texture,
      });
      //传入的多点的话生成多个模型
      for (let i = 0; i < this.position.length; i += 1) {
        //组合生成模型
        this.meshring = new THREE.Mesh(geometry, material2);
        //设置模型的X轴偏移量，让模型平铺再X面上
        this.meshring.rotateX(Math.PI / 2);
        //设置初始状态模型缩放比例
        this.meshring.scale.set(0.1, 0.1, 0.1);
        //设置模型位置
        this.meshring.position.set(this.position[i][0], this.position[i][1], this.position[i][2]);
        //储存模型对象，用于render改变属性和销毁对象
        this.meshrings.push(this.meshring)
        //添加到场景里面
        this.scene.add(this.meshrings[i]);

      }


    });
    //创建render，每一帧进行模型改变
    this.thing = setInterval(() => {
      //循环所有创建的模型，进行改变
      for (let i = 0; i < this.position.length; i += 1) {
        //如果模型已经创建
        if (this.meshrings[i]) {
          //当模型缩放比例小于1的时候，模型进行放大
          if (this.meshrings[i].scale.x < 1) {
            this.meshrings[i].scale.set(
              this.meshrings[i].scale.x + 0.01,
              this.meshrings[i].scale.x + 0.01,
              this.meshrings[i].scale.x + 0.01,
            );
          } else {
            //当模型比例大于1的时候，模型重置
            this.meshrings[i].scale.set(0.1, 0.1, 0.1);
          }
        }
      }

    }, 50);

  }
  delete() {
    //删除scene中对应的模型
    for (let i = 0; i < this.position.length; i += 1) {
      if (this.meshrings[i]) {
        this.scene.remove(this.meshrings[i]);
      }
    }
    if (this.thing) {
      //清除render事件
      clearInterval(this.thing);
    }
  }
}
export default RunRing;