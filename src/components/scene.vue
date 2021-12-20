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
let controls; //后处理
export default {
  mounted() {
    this.init();
    this.createControls();

    this.addGLTF();
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
      const ambient = new THREE.AmbientLight(0x404040, 1);
      scene.add(ambient);
      scene.background = new THREE.Color("rgb(25, 35, 39)");
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
        gltf.scene.traverse((child) => {
          // 设置线框材质

          if (child.isMesh) {
            //这个判断模型是楼房还是其他  加载不同的材质
            if (["CITY_UNTRIANGULATED"].includes(child.name)) {
              // 拿到模型线框的Geometry
              const edges = new THREE.EdgesGeometry(child.geometry, 1);
              //设置模型的材质
              const lineMaterial = new THREE.LineBasicMaterial({
                // 线的颜色
                color: "rgba(38,133,254)",
              });
              //把数据组合起来
              const lineS = new THREE.LineSegments(edges, lineMaterial);
              //设置数据的位置
              lineS.position.set(
                child.position.x,
                child.position.y,
                child.position.z
              );
              //添加到场景
              scene.add(lineS);
              lineS.rotateX(-Math.PI / 2);
              // 模型面材质
              const material = new THREE.MeshPhysicalMaterial({
                //颜色为
                color: "rgb(50,170,255)",
                //金属度
                metalness: 0.5,
                //粗糙度
                roughness: 0.1,
                //透明度
                transmission: 0.9,
                //模型是否透明
                transparent: true,
              });
              //生成模型对象
              const mesh = new THREE.Mesh(child.geometry, material);
              //添加到场景
              scene.add(mesh);
              mesh.position.set(
                child.position.x,
                child.position.y,
                child.position.z
              );

              mesh.rotateX(-Math.PI / 2);
            } else if (["ROADS"].includes(child.name)) {
              //道路
              const material = new THREE.MeshBasicMaterial({
                color: "rgb(41,46,76)",
           
              });
              const mesh = new THREE.Mesh(child.geometry, material);
              mesh.rotateX(-Math.PI / 2);
              mesh.position.set(
                child.position.x,
                child.position.y,
                child.position.z
              );
              scene.add(mesh);
            } else {
              //地面
              const material = new THREE.MeshBasicMaterial({
                color: "#040912",
              });
              const mesh = new THREE.Mesh(child.geometry, material);
              scene.add(mesh);
              mesh.rotateX(-Math.PI / 2);
              mesh.position.set(
                child.position.x,
                child.position.y,
                child.position.z
              );
          
            }
          }
          // 设置线框材质
        });
      });
    },
  
  },
};
</script>
<style scoped>
html,
body,
#scene {
  width: 100vw;
  height: 100vh;
  z-index: 2;
  position: absolute;
  top: 0%;
}
</style>
