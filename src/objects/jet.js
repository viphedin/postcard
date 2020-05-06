import { AnimatedSprite } from '@pixi/sprite-animated';
import { Texture } from '@pixi/core';
import { OutlineFilter } from '@pixi/filter-outline';

import gsap from 'gsap';

export class Jet {

    constructor(app, scale) {
        this._jets = {
            base: null,
            left: null,
            right: null,
            leftBack: null,
            rightBack : null
        }

        this._jet = null;
        this._mc = null;
    
        this.direction = 0;
        this.lastDirection = 0;
        this.moving = false;
    
        this.indent = 0;
    
        this.isCollision = null;
        this.wait = null;

        this.app = app;
        this.scale = scale;

        this.app.loader.add('fighter', './assets/resources/fighter.json');

        this.app.loader.add('mc', './assets/resources/mc.json');

        this.bonus = 0;

        window.addEventListener(
            "keydown", (event) => {
                switch(event.code) {
                    case 'KeyA':
                    case 'ArrowLeft':
                      this.direction = -1;
                      event.preventDefault();
                      this.doMove();
                      break;
                    case 'KeyD':
                    case 'ArrowRight':
                        this.direction = 1;
                        event.preventDefault();
                        this.doMove();
                        break;
                  }
            }, false
        );
          
        window.addEventListener(
            "keyup", (event) => {
                switch(event.code) {
                    case 'KeyA':
                    case 'ArrowLeft':
                    case 'KeyD':
                    case 'ArrowRight':
                        this.direction = 0;
                        event.preventDefault();
                        this.doMove()
                        break;
                }
            }, false
        );
    }

    get jet() {
        return this._jet;
    }

    get mc() {
        return this._mc;
    }

    append() {
        this._jets = {
            base: this.getJetSprite(0, 1),
            left: this.getJetSprite(29, 23),
            right: this.getJetSprite(0, 6),
            leftBack: this.getJetSprite(24, 30),
            rightBack : this.getJetSprite(5, -1)
        }

        this._jet = this._jets.left;
        
        this.app.stage.addChild(this._jet);

        const mcFrames = [];
        
        for (let i = 1; i <= 27; i++) {
            mcFrames.push(
                Texture.from(`Explosion_Sequence_A ${i}.png`)
            );
        }

        this._mc = new AnimatedSprite(mcFrames);
        this._mc.scale.set(this.scale);
        this._mc.anchor.set(0.5);
        this._mc.animationSpeed = 1;
        this._mc.loop = false;

        this.app.stage.addChild(this._mc);

        this.app.stage.interactive = true;
        this.app.stage.on('pointerdown', (event) => { this.onClick(event); });
        this.app.stage.on('pointerup', (event) => { this.onClickUp(event); });

        this.indent = Math.floor(this._jet.width / 2);
    }

    getJetSprite(from, to) {
        const frames = [];

        const i = from < to ? 1 : -1;

        console.log(from, to, i);
        while (from != to) {
            console.log(from, to);
            const val = from < 10 ? `0${from}` : from;
    
            frames.push(
                Texture.from(`rollSequence00${val}.png`)
            );

            from += i;
        }

        const jet = new AnimatedSprite(frames);
        jet.scale.set(this.scale * 0.7);
        jet.anchor.set(0.5);
        jet.x = this.app.screen.width / 2;
        jet.y = this.app.screen.height - 200 * this.scale;
        jet.loop = false;

        return jet;
    }

    tick(delta) {
        if (this.isCollision) {
            this._jet.filters = [
                new OutlineFilter(8 * this.scale, 0xff6666)
            ];
            this.app.stage.addChild(this._mc);
            this._mc.gotoAndPlay(0);
            this.wait = 20;

            this.isCollision = false;
        } else {
            this.wait--;

            this._mc.y += 10 * this.scale;

            if (this.wait == 0) {
                this._jet.filters = null;
            }
        }

        this.bonus += delta / 5;

        //console.log('bonus', this.bonus);
    }

    collision(x, y) {
        this._mc.x = x;
        this._mc.y = y;
        this.isCollision = true;

        this.bonus -= 100;

        if (this.bonus < 0) {
            this.bonus = 0;
        }
    }

    onClick(event) {
        if (this._jet != null) {
            this.direction = this._jet.x > event.data.global.x ? -1 : 1;
            this.doMove();
        }
    }

    onClickUp(event) {
        this.direction = 0;
        this.doMove();
    }

    doMove() {
        if (!this.moving && this.direction) {
            let x = this.jet.x + this.direction * 20 * this.scale;
    
            if (x > this.indent && x < this.app.screen.width - this.indent) {
                this.moving = true;

                if (this.lastDirection != this.direction) {
                    this.setJet(this.direction == 1 ? this._jets.right : this._jets.left);
                }

                gsap.to(this._jet, { x: x, ease: "none", duration: 0.1, onComplete: () => {
                    this.moving = false;
                    this.doMove();
                }});
    
                if (this.lastDirection != this.direction) {
                    this._jet.gotoAndPlay(0);
                    this.lastDirection = this.direction;
                }
            }
        } else if (!this.moving && this.lastDirection) {
            this.setJet(this.lastDirection == 1 ? this._jets.rightBack : this._jets.leftBack);

            this._jet.gotoAndPlay(0);
        } else if (!this.moving) {
            this.setJet(this._jets.base);
        }
    }

    setJet(jet) {
        if (jet != this.jet) {
            jet.x = this._jet.x;
            jet.y = this._jet.y;
            jet.filters = this._jet.filters;

            this.app.stage.removeChild(this._jet);

            this._jet = jet;

            this.app.stage.addChild(this._jet);
        }
    }
}