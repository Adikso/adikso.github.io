const splash = {

    ticker: 0,

    onEnter: () => {
        splash.ticker = 0;
    },

    onLeave: () => {

    },

    onUpdate: (canvas) => {
        splash.ticker++;

        console.log(splash.ticker);

        if (splash.ticker === 1) {
            switchStage('game');
        }
    },

    onRender: (canvas, ctx) => {
        ctx.globalCompositeOperation = "lighter";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        neonDraw(ctx, 0, 0, canvas.width, canvas.height, 0, 255, 0, (x, y, w, h) => { ctx.strokeRect(x, y, w, h) });
        ctx.restore();
    }

};

