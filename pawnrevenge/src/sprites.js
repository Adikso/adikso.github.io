const wallsShadowFilter = new PIXI.filters.DropShadowFilter({distance: 8});

export function putSprite(name, x, y) {
    const sprite = new PIXI.Sprite(app.loader.resources[`assets/${name}.png`].texture);
    sprite.position.x = x * sprite.width;
    sprite.position.y = y * sprite.width;
    sprite.smoothed = true;

    app.stage.addChild(sprite);
    return sprite;
}

export function putPiece(x, y) {
    const piece = putSprite('piece', x, y);
    piece.filters = [wallsShadowFilter];
    // piece.tint = getRandomInt(0x555555, 0xffffff);
    piece.tint = getColorForPercentage(1);
    return piece;
}

export function putPlayer(x, y) {
    const playerSprite = putSprite('dice/dieRed_border5', x, y);
    playerSprite.anchor.x = 0.5;
    playerSprite.anchor.y = 0.5;
    playerSprite.filters = [wallsShadowFilter];
    return playerSprite;
}

function HSLToRGB(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b]
}

export function getColorForPercentage(value) {
    const hue = (value * 120);
    const [r, g, b] = HSLToRGB(hue, 100, 50);

    return (r << 16) + (g << 8) + b;
}
