#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

uniform float u_time;
uniform int FrameW;
uniform int FrameH;
uniform int Mx;
uniform int My;
uniform int IsClick;
uniform float FractW;
uniform float FractH;
uniform vec3 Color;
uniform int TF;

vec2 CmplSet( float A, float B )
{
  vec2 r;

  r.x = A;
  r.y = B;
  return r;
}

vec2 CmplAddCmpl( vec2 Z1, vec2 Z2 )
{
  vec2 r;

  r.x = Z1.x + Z2.x;
  r.y = Z1.y + Z2.y;
  return r;
}

vec2 CmplMulCmpl( vec2 Z1, vec2 Z2 )
{
  vec2 r;

  r.x = Z1.x * Z2.x - Z1.y * Z2.y;
  r.y = Z1.x * Z2.y + Z2.x * Z1.y;
  return r;
}

vec2 CmplSubCmpl( vec2 Z1, vec2 Z2 )
{
  Z2.x = -Z2.x;
  Z2.y = -Z2.y;

  return CmplAddCmpl(Z1, Z2);    
}

vec2 CmplMulNum( vec2 Z, float X )
{
  vec2 D;

  D.x = X * Z.x;
  D.y = X * Z.y;

  return D;
}

float CmplNorm( vec2 Z )
{
 return sqrt(Z.x * Z.x + Z.y * Z.y);
}

float CmplNorm2( vec2 Z )
{
  return Z.x * Z.x + Z.y * Z.y;
}

vec2 CmplDivCmpl( vec2 Z1, vec2 Z2 )
{
  return CmplMulNum(CmplMulCmpl(Z1, CmplSet(Z2.x, -Z2.y)), 1.0 / CmplNorm2(Z2));
}

void main()
{
  int n = 0;
  vec2 C, Z0, Z, Z1, Z11, Z12, Z13, Z14, Z15, Z16, Z17, Z2, Z3, Z4, Z5;

  Z = (gl_FragCoord.xy * vec2(FractW, FractH) - vec2(Mx, -My)) / vec2(FrameW, FrameH);

  while (Z.x * Z.x + Z.y * Z.y < 4.0 && n < 255)
  {
    Z11 = CmplMulCmpl(Z, Z);
    Z12 = CmplMulCmpl(Z, Z11);
    Z13 = CmplMulCmpl(Z, Z12);
    Z14 = CmplMulCmpl(Z, Z13);
    Z15 = CmplMulCmpl(Z, Z14);
    Z16 = CmplMulCmpl(Z, Z15);
    Z17 = CmplMulCmpl(Z, Z16);
    Z1 = CmplMulCmpl(Z, Z14);
    Z2 = CmplMulNum(Z1, 3.0);
    Z3 = CmplMulCmpl(Z, Z1);
    Z4 = CmplSubCmpl(Z3, CmplSet(1.0, 0.0));
    Z5 = CmplDivCmpl(Z4, Z2);

    if (TF == 1)
      Z5 = Z5 - vec2(u_time / 2.0, u_time / 2.0);
    Z = Z - Z5, n++;                    
  }

  vec3 col;
  
  if (TF == 1)
    col = vec3(float(n) * cos(u_time) / 255.0, float(n) * cos(u_time) * (sin(u_time) + 1.0) / 255.0, float(n) * (sin(u_time) + 1.0) / 255.0);
  else if (TF == 0)
    col = vec3(float(n) / 255.0, float(n) / 255.0, float(n) / 255.0);

  col = vec3(float(n) * cos(u_time) / 255.0, float(n) * cos(u_time) * (sin(u_time) + 1.0) / 255.0, float(n) * (sin(u_time) + 1.0) / 255.0);

  if (col.x * col.x + col.y * col.y + col.z * col.z <= 0.01)
    o_color = vec4(col, 1);
  else
    o_color = vec4(normalize(col + 0.30 * Color / 255.0), 1);
  //o_color = vec4(1, cos(u_time) * cos(u_time), 0, 1);
}