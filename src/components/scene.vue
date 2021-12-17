<template>
  <div id="scene"></div>
</template>
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
let scene; //场景
let camera; //相机
let renderer; //创建渲染器
// eslint-disable-next-line no-unused-vars
let controls; //控制器
export default {
  mounted() {
    this.init();
    this.createControls();
    this.render();
      this.addGLTF();
  },
  methods: {
    init() {
      //创建场景
      scene = new THREE.Scene();
      /**
       * 透视投影相机设置
       */
      const width = window.innerWidth; // 窗口宽度
      const height = window.innerHeight; // 窗口高度

      /** 透视投影相机对象 */
      camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000);
      camera.position.set(6000, 9000, 6000); // 树上面观察
      camera.lookAt(scene.position); // 设置相机方向(指向的场景对象)
      // 创建渲染器对象
      const container = document.getElementById("scene");
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight); // 设置渲染区域尺寸
      container.appendChild(renderer.domElement); // body元素中插入canvas对象

        //创建点光源和环境光源
        const point = new THREE.PointLight(0xffffff);
        point.position.set(6000, 9000, 6000); // 点光源位置
        scene.add(point); // 点光源添加到场景中
        // 环境光
        const ambient = new THREE.AmbientLight(0x888888);
        scene.add(ambient);
    },
    createControls() {
      controls = new OrbitControls(camera, renderer.domElement);
    },
    render() {
      renderer.render(scene, camera);
      requestAnimationFrame(this.render); // 请求再次执行渲染函数render
    },
    addGLTF() {
      const loader = new GLTFLoader();
      loader.load("shanghai.gltf", (gltf) => {
        scene.add(gltf.scene);
      });
    },
  },
};
</script>
<style scoped>
html,
body,
#scene {
  width: 100%;
  height: 100vh;
  z-index: 2;
  position: absolute;
  top: 0%;
}
</style>
