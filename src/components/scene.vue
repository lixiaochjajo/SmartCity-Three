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
      this.cityanimate();
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
              this.setCityLineMaterial(child);
              this.setCityMaterial(child);
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
    setCityMaterial(object) {
      const shader = new THREE.ShaderMaterial({
        uniforms: {
          height: this.height,
          uFlowColor: {
            value: new THREE.Color("#5588aa"),
          },
          uCityColor: {
            value: new THREE.Color("#1B3045"),
          },
        },
        vertexShader: `
                varying vec3 vPosition;
                void main()
                {
                  vPosition = position;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
        fragmentShader: `
float distanceTo(vec2 src,vec2 dst)
{
    float dx=src.x-dst.x;
    float dy=src.y-dst.y;
    float dv=dx*dx+dy*dy;
    return sqrt(dv);
}
varying vec3 vPosition;
uniform float height;
uniform float uStartTime;
uniform vec3 uSize;
uniform vec3 uFlowColor;
uniform vec3 uCityColor;
void main()
{
    //模型的基础颜色
    vec3 distColor=uCityColor;
    // 流动范围当前点z的高度加上流动线的高度
    float topY=vPosition.z+10.;
    if(height>vPosition.z&&height<topY){
        // 颜色渐变
            float dIndex = sin((height - vPosition.z) / 10.0 * 3.14);
            distColor = mix(uFlowColor, distColor, 1.0-dIndex);

    }
    //定位当前点位位置
    vec2 position2D=vec2(vPosition.x,vPosition.y);
    //求点到原点的距离
    float Len=distanceTo(position2D,vec2(0,0));
      if(Len>height*30.0&&Len<(height*30.0+130.0)){
        // 颜色渐变
        float dIndex = sin((Len - height*30.0) / 130.0 * 3.14);
        distColor= mix(uFlowColor, distColor, 1.0-dIndex);
    }
    gl_FragColor=vec4(distColor,1.0);
}`,
                    transparent: true,
      });

      const city = new THREE.Mesh(object.geometry, shader);
      city.position.set(
        object.position.x,
        object.position.y,
        object.position.z
      );
      scene.add(city);
      city.rotateX(-Math.PI / 2);
    },
    setCityLineMaterial(object) {
      const edges = new THREE.EdgesGeometry(object.geometry, 1);
      //设置模型的材质
      const lineMaterial = new THREE.LineBasicMaterial({
        // 线的颜色
        color: "rgba(38,133,254)",
      });
      //把数据组合起来
      const lineS = new THREE.LineSegments(edges, lineMaterial);
      //设置数据的位置
      lineS.position.set(
        object.position.x,
        object.position.y,
        object.position.z
      );
      //添加到场景
      scene.add(lineS);
      lineS.rotateX(-Math.PI / 2);
    },
    cityanimate() {
      this.height.value += 0.2;
      if(this.height.value>100)
      {
        this.height.value=0.0
      }
    
    },
  },
  data() {
    return {
      height: {
        value: 0,
      },
    };
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
