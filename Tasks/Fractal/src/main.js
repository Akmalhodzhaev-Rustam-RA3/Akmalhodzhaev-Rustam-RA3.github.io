import { add } from "./math.js"
import { Pane } from "tweakpane"
import { onStart } from "./rnd.js"

window.addEventListener("load", () => {
    let PARAMS = {
        factor: 30,
        title: "RA3",
        color: "#ff0055",
    }
    
    const pane = new Pane();
    pane.addBinding(PARAMS, "factor");
    pane.addBinding(PARAMS, "title");
    pane.addBinding(PARAMS, "color");

    console.log("ABCXYZWWW");
    console.log(add(1, 1));

    onStart();

    setInterval(() => {
        const str = JSON.stringify(PARAMS);
        console.log(str);
        const obj = JSON.parse(str);
    }, 1000);
});
