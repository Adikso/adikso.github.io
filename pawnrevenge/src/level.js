import {putPiece, putPlayer, putSprite} from "./sprites.js";
import {drawHealth} from "./game.js";
import {playSound} from "./sound.js";

const wallsShadowFilter = new PIXI.filters.DropShadowFilter({ distance: 8})

export function createRoom() {
    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 20; x++) {
            putSprite('floor', x, y);
        }
    }

    for (let x = 0; x < 20; x++) {
        if (x >= 8 && x <= 12) {
            continue
        }

        const upWall = putSprite('wall', x, 0);
        state.walls.push(upWall)
        upWall.filters = [wallsShadowFilter];

        state.walls.push(putSprite('wall', x, 15))
    }

    for (let y = 1; y < 16; y++) {
        if (y >= 6 && y <= 9) {
            continue
        }

        const leftWall = putSprite('wall', 0, y);
        state.walls.push(leftWall)
        leftWall.filters = [wallsShadowFilter];

        state.walls.push(putSprite('wall', 19, y))
    }
}

let roundText = null;

export function newRound(num) {
    if (state.walls.length === 0) {
        createRoom();
    }

    if (!state.player) {
        state.player = putPlayer(8, 8);
    }

    if (state.text) {
        app.stage.removeChild(state.text);
    }

    if (roundText) {
        app.stage.removeChild(roundText);
    }

    roundText = new PIXI.Text(`ROUND ${num}`,{fontFamily : 'Kenney', fontSize: 44, fill : 0xffffff, align : 'center'});
    roundText.position.set(630, 20);
    app.stage.addChild(roundText);

    if (num <= 5) {
        playSound(`assets/round_${num}.ogg`)
    } else {
        playSound(`assets/prepare_yourself.ogg`)
    }
}
