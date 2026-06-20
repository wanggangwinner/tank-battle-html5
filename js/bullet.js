/**
 * 子弹类
 */
class Bullet {
    constructor(x, y, direction, owner, speed = 320, damage = 1) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.owner = owner; // 'player' 或 'enemy'
        this.speed = speed;
        this.damage = damage;
        this.width = 8;
        this.height = 8;
        this.active = true;
        this.lifetime = 3; // 秒

        const vec = DIR_VECTORS[direction];
        this.vx = vec.x * speed;
        this.vy = vec.y * speed;
    }

    update(dt, gameMap, tanks) {
        if (!this.active) return;

        this.lifetime -= dt;
        if (this.lifetime <= 0) {
            this.active = false;
            return;
        }

        const nextX = this.x + this.vx * dt;
        const nextY = this.y + this.vy * dt;

        // 检查与地图边界和墙体的碰撞
        const bounds = this.getBoundsAt(nextX, nextY);
        const minC = Math.floor(bounds.x / TILE_SIZE);
        const maxC = Math.floor((bounds.x + bounds.w) / TILE_SIZE);
        const minR = Math.floor(bounds.y / TILE_SIZE);
        const maxR = Math.floor((bounds.y + bounds.h) / TILE_SIZE);

        let hitWall = false;
        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                if (gameMap.isWall(c, r)) {
                    hitWall = true;
                    if (gameMap.destroyTile(c, r)) {
                        // 砖墙被摧毁时产生粒子
                        gameMap.particles.spawnHit(c * TILE_SIZE + TILE_SIZE / 2, r * TILE_SIZE + TILE_SIZE / 2);
                    }
                }
            }
        }

        if (hitWall) {
            this.active = false;
            return;
        }

        // 检查与坦克的碰撞
        for (const tank of tanks) {
            if (!tank.alive) continue;
            if (tank.isInvulnerable()) continue;
            // 子弹不击中发射者自己
            if (tank.owner === this.owner) continue;

            if (rectsOverlap(nextX, nextY, this.width, this.height,
                             tank.x, tank.y, tank.width, tank.height)) {
                tank.takeDamage(this.damage);
                this.active = false;
                return;
            }
        }

        this.x = nextX;
        this.y = nextY;

        // 出界
        if (this.x < 0 || this.x > CANVAS_WIDTH || this.y < 0 || this.y > CANVAS_HEIGHT) {
            this.active = false;
        }
    }

    getBoundsAt(x, y) {
        return { x, y, w: this.width, h: this.height };
    }

    draw(ctx) {
        if (!this.active) return;
        ctx.fillStyle = this.owner === 'player' ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // 高光
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x + 2, this.y + 2, 2, 2);
    }
}
