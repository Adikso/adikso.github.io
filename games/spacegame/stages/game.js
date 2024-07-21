const play = {

    ship: {
        x: 400,
        y: 400,
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        angle: 0,
        scale: 1
    },

    startTime: 0,

    ticker: 0,

    backgroundStars: [],
    backgroundXOff: 0,

    asteroids: [],
    projectiles: [],
    projectiles_caches: {},
    bonuses: [],
    areas: [],
    keys: [],

    onEnter: () => {
        play.ship = {
            x: 400,
            y: 400,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            angle: 0,
            scale: 1
        };


        play.startTime = new Date().getTime() / 1000;
        play.ticker = 0;
        play.backgroundStars = [];
        play.backgroundXOff = 0;

        play.asteroids = [];
        play.projectiles = [];
        play.projectiles_caches = {};
        play.bonuses = [];
        play.areas = [];
        play.keys = [];

        window.addEventListener("keydown", play.onKeyDown, false);
        window.addEventListener("keyup", play.onKeyUp, false);
        window.addEventListener("keypress", play.onKeyPress, false);

        for (let i = 0; i < 100; i++) {
            const grayscale = Math.random() * 255;

            play.backgroundStars.push({
                x: Math.random() * (canvas.width + canvas.width / 2) - canvas.width / 2,
                y: Math.random() * (canvas.height + canvas.height / 2) - canvas.height / 2,
                color: {r: Math.random() * 155, g: Math.random() * 155, b: Math.random() * 155},
                // color: {r: grayscale, g: grayscale, b: grayscale},
                size: Math.random() * 3
            });
        }
    },

    onLeave: () => {
        window.removeEventListener("keydown", play.onKeyDown);
        window.removeEventListener("keydown", play.onKeyUp);
        window.removeEventListener("keypress", play.onKeyPress);
    },

    onUpdate: (canvas) => {
        const ship = play.ship;

        if (play.ticker % 10 === 0 && play.asteroids.length < 60) {
            const side = Math.floor(Math.random() * 4);
            let x = 0;
            let y = 0;
            let vx = Math.random();
            let vy = Math.random();

            switch (side) {
                case 0:
                    y = -50;
                    x = Math.random() * canvas.width;
                    break;
                case 1:
                    y = canvas.height + 50;
                    x = Math.random() * canvas.width;
                    vy *= -1;
                    break;
                case 2:
                    y = Math.random() * canvas.height;
                    x = -50;
                    break;
                case 3:
                    y = Math.random() * canvas.height;
                    x = canvas.width + 50;
                    vx *= -1;
                    break;
            }

            play.asteroids.push(createAsteroid(x, y, 1, vx, vy));
        }

        if (play.ticker % 1000 === 0) {
            let type = Math.floor(Math.random() * 2);
            let typeName;

            if (play.ticker === 0) {
                type = 0;
            }

            switch (type) {
                case 0:
                    typeName = 'slow';
                    break;
                case 1:
                    typeName = 'fast';
                    break;
            }

            play.bonuses.push({x: Math.random() * canvas.width, y: Math.random() * canvas.height, color: {r: type === 1 ? 255 : 0, g: 0, b: type === 0 ? 255 : 0}, ticker: 0, type: typeName});
        }

        for (const asteroid of play.asteroids.slice(0)) {
            if (!asteroid || !asteroid.path) {
                continue;
            }

            const checkPoints = [
                [ship.x, ship.y - 40 * ship.scale],
                [ship.x - 20 * ship.scale, ship.y + 10 * ship.scale],
                [ship.x, ship.y],
                [ship.x + 20 * ship.scale, ship.y + 10 * ship.scale]
            ];

            for (const point of checkPoints) {
                if (asteroid.path && ctx.isPointInPath(asteroid.path, point[0], point[1])) {
                    switchStage('splash');
                }
            }
        }

        for (const bonusIdx in play.bonuses.slice(0)) {
            const bonus = play.bonuses[bonusIdx];

            if (!bonus) continue;

            const distX = Math.abs(ship.x - bonus.x);
            const distY = Math.abs(ship.y - bonus.y);

            if (bonus.ticker < 60) {
                bonus.ticker++;
            }

            if (Math.sqrt(distX * distX + distY * distY) <= 60) {
                play.bonuses.splice(bonusIdx, 1);
                play.areas.push({
                    x: bonus.x,
                    y: bonus.y,
                    type: bonus.type,
                    ticker: 0,
                    size: 0,
                    color: {r: bonus.color.r, g: bonus.color.g, b: bonus.color.b}
                });
            }
        }

        for (const areaIdex in play.areas.slice(0)) {
            const area = play.areas[areaIdex];
            if (!area) continue;

            if (area.ticker < 200) {
                area.size++;
            }

            if (area.ticker > 640) {
                if (area.size - 1 === 0) {
                    play.areas.splice(areaIdex, 1);
                    continue;
                }

                area.size--;
            }

            area.ticker++;
        }

        for (const projectileIdx in play.projectiles.slice(0)) {
            const projectile = play.projectiles[projectileIdx];

            if (!projectile) continue;

            const offX1 = ((projectile.distance - 10) * Math.cos(projectile.angle));
            const x1 = projectile.x + offX1;

            const offY1 = ((projectile.distance - 10) * Math.sin(projectile.angle));
            const y1 = projectile.y + offY1;

            const offX2 = ((projectile.distance + 10) * Math.cos(projectile.angle));
            const x2 = projectile.x + offX2;

            const offY2 = ((projectile.distance + 10) * Math.sin(projectile.angle));
            const y2 = projectile.y + offY2;

            projectile.beginning = {x: x1, y: y1, offX: offX1, offY: offY1};
            projectile.end = {x: x2, y: y2, offX: offX2, offY: offY2};
            //
            if ((x1 > canvas.width || x1 < 0)
                || (x2 > canvas.width || x2 < 0)
                || (y1 > canvas.height || y1 < 0)
                || (y2 > canvas.height || y2 < 0)) {

                play.projectiles.splice(projectileIdx, 1);
                continue;
            }

            let collisionY = 0;
            let collisionX = 0;
            let targetAsteroid = null;
            let asteroidIndex;

            finder:
                for (let i of [0, 5, 10, 15, 20]) {
                    for (const asteroidIdx in play.asteroids) {
                        const asteroid = play.asteroids[asteroidIdx];
                        collisionX = x1 + (i * Math.cos(projectile.angle));
                        collisionY = y1 + (i * Math.sin(projectile.angle));

                        // <Joy>
                        const path = new Path2D();
                        path.moveTo(asteroid.x + asteroid.points[0][0], asteroid.y + asteroid.points[0][1]);

                        for (const point of asteroid.points.slice(1)) {
                            path.lineTo(asteroid.x + point[0], asteroid.y + point[1]);
                        }

                        path.closePath();
                        asteroid.path = path;
                        // </Joy>

                        if (asteroid.path && ctx.isPointInPath(asteroid.path, collisionX, collisionY)) {
                            targetAsteroid = asteroid;
                            asteroidIndex = asteroidIdx;
                            break finder;
                        }
                    }
                }

            if (targetAsteroid) {
                targetAsteroid.health--;

                if (targetAsteroid.health <= 0) {
                    if (targetAsteroid.scale / 2 > 0.3) {
                        play.asteroids.push(createAsteroid(targetAsteroid.x, targetAsteroid.y, targetAsteroid.scale / 2));
                        play.asteroids.push(createAsteroid(targetAsteroid.x, targetAsteroid.y, targetAsteroid.scale / 2));
                    }

                    targetAsteroid.health = targetAsteroid.maxHealth;
                    targetAsteroid.color = {r: 255, g: 255, b: 255};

                    if (targetAsteroid.scale - 1.0 / targetAsteroid.maxHealth >= 0) {
                        targetAsteroid.scale -= 1.0 / targetAsteroid.maxHealth;
                    }

                    play.asteroids.splice(asteroidIndex, 1);
                }

                play.projectiles.splice(projectileIdx, 1);
            }

            let modifier = 1;
            for (const area of play.areas) {
                const distX = Math.abs(x2 - area.x);
                const distY = Math.abs(y2 - area.y);

                if (Math.sqrt(distX * distX + distY * distY) <= area.size) {
                    if (area.type === 'slow') {
                        modifier /= 1.5;
                    } else {
                        modifier *= 1.5;
                    }
                    break;
                }
            }

            projectile.distance += 10 * modifier;
        }

        for (const asteroidIdx in play.asteroids.slice(0)) {
            let asteroid = play.asteroids[asteroidIdx];
            let modifier = 1;

            if (!asteroid) {
                continue;
            }

            if ((asteroid.x < -100 || asteroid.x > canvas.width + 100) || (asteroid.y < -100 || asteroid.y > canvas.height + 100)) {
                play.asteroids.splice(asteroidIdx, 1);
                continue;
            }

            // <Joy>
            const path = new Path2D();
            path.moveTo(asteroid.x + asteroid.points[0][0], asteroid.y + asteroid.points[0][1]);

            for (const point of asteroid.points.slice(1)) {
                path.lineTo(asteroid.x + point[0], asteroid.y + point[1]);
            }

            path.closePath();
            asteroid.path = path;
            // </Joy>

            found:
            for (const area of play.areas) {
                for (const point of asteroid.points) {
                    const distX = Math.abs(point[0] + asteroid.x - area.x);
                    const distY = Math.abs(point[1] + asteroid.y - area.y);

                    if (Math.sqrt(distX * distX + distY * distY) <= area.size) {
                        if (area.type === 'slow') {
                            modifier /= 1.5;
                        } else {
                            modifier *= 1.5;
                        }
                        // break found;
                    }
                }
            }

            asteroid.x += asteroid.vx * modifier;
            asteroid.y += asteroid.vy * modifier;
        }

        if (play.keys[37]) {
            ship.angle -= 0.05;
        }

        if (play.keys[39]) {
            ship.angle += 0.05;
        }

        if (play.keys[38]) {
            ship.ax = Math.cos(ship.angle) * 0.05;
            ship.ay = Math.sin(ship.angle) * 0.05;
        } else {
            ship.ax = ship.ay = 0;
        }

        ship.vx += ship.ax;
        ship.vy += ship.ay;

        ship.x += ship.vx;
        ship.y += ship.vy;

        play.ticker++;
    },

    onRender: (canvas, ctx) => {
        // ctx.globalCompositeOperation = "lighter";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#100912';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        const diff = Math.round(new Date().getTime() / 1000 - play.startTime);
        let text = diff + " s";
        ctx.font = '30pt Arial';
        ctx.fillStyle = '#fff';
        const width = ctx.measureText(text).width;
        ctx.fillText(text, canvas.width / 2 - width / 2,  50);
        ctx.restore();

        ctx.save();

        if (!woodenpc) {
            drawBackground();
        }

        for (const bonusIdx in play.bonuses) {
            const bonus = play.bonuses[bonusIdx];

            neonDraw(ctx, bonus.x, bonus.y, 0, 0, bonus.color.r, bonus.color.g, bonus.color.b, () => {
                strokeStar(bonus.x, bonus.y, bonus.ticker / 6, 5, 2);
            }, 20);
        }

        for (const area of play.areas) {
            neonDraw(ctx, area.x, area.y, 0, 0, area.color.r, area.color.g, area.color.b, () => {
                ctx.beginPath();
                ctx.arc(area.x, area.y, area.size, 0, 2 * Math.PI, false);
                ctx.fill();
            });
        }

        for (const projectile of play.projectiles) {
            if (projectile.beginning) {
                neonDraw(ctx, 0, 0, 0, 0, 255, 0, 0, (x, y, w, h) => {
                    ctx.beginPath();
                    ctx.moveTo(projectile.beginning.x, projectile.beginning.y);
                    ctx.lineTo(projectile.end.x, projectile.end.y);
                    ctx.closePath();
                    ctx.stroke();
                });
            }
        }

        for (const asteroid of play.asteroids) {
            drawAsteroid(asteroid);
        }

        neonDraw(ctx, 300, 300, 0, 0, 0, 255, 0, () => {
            drawShip();
        }, 5);

        ctx.restore();
    },

    onKeyUp: (e) => {
        if (play.keys[e.which] && [37, 38, 39].includes(e.which)) {
            shoot();
        }

        play.keys[e.which] = false;
    },

    onKeyDown: (e) => {
        play.keys[e.which] = true;
    },

    onKeyPress: (e) => {}

};

function createProjectile(x1, y1, angle) {
    return {x: x1, y: y1, angle: angle, distance: 0};
}

function shoot() {
    const ship = play.ship;
    const xOff = 40 * Math.cos(ship.angle);
    const yOff = 40 * Math.sin(ship.angle);

    play.projectiles.push(createProjectile(ship.x + xOff, ship.y + yOff, ship.angle));
}

function drawShip() {
    const ship = play.ship;

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(Math.PI / 2);
    ctx.rotate(ship.angle);
    ctx.translate(-ship.x, -ship.y);

    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y - 40 * ship.scale);
    ctx.lineTo(ship.x - 20 * ship.scale, ship.y + 10 * ship.scale);
    ctx.lineTo(ship.x, ship.y);
    ctx.lineTo(ship.x + 20 * ship.scale, ship.y + 10 * ship.scale);
    ctx.closePath();
    ctx.stroke();

    // if (play.keys[38]) {
    //     // ctx.beginPath();
    //     // ctx.strokeStyle = "#ffff00";
    //     // ctx.shadowColor = "#ffff00";
    //     // ctx.moveTo(ship.x, ship.y);
    //     // ctx.lineTo(ship.x, ship.y + 20);
    //     // ctx.closePath();
    //     // ctx.stroke();
    //
    //     ctx.beginPath();
    //     ctx.strokeStyle = "#ff0000";
    //     ctx.shadowColor = "#ff0000";
    //     ctx.moveTo(ship.x, ship.y);
    //     ctx.lineTo(ship.x, ship.y + 10);
    //     ctx.closePath();
    //     ctx.stroke();
    // }

    ctx.restore();
}

function createAsteroid(x, y, scale = 1, vx=undefined, vy=undefined) {
    let points = [];

    let offX = 50;
    let offY = 15;

    let last = 0;
    for (let i = 0; i < 5; i++) {
        let angle = Math.random() * (Math.PI / 2);
        angle += last;
        last = angle;

        const pointX = Math.cos(angle) * 50 * scale;
        const pointY = Math.sin(angle) * 50 * scale;

        if (pointX + offX < 0) {
            offX += -(pointX + offX);
        }

        if (pointY + offY < 0) {
            offY += -(pointY + offY);
        }

        points.push([pointX, pointY]);
    }

    for (const point of points) {
        point[0] += offX;
        point[1] += offY;
    }

    return {
        x: x,
        y: y,
        vx: vx ? vx : Math.random() * 2 - 1,
        vy: vy ? vy : Math.random() * 2 - 1,
        maxHealth: 1,
        health: 1,
        color: {r: 255, g: 255, b: 255},
        scale: scale,
        points: points
    };
}

function drawAsteroid(asteroid) {
    if (!asteroid.cached) {
        neonDraw(cache, asteroid.x, asteroid.y, 0, 0, asteroid.color.r, asteroid.color.g, asteroid.color.g, (x, y, w, h) => {
            const path = new Path2D();
            path.moveTo(asteroid.points[0][0], asteroid.points[0][1]);

            for (const point of asteroid.points.slice(1)) {
                path.lineTo(point[0], point[1]);
            }

            path.closePath();
            asteroid.path = path;

            cache.clearRect(0, 0, prerender.width, prerender.height);
            cache.stroke(asteroid.path);
        });

        const image = new Image();
        image.src = prerender.toDataURL();
        asteroid.cached = image;
    } else {
        ctx.drawImage(asteroid.cached, asteroid.x, asteroid.y);
    }
}

function drawBackground() {
    play.backgroundXOff += 1;
    for (const star of play.backgroundStars) {
        neonDraw(ctx, star.x + play.backgroundXOff * ((star.size / 10)), star.y, 0, 0, star.color.r, star.color.r, star.color.r, (x, y, w, h) => {
            // drawAsteroid({x: x, y: y, scale: star.size / 10});
            ctx.beginPath();
            ctx.arc(x, y, star.size, 0, 2 * Math.PI, false);
            ctx.fill();
        });
    }

    if (play.backgroundXOff % (canvas.width / 2) === 0) {
        for (let i = 0; i < 10; i++) {
            play.backgroundStars.push({
                x: Math.random() * (canvas.width / 2) - play.backgroundXOff,
                y: Math.random() * canvas.height,
                color: {r: Math.random() * 255, g: Math.random() * 255, b: Math.random() * 255},
                size: Math.random() * 3
            });
        }
    }
}

function strokeStar(x, y, r, n, inset) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0, 0 - r);
    for (let i = 0; i < n; i++) {
        ctx.rotate(Math.PI / n);
        ctx.lineTo(0, 0 - (r * inset));
        ctx.rotate(Math.PI / n);
        ctx.lineTo(0, 0 - r);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
}
