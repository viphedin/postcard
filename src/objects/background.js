
import { TilingSprite } from '@pixi/sprite-tiling';
import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';

import gsap from 'gsap';

export class Background {

    constructor(app, scale) {
        this.app = app;
        this.scale = scale;

        this.play = false;

        this.bgSprite = null;

        this.cloudContaner = new Container();

        this.cloudsCount = 0;

        this.initTimer = 1000;

        this.isMobile = this.app.screen.width < 450;

        this.step = 0;

        this.app.loader.add('bg', './assets/resources/san-francisco' + (this.isMobile ? '.small' : '') + '.jpg');

        this.app.loader.add('cloud1', './assets/resources/cloud1.png');
        this.app.loader.add('cloud2', './assets/resources/cloud2.png');
        this.app.loader.add('cloud3', './assets/resources/cloud3.png');

        this.tweens = [];
    }

    append() {
        this.bgSprite = TilingSprite.from('bg', this.app.screen.width, this.app.screen.height);
        this.bgSprite.anchor.set(0);
        
        this.app.stage.addChild(this.bgSprite);

        this.bgSprite.tilePosition.x = 0;
        this.bgSprite.tilePosition.y = this.app.screen.height;
       
        this.cloudContaner.x = 0;
        this.cloudContaner.y = 0;

        this.app.stage.addChild(this.cloudContaner);

        const height = this.isMobile ? 2194 : 3900;

        this.step = (height - this.app.screen.height) / 60 / 42;

        this.initClouds();
    }

    tick(delta) {
        if (this.play) {
            this.bgSprite.tilePosition.y += this.step * delta;
        }
    }

    start() {
        this.play = true;

        this.tweens.map((tween) => {
            tween.play();
        });
    }

    stop() {
        this.play = false;

        this.tweens.map((tween) => {
            tween.pause();
        });
    }

    restart() {
        this.bgSprite.tilePosition.x = 0;
        this.bgSprite.tilePosition.y = this.app.screen.height;

        this.start();
    }

    initClouds() {
        let height = this.app.screen.height / 9;

        for (let i = 0; i < 10; i++) {
            this.tweens.push(null);
            this.addCloud(this.tweens.length - 1, height * i - height / 2);
        }
    }

    addCloud(key, y) {
        let cloud = this.createCloud();

        if (this.tweens[key] != null) {
            this.tweens[key].kill();
        }
    
        this.tweens[key] = gsap.to(cloud, { y: this.app.screen.height + cloud.height, ease: 'none', duration: 3, onComplete: () => {
            this.cloudContaner.removeChild(cloud);
            this.addCloud(key);
        } });

        if (y != null) {
            this.tweens[key].pause();
            this.tweens[key].duration(4 / this.app.screen.height * (this.app.screen.height - y));
            cloud.y = y;
        }

    }

    createCloud() {
        let id = Math.floor(1 + Math.random() * 3);
   
        let cloud = Sprite.from('cloud' + id);
        cloud.scale.set(this.scale);
        cloud.anchor.set(0.5);
        cloud.y = -cloud.height;
        cloud.x = Math.random() * this.app.screen.width;
    
        this.cloudContaner.addChild(cloud);

        return cloud;
    }
}