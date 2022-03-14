<template>
  <div id="map"></div>
</template>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Wall from "./js/Wall";
import RunRing from "./js/RunRing";
import RunLine from "./js/RunLine";
const mapboxgl = require("mapbox-gl"); //引入组件

// eslint-disable-next-line no-unused-vars
var map;
let scene; //场景
let camera; //相机
let renderer; //创建渲染器

export default {
  mounted() {
    this.initmap();
    map.on("style.load", () => {
      let customLayer = this.setCustomLayer();
      map.addLayer(customLayer, "waterway-label");
      this.addGLTF();
      this.creatWall();
      this.creatRunLine();
    });
  },
  methods: {
    initmap() {
      mapboxgl.accessToken =
        "pk.eyJ1IjoibGl4aWFvY2hhbyIsImEiOiJjbDBxMndxZXcwZDJvM2puaXFocnd1aTAxIn0.5UxvjQgMxF9aYriiIyRnbg"; //这里请换成自己的token
      map = new mapboxgl.Map({
        container: "map", // container id 绑定的组件的id
        style: "mapbox://styles/mapbox/streets-v11", //地图样式，可以使用官网预定义的样式,也可以自定义
        center: [121.47, 31.23], // 初始坐标系
        zoom: 15, // starting zoom 地图初始的拉伸比例
        pitch: 60, //地图的角度，不写默认是0，取值是0-60度，一般在3D中使用
        bearing: -17.6, //地图的初始方向，值是北的逆时针度数，默认是0，即是正北
        antialias: true, //抗锯齿，通过false关闭提升性能
      });
    },
    setCustomLayer() {
      const customLayer = {
        id: "3d-model",
        type: "custom",
        renderingMode: "3d",
        onAdd: this.initThree,
        // eslint-disable-next-line no-unused-vars
        render: this.threeRender,
      };
      return customLayer;
    },
    initThree(map, gl) {
      //创建场景
      scene = new THREE.Scene();
      //天空盒

      //   const textureCube = new THREE.CubeTextureLoader().load([
      //     "1.jpg",
      //     "2.jpg",
      //     "3.jpg",
      //     "4.jpg",
      //     "5.jpg",
      //     "6.jpg",
      //   ]);
      //   scene.background = textureCube; // 作为背景贴图
      /**
       * 透视投影相机设置
       */
      const width = window.innerWidth; // 窗口宽度
      const height = window.innerHeight; // 窗口高度

      /** 透视投影相机对象 */
      camera = new THREE.PerspectiveCamera(60, width / height, 1, 700);
      camera.position.set(600, 900, 600); // 树上面观察
      camera.lookAt(scene.position); // 设置相机方向(指向的场景对象)
      // 创建渲染器对象
      //   const container = document.getElementById("scene");
      renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });
      //   container.appendChild(renderer.domElement); // body元素中插入canvas对象

      //创建点光源和环境光源
      const point = new THREE.PointLight(0xffffff);
      point.position.set(600, 900, 600); // 点光源位置
      scene.add(point); // 点光源添加到场景中
      // 环境光
      const ambient = new THREE.AmbientLight(0x404040, 1);
      scene.add(ambient);
      renderer.autoClear = false;
      //   pickingScene = new THREE.Scene(); //离屏渲染
      //   pickingTexture = new THREE.WebGLRenderTarget(1, 1); //离屏渲染
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
                child.position.y + 0,
                child.position.z
              );
              //   scene.add(mesh);
            } else {
              //地面
              const material = new THREE.MeshBasicMaterial({
                color: "#040912",
              });
              const mesh = new THREE.Mesh(child.geometry, material);
              //   scene.add(mesh);
              mesh.rotateX(-Math.PI / 2);
              mesh.position.set(
                child.position.x,
                child.position.y + 0,
                child.position.z
              );
            }
          }
          // 设置线框材质
        });
      });
    },
    threeRender(gl, matrix) {
      const modelOrigin = [121.47, 31.23];
      const modelAltitude = 770;
      const modelRotate = [Math.PI / 4, 0, 0];
      const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
        modelOrigin,
        modelAltitude
      );
      const modelTransform = {
        translateX: modelAsMercatorCoordinate.x,
        translateY: modelAsMercatorCoordinate.y,
        translateZ: modelAsMercatorCoordinate.z,
        rotateX: modelRotate[0],
        rotateY: modelRotate[1],
        rotateZ: modelRotate[2],
        scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
      };
      const rotationX = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(1, 0, 0),
        modelTransform.rotateX
      );
      const rotationY = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 1, 0),
        modelTransform.rotateY
      );
      const rotationZ = new THREE.Matrix4().makeRotationAxis(
        new THREE.Vector3(0, 0, 1),
        modelTransform.rotateZ
      );

      const m = new THREE.Matrix4().fromArray(matrix);
      const l = new THREE.Matrix4()
        .makeTranslation(
          modelTransform.translateX,
          modelTransform.translateY,
          modelTransform.translateZ
        )
        .scale(
          new THREE.Vector3(
            modelTransform.scale,
            -modelTransform.scale,
            modelTransform.scale
          )
        )
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(rotationZ);

      camera.projectionMatrix = m.multiply(l);
      this.cityanimate();
      renderer.resetState();
      renderer.render(scene, camera);
      map.triggerRepaint();
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
        object.position.y + 0,
        object.position.z
      );
      scene.add(city);
      // pickingScene.add(city);
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
        object.position.y + 0,
        object.position.z
      );
      //添加到场景
      scene.add(lineS);

      lineS.rotateX(-Math.PI / 2);
    },
    cityanimate() {
      this.height.value += 0.2;
      if (this.height.value > 100) {
        this.height.value = 0.0;
      }
    },
    creatWall() {
      const wallData = {
        position: {
          x: -150,
          y: 15,
          z: 100,
        },
        speed: 0.5,
        color: "#efad35",
        opacity: 1.0,
        radius: 420,
        height: 120,
        renderOrder: 5,
      };

      let wallMesh = new Wall(wallData);
      wallMesh.mesh.material.uniforms.time = this.height;
      scene.add(wallMesh.mesh);
    },
    creatRing() {
      this.RunRing1 = new RunRing({
        img: "clice.png",
        scene: scene,
        speed: 1,
        radius: 400,
        position: [
          [400, 20, 400],
          [100, 20, 1200],
        ],
      });
    },
    creatRunLine() {
      this.runline1 = new RunLine({
        img: "z1.png",
        camera: camera,
        height: 140,
        v0: new THREE.Vector3(60, 18, -279),
        v1: new THREE.Vector3(-17.5, 111.5, -23),
        el: document.getElementById("map"),
        scene: scene,
        speed: 1,
        lineWidth: 40,
        type: "run",
      });
      this.runline2 = new RunLine({
        img: "z_112.png",
        camera: camera,
        height: 140,
        v0: new THREE.Vector3(-113, 44, 666),
        v1: new THREE.Vector3(-17.5, 111.5, -23),
        el: document.getElementById("map"),
        scene: scene,
        speed: 1,
        lineWidth: 40,
        type: "run",
      });
      this.runline3 = new RunLine({
        img: "z_11.png",
        camera: camera,
        height: 140,
        v0: new THREE.Vector3(-418, 113, -12),
        v1: new THREE.Vector3(-17.5, 111.5, -23),
        el: document.getElementById("map"),
        scene: scene,
        speed: 1,
        lineWidth: 40,
        type: "run",
      });
      this.runline5 = new RunLine({
        img: "n.png",
        camera: camera,
        height: 140,
        v0: new THREE.Vector3(614, 18, 130),
        v1: new THREE.Vector3(-17.5, 111.5, -23),
        el: document.getElementById("map"),
        scene: scene,
        speed: 1,
        lineWidth: 40,
        type: "run",
      });
    },
    onDocumentMouseDown(event) {
      this.gpuClick();
      this.raycastClick(event);
    },
    raycastClick(event) {
      event.preventDefault();
      const vector = new THREE.Vector3(); // 三维坐标对象
      vector.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
      );
      vector.unproject(camera);
      const raycaster = new THREE.Raycaster(
        camera.position,
        vector.sub(camera.position).normalize()
      );
      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        const selected = intersects[0]; // 取第一个物体
        console.log(`x坐标:${selected.point.x}`);
        console.log(`y坐标:${selected.point.y}`);
        console.log(`z坐标:${selected.point.z}`);
      }
    },
    gpuClick() {
      //   renderer.setRenderTarget(pickingTexture);
      //   renderer.render(pickingScene, camera);
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

<style>
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
   height: 100%;
   overflow-y:hidden;
      overflow-x:hidden;
}
.mapboxgl-ctrl {
    display: none !important;
}
</style>