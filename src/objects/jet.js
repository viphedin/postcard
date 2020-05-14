import { AnimatedSprite } from '@pixi/sprite-animated';
import { Texture } from '@pixi/core';

import gsap from 'gsap';

export class Jet {

    constructor(app, scale) {
        this.app = app;
        this.scale = scale;

        this.play = false;

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

        this.app.loader.add('jet', './assets/resources/jet.json');
        this.app.loader.add('jet_sound', './assets/resources/jet.mp3');

        this.tween = null;

        this.sound = null;

        window.addEventListener(
            "keydown", (event) => {
                let code = event.code ? event.code : event.key;

                switch(code) {
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
                let code = event.code ? event.code : event.key;

                switch(code) {
                    case 'KeyA':
                    case 'ArrowLeft':
                        this.direction = this.direction == -1 ? 0 : this.direction;
                        if (this.direction == 0) {
                            this.doMove();
                        }
                        event.preventDefault();
                        break;              
                    case 'KeyD':
                    case 'ArrowRight':
                        this.direction = this.direction == 1 ? 0 : this.direction;
                        if (this.direction == 0) {
                            this.doMove();
                        }
                        event.preventDefault();
                        break;
                }
            }, false
        );
    }

    get jet() {
        return this._jet;
    }

    append(resources) {
        this.sound = resources.jet_sound.sound;
        this.sound.volume = 0.2;

        this._jets = {
            base: this.getJetSprite(5, 8),
            left: this.getJetSprite(7, 12),
            right: this.getJetSprite(5, 0),
            leftBack: this.getJetSprite(11, 6),
            rightBack : this.getJetSprite(1, 6)
        }

        this._jets.leftBack.loop = true;
        this._jets.leftBack.onLoop = () => {
            this._jets.leftBack.stop();
            this.setJet('base');
            this._jet.play();
        };

        this._jets.rightBack.loop = true;
        this._jets.rightBack.onLoop = () => {
            this._jets.rightBack.stop();
            this.setJet('base');
            this._jet.play();
        };
        
        this._jets.base.loop = true;

        this._jet = this._jets.base;
        this._jet.animationSpeed = 0.5;
        this._jet.loop = true;
        this._jetType = 'base';
        
        this.app.stage.addChild(this._jet);

        this.app.stage.interactive = true;
        this.app.stage.on('pointerdown', (event) => { this.onClick(event); });
        this.app.stage.on('pointerup', (event) => { this.onClickUp(event); });

        this.indent = Math.floor(this._jet.width / 4);
    }

    getJetSprite(from, to) {
        const frames = [];

        const i = from < to ? 1 : -1;

        while (from != to) {
            frames.push(
                Texture.from(`jet${from}.png`)
            );

            from += i;
        }

        const jet = new AnimatedSprite(frames);
        jet.scale.set(this.scale);
        jet.anchor.set(0.5);
        jet.x = this.app.screen.width / 2;
        jet.y = this.app.screen.height - 200 * this.scale;
        jet.animationSpeed = 1;
        jet.loop = false;

        return jet;
    }

    tick(delta) {

    }

    start() {
        this.play = true;

        this._jets.base.play();

        this.sound.play();
    }

    stop() {
        this.play = false;

        this.setJet('base');
        this._jet.stop();
        this.sound.stop();
    }

    restart() {
        this.setJet('base');
        this._jet.x = this.app.screen.width / 2;
        this._jet.y = this.app.screen.height - 200 * this.scale;

        this.start();
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
        if (this.moving || !this.play) {
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
        if (this.sound) {
            if (type == 'base') {
                this.sound.volume = 0.2;
            } else {
                this.sound.volume = 0.3;
            }
        }

        if (type != this._jetType) {
            this._jet.stop();

            let jet = this._jets[type];
            jet.x = this._jet.x;
            jet.y = this._jet.y;
            jet.filters = this._jet.filters;

            this.app.stage.removeChild(this._jet);

            this._jet = jet;
            this._jetType = type;

            this.app.stage.addChild(this._jet);

            this._jet.play();
        }
    }
}