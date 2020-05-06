import { AnimatedSprite } from '@pixi/sprite-animated';
import { Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { BitmapFontLoader, BitmapText } from '@pixi/text-bitmap';
import { Loader } from '@pixi/loaders';

Loader.registerPlugin(BitmapFontLoader);

import gsap from 'gsap';

export class Stars {

    constructor(app, scale) {
        this.stars = [];

        this.app = app;
        this.scale = scale;

        this.starsContaner = new Container();
        this.scoreContaner = new Container();

        this.timer = 0;

        this.app.loader.add('star', './assets/resources/star.json');
        app.loader.add('desyrel', './assets/resources/bitmap-font/desyrel.xml');

        this.score = 0;
    }

    append() {
        this.starsContaner.x = 0;
        this.starsContaner.y = 0;

        this.app.stage.addChild(this.starsContaner);

        this.scoreContaner.x = 0;
        this.scoreContaner.y = 0;
        this.app.stage.addChild(this.scoreContaner);

        this.scoreText = new BitmapText('Score: ' + Math.floor(this.score), { font: (Math.floor(55 * this.scale)) + 'px Desyrel', align: 'right' });

        this.scoreText.x = this.app.screen.width - 40 * this.scale;
        this.scoreText.y = 15 * this.scale;

        this.scoreText.anchor.set(1, 0);

        this.app.stage.addChild(this.scoreText);
    }

    tick(delta) {
        this.runStar(delta);
    }

    runStar(delta) {
        this.timer += delta;

        if (this.timer > 60 + Math.random() * 50) {
            this.star();
            this.timer = 0;
        }
    }

    checkCollision(jet) {
        for (let i = 0; i < this.stars.length; i++) {
            if (this.macroCollision(this.stars[i].sprite, jet, 0.7)) {
                this.stars[i].tween.kill();

                let key = this.stars[i].key;

                this.stars[i].sprite.animationSpeed = 0.3;

                this.stars[i].tween = gsap.to(this.stars[i].sprite, { x: this.app.screen.width - 40 * this.scale, y: 60 * this.scale, ease: "none", duration: 1, onComplete: () => {
                    this.deleteStar(key);
                    this.updateScore();
                } });

                this.score += 10;

                return true;
            }
        }

        return false;
    }

    updateScore() {
        this.scoreText.text = 'Score: ' + Math.floor(this.score);
    }

    star() {
        const frames = [];
            
        for (let i = 5; i >= 1; i--) {
            frames.push(
                Texture.from(`star${i}.png`)
            );
        }
    
        let star = {
            key: Math.random().toString(36).replace(/[^a-z]+/g, ''),
            sprite: new AnimatedSprite(frames),
            tween: null
        };

        star.sprite.animationSpeed = 0.1;
        star.sprite.scale.set(this.scale * 0.7);
        star.sprite.x = 60 * this.scale + Math.random() * (this.app.screen.width - 60 * this.scale);
        star.sprite.y = - 60 * this.scale;
        star.sprite.anchor.set(0.5);
        star.sprite.play();
    
        this.starsContaner.addChild(star.sprite);

        this.stars.push(star);
    
        star.tween = gsap.to(star.sprite, { y: this.app.screen.height + 60, ease: "none", duration: 3, onComplete: () => {
            this.deleteStar(star.key);
        } });
    }

    deleteStar(key) {
        for (let i = 0; i < this.stars.length; i++) {
            if (this.stars[i].key == key) {
                this.starsContaner.removeChild(this.stars[i].sprite);
                this.stars.splice(i, 1);
                return;
            }
        }
    }

    macroCollision(obj1, obj2, delta) {
        let xColl = false;
        let yColl = false;
    
        let obj1Left = obj1.x - obj1.width / 2;
        let obj1Right = obj1.x + obj1.width / 2;
    
        let obj2Left = obj2.x - (obj2.width  * delta) / 2;
        let obj2Right = obj2.x + (obj2.width  * delta) / 2;
    
        let obj1Top = obj1.y - obj1.height / 2;
        let obj1Bottom = obj1.y + obj1.height / 2;
    
        let obj2Top = obj2.y - (obj2.height * delta) / 2;
        let obj2Bottom = obj2.y + (obj2.height * delta) / 2;
    
        if ((obj1Left <= obj2Right) && (obj1Right >= obj2Left)) xColl = true;
        if ((obj1Top <=  obj2Bottom) && (obj1Bottom >= obj2Top)) yColl = true;
    
        if (xColl && yColl) {
            return true;
        }
    
        return false;
    }
}