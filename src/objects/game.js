import { BitmapText } from '@pixi/text-bitmap';
import { BlurFilter } from '@pixi/filter-blur';

import gsap from 'gsap';

export class Game {
    constructor(app, scale) {
        this.app = app;
        this.scale = scale;

        this.play = false;

        this.startCallback = null;
        this.stopCallback = null;
        this.restartCallback = null;

        this.timer = 0;

        this.loaded = false;

        this.stars = null;

        this.scoreText = null;

        this.end = false;

        window.addEventListener(
            "keydown", (event) => {
                if (!this.play && this.loaded) {
                    switch(event.code) {
                        case 'Space':
                            if (this.end) {
                                this.onRestartClick();
                            } else {
                                this.onClick();
                            }
                            event.preventDefault();
                            break;
                    }
                }
            }, false
        );
    }

    append() {
        this.startText = new BitmapText('START', { font: Math.floor(70 * this.scale) + 'px Desyrel', align: 'center' });

        this.startText.x = this.app.screen.width / 2;
        this.startText.y = this.app.screen.height / 2;

        this.startText.anchor.set(0.5, 0.5);

        this.app.stage.addChild(this.startText);

        this.startText.interactive = true;
        this.startText.on('pointerdown', (event) => { this.onClick(event); });

        this.restartText = new BitmapText('PLAY AGAIN', { font: Math.floor(55 * this.scale) + 'px Desyrel', align: 'center' });

        this.restartText.x = this.app.screen.width / 2;
        this.restartText.y = this.app.screen.height / 6 * 5;

        this.restartText.anchor.set(0.5, 0.5);

        this.restartText.interactive = true;
        this.restartText.on('pointerdown', (event) => { this.onRestartClick(event); });

        this.timeText = new BitmapText('Time: 00.0', { font: Math.floor(50 * this.scale) + 'px Desyrel', align: 'left' });

        this.timeText.x = 20 * this.scale;
        this.timeText.y = 15 * this.scale;

        this.timeText.anchor.set(0, 0);

        this.app.stage.addChild(this.timeText);

        this.loaded = true;
    }

    tick(delta) {
        if (this.play) {
            this.timer += delta;

            if (this.timer * 16.66 >= 40200) {
                this.stopGame();
            } else {
                let time = Math.ceil(this.timer * 16.66 / 100) / 10;

                this.timeText.text = 'Time: ' + (time < 10 ? `0${time}` : time);
            }
        }
    }

    onClick() {
        let width = this.startText.width;
        let height = this.startText.height;

        gsap.to(this.startText, { width: width * 0.5, height: height * 0.5, duration: 0.1, onComplete: () => {
            this.app.stage.removeChild(this.startText);
            this.startGame();
        }});
    }

    onRestartClick() {
        let width = this.restartText.width;
        let height = this.restartText.height;

        gsap.to(this.restartText, { width: width * 0.5, height: height * 0.5, duration: 0.1, onComplete: () => {
            this.app.stage.removeChild(this.restartText);
            this.restartText.width = width;
            this.restartText.height = height;
            this.restartGame();
        }});
    }

    start() {
        this.play = true;
    }

    stop() {
        this.play = false;
    }

    registerStars(stars) {
        this.stars = stars;
    }

    registerStart(callback) {
        this.startCallback = callback;
    }

    registerStop(callback) {
        this.stopCallback = callback;
    }

    registerRestart(callback) {
        this.restartCallback = callback;
    }

    startGame() {
        this.start();

        if (this.startCallback != null) {
            this.startCallback.call();
        }
    }

    stopGame() {
        this.stop();

        this.end = true;

        if (this.stopCallback != null) {
            this.stopCallback.call();
        }

        const filter = new BlurFilter();
        filter.blur = 2;

        this.app.stage.children.map((item) => {
            item.filters = [filter];
        });

        if (this.stars != null) {
            this.scoreText = new BitmapText("GREAT FLIGHT!\n\nYOUR SCORE\n" + this.stars.getScore(), { font: Math.floor(70 * this.scale) + 'px Desyrel', align: 'center' });

            this.scoreText.x = this.app.screen.width / 2;
            this.scoreText.y = this.app.screen.height / 3;

            this.scoreText.anchor.set(0.5, 0.5);

            this.app.stage.addChild(this.scoreText);

            this.app.stage.addChild(this.restartText);
        }
    }

    restartGame() {
        if (this.scoreText != null) {
            this.app.stage.removeChild(this.scoreText);
        }

        this.end = false;
        this.timer = 0;
        this.timeText.text = 'Time: 00.0';

        this.app.stage.children.map((item) => {
            item.filters = null;
        });

        if (this.restartCallback != null) {
            this.restartCallback.call();
        }

        this.start();
    }
}