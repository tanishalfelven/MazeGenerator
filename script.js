let worms = 5, width = 40, canvasWidth = 400, canvasHeight = 400;



m.mount(window.mount, {
    oninit : (vnode) => {
        vnode.state.matrix = new Matrix(width, width, worms);
    },
    view : (vnode) => [
        m("div.input", [
            m("div", [
                m("label", "Number of Worms"),
                m("input[type='number']#worms", { value : worms })
            ]),
            m("div", [
                m("label", "Width/Height"),
                m("input[type='number']#width", { value : width })
            ]),
            m("div", [
                m("input[type='button']#generate", { value: "Generate!", onclick : () => {
                    if (width !== vnode.state.matrix.width || worms !== vnode.state.maxActive) {
                        vnode.state.matrix = new Matrix(width, width, worms);
                    }
                    vnode.state.matrix.initGenerate()
                }})
            ])
        ]),
        m("div#generator", m(vnode.state.matrix))
    ]
});