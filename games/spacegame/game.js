const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: false });

const prerender = document.getElementById("pre-render");
const cache = prerender.getContext("2d", { alpha: false });

const woodenpc = window.location.hash === "#wooden";

let state = {
    stage: 'splash',
    stages: {
        splash: splash,
        game: play
    },
    rendering: {
        fpsInterval: 1000 / 60,
        then: Date.now(),
        startTime: Date.now()
    }
};

function switchStage(name) {
    let stage = state.stages[state.stage];
    stage.onLeave();

    state.stage = name;
    stage = state.stages[state.stage];
    stage.onEnter();
}

function onUpdate() {
    window.requestAnimationFrame(onUpdate);

    const now = Date.now();
    const elapsed = now - state.rendering.then;

    if (elapsed > state.rendering.fpsInterval) {
        const stage = state['stages'][state['stage']];

        stage.onUpdate(canvas);
        stage.onRender(canvas, ctx);

        state.rendering.then = now - (elapsed % state.rendering.fpsInterval);
    }
}

window.requestAnimationFrame(onUpdate);

function neonDraw(targetCtx, x, y, w, h, r, g, b, drawFunc, shadow=5) {
    targetCtx.save();
    if (woodenpc) {
        targetCtx.strokeStyle = "rgb(" + r + "," + g + "," + b + ")";
        drawFunc(x, y, w, h);
    } else {
        targetCtx.shadowColor = "rgb(" + r + "," + g + "," + b + ")";
        targetCtx.shadowBlur = shadow;
        targetCtx.strokeStyle = "rgba(" + r + "," + g + "," + b + ",0.2)";
        targetCtx.lineWidth = 7.5;
        drawFunc(x, y, w, h);
        targetCtx.lineWidth = 6;
        drawFunc(x, y, w, h);
        targetCtx.lineWidth = 4.5;
        drawFunc(x, y, w, h);
        targetCtx.lineWidth = 3;
        drawFunc(x, y, w, h);
        targetCtx.strokeStyle = '#fff';
        targetCtx.lineWidth = 1.5;
        drawFunc(x, y, w, h);
    }
    targetCtx.restore();
}
