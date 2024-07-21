import {drawHealth} from "./game.js";
import {playSound} from "./sound.js";

export function handleEnemiesMovement(delta) {
    for (const enemyAll of state.enemies) {
        const enemy = enemyAll.sprite;

        let newX = enemy.x;
        let newY = enemy.y;

        if (Math.abs(state.player.x - 32 - enemy.x) >= 6) {
            if (state.player.x - enemy.x >= 0) {
                newX += enemyAll.speed * delta;
            } else {
                newX -= enemyAll.speed * delta;
            }
        }

        if (Math.abs(state.player.y - 32 - enemy.y) >= 6) {
            if (state.player.y - enemy.y >= 0) {
                newY += enemyAll.speed * delta;
            } else {
                newY -= enemyAll.speed * delta;
            }
        }

        enemy.x = newX;
        enemy.y = newY;

        const dist = Math.sqrt((newX + 32 - state.player.x) ** 2 + (newY + 32 - state.player.y) ** 2);
        if (dist < 64 && performance.now() - enemyAll.lastAttack > 500) {
            if (state.health > 0) {
                state.health = Math.max(0, state.health - 3);
                drawHealth();
                playSound('assets/hit.ogg');
            }
            enemyAll.lastAttack = performance.now();
        }
    }
}
