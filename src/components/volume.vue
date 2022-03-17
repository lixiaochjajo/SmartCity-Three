<template>
  <div id="scene"></div>
</template>
<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
let scene; //场景
let camera; //相机
let renderer; //创建渲染器
// eslint-disable-next-line no-unused-vars
let controls;
let volume;

export default {
  mounted() {
    this.init();
    this.createControls();
    this.render();
    this.addVolume();
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
      camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
      camera.position.set(1, 2, 3); // 树上面观察
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
    },
    createControls() {
      controls = new OrbitControls(camera, renderer.domElement);
    },
    render() {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
      requestAnimationFrame(this.render); // 请求再次执行渲染函数render
      if (volume) {
        volume.material.uniforms.cameraPos.value.copy(camera.position);
        // mesh.rotation.z = -performance.now() / 7500;
        volume.material.uniforms.time_lxs.value = performance.now() / 3500;
      }
    },
    addVolume() {
      // Material

      const vertexShader = /* glsl */ `
					in vec3 position;

					uniform mat4 modelMatrix;
					uniform mat4 modelViewMatrix;
					uniform mat4 projectionMatrix;
					uniform vec3 cameraPos;

					out vec3 vOrigin;
					out vec3 vDirection;

					void main() {
						vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

						vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
						// vOrigin=vec3(1.0,1.0,0.0);
						vDirection = position - vOrigin;

						gl_Position = projectionMatrix * mvPosition;
					}
				`;
      const fragmentShader = /* glsl */ `
					precision highp float;
					precision highp sampler2D;
					const float _NoiseFreq = 2.0;
					const float _NoiseAmp = 1.0;
					uniform vec3 _NoiseAnim;
					uniform int _VolumeSteps;
					const float _Density=0.2;
					const float _StepSize=.02;
					const float _SphereRadius=1.0;
					uniform mat4 modelViewMatrix;
					uniform mat4 projectionMatrix;
					uniform float time_lxs;
					uniform float texture_bias;

					in vec3 vOrigin;
					in vec3 vDirection;

					out vec4 color;

					float hash(float h) {
						return fract(sin(h) * 43758.5453123);
					}

					float noise(vec3 x) {
						vec3 p = floor(x);
						vec3 f = fract(x);
						f = f * f * (3.0 - 2.0 * f);
					
						float n = p.x + p.y * 157.0 + 113.0 * p.z;
						return mix(
								mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
										mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y),
								mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
										mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
					}
					
					float fbm( vec3 p )
					{
					    float f = 0.0;
					    float amp = 0.5;
					    for(int i=0; i<4; i++)
					    {
					        // f += abs(noise(p)) * amp;
					        f += noise(p) * amp;
					        p *= 2.03;
					        amp *= 0.5;
						}
					    return f;
					}

					float Noise3D(in vec3 p3) {
						p3  = fract(p3 * 0.1031);
					    p3 += dot(p3, p3.yzx + 33.33);
					    return fract((p3.x + p3.y) * p3.z);
					}

					float SmoothNoise3D(in vec3 p) {
					    vec3 cell = floor(p);
					    vec3 local = fract(p);
					    local *= local * (3.0 - 2.0 * local);
					
					    float ldb = Noise3D(cell);                       // Left, Down, Back
					    float rdb = Noise3D(cell + vec3(1.0, 0.0, 0.0)); // Right, Down, Back
					    float ldf = Noise3D(cell + vec3(0.0, 0.0, 1.0)); // Left, Down, Front
					    float rdf = Noise3D(cell + vec3(1.0, 0.0, 1.0)); // Right, Down, Front
					    float lub = Noise3D(cell + vec3(0.0, 1.0, 0.0)); // Left, Up, Back
					    float rub = Noise3D(cell + vec3(1.0, 1.0, 0.0)); // Right, Up, Back
					    float luf = Noise3D(cell + vec3(0.0, 1.0, 1.0)); // Left, Up, Front
					    float ruf = Noise3D(cell + vec3(1.0, 1.0, 1.0)); // Right, Up, Front
					
					    return mix(mix(mix(ldb, rdb, local.x),
					                   mix(ldf, rdf, local.x),
					                   local.z),
					
					               mix(mix(lub, rub, local.x),
					                   mix(luf, ruf, local.x),
					                   local.z),
					
					               local.y);
					}

					float FractalNoise3D(in vec3 p, in float scale, in float octaves) {
					    float value = 0.0;
					    float nscale = 1.0;
					    float tscale = 0.0;
					
					    for (float octave=0.0; octave < octaves; octave++) {
					        value += SmoothNoise3D(p * pow(2.0, octave) * scale) * nscale;
					        tscale += nscale;
					        nscale *= 0.5;
					    }
					
					    return value / tscale;
					}

					float distanceFunc(vec3 p)
					{	
					
						// distance to sphere
					    float d = length(p);//-_SphereRadius;
						// offset distance with noise
						d += FractalNoise3D(p*_NoiseFreq + _NoiseAnim*time_lxs,2.,4.) * _NoiseAmp;
						// d+=fbm(p*_NoiseFreq + _NoiseAnim*time_lxs)*_NoiseAmp;
						// d+=SmoothNoise3D(p);
						
						return d;
					}
					// shade a point based on distance
					vec4 shade(float d)
					{	
						// return vec4(d,d,d,1.);
						// 云
					    // if (d >= 0.0 && d < 0.2) return (mix(vec4(3, 3, 3, 1), vec4(1, 1, 1, 0.8), d / 0.2));
						if (d >= 0.2 && d < 0.4) return (mix(vec4(1, 1, 1, 0.8), vec4(1, 1, 1, 0.6), (d - 0.2) / 0.2));
						if (d >= 0.4 && d < 0.6) return (mix(vec4(1, 1, 1, 0.6), vec4(1., 1, 1, 0.4), (d - 0.4) / 0.2));    
					    if (d >= 0.6 && d < 0.8) return (mix(vec4(1, 1, 1, 0.4), vec4(1, 1, 1, 0.2), (d - 0.6) / 0.2));
					    // if (d >= 0.8 && d < 1.0) return (mix(vec4(0, .0, 0, .2), vec4(0, .6, 1, 0), (d - 0.8) / 0.2));   

						//火
    					// if (d >= 0.0 && d < 0.2) return (mix(vec4(3, 3, 3, 1), vec4(1, 1, 0, 1), d / 0.2));
						// if (d >= 0.2 && d < 0.4) return (mix(vec4(1, 1, 0, 1), vec4(1, 0, 0, 1), (d - 0.2) / 0.2));
						// if (d >= 0.4 && d < 0.6) return (mix(vec4(1, 0, 0, 1), vec4(0, 0, 0, 0), (d - 0.4) / 0.2));    
                        //白
    					// if (d >= 0.6 && d < 0.8) return (mix(vec4(0, 0, 0, 0), vec4(0, .5, 1, 0.2), (d - 0.6) / 0.2));
    					// if (d >= 0.8 && d < 1.0) return (mix(vec4(0, .5, 1, .2), vec4(0, 0, 0, 0), (d - 0.8) / 0.2));            
    
						
					    return vec4(0.0, 0.0, 0.0, 0.0);
					}

					vec4 volumeFunc(vec3 p)
					{
						float d=distanceFunc(p);
						return shade(d-.2);
					}

					vec2 hitSphere(vec3 origin,vec3 dir){
						float b=dot(dir,origin);
						float c=dot(origin,origin)-_SphereRadius*_SphereRadius;

						float t0=-b-sqrt(b*b-c);
						float t1=-b+sqrt(b*b-c);
						t0=max(t0,0.);
						return vec2(t0,t1);
					}

					vec4 rayMarch(vec3 rayOrigin,vec3 rayStep,out vec3 pos)
					{
						vec4 sum=vec4(0.,0.,0.,0.);
						pos=rayOrigin;
						for(int i=0;i<_VolumeSteps;i++)
						{
							vec4 col=volumeFunc(pos);
							col.a*=_Density;
							col.rgb*=col.a;
							sum=sum+col*(1.0-sum.a);
							pos+=rayStep;
						}
						return sum;
					}

					void main(){
						vec3 rayDir = normalize( vDirection );

						vec2 bounds=hitSphere(vOrigin,rayDir);
						if(bounds.y<0.) discard;

						vec3 hitPos;
						//射线第一次进入球的位置
						vec3 p=vOrigin+bounds.x*rayDir;

						vec4 col=rayMarch(p,rayDir*_StepSize,hitPos);
						color = col;

						if ( color.a == 0.0 ) discard;

					}
				`;
      const boxSize = 1;
      const geometry = new THREE.SphereGeometry(boxSize, 16, 16);
      const material = new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          cameraPos: { value: new THREE.Vector3() },
          time_lxs: { value: 0 },
          _NoiseAnim: { value: new THREE.Vector3(0, -1, 0) },
          _VolumeSteps: { value: 48 },
        },
        vertexShader,
        fragmentShader,
        side: THREE.BackSide,
        transparent: true,
      });

      volume = new THREE.Mesh(geometry, material);
      scene.add(volume);
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
