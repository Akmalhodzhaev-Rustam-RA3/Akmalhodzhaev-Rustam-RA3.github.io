#version 300 es
precision highp float;

layout (location = 0) in vec3 a_pos;
layout (location = 1) in vec3 a_norm;

uniform mat4 MatrVP;
uniform mat4 MatrW;

out vec3 Normal;
out vec3 Position;

void main()
{
    gl_Position = MatrVP * MatrW * vec4(a_pos, 1.0);
    Normal = vec3(MatrW * vec4(a_norm, 1));
    Position = vec3(MatrW * vec4(a_pos, 1));
}