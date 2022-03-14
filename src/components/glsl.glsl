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
uniform vec3 uFlow;
uniform vec3 uFlowColor;
uniform vec3 uCityColor;
void main()
{
    //模型的基础颜色
    vec3 distColor=uCityColor;
    // 流动范围当前点z的高度加上流动线的高度
    float topY=vPosition.z+5.;
    if(height>vPosition.z&&height<topY){
        // 颜色渐变
        distColor=uFlowColor;
    }
    //定位当前点位位置
    vec2 position2D=vec2(vPosition.x,vPosition.y);
    //求点到原点的距离
    float Len=distanceTo(position2D,vec2(0,u0));
    if(Len>height&&Len<(height-100.)){
        // 颜色渐变
        distColor=uFlowColor;
    }
    gl_FragColor=vec4(distColor,.9);
}