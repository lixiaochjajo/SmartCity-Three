/* eslint-disable */
import * as THREE from "three";
/**
 * 波动墙
 * @param  options.scene three场景
 * @param  options.radius 中心
 * @param  options.height 墙高度
 * @param  options.opacity 墙透明度
 * @param  options.color 墙颜色
 * @example
 */

class Wall {
  constructor(option) {
    this.scene = option.scene;
    this.radius = option.radius || 420;
    this.height = option.height || 120;
    this.opacity = option.opacity || 0.5;
    this.color = option.color || "#efad35";
    this.speed = option.speed || 0.5;
    this.mesh = ""; //生成的模型数据
    this.CreatRing();
  }
  CreatRing() {
    const vertexShader = `
uniform vec3 u_color;
uniform float time;
uniform float u_height;
 
varying float v_opacity;

void main() {
//模型点位置乘以一个0.0-1.0的系数，来模拟扩散效果。
    vec3 vPosition = position * mod(time/20.0, 1.0);
//模型的透明度和模型的高度呈反比
    v_opacity =1.0- position.y / u_height;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
`;
    const fragmentShader = ` 
uniform vec3 u_color;
uniform float u_opacity;
 
varying float v_opacity;

void main() { 
    //u_color是颜色 v_opacity * u_opacity是高度所产生的透明效果和模型传入的透明度的乘积。
    gl_FragColor = vec4(u_color, v_opacity * u_opacity);
}
`;
//获取参数
    const { radius, height, opacity, color, speed, renderOrder } = this;
//生成模型结构
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      32,
      1,
      true
    );
    //模型位置设置
    geometry.translate(0, height / 2, 0);
    //自定义模型材质
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_height: {
          value: height,
        },
        u_opacity: {
          value: opacity,
        },
        u_color: {
          value: new THREE.Color(color),
        },
        time: {
          value: 0,
        },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
    //组合材质和结构生成对象
    const mesh = new THREE.Mesh(geometry, material);
    //设置模型遮挡，把这个模型放到最前面防止遮挡
    mesh.renderOrder = renderOrder || 1;
    this.mesh = mesh;
  }
}

export default Wall;
