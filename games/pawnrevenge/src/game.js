import {actionHandler, movementHandler} from "./player.js";
import {newRound} from "./level.js";
import {handleBulletsMovement} from "./bullets.js";
import {handleEnemiesMovement} from "./enemies.js";
import {getColorForPercentage, putPiece, putSprite} from "./sprites.js";
import {playSound} from "./sound.js";

window.app = new PIXI.Application({
    width: 1280,
    height: 1024,
    antialias: true
});

const crtFilter = new PIXI.filters.CRTFilter({ lineWidth: 0});
window.app.stage.filters = [crtFilter];

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
document.body.appendChild(app.view);

app.loader
    .add('assets/wall.png')
    .add('assets/floor.png')
    .add('assets/piece.png')
    .add('assets/runeRadius.png')
    .add('assets/healthRune.png')
    .add('assets/dice/dieRed_border5.png')
    .add('assets/dice/dieWhite_border1.png')
    .add('assets/dice/dieWhite_border2.png')
    .add('assets/dice/dieWhite_border3.png')
    .add('assets/dice/dieWhite_border4.png')
    .add('assets/dice/dieWhite_border5.png')
    .add('assets/dice/dieWhite_border6.png')
    .load(start);

window.state = {
    player: null,
    bullets: [],
    shockwaves: [],
    enemies: [],
    walls: [],
    lastSpawn: 0,
    round: 1,
    text: null,
    cache: {
        sounds: {}
    },
    healthBar: null,
    health: 100,
    finished: false,
    roundSpawned: 0,
    roundKilled: 0,
    lastPowerup: performance.now(),
    powerups: []
}

export function drawHealth() {
    state.healthBar.position.set(100, 50);
    state.healthBar.lineStyle(10, 0xffffff)
        .moveTo(0, 0)
        .lineTo(400, 0);

    state.healthBar.position.set(100, 50);
    state.healthBar.lineStyle(10, 0xff0000)
        .moveTo(0, 0)
        .lineTo(400 * state.health / 100, 0);
}

function start() {
    newRound(state.round);

    let myGraph = new PIXI.Graphics();
    app.stage.addChild(myGraph);
    state.healthBar = myGraph;
    drawHealth();

    let text = new PIXI.Text(`Health`,{fontFamily : 'Kenney', fontSize: 24, fill : 0xffffff, align : 'center'});
    text.position.set(300, 25);
    text.anchor.x = 0.5;
    text.anchor.y = 0.5;
    app.stage.addChild(text);

    const healthText = new PIXI.Text(`Health`,{fontFamily : 'Kenney', fontSize: 24, fill : 0xffffff, align : 'center'});
    healthText.position.set(300, 25);
    healthText.anchor.x = 0.5;
    healthText.anchor.y = 0.5;
    app.stage.addChild(healthText);

    app.ticker.add((delta) => {
        if (state.health <= 0) {
            if (!state.finished) {
                const filterShadow = new PIXI.filters.DropShadowFilter({ distance: 10});

                let lostText = new PIXI.Text(`You died`,{fontFamily : 'Kenney', fontSize: 144, fill : 0xff0000, align : 'center'});
                lostText.position.set(670, 512);
                lostText.anchor.x = 0.5;
                lostText.anchor.y = 0.5;
                lostText.filters = [filterShadow];
                app.stage.addChild(lostText);

                let lostText2 = new PIXI.Text(`Press [R] to restart`,{fontFamily : 'Kenney', fontSize: 34, fill : 0xffffff, align : 'center'});
                lostText2.position.set(670, 582);
                lostText2.anchor.x = 0.5;
                lostText2.anchor.y = 0.5;
                lostText2.filters = [filterShadow];
                app.stage.addChild(lostText2);

                playSound(`assets/loser.ogg`);
            }

            state.finished = true;
            return
        }

        movementHandler(delta);
        actionHandler(delta);
        handleBulletsMovement();
        handleEnemiesMovement(delta);

        for (const powerup of state.powerups) {
            const colliding = state.powerups.filter(wall => Intersects.boxBox(state.player.x - 32, state.player.y - 32, state.player.width, state.player.height, wall.sprite.x, wall.sprite.y, wall.sprite.width, wall.sprite.height));
            for (const power of colliding) {
                state.powerups = state.powerups.filter(e => e !== power);
                app.stage.removeChild(power.sprite);

                if (power.type === 'radius') {
                    const shockWaveFilter = new PIXI.filters.ShockwaveFilter([50, 50]);
                    shockWaveFilter.speed = 2000;
                    shockWaveFilter.radius = -1;
                    shockWaveFilter.center = [power.sprite.x, power.sprite.y];

                    app.stage.filters.push(shockWaveFilter);
                    state.shockwaves.push(shockWaveFilter);

                    if (state.enemies.length > 0) {
                        playSound('assets/impactBell_heavy_000.ogg');
                    }

                    state.enemies.forEach(enemy => {
                        enemy.life -= 0.8;
                        enemy.sprite.tint = getColorForPercentage(enemy.life);

                        if (enemy.life <= 0) {
                            state.roundKilled++;
                            state.enemies = state.enemies.filter(e => e !== enemy);
                            app.stage.removeChild(enemy.sprite);
                        }
                    })
                } else if (power.type === 'health') {
                    if (state.health < 100) {
                        state.health = Math.min(100, state.health + 8);
                        drawHealth();
                    }

                    playSound('assets/war_medic.ogg');
                }
            }
        }

        if (performance.now() - state.lastPowerup > 60000) {
            const typeNum = getRandomInt(0, 2);

            let spriteName = null;
            let type = null;
            if (typeNum === 0) {
                type = 'radius'
                spriteName = 'runeRadius';
            } else if (typeNum === 1) {
                type = 'health'
                spriteName = 'healthRune';
            }

            const sprite = putSprite(spriteName, -1, -1);

            if (typeNum === 0) {
                sprite.tint = 0xaaaaff;
            } else if (typeNum === 1) {
                sprite.tint = 0xff8888;
            }

            let failuresCount = 0;
            do {
                if (failuresCount === 50) {
                    break
                }

                failuresCount++;
                sprite.x = sprite.width * getRandomInt(2, 18);
                sprite.y = sprite.height * getRandomInt(2, 15);
            } while (state.powerups.some(ele => ele.sprite.x === sprite.x && ele.sprite.y === sprite.y))

            if (failuresCount < 50) {
                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;
                const filterShadow = new PIXI.filters.DropShadowFilter({ distance: 8});
                sprite.filters = [filterShadow];
                state.lastPowerup = performance.now();

                const shockWaveFilter = new PIXI.filters.ShockwaveFilter([50, 50]);
                shockWaveFilter.radius = 50;
                shockWaveFilter.center = [sprite.x, sprite.y];

                app.stage.filters.push(shockWaveFilter);
                state.shockwaves.push(shockWaveFilter);
                state.powerups.push({
                    sprite: sprite,
                    type: type
                })
            }
        }

        for (const shockwave of state.shockwaves) {
            shockwave.time += 0.01;

            if (shockwave.time > 3) {
                state.shockwaves = state.shockwaves.filter(x => x !== shockwave);
                app.stage.filters = app.stage.filters.filter(x => x !== shockwave);
            }
        }

        if (state.roundSpawned < state.round * 5 && performance.now() - state.lastSpawn > 7000 * (1/state.round)) {
            const direction = getRandomInt(0, 4);

            if (direction === 0) {
                state.enemies.push({
                    sprite: putPiece(getRandomInt(9, 12), -1),
                    speed: Math.random() + 1,
                    life: 1,
                    lastAttack: 0,
                });
            } else if (direction === 2) {
                state.enemies.push({
                    sprite: putPiece(getRandomInt(9, 12), 16),
                    speed: Math.random() + 1,
                    life: 1,
                    lastAttack: 0,
                });
            } else if (direction === 1) {
                state.enemies.push({
                    sprite: putPiece(20, getRandomInt(6, 10)),
                    speed: Math.random() + 1,
                    life: 1,
                    lastAttack: 0,
                });
            } else if (direction === 3) {
                state.enemies.push({
                    sprite: putPiece(-1, getRandomInt(6, 10)),
                    speed: Math.random() + 1,
                    life: 1,
                    lastAttack: 0,
                });
            }

            state.lastSpawn = performance.now();
            state.roundSpawned++;
        }

        if (state.roundKilled === state.round * 5) {
            state.round++;
            state.roundSpawned = 0;
            state.roundKilled = 0;
            newRound(state.round);
        }
    });
}

