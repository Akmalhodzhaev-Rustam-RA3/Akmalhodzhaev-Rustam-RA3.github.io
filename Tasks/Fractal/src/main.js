import { add } from "./math.js"
import { Pane } from "tweakpane"
import { onStart } from "./rnd.js"
import { vec3 } from "gl-matrix"

let color;
export { color };

let IsWithTime = {TrueFalse: true};
export {IsWithTime};

window.addEventListener("load", () => {
    let PARAMS = {
        factor: 30,
        title: "RA3",
        color: { r: 255, g: 0, b: 85 },
    }
    
    const pane = new Pane();
    pane.addBinding(PARAMS, "factor");
    pane.addBinding(PARAMS, "title");
    pane.addBinding(PARAMS, "color");
    pane.addBinding(IsWithTime, "TrueFalse");

    color = vec3.create();
    console.log("ABCXYZWWW");
    console.log(add(1, 1));

    onStart();

    setInterval(() => {
        const str = JSON.stringify(PARAMS);
        console.log(str);
        color[0] = PARAMS.color.r;
        color[1] = PARAMS.color.g;
        color[2] = PARAMS.color.b;
        const obj = JSON.parse(str);
    }, 1000);
});
