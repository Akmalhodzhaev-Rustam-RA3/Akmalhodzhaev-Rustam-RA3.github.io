import { mat4, vec3, vec4 } from "gl-matrix"

let gl;
let startTime;
let FrameW = 1000;
let FrameH = 1000;
let Mx = 0;
let My = 0;
let NewMx = 0;
let NewMy = 0;
let IsClick = 0;
let shaderFs = ``;
let shaderVs = ``;
let PI = 3.14159265358979323846;

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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
let MatrVP_location;
let MatrW_location;
let CamLoc_location;

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
    MatrVP_location = gl.getUniformLocation(program, "MatrVP");
    MatrW_location = gl.getUniformLocation(program, "MatrW");
    CamLoc_location = gl.getUniformLocation(program, "CamLoc");
}

let vertexBuffer, indexBuffer, normalsBuffer;
let GRID_H = 30, GRID_W = 30;
let MatrP = mat4.create(), MatrV = mat4.create(), MatrVP = mat4.create(), MatrW = mat4.create();
let CamLoc = vec3.create(), CamAt = vec3.create(), CamUp = vec3.create();

function initBuffer() {
    CamLoc[0] = CamLoc[1] = 0;
    CamLoc[2] = 15;
    CamAt[0] = CamAt[1] = CamAt[2] = 0;
    CamUp[0] = CamUp[2] = -0.40824831;
    CamUp[1] = 0.81649661;

    mat4.identity(MatrW);
    mat4.lookAt(MatrV, CamLoc, CamAt, CamUp);

    /* Create positions biffer */
    let vertices = [];
    let normals = [];

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let i, theta, j, phi, R = 5;

    /*
    for (i = 0, theta = 0; i < GRID_H; i++, theta += PI / (GRID_H - 1))
        for (j = 0, phi = 0; j < GRID_W; j++, phi += 2 * PI / (GRID_W - 1))
        {
            vertices[(i * GRID_W + j) * 3 + 0] = R * Math.sin(theta) * Math.sin(phi);
            vertices[(i * GRID_W + j) * 3 + 1] = R * Math.cos(theta);
            vertices[(i * GRID_W + j) * 3 + 2] = R * Math.sin(theta) * Math.cos(phi);
            normals[(i * GRID_W + j) * 3 + 0] = 0;
            normals[(i * GRID_W + j) * 3 + 1] = 0;
            normals[(i * GRID_W + j) * 3 + 2] = 0;
        }
    */

    for (i = 0, theta = -1; i < GRID_H; i++, theta += 2 / (GRID_H - 1))
        for (j = 0, phi = 0; j < GRID_W; j++, phi += 2 * PI / (GRID_W - 1))
        {
            vertices[(i * GRID_W + j) * 3 + 0] = (R + theta * Math.cos(phi / 2) / 2) * Math.cos(phi);
            vertices[(i * GRID_W + j) * 3 + 1] = (R + theta * Math.cos(phi / 2) / 2) * Math.sin(phi);
            vertices[(i * GRID_W + j) * 3 + 2] = theta * Math.sin(phi / 2) / 2;
            normals[(i * GRID_W + j) * 3 + 0] = 0;
            normals[(i * GRID_W + j) * 3 + 1] = 0;
            normals[(i * GRID_W + j) * 3 + 2] = 0;
        }

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    /* Create normals biffer */
    normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);

    for (i = 0; i < GRID_H - 1; i++)
        for (j = 0; j < GRID_W - 1; j++)
        {
            let N0 = vec3.create(), N1 = vec3.create(), N2 = vec3.create(), N3 = vec3.create();
            let a = vec3.create(), b = vec3.create(),
                c = vec3.create(), d = vec3.create(),
                e = vec3.create(), f = vec3.create(),
                g = vec3.create(), h = vec3.create(),
                v0 = vec3.create(), v1 = vec3.create(),
                v2 = vec3.create(), v3 = vec3.create();

            v0[0] = vertices[((i + 1) * GRID_W + j + 1) * 3 + 0], v0[1] = vertices[((i + 1) * GRID_W + j + 1) * 3 + 1], v0[2] = vertices[((i + 1) * GRID_W + j + 1) * 3 + 2];
            v1[0] = vertices[((i + 1) * GRID_W + j) * 3 + 0], v1[1] = vertices[((i + 1) * GRID_W + j) * 3 + 1], v1[2] = vertices[((i + 1) * GRID_W + j) * 3 + 2];
            v2[0] = vertices[(i * GRID_W + j) * 3 + 0], v2[1] = vertices[(i * GRID_W + j) * 3 + 1], v2[2] = vertices[(i * GRID_W + j) * 3 + 2];
            v3[0] = vertices[(i * GRID_W + j + 1) * 3 + 0], v3[1] = vertices[(i * GRID_W + j + 1) * 3 + 1], v3[2] = vertices[(i * GRID_W + j + 1) * 3 + 2];
            vec3.sub(a, v0, v1);
            vec3.sub(b, v2, v1);
            vec3.sub(c, v3, v0);
            vec3.sub(d, v1, v0);
            vec3.sub(e, v2, v3);
            vec3.sub(f, v0, v3);
            vec3.sub(g, v1, v2);
            vec3.sub(h, v3, v2);
            vec3.cross(N0, g, h);
            vec3.cross(N1, e, f);
            vec3.cross(N2, a, b);
            vec3.cross(N3, c, d);

            normals[(i * GRID_W + j) * 3 + 0] += N0[0];
            normals[(i * GRID_W + j) * 3 + 1] += N0[1];
            normals[(i * GRID_W + j) * 3 + 2] += N0[2];
            normals[(i * GRID_W + j + 1) * 3 + 0] += N1[0];
            normals[(i * GRID_W + j + 1) * 3 + 1] += N1[1];
            normals[(i * GRID_W + j + 1) * 3 + 2] += N1[2];
            normals[((i + 1) * GRID_W + j) * 3 + 0] += N2[0];
            normals[((i + 1) * GRID_W + j) * 3 + 1] += N2[1];
            normals[((i + 1) * GRID_W + j) * 3 + 2] += N3[2];
            normals[((i + 1) * GRID_W + j + 1) * 3 + 0] += N3[0];
            normals[((i + 1) * GRID_W + j + 1) * 3 + 1] += N3[1];
            normals[((i + 1) * GRID_W + j + 1) * 3 + 2] += N3[2];
        }

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(normals),
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, true, 0, 0);

    /* Create indexes biffer */
    let indexes = [];

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    let i2 = 0, j2 = 0, id = 0, k = 0;
    
    for (id = 0, k = 0, i2 = 0; i2 < (GRID_H - 1); i2++)
        for (j2 = 0; j2 < GRID_W; j2++, id++)
        {
            indexes[k++] = id;
            indexes[k++] = (id + 1);
            indexes[k++] = (id + GRID_W);

            indexes[k++] = (id + GRID_W + 1);
            indexes[k++] = (id + GRID_W);
            indexes[k++] = (id + 1);
        }

    gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Int32Array(indexes),
        gl.STATIC_DRAW
    );
}

function drawScene() {
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let timeFromStart = new Date().getMilliseconds() - startTime;
    gl.uniform1f(u_time_location, timeFromStart / 1000.0);
    gl.uniform1i(FrameW_location, FrameW);
    gl.uniform1i(FrameH_location, FrameH);
    gl.uniform1i(Mx_location, Mx);
    gl.uniform1i(My_location, My);
    gl.uniform1i(IsClick_location, IsClick);
    gl.uniformMatrix4fv(MatrVP_location, false, MatrVP);
    gl.uniformMatrix4fv(MatrW_location, false, MatrW);
    gl.uniform3fv(CamLoc_location, CamLoc);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLE_STRIP, (GRID_H - 1) * (GRID_W - 1) * 2 * 3, gl.UNSIGNED_INT, 0);

    /*
    gl.drawArrays(gl.LINES, 0, GRID_H * GRID_W);
    */
    
    window.requestAnimationFrame(drawScene);
}

function MatrixChange(canvas) {
    mat4.lookAt(MatrV, CamLoc, CamAt, CamUp);
    mat4.perspective(MatrP, Math.PI / 2, canvas.clientWidth / canvas.clientHeight, 0.1, 100.0);
    mat4.multiply(MatrVP, MatrP, MatrV);
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
        /*
        console.log(`(${NewMx}, ${NewMy})`);
        console.log(`(${Mx}, ${My})`);
        */
        if (IsClick == 1) {
            mat4.rotateY(MatrW, MatrW, Mx / 47);
            mat4.rotateX(MatrW, MatrW, (ev.y - NewMy) / 47);
            mat4.rotateY(MatrW, MatrW, -Mx / 47);
            
            mat4.rotateY(MatrW, MatrW, -(ev.x - NewMx) / 47);

            Mx += (ev.x - NewMx);
            My += (ev.y - NewMy);
        }
        NewMx = ev.x;
        NewMy = ev.y;
    };

    canvas.onwheel = (ev) => {
        /*
        CamLoc[0] += ev.deltaY / 30;
        CamLoc[1] += ev.deltaY / 30;
        */
        CamLoc[2] += ev.deltaY / 30;
    
        MatrixChange(canvas);
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
            .then (() => MatrixChange(canvas))
            .then (() => startTime = new Date().getMilliseconds())
            .then (() => drawScene());
    /*
    initShaders();
    initBuffer();
    startTime = new Date().getMilliseconds();
    drawScene();
    */
}
