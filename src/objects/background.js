
import { TilingSprite } from '@pixi/sprite-tiling';
import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';

import gsap from 'gsap';

export class Background {

    constructor(app, scale) {
        this.bgSprite = null;

        this.app = app;
        this.scale = scale;

        this.cloudContaner = new Container();

        this.cloudsCount = 0;

        this.initTimer = 1000;
        this.timer = 0;

        this.isMobile = this.app.screen.width < 450;

        this.step = 0;

        this.app.loader.add('bg', './assets/resources/san-francisco' + (this.isMobile ? '.small' : '') + '.jpg');

        this.app.loader.add('cloud1', './assets/resources/cloud1.png');
        this.app.loader.add('cloud2', './assets/resources/cloud2.png');
        this.app.loader.add('cloud3', './assets/resources/cloud3.png');
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

        this.step = (height - this.app.screen.height) / 60 / 40.2;
    }

    tick(delta) {
        this.timer += delta;

        if (this.timer * 16.66 < 40200) {
            this.bgSprite.tilePosition.y += this.step * delta;

           this.initClouds(delta);
        }
    }

    initClouds(delta) {
        if (this.cloudsCount < 10) {
            this.initTimer += delta;

            if (this.initTimer > 20) {
                this.addCloud();
                this.cloudsCount++;
                this.initTimer = 0;
            }
        }
    }

    addCloud() {
        let id = Math.floor(1 + Math.random() * 3);
   
        let cloud = Sprite.from('cloud' + id);
        cloud.scale.set(this.scale);
        cloud.anchor.set(0.5);
        cloud.y = -cloud.height;
        cloud.x = Math.random() * this.app.screen.width;
    
        this.cloudContaner.addChild(cloud);
    
        gsap.to(cloud, { y: this.app.screen.height + cloud.height, ease: 'none', duration: 4, onComplete: () => {
            this.cloudContaner.removeChild(cloud);
            this.addCloud();
        } });
    }
}