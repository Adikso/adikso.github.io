export const mouseClicks = [];
export const mouse = {};
export const keyboard = {};

document.addEventListener('keydown', (event) => {
    keyboard[event.key] = true;

    if (event.key === 'r') {
        location.reload();
    }
});

document.addEventListener('keyup', (event) => {
    keyboard[event.key] = false;
});

document.addEventListener('mousemove', e => {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
});

document.addEventListener('mousedown', e => {
    if (e.buttons === 4) {
        return
    }

    mouseClicks.push({
        x: e.offsetX,
        y: e.offsetY,
        button: e.buttons
    });
})

document.addEventListener('contextmenu', function(evt) {
    evt.preventDefault();
});