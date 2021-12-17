<template>
  <div id="scene"></div>
</template>
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
let scene; //场景
let camera; //相机
let renderer; //创建渲染器
// eslint-disable-next-line no-unused-vars
let controls; //控制器
let dataState = 1; //控制着色器闪烁
let composer; //后处理
export default {
  mounted() {
    this.init();
    this.createControls();

    this.addGLTF();
    this.addRenderPass();
    this.render();
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
      camera.position.set(600, 900, 600); // 树上面观察
      camera.lookAt(scene.position); // 设置相机方向(指向的场景对象)
      // 创建渲染器对象
      const container = document.getElementById("scene");
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container.clientWidth, container.clientHeight); // 设置渲染区域尺寸
      container.appendChild(renderer.domElement); // body元素中插入canvas对象

      //创建点光源和环境光源
      const point = new THREE.PointLight(0xffffff);
      point.position.set(600, 900, 600); // 点光源位置
      scene.add(point); // 点光源添加到场景中
      // 环境光
      const ambient = new THREE.AmbientLight(0x888888);
      scene.add(ambient);
    },
    createControls() {
      controls = new OrbitControls(camera, renderer.domElement);
    },
    render() {
      renderer.autoClear = false;
      renderer.clear();
      renderer.clearDepth();
      camera.layers.set(0);
      composer.render(scene, camera);
      if (
        composer.passes[1].strength > 1.0 ||
        composer.passes[1].strength < 0.0
      ) {
        dataState = -dataState;
      }
      composer.passes[1].strength += 0.01 * dataState;
      renderer.clearDepth();
      camera.layers.set(1);
      renderer.render(scene, camera);
      requestAnimationFrame(this.render); // 请求再次执行渲染函数render
    },
    addGLTF() {
      const loader = new GLTFLoader();
      loader.load("shanghai.gltf", (gltf) => {
        gltf.scene.traverse((child) => {
          // 设置线框材质
          const cityArray = ["CITY_UNTRIANGULATED"];
          if (child.isMesh) {
            //这个判断模型是楼房还是其他  加载不同的材质
            if (cityArray.includes(child.name)) {
              // 建筑物线框模式
              const edges = new THREE.EdgesGeometry(child.geometry, 1);
              const lineMaterial = new THREE.LineBasicMaterial({
                // 线的颜色
                color: "rgba(38,133,254)",
                transparent: true,
                linewidth: 1,
              });
              const lineS = new THREE.LineSegments(edges, lineMaterial);
              lineS.position.set(
                child.position.x,
                child.position.y,
                child.position.z
              );
              lineS.layers.set(0);
              scene.add(lineS);
              lineS.rotateX(-Math.PI / 2);
              // 建筑物线框模式
              const material = new THREE.MeshPhysicalMaterial({
                color: "rgb(50,170,255)",
                metalness: 0.5,
                roughness: 0.1,
                side: 2,
                transmission: 0.5,
                transparent: true,
              });
              const mesh = new THREE.Mesh(child.geometry, material);
              mesh.position.set(
                child.position.x,
                child.position.y,
                child.position.z
              );
              mesh.layers.set(1);
              scene.add(mesh);
              mesh.rotateX(-Math.PI / 2);
            } else {
              const material = new THREE.MeshPhysicalMaterial({
                color: "rgb(50,170,255)",
                transmission: 0.5,
                transparent: true,
              });
              const mesh = new THREE.Mesh(child.geometry, material);
              mesh.rotateX(-Math.PI / 2);
              mesh.position.set(
                child.position.x,
                child.position.y,
                child.position.z
              );
              mesh.layers.set(1);
              scene.add(mesh);
            }
          }
          // 设置线框材质
        });
      });
    },
    addRenderPass() {
      // 后处理
      const renderScene = new RenderPass(scene, camera);

      composer = new EffectComposer(renderer);
      composer.addPass(renderScene);
      const params2 = {
        exposure: 2,
        bloomStrength: 0.0,
        bloomThreshold: 0,
        bloomRadius: 0,
        debug: false,
      };

      let bloomPass2 = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight)
      );
      bloomPass2.renderToScreen = true;
      bloomPass2.threshold = params2.bloomThreshold;
      bloomPass2.strength = params2.bloomStrength;
      bloomPass2.radius = params2.bloomRadius;
      composer.addPass(bloomPass2);
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
