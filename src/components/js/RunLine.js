import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "./THREE.MeshLine";
import { Geometry } from "three/examples/jsm/deprecated/Geometry";
THREE.Geometry = Geometry;
/**
 * 波纹散射图层
 * @param  options.img 照片地址
 * @param  options.lineWidth 线宽度
 * @param  options.side 贴图样式
 * @param  options.camera 相机
 * @param  options.height 高度
 * @param  options.v0 点一
 * @param  options.v1 点二
 * @param  options.speed 流动速度
 * @param  options.el 节目场景元素
 * @param  options.type 线类型分run和top
 * @param  options.maxheight 当类型为top时最高上升高度
 * @param  options.line 存储线
 * @param  options.thing 存储setInterval事件
 * @example
 */
class RunLine {
  constructor(option) {
    this.img = option.img || "";
    this.lineWidth = option.lineWidth || 1;
    this.side = option.side || THREE.FrontSide;
    this.camera = option.camera || "";
    this.height = option.height || 100;
    this.v0 = option.v0 || new THREE.Vector3(0, 0, 0);
    this.v1 = option.v1 || new THREE.Vector3(0, 0, 0);
    this.speed = option.speed / 100 || 0.01;
    this.el = option.el || "";
    this.scene = option.scene || "";
    this.type = option.type || "run";
    this.maxheight = option.maxheight || 300;
    this.line = "";
    this.thing = "";
    this.creatline();
  }

  creatline() {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(this.img, (texture) => {
      this.texture = texture;
      this.texture.anisotropy = 16;
      this.texture.wrapS = THREE.RepeatWrapping; // 每个都重复
      this.texture.wrapT = THREE.RepeatWrapping;
      const resolution = new THREE.Vector2(
        this.el.offsetWidth,
        this.el.offsetHeight
      );
      const material1 = new MeshLineMaterial({
        color: "",
        map: this.texture,
        useMap: true,
        lineWidth: this.lineWidth,
        resolution,
        dashArray: 0, // 破折号之间的长度和间距。(0 -无破折号)
        dashRatio: 0.7, // 定义可见和不可见之间的比率(0 -更可见，1 -更不可见)。
        dashOffset: 1,
        transparent: true,
        sizeAttenuation: 1, // 使线宽不变，不管距离(1个单位是屏幕上的1px)(0 -衰减，1 -不衰减)
        side: THREE.FrontSide,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        near: this.camera.near,
        far: this.camera.far,
      });
      this.line = this.createAnimateLine({
        kind: "sphere", // 默认不填 为普通 ; 如为sphere,则表示球面建点
        type: "line", // 默认不填 为MeshLine ; 如为pipe,则表示管道线
        sphereHeightPointsArgs: [this.v0, this.v1],
        material: material1,
        number: 50,
        radius: 3, // 默认
      });
      if (this.type === "run") {
        this.line1 = this.createAnimateLine({
          kind: "sphere", // 默认不填 为普通 ; 如为sphere,则表示球面建点
          type: "line", // 默认不填 为MeshLine ; 如为pipe,则表示管道线
          sphereHeightPointsArgs: [this.v0, this.v1],
          material: material1,
          number: 50,
          radius: 3, // 默认
        });
      }

      this.scene.add(this.line);
      this.scene.add(this.line1);
      const { speed } = this;
      if (this.type === "run") {
        this.thing = setInterval(() => {
          this.line.material.uniforms.offset.value.x -= speed;
          this.line1.material.uniforms.offset.value.x -= speed;
        }, 30);
      } else if (this.type === "top") {
        this.thing = setInterval(() => {
          if (this.line.position.y < this.maxheight) {
            this.line.position.y += this.speed * 100;
          } else {
            this.line.position.y = 0;
          }
        }, 30);
      }
    });
  }

  createAnimateLine(option) {
    let curve;

    // 由两点之间连线成贝塞尔曲线
    const { sphereHeightPointsArgs } = option;
    const vX = (sphereHeightPointsArgs[1].x + sphereHeightPointsArgs[0].x) / 2;
    const vZ = (sphereHeightPointsArgs[1].z + sphereHeightPointsArgs[0].z) / 2;
    if (this.type === "run") {
      curve = new THREE.CubicBezierCurve3(
        sphereHeightPointsArgs[0],
        new THREE.Vector3(vX, this.height, vZ),
        new THREE.Vector3(vX, this.height, vZ),
        sphereHeightPointsArgs[1]
      );
    } else {
      curve = new THREE.CubicBezierCurve3(
        sphereHeightPointsArgs[0],
        new THREE.Vector3(vX, this.height, vZ),
        new THREE.Vector3(vX, this.height, vZ),
        sphereHeightPointsArgs[1]
      );
    }

    const geo = new THREE.Geometry();
    geo.setFromPoints(curve.getPoints(100));

    // const geo = new Geometry();
    // geo.vertices = option.sphereHeightPointsArgs;
    const meshLine = new MeshLine();
    meshLine.setGeometry(geo);
    return new THREE.Mesh(meshLine.geometry, option.material);
  }

  delete() {
    if (this.line) {
      this.scene.remove(this.line);
      this.scene.remove(this.line1);
    }
    if (this.thing) {
      clearInterval(this.thing);
    }
  }
}

export default RunLine;
