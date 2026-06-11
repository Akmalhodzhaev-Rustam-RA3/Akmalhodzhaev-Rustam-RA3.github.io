#version 300 es
precision highp float;

layout (location = 0) out vec4 o_color;

uniform float u_time;
uniform int FrameW;
uniform int FrameH;
uniform int Mx;
uniform int My;
uniform int IsClick;
uniform vec3 CamLoc;

in vec3 Normal;
in vec3 Position;

vec3 Shade( vec3 P, vec3 N, vec3 V, vec3 Ka, vec3 Kd, vec3 Ks, float Ph, vec3 L, vec3 LColor )
{
  // Ambient
  vec3 color = Ka;

  // Diffuse
  if (dot(N, L) >= 0.0)
    color += LColor * Kd * dot(N, L);

  // Specular
  if (pow(dot(L, reflect(V, N)), Ph) >= 0.0)
    color += LColor * Ks * pow(dot(L, reflect(V, N)), Ph);

  return color;
}

void main( void )
{
    vec3 P = Position;
    vec3 V = normalize(P - CamLoc);
    vec3 L0 = vec3(0.0, 0.0, 30.0);
    vec3 L0Col = vec3(0.47, 0.0, 0.0);
    vec3 N = Normal;
    vec3 Ka = vec3(0.030, 0.01, 0.047);
    vec3 Kd = vec3(0.47, 0.18, 0.102);
    vec3 Ks = vec3(0.3, 0.80, 0.1);
    float Ph = 30.0;

    N = normalize(N);
    N = faceforward(N, V, N);

    vec3 color = Shade(P, N, V, Ka, Kd, Ks, Ph, L0, L0Col);

    //if (color.x <= 0.05 && color.y <= 0.05 && color.z <= 0.05)
    //  color = vec3(L0Col * 0.1);

    o_color = vec4(color, 1.0);
    o_color = vec4(N, 1.0);
    //o_color = vec4(1.0, 0.0, 1.0, 1.0);
}