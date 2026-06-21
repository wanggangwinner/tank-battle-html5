/**
 * 键盘输入处理
 */
class InputHandler {
    constructor() {
        this.keys = {};
        this.lastKeys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isDown(code) {
        return !!this.keys[code];
    }

    isPressed(code) {
        return !!this.keys[code] && !this.lastKeys[code];
    }

    update() {
        // 在帧末同步 lastKeys，供下一帧检测按键按下事件
        for (const code in this.keys) {
            this.lastKeys[code] = this.keys[code];
        }
    }

    getMovementDirection() {
        if (this.isDown('KeyW') || this.isDown('ArrowUp')) return DIRECTION.UP;
        if (this.isDown('KeyS') || this.isDown('ArrowDown')) return DIRECTION.DOWN;
        if (this.isDown('KeyA') || this.isDown('ArrowLeft')) return DIRECTION.LEFT;
        if (this.isDown('KeyD') || this.isDown('ArrowRight')) return DIRECTION.RIGHT;
        return -1;
    }

    isShootPressed() {
        return this.isPressed('Space');
    }

    isPausePressed() {
        return this.isPressed('KeyP');
    }

    isRestartPressed() {
        return this.isPressed('KeyR');
    }
}
