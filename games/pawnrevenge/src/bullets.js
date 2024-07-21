import {getColorForPercentage, putSprite} from "./sprites.js";
import {playSound} from "./sound.js";
import {handleCollisions} from "./collisions.js";

let allDecayingBullets = [];

export function spawnBullet(x, y, rotation, isShortThrow) {
    const bullet = putSprite(`dice/dieWhite_border2`, -1, -1);
    bullet.position.x = x;
    bullet.position.y = y;
    bullet.anchor.x = 0.5;
    bullet.anchor.y = 0.5;
    bullet.scale.x = 0.5;
    bullet.scale.y = 0.5;
    bullet.rotation = rotation + 3/4*Math.PI;

    const filterShadow = new PIXI.filters.DropShadowFilter({ distance: 20});
    bullet.filters = [filterShadow];

    state.bullets.push({
        sprite: bullet,
        maxFrames: isShortThrow ? 30 : 60,
        currentFrames: 0,
        playedAudio: false,
        value: 2,
        finished: false,
        decayFrames: 0,
        short: isShortThrow
    });

    if (isShortThrow) {
        bullet.tint = 0xffffaa;
    }

    playSound('assets/dieGrab1.ogg');
}

export function handleBulletsMovement() {
    for (const bullet of state.bullets) {
        const newX = bullet.sprite.x + Math.cos(bullet.sprite.rotation) * 7;
        const newY = bullet.sprite.y + Math.sin(bullet.sprite.rotation) * 7;
        const colliding = handleCollisions(bullet.sprite, newX, newY);

        bullet.currentFrames += 1;

        let x = (bullet.currentFrames / 30);
        if (bullet.short) {
            x *= 2;
        }

        const value = (-Math.pow(x - 1, 2) + 1) + 1
        bullet.sprite.scale.x = value / 2;
        bullet.sprite.scale.y = value / 2;
        bullet.sprite.filters[0].distance = 40 * value / 2;

        if (bullet.currentFrames > (bullet.short ? 0.5 : 0.8) * bullet.maxFrames && bullet.currentFrames % 10 === 0) {
            if (!colliding) {
                bullet.sprite.rotation += (getRandomInt(0, 20) - 10) / 10;
            }
            bullet.value = getRandomInt(1, 7);
            bullet.sprite.texture = app.loader.resources[`assets/dice/dieWhite_border${bullet.value}.png`].texture;
        }

        if (!bullet.playedAudio && bullet.currentFrames >= bullet.maxFrames * (bullet.short ? 0.5 : 0.8)) {
            playSound(`assets/dieThrow${getRandomInt(1, 3)}.ogg`);
            bullet.playedAudio = true;
        }

        if (bullet.currentFrames >= bullet.maxFrames && bullet.value >= 4) {
            const shockWaveFilter = new PIXI.filters.ShockwaveFilter([50, 50]);
            shockWaveFilter.radius = 200;
            shockWaveFilter.center = [bullet.sprite.x, bullet.sprite.y];

            app.stage.filters.push(shockWaveFilter);
            state.shockwaves.push(shockWaveFilter);

            playSound('assets/impactBell_heavy_000.ogg');
            bullet.finished = true;

            for (const enemy of state.enemies) {
                const dist = Math.sqrt((bullet.sprite.x - enemy.sprite.x) ** 2 + (bullet.sprite.y - enemy.sprite.y) ** 2);
                if (dist < 200) {
                    if (bullet.short) {
                        enemy.life -= 0.2;
                    } else {
                        enemy.life -= 0.7;
                    }

                    enemy.sprite.tint = getColorForPercentage(enemy.life);

                    if (enemy.life <= 0) {
                        state.roundKilled++;
                        state.enemies = state.enemies.filter(e => e !== enemy);
                        app.stage.removeChild(enemy.sprite);
                    }
                }
            }
        }

        if (bullet.currentFrames >= bullet.maxFrames) {
            bullet.sprite.filters[0].distance = 8;
        }
    }

    const decayingBullets = state.bullets.filter(b => b.currentFrames >= b.maxFrames);
    for (const decaying of decayingBullets) {
        allDecayingBullets.push(decaying);

        const secondEase = new Ease.Ease({ duration: 6000, ease: 'easeInOutQuad'})
        secondEase.add(decaying.sprite, { alpha: 0 });
    }

    for (const decaying of allDecayingBullets) {
        decaying.decayFrames += 1;

        if (decaying.decayFrames === 400) {
            app.stage.removeChild(decaying.sprite);
            allDecayingBullets = allDecayingBullets.filter(e => e !== decaying);
        }
    }

    state.bullets = state.bullets.filter(b => b.currentFrames < b.maxFrames);
}
