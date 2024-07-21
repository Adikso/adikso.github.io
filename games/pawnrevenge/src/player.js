import {handleCollisions} from "./collisions.js";
import {spawnBullet} from "./bullets.js";
import {mouse, mouseClicks, keyboard} from "./controls.js";

export function movementHandler(delta) {
    const mouseXOff = state.player.x - mouse.x;
    const mouseYOff = state.player.y - mouse.y;

    const angle = Math.atan2(mouseYOff, mouseXOff) + 3 / 4 * Math.PI;
    state.player.rotation = angle - 3 / 4 * Math.PI;

    let newX = state.player.x;
    let newY = state.player.y;

    if (keyboard['d']) {
        newX += 5 * delta;
    }

    if (keyboard['a']) {
        newX -= 5 * delta;
    }

    if (keyboard['w']) {
        newY -= 5 * delta;
    }

    if (keyboard['s']) {
        newY += 5 * delta;
    }

    if (newX > 1280 || newX < 0 || newY > 1024 || newY < 0) {
        return
    }

    handleCollisions(state.player, newX, newY);
}

export function actionHandler(delta) {
    const clickAction = mouseClicks.pop();

    if (clickAction && state.bullets.length === 0) {
        const isShortThrow = clickAction.button === 2;

        spawnBullet(state.player.x, state.player.y, state.player.rotation + Math.PI / 4, isShortThrow);
    }
}