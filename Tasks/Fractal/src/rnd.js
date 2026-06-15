import { color } from "./main.js"
import { IsWithTime } from "./main.js"

let gl;
let startTime;
let FrameW = 800;
let FrameH = 800;
let FractW = 1;
let FractH = 1;
let Mx = 0;
let My = 0;
let NewMx = 0;
let NewMy = 0;
let IsClick = 0;
let shaderFs = '';
let shaderVs = '';

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}

function getShader(shaderStr, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }

    return shader;
}

let u_time_location;
let FrameW_location;
let FrameH_location;
let Mx_location;
let My_location;
let IsClick_location;
let FractW_location;
let FractH_location;
let Color_location;
let IsWithTime_location;

function initShaders() {
    const vs = getShader(shaderFs, gl.FRAGMENT_SHADER);
    const fs = getShader(shaderVs, gl.VERTEX_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Program linkage error");
    }

    gl.useProgram(program);

    u_time_location = gl.getUniformLocation(program, "u_time");
    FrameW_location = gl.getUniformLocation(program, "FrameW");
    FrameH_location = gl.getUniformLocation(program, "FrameH");
    Mx_location = gl.getUniformLocation(program, "Mx");
    My_location = gl.getUniformLocation(program, "My");
    IsClick_location = gl.getUniformLocation(program, "IsClick");
    FractW_location = gl.getUniformLocation(program, "FractW");
    FractH_location = gl.getUniformLocation(program, "FractH");
    Color_location = gl.getUniformLocation(program, "Color");
    IsWithTime_location = gl.getUniformLocation(program, "TF");
}

let vertexBuffer;
function initBuffer() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let vertices = [-1, 3, -1, -1, 3, -1];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );
}

function drawScene() {
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let timeFromStart = new Date().getMilliseconds() - startTime;
    gl.uniform1f(u_time_location, timeFromStart / 1000.0);
    gl.uniform1i(FrameW_location, FrameW);
    gl.uniform1i(FrameH_location, FrameH);
    gl.uniform1i(Mx_location, Mx);
    gl.uniform1i(My_location, My);
    gl.uniform1i(IsClick_location, IsClick);
    gl.uniform1f(FractW_location, FractW);
    gl.uniform1f(FractH_location, FractH);
    gl.uniform3fv(Color_location, color);
    
    if (IsWithTime.TrueFalse)
        gl.uniform1i(IsWithTime_location, 1);
    else
        gl.uniform1i(IsWithTime_location, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.requestAnimationFrame(drawScene);
}

export function onStart() {
    let canvas = document.getElementById("webgl-canvas");

    canvas.onmousedown = () => {
        IsClick = 1;
    }

    canvas.onmouseup = () => {
        IsClick = 0;
    }

    canvas.onmousemove = (ev) => {
        console.log(`(${NewMx}, ${NewMy})`);
        console.log(`(${Mx}, ${My})`);
        
        if (IsClick == 1) {
            Mx += (ev.x - NewMx) * FractW;
            My += (ev.y - NewMy) * FractH;
        }
        NewMx = ev.x;
        NewMy = ev.y;
    };

    canvas.onwheel = (ev) => {
        ev.preventDefault();

        Mx += (NewMx * ev.deltaY / (5000) * FractW);
        My -= ((FrameH - NewMy) * ev.deltaY / (5000) * FractH);

        FractW += FractW * ev.deltaY / (5000);
        FractH += FractH * ev.deltaY / (5000);
    }

    canvas.ondblclick = () => {
        Mx = 0;
        My = 0;
        FractW = FractH = 1;
    }
    
    initGL(canvas);
    fetch("shaders/frag.glsl")
        .then (response => response.text())
        .then (text => shaderFs = text)
        .then (() => fetch("shaders/vert.glsl"))
            .then (response => response.text())
            .then (text => shaderVs = text)
            .then (() => initShaders())
            .then (() => initBuffer())
            .then (() => startTime = new Date().getMilliseconds())
            .then (() => drawScene());
}
