export function handleCollisions(entity, newX, newY) {
    const isColliding = state.walls.some(wall => Intersects.boxBox(newX - 32, newY - 32, entity.width, entity.height, wall.x, wall.y, wall.width, wall.height));
    if (!isColliding) {
        entity.x = newX;
        entity.y = newY;
    }

    return isColliding
}
