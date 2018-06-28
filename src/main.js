import m from "mithril";
import config from "./config";
import Matrix from "./lib/matrix";

function initMatrix(vs) {
    vs.matrix = new Matrix(config.width, config.height, config.worms);
}

m.mount(document.body, {
    oninit : (vnode) => {
        initMatrix(vnode.state);
    },
    view : (vnode) => [
        m("div.input", [
            m("div", [
                m("label", "Number of Worms"),
                m("input[type='number']#worms", { 
                    value : config.worms, 
                    onchange : (e) => { 
                        config.worms = parseInt(e.target.value); 
                        initMatrix(vnode.state); 
                    } 
                })
            ]),
            m("div", [
                m("label", "Width/Height"),
                m("input[type='number']#width", { 
                    value : config.width, 
                    onchange : (e) => { 
                        config.width = parseInt(e.target.value); 
                        config.height = parseInt(e.target.value); 
                        initMatrix(vnode.state); 
                    }
                })
            ]),
            m("div", [
                m("input[type='button']#generate", { 
                    value: "Generate!", 
                    onclick : () => {
                        if (config.width !== vnode.state.matrix.width || config.worms !== vnode.state.maxActive) {
                            vnode.state.matrix = new Matrix(config.width, config.height, config.worms);
                        }
                        vnode.state.matrix.initGenerate()
                }})
            ])
        ]),
        m("div#generator", m(vnode.state.matrix))
    ]
});