/**
 * 游戏主控制器
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.input = new InputHandler();
        this.audio = new AudioManager();
        this.particles = new ParticleSystem();

        this.state = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER, VICTORY
        this.levelIndex = 0;
        this.score = 0;
        this.lives = 3;
        this.maxLevels = LEVELS.length;

        this.gameMap = new GameMap();
        this.player = null;
        this.enemies = [];
        this.bullets = [];

        this.enemySpawnTimer = 0;
        this.enemiesToSpawn = 0;
        this.enemySpawnQueue = [];
        this.maxEnemiesOnScreen = 4;

        this.lastTime = 0;
        this.boundLoop = this.loop.bind(this);

        this.bindUI();
        this.updateHUD();
        requestAnimationFrame(this.boundLoop);
    }

    bindUI() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());

        // 点击画布时恢复 AudioContext
        this.canvas.addEventListener('click', () => {
            this.audio.resume();
        });
    }

    startGame() {
        this.audio.resume();
        this.score = 0;
        this.lives = 3;
        this.levelIndex = 0;
        this.loadLevel(this.levelIndex);
        this.state = 'PLAYING';
        this.hideScreens();
        this.updateHUD();
    }

    loadLevel(index) {
        if (index >= this.maxLevels) {
            this.state = 'VICTORY';
            this.showScreen('victory');
            document.getElementById('victoryScore').textContent = `最终分数: ${this.score}`;
            return;
        }

        this.gameMap.load(LEVELS[index]);
        this.gameMap.particles = this.particles;

        // 玩家出生位置：底部基地上方
        const startTile = this.findPlayerSpawn();
        this.player = new PlayerTank(startTile.c * TILE_SIZE + 3, startTile.r * TILE_SIZE + 3);

        this.bullets = [];
        this.enemies = [];
        this.particles.particles = [];

        // 根据关卡生成敌人队列
        const baseCount = 6 + index * 3;
        this.enemySpawnQueue = this.generateEnemyQueue(baseCount, index);
        this.enemiesToSpawn = this.enemySpawnQueue.length;
        this.enemySpawnTimer = 0;

        this.updateHUD();
    }

    findPlayerSpawn() {
        if (this.gameMap.base) {
            return { c: this.gameMap.base.c, r: Math.max(0, this.gameMap.base.r - 1) };
        }
        return { c: COLS / 2, r: ROWS - 2 };
    }

    generateEnemyQueue(count, levelIndex) {
        const queue = [];
        const types = ['normal'];
        if (levelIndex >= 1) types.push('fast');
        if (levelIndex >= 2) types.push('heavy');

        for (let i = 0; i < count; i++) {
            queue.push(randChoice(types));
        }
        return queue;
    }

    resumeGame() {
        if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            this.hideScreens();
        }
    }

    hideScreens() {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    }

    showScreen(id) {
        this.hideScreens();
        document.getElementById(id).classList.add('active');
    }

    spawnEnemy() {
        if (this.enemiesToSpawn <= 0) return;
        if (this.enemies.length >= this.maxEnemiesOnScreen) return;

        // 寻找出生点（顶部区域空地）
        const spawnTiles = [];
        for (let c = 1; c < COLS - 1; c++) {
            for (let r = 1; r <= 3; r++) {
                if (this.gameMap.isPassable(c, r)) {
                    spawnTiles.push({ c, r });
                }
            }
        }
        if (spawnTiles.length === 0) return;

        const tile = randChoice(spawnTiles);
        const type = this.enemySpawnQueue.shift();
        const enemy = new EnemyTank(tile.c * TILE_SIZE + 3, tile.r * TILE_SIZE + 3, type);
        this.enemies.push(enemy);
        this.enemiesToSpawn--;
    }

    update(dt) {
        this.input.update();

        if (this.input.isPausePressed()) {
            if (this.state === 'PLAYING') {
                this.state = 'PAUSED';
                this.showScreen('pause');
                return;
            } else if (this.state === 'PAUSED') {
                this.resumeGame();
                return;
            }
        }

        if (this.input.isRestartPressed()) {
            if (this.state === 'GAMEOVER' || this.state === 'VICTORY') {
                this.startGame();
                return;
            }
        }

        if (this.state !== 'PLAYING') return;

        // 玩家死亡但还有生命时复活
        if (!this.player.alive) {
            if (this.player.respawnTime <= 0) {
                this.player.respawnTime = 1;
                this.lives--;
                this.updateHUD();
                if (this.lives < 0) {
                    this.state = 'GAMEOVER';
                    this.showScreen('gameover');
                    document.getElementById('finalScore').textContent = `最终分数: ${this.score}`;
                    return;
                }
            } else {
                this.player.respawnTime -= dt;
                if (this.player.respawnTime <= 0) {
                    const spawn = this.findPlayerSpawn();
                    this.player.respawn(spawn.c * TILE_SIZE + 3, spawn.r * TILE_SIZE + 3);
                }
            }
        }

        // 更新粒子
        this.particles.update(dt);

        // 生成敌人
        this.enemySpawnTimer += dt;
        if (this.enemySpawnTimer >= 2) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }

        // 玩家
        if (this.player.alive) {
            this.player.update(dt, this.gameMap, this.input, [this.player, ...this.enemies]);
            if (this.input.isShootPressed()) {
                const bullet = this.player.shoot();
                if (bullet) {
                    this.bullets.push(bullet);
                    this.audio.playShoot();
                }
            }
        }

        // 敌人
        for (const enemy of this.enemies) {
            enemy.update(dt, this.gameMap, this.player, [this.player, ...this.enemies]);
            const bullet = enemy.shoot();
            if (bullet) {
                this.bullets.push(bullet);
                this.audio.playShoot();
            }
        }

        // 子弹
        for (const bullet of this.bullets) {
            bullet.update(dt, this.gameMap, [this.player, ...this.enemies]);
        }

        // 清理子弹
        this.bullets = this.bullets.filter(b => b.active);

        // 处理敌人死亡
        const killedEnemies = this.enemies.filter(e => !e.alive);
        for (const e of killedEnemies) {
            this.score += e.scoreValue;
            this.particles.spawnExplosion(e.x + e.width / 2, e.y + e.height / 2, '#e74c3c', 15);
            this.audio.playExplosion();
        }
        this.enemies = this.enemies.filter(e => e.alive);

        // 玩家受伤粒子与音效
        if (this.player.alive && this.player.isInvulnerable() && this.player.health > 0) {
            // 刚被击中时由 takeDamage 触发，这里不需要额外处理
        }

        // 检查基地被毁
        if (this.gameMap.base) {
            const baseX = this.gameMap.base.c * TILE_SIZE;
            const baseY = this.gameMap.base.r * TILE_SIZE;
            if (this.player.alive && rectsOverlap(this.player.x, this.player.y, this.player.width, this.player.height, baseX, baseY, TILE_SIZE, TILE_SIZE)) {
                // 玩家可以穿过基地
            }
        }

        // 检查关卡完成
        if (this.enemiesToSpawn <= 0 && this.enemies.length === 0) {
            this.levelIndex++;
            this.loadLevel(this.levelIndex);
        }

        this.updateHUD();
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // 绘制地图
        this.gameMap.draw(this.ctx);

        // 绘制基地
        if (this.gameMap.base) {
            // 已在 map.draw 中绘制
        }

        // 绘制玩家
        if (this.player) this.player.draw(this.ctx);

        // 绘制敌人
        for (const enemy of this.enemies) {
            enemy.draw(this.ctx);
        }

        // 绘制子弹
        for (const bullet of this.bullets) {
            bullet.draw(this.ctx);
        }

        // 绘制粒子
        this.particles.draw(this.ctx);
    }

    updateHUD() {
        document.getElementById('score').textContent = `分数: ${this.score}`;
        document.getElementById('lives').textContent = `生命: ${Math.max(0, this.lives)}`;
        document.getElementById('level').textContent = `关卡: ${Math.min(this.levelIndex + 1, this.maxLevels)}`;
        const remaining = this.enemiesToSpawn + this.enemies.length;
        document.getElementById('enemies').textContent = `敌人: ${remaining}`;
    }

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame(this.boundLoop);
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new Game();
});
