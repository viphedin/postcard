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

        this._jetType = '';
        this._jet = null;
    
        this.direction = 0;
        this.lastDirection = 0;
        this.moving = false;
    
        this.indent = 0;
    
        this.isCollision = null;
        this.wait = null;

        this.app = app;
        this.scale = scale;

        this.app.loader.add('fighter', './assets/resources/fighter.json');

        this.tween = null;

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
                        this.direction = this.direction == -1 ? 0 : this.direction;
                        event.preventDefault();
                        break;              
                    case 'KeyD':
                    case 'ArrowRight':
                        this.direction = this.direction == 1 ? 0 : this.direction;
                        event.preventDefault();
                        break;
                }
            }, false
        );
    }

    get jet() {
        return this._jet;
    }

    append() {
        this._jets = {
            base: this.getJetSprite(0, 1),
            left: this.getJetSprite(29, 23),
            right: this.getJetSprite(0, 6),
            leftBack: this.getJetSprite(24, 30),
            rightBack : this.getJetSprite(5, -1)
        }

        this._jet = this._jets.base;
        this._jetType = 'base';
        
        this.app.stage.addChild(this._jet);

        this.app.stage.interactive = true;
        this.app.stage.on('pointerdown', (event) => { this.onClick(event); });
        this.app.stage.on('pointerup', (event) => { this.onClickUp(event); });

        this.indent = Math.floor(this._jet.width / 2);
    }

    getJetSprite(from, to) {
        const frames = [];

        const i = from < to ? 1 : -1;

        while (from != to) {
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
        jet.animationSpeed = 1;
        jet.loop = false;

        return jet;
    }

    tick(delta) {
        if (this.isCollision) {
            this._jet.filters = [
                new OutlineFilter(4 * this.scale, 0x00ee33)
            ];

            this.wait = 20;

            this.isCollision = false;
        } else {
            this.wait--;

            if (this.wait == 0) {
                this._jet.filters = null;
            }
        }
    }

    collision() {
        this.isCollision = true;
    }

    onClick(event) {
        if (this._jet != null) {
            this.direction = this._jet.x > event.data.global.x ? -1 : 1;
            this.doMove();
        }
    }

    onClickUp(event) {
        this.direction = 0;
    }

    doMove() {
        if (this.moving) {
            return;
        }

        if (this.direction) {
            let x = this.jet.x + this.direction * 20 * this.scale;
    
            if (x > this.indent && x < this.app.screen.width - this.indent) {
                this.moving = true;

                if (this.lastDirection != this.direction) {
                    this.setJet(this.direction == 1 ? 'right' : 'left');
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
        } else if (this.lastDirection) {
            this.setJet(this.lastDirection == 1 ? 'rightBack' : 'leftBack');
            this._jet.gotoAndPlay(0);
            this.lastDirection = 0;
        }
    }

    setJet(type) {
        if (type != this._jetType) {
            let jet = this._jets[type];
            jet.x = this._jet.x;
            jet.y = this._jet.y;
            jet.filters = this._jet.filters;

            this.app.stage.removeChild(this._jet);

            this._jet = jet;
            this._jetType = type;

            this.app.stage.addChild(this._jet);
        }
    }
}