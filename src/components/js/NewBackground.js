/* eslint-disable */
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * 新建layer当作天空盒
 * @param  dom dom元素
 * @param  url 图片地址

 * @example
 */

class NewBackground {
  constructor(option) {
    this.urls = option.urls;
    this.dom = option.dom;
    this.initLayer();
  }
  initLayer() {
    let scene = new THREE.Scene();
    const textureCube = new THREE.CubeTextureLoader().load(this.urls);
    scene.background = textureCube; // 作为背景贴图
    const width = window.innerWidth; // 窗口宽度
    const height = window.innerHeight; // 窗口高度
    /** 透视投影相机对象 */
    let camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000);
    camera.position.set(6000, 9000, 6000); // 树上面观察
    camera.lookAt(scene.position); // 设置相机方向(指向的场景对象)
    const ambient = new THREE.AmbientLight(0x888888);
    scene.add(ambient);
    this.dom.style.zIndex = 1;
    this.dom.style.width = "100vw";
    this.dom.style.height = "100vh";
    let renderer = new THREE.WebGLRenderer({ antialias: true ,alpha:true});
    renderer.setSize(this.dom.clientWidth, this.dom.clientHeight); // 设置渲染区域尺寸
    this.dom.appendChild(renderer.domElement); // body元素中插入canvas对象
    let controls = new OrbitControls(camera, document.getElementById('scence'));

    this.thing = setInterval(() => {
      renderer.render(scene, camera); // 执行渲染操作
    }, 50);
  }

  remove() {}
}
export default NewBackground;
