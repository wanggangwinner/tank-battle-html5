/**
 * 坦克基类
 */
class Tank {
    constructor(x, y, direction, owner, color, speed = 120) {
        this.x = x;
        this.y = y;
        this.width = 34;
        this.height = 34;
        this.direction = direction;
        this.owner = owner;
        this.color = color;
        this.speed = speed;
        this.alive = true;
        this.maxHealth = 1;
        this.health = 1;
        this.cooldown = 0;
        this.fireInterval = 0.5;
        this.invulnerableTime = 0;
    }

    isInvulnerable() {
        return this.invulnerableTime > 0;
    }

    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    canShoot() {
        return this.alive && this.cooldown <= 0;
    }

    shoot() {
        if (!this.canShoot()) return null;
        this.cooldown = this.fireInterval;
        const center = this.getCenter();
        const vec = DIR_VECTORS[this.direction];
        // 子弹从炮管前方射出
        const offset = 24;
        const bx = center.x + vec.x * offset - 4;
        const by = center.y + vec.y * offset - 4;
        return new Bullet(bx, by, this.direction, this.owner);
    }

    takeDamage(amount) {
        if (this.isInvulnerable()) return;
        this.health -= amount;
        this.invulnerableTime = 0.15;
        if (this.health <= 0) {
            this.alive = false;
        }
    }

    update(dt, gameMap, tanks) {
        if (!this.alive) return;
        if (this.cooldown > 0) this.cooldown -= dt;
        if (this.invulnerableTime > 0) this.invulnerableTime -= dt;
    }

    tryMove(dt, gameMap, tanks) {
        const vec = DIR_VECTORS[this.direction];
        const nextX = this.x + vec.x * this.speed * dt;
        const nextY = this.y + vec.y * this.speed * dt;

        // 边界限制
        const clampedX = clamp(nextX, 0, CANVAS_WIDTH - this.width);
        const clampedY = clamp(nextY, 0, CANVAS_HEIGHT - this.height);

        // 地图碰撞
        if (!this.collidesWithMap(clampedX, clampedY, gameMap)) {
            // 坦克间碰撞
            let collides = false;
            for (const tank of tanks) {
                if (tank === this || !tank.alive) continue;
                if (rectsOverlap(clampedX, clampedY, this.width, this.height,
                                 tank.x, tank.y, tank.width, tank.height)) {
                    collides = true;
                    break;
                }
            }
            if (!collides) {
                this.x = clampedX;
                this.y = clampedY;
                return true;
            }
        }
        return false;
    }

    collidesWithMap(x, y, gameMap) {
        const minC = Math.floor(x / TILE_SIZE);
        const maxC = Math.floor((x + this.width - 1) / TILE_SIZE);
        const minR = Math.floor(y / TILE_SIZE);
        const maxR = Math.floor((y + this.height - 1) / TILE_SIZE);

        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                if (!gameMap.isPassable(c, r)) {
                    return true;
                }
            }
        }
        return false;
    }

    draw(ctx) {
        if (!this.alive) return;

        ctx.save();
        if (this.isInvulnerable()) {
            ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 30) * 0.2;
        }

        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // 车身
        ctx.translate(cx, cy);
        ctx.rotate(this.direction * Math.PI / 2);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // 履带
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, 6, this.height - 4);
        ctx.fillRect(this.width / 2 - 8, -this.height / 2 + 2, 6, this.height - 4);

        // 炮塔
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-10, -10, 20, 20);

        // 炮管
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(-4, -this.height / 2 - 6, 8, 16);

        ctx.restore();
    }
}

/**
 * 玩家坦克
 */
class PlayerTank extends Tank {
    constructor(x, y) {
        super(x, y, DIRECTION.UP, 'player', '#3498db', 140);
        this.maxHealth = 1;
        this.health = 1;
        this.respawnTime = 0;
    }

    update(dt, gameMap, input, tanks) {
        if (!this.alive) {
            this.respawnTime -= dt;
            return;
        }

        super.update(dt, gameMap, tanks);

        const newDir = input.getMovementDirection();
        if (newDir !== -1) {
            this.direction = newDir;
            this.tryMove(dt, gameMap, tanks);
        }
    }

    respawn(x, y) {
        this.x = x;
        this.y = y;
        this.direction = DIRECTION.UP;
        this.alive = true;
        this.health = this.maxHealth;
        this.invulnerableTime = 1.5;
        this.cooldown = 0;
    }
}
