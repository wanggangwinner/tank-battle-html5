/**
 * 地图与关卡系统
 *
 * 地图使用 20x15 的格子，每个格子 40 像素。
 * 0=空地 1=砖墙（可破坏） 2=钢墙（不可破坏） 3=草地（可穿过，遮挡） 4=水域（不可穿过） 5=基地
 */
class GameMap {
    constructor() {
        this.grid = [];
        this.base = null; // {x, y}
    }

    load(levelData) {
        this.grid = levelData.map(row => [...row]);
        this.base = null;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (this.grid[r][c] === TILE.BASE) {
                    this.base = { c, r };
                }
            }
        }
    }

    get(c, r) {
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return TILE.STEEL;
        return this.grid[r][c];
    }

    set(c, r, value) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            this.grid[r][c] = value;
        }
    }

    isWall(c, r) {
        const t = this.get(c, r);
        return t === TILE.BRICK || t === TILE.STEEL || t === TILE.WATER;
    }

    isDestructible(c, r) {
        return this.get(c, r) === TILE.BRICK;
    }

    isPassable(c, r) {
        const t = this.get(c, r);
        return t === TILE.EMPTY || t === TILE.GRASS;
    }

    destroyTile(c, r) {
        if (this.isDestructible(c, r)) {
            this.set(c, r, TILE.EMPTY);
            return true;
        }
        return false;
    }

    draw(ctx) {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const t = this.grid[r][c];
                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;

                if (t === TILE.BRICK) {
                    this.drawBrick(ctx, x, y);
                } else if (t === TILE.STEEL) {
                    this.drawSteel(ctx, x, y);
                } else if (t === TILE.GRASS) {
                    this.drawGrass(ctx, x, y);
                } else if (t === TILE.WATER) {
                    this.drawWater(ctx, x, y);
                } else if (t === TILE.BASE) {
                    this.drawBase(ctx, x, y);
                }
            }
        }
    }

    drawBrick(ctx, x, y) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#5D2F0D';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.beginPath();
        ctx.moveTo(x + 2, y + TILE_SIZE / 2);
        ctx.lineTo(x + TILE_SIZE - 2, y + TILE_SIZE / 2);
        ctx.moveTo(x + TILE_SIZE / 2, y + 2);
        ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE - 2);
        ctx.stroke();
    }

    drawSteel(ctx, x, y) {
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#bdc3c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        ctx.strokeStyle = '#566363';
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 3);
        ctx.lineTo(x + TILE_SIZE - 3, y + TILE_SIZE - 3);
        ctx.moveTo(x + TILE_SIZE - 3, y + 3);
        ctx.lineTo(x + 3, y + TILE_SIZE - 3);
        ctx.stroke();
    }

    drawGrass(ctx, x, y) {
        ctx.fillStyle = 'rgba(39, 174, 96, 0.4)';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = 'rgba(46, 204, 113, 0.5)';
        for (let i = 0; i < 5; i++) {
            const px = x + Math.random() * TILE_SIZE;
            const py = y + Math.random() * TILE_SIZE;
            ctx.fillRect(px, py, 4, 8);
        }
    }

    drawWater(ctx, x, y) {
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x + 5, y + 10, TILE_SIZE - 10, 4);
        ctx.fillRect(x + 10, y + 22, TILE_SIZE - 15, 4);
    }

    drawBase(ctx, x, y) {
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#e74c3c';
        const pad = 6;
        ctx.fillRect(x + pad, y + pad, TILE_SIZE - pad * 2, TILE_SIZE - pad * 2);
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + pad, y + pad, TILE_SIZE - pad * 2, TILE_SIZE - pad * 2);
        // 鹰徽
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

/**
 * 预定义关卡
 * 0=空地 1=砖墙 2=钢墙 3=草地 4=水域 5=基地
 */
const LEVELS = [
    [
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,2],
        [2,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,1,0,2,2,0,0,0,0,0,0,0,0,2,2,0,1,0,2],
        [2,0,1,0,2,2,0,0,0,0,0,0,0,0,2,2,0,1,0,2],
        [2,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,2],
        [2,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,2],
        [2,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,2],
        [2,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,2],
        [2,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,2],
        [2,0,0,0,0,1,1,0,0,5,0,0,0,1,1,0,0,0,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    [
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,1,1,0,0,2,2,0,1,1,0,2,2,0,0,1,1,0,2],
        [2,0,1,1,0,0,2,2,0,1,1,0,2,2,0,0,1,1,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,2,2,1,1,0,0,4,4,4,4,0,0,1,1,2,2,0,2],
        [2,0,2,2,1,1,0,0,4,4,4,4,0,0,1,1,2,2,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,1,1,0,2,2,0,1,1,0,0,1,1,0,2,2,0,1,1,2],
        [2,1,1,0,2,2,0,1,1,0,0,1,1,0,2,2,0,1,1,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,2],
        [2,0,1,1,0,0,1,1,0,0,5,0,1,1,0,0,1,1,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    [
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,2,0,2,0,2,0,2,0,0,2,0,2,0,2,0,2,0,2],
        [2,0,2,0,2,0,2,0,2,0,0,2,0,2,0,2,0,2,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,1,1,2,2,0,1,1,0,0,1,1,0,2,2,1,1,0,2],
        [2,0,1,1,2,2,0,1,1,0,0,1,1,0,2,2,1,1,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,2,0,1,1,0,2,2,0,0,2,2,0,1,1,0,2,0,2],
        [2,0,2,0,1,1,0,2,2,0,0,2,2,0,1,1,0,2,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,0,1,2,1,0,1,2,1,0,0,1,2,1,0,1,2,1,0,2],
        [2,0,1,2,1,0,1,2,1,0,5,1,2,1,0,1,2,1,0,2],
        [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ]
];

function findEmptyTiles(grid) {
    const tiles = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] === TILE.EMPTY) {
                tiles.push({ c, r });
            }
        }
    }
    return tiles;
}
