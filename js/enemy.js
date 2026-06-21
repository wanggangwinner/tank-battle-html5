/**
 * 敌方坦克 AI
 */
class EnemyTank extends Tank {
    constructor(x, y, type = 'normal') {
        const colors = {
            normal: '#e74c3c',
            fast: '#e67e22',
            heavy: '#9b59b6'
        };
        const speeds = { normal: 80, fast: 130, heavy: 60 };
        super(x, y, DIRECTION.DOWN, 'enemy', colors[type], speeds[type]);
        this.type = type;
        this.maxHealth = type === 'heavy' ? 2 : 1;
        this.health = this.maxHealth;
        this.fireInterval = type === 'fast' ? 0.8 : 1.2;
        this.aiTimer = 0;
        this.moveTimer = 0;
        this.changeDirTime = randRange(1.5, 3);
        this.scoreValue = type === 'heavy' ? 300 : type === 'fast' ? 200 : 100;
    }

    update(dt, gameMap, player, tanks) {
        if (!this.alive) return;
        super.update(dt, gameMap, tanks);

        this.aiTimer += dt;
        this.moveTimer += dt;

        // 检测是否能看到玩家
        const canSeePlayer = this.canSee(player, gameMap);

        if (canSeePlayer) {
            // 朝向玩家
            this.direction = this.directionTo(player);
            // 尝试移动追击
            if (!this.tryMove(dt, gameMap, tanks)) {
                // 撞墙时随机转向
                if (this.moveTimer > 0.3) {
                    this.direction = randChoice(this.availableDirections(gameMap, tanks));
                    this.moveTimer = 0;
                }
            }
        } else {
            // 巡逻模式
            if (this.moveTimer >= this.changeDirTime) {
                this.direction = randChoice(this.availableDirections(gameMap, tanks));
                this.moveTimer = 0;
                this.changeDirTime = randRange(1, 2.5);
            }
            if (!this.tryMove(dt, gameMap, tanks)) {
                // 撞墙立即转向
                this.direction = randChoice(this.availableDirections(gameMap, tanks));
            }
        }
    }

    canSee(player, gameMap) {
        if (!player.alive) return false;
        const c1 = Math.floor((this.x + this.width / 2) / TILE_SIZE);
        const r1 = Math.floor((this.y + this.height / 2) / TILE_SIZE);
        const c2 = Math.floor((player.x + player.width / 2) / TILE_SIZE);
        const r2 = Math.floor((player.y + player.height / 2) / TILE_SIZE);

        // 必须在同一行或同一列
        if (c1 !== c2 && r1 !== r2) return false;

        if (c1 === c2) {
            const minR = Math.min(r1, r2);
            const maxR = Math.max(r1, r2);
            for (let r = minR + 1; r < maxR; r++) {
                if (!gameMap.isPassable(c1, r)) return false;
            }
        } else {
            const minC = Math.min(c1, c2);
            const maxC = Math.max(c1, c2);
            for (let c = minC + 1; c < maxC; c++) {
                if (!gameMap.isPassable(c, r1)) return false;
            }
        }
        return true;
    }

    directionTo(player) {
        const center = this.getCenter();
        const pCenter = player.getCenter();
        const dx = pCenter.x - center.x;
        const dy = pCenter.y - center.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
        } else {
            return dy > 0 ? DIRECTION.DOWN : DIRECTION.UP;
        }
    }

    availableDirections(gameMap, tanks) {
        const dirs = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];
        const valid = [];
        for (const d of dirs) {
            const vec = DIR_VECTORS[d];
            const testX = this.x + vec.x * this.speed * 0.05;
            const testY = this.y + vec.y * this.speed * 0.05;
            let blocked = this.collidesWithMap(testX, testY, gameMap);
            if (!blocked) {
                for (const t of tanks) {
                    if (t !== this && t.alive) {
                        if (rectsOverlap(testX, testY, this.width, this.height, t.x, t.y, t.width, t.height)) {
                            blocked = true;
                            break;
                        }
                    }
                }
            }
            if (!blocked) valid.push(d);
        }
        return valid.length > 0 ? valid : [DIRECTION.UP];
    }

    shoot() {
        if (!this.canShoot()) return null;
        this.cooldown = this.fireInterval;
        const center = this.getCenter();
        const vec = DIR_VECTORS[this.direction];
        const offset = 24;
        const bx = center.x + vec.x * offset - 4;
        const by = center.y + vec.y * offset - 4;
        return new Bullet(bx, by, this.direction, this.owner, 260, 1);
    }
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}
