import { Application } from '@pixi/app';
import { TilingSprite } from '@pixi/sprite-tiling';
import { Sprite } from '@pixi/sprite';
import { AnimatedSprite } from '@pixi/sprite-animated';

import { Renderer } from '@pixi/core';

import { BatchRenderer } from '@pixi/core';
Renderer.registerPlugin('batch', BatchRenderer);

import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer);

import { InteractionManager } from '@pixi/interaction';
Renderer.registerPlugin('interaction', InteractionManager);

import { TickerPlugin } from '@pixi/ticker';
Application.registerPlugin(TickerPlugin);

import { AppLoaderPlugin } from '@pixi/loaders';
Application.registerPlugin(AppLoaderPlugin);

import { SpritesheetLoader } from '@pixi/spritesheet';
import { Loader } from '@pixi/loaders';
Loader.registerPlugin(SpritesheetLoader)

import { BitmapFontLoader } from '@pixi/text-bitmap';
Loader.registerPlugin(BitmapFontLoader);

import { Texture } from '@pixi/core';
import { Container } from '@pixi/display';

import { OutlineFilter } from '@pixi/filter-outline';

import { Graphics } from '@pixi/graphics';
import { BlurFilter } from '@pixi/filter-blur';
import { Text, TextStyle } from '@pixi/text';

import { Jet } from './objects/jet.js';
import { Background } from './objects/background.js';
import { Stars } from './objects/stars.js';
import { Game } from './objects/game.js';

import gsap from 'gsap';

let screenWidth = window.innerWidth > 600 ? 600 : window.innerWidth;

const app = new Application({
    width: screenWidth,
    height: window.innerHeight,
    //resolution: window.devicePixelRatio
});

let scale = screenWidth / 600;

document.getElementById('game').appendChild(app.view);

const jet = new Jet(app, scale);
const background = new Background(app, scale);
const stars = new Stars(app, scale);
const game = new Game(app, scale);

game.registerStart(() => {
    jet.start();
    background.start();
    stars.start();
})

game.registerStop(() => {
    jet.stop();
    background.stop();
    stars.stop();
})

game.registerStars(stars);

let clouds = [];
let cloudFilters = [];

let mouseCursor = 1;
let rocketContaner = new Container();
let rocketSpeed = 0;
let hatSprite = null;

const style = new TextStyle({
    fontFamily: 'sans-serif',
    fontSize: 50 * scale,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#6c757d', '#000000'], // gradient
    dropShadow: true,
    dropShadowColor: '#4f52ba',
    dropShadowBlur: 2,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 2,
    wordWrap: true,
    wordWrapWidth: 440 * scale,
});

app.loader.add('desyrel', './assets/resources/bitmap-font/desyrel.xml');

app.loader.load(() => {
    background.append();
    stars.append();
    jet.append();
    game.append();

/*
    rocketContaner.x = 0;
    rocketContaner.y = 0;
    app.stage.addChild(rocketContaner);

    runRocket();
*/
    let thing = new Graphics();
    thing.x = 0;
    thing.y = 0;

    app.stage.addChild(thing);

    app.ticker.add((delta) => {
        game.tick(delta);
        background.tick(delta);
        stars.tick(delta);

        if (stars.checkCollision(jet.jet)) {
            jet.collision();
        }
/*
        rocketContaner.children.forEach((value, key) => {
            if (macroCollision(value, jet.jet, 0.8)) {
                collision = true;
                collisionX = value.x;
                collisionY = value.y + value.height / 2;
                rocketContaner.removeChild(value);
            }
        });

        if (collision) {
            jet.collision(collisionX, collisionY);
        }

        if (hatSprite == null && rocketSpeed >= 2) {
            hatSprite = createHat();
        }

        if (hatSprite != null) {
            if (macroCollision(hatSprite, jet, 0.2)) {
                app.stage.removeChild(hatSprite);
                hatSprite = null;
                rocketSpeed = 0;

                //drawDialog(thing, bgSprite);
            } else {
                hatSprite.y += 2;

                let diff = hatSprite.x - jet.x;

                if (Math.abs(diff) > 10) {
                    hatSprite.x += diff > 0 ? -5 : 5;
                }

                hatSprite.rotation -= 0.037 * delta;
            }
        }
*/
        jet.tick(delta);
    });

});

function onClick(event) {
    if (jet != null) {
        jetMoves = jet.x > event.data.global.x ? -1 : 1;
        doMove();
    }
}

function onClickUp(event) {
    jetMoves = 0;
}

function doMove() {
    if (!jetMoving && jetMoves) {
        let x = jet.x + jetMoves * 80 * scale;

        if (x > 20 * scale && x < app.screen.width - 20 * scale) {
            jetMoving = true;

            gsap.to(jet, { x: x, ease: "none", duration: 0.6, onComplete: () => {
                jetMoving = false;
                doMove();
            }});

            jet.gotoAndPlay(0);
        }
    }
}

function createCloud(key) {
    if (clouds[key]) {
        cloudContaner.removeChild(clouds[key]);
    }

    let id = Math.floor(1 + Math.random() * 3);

    clouds[key] = Sprite.from('cloud' + id);
    clouds[key].scale.set(scale);
    clouds[key].y = -120 * scale;
    clouds[key].x = Math.random() * (app.screen.width - 60);

    cloudContaner.addChild(clouds[key]);

    gsap.to(clouds[key], { y: app.screen.height + 100 * scale, ease: "none", duration: 4, onComplete: () => {
        createCloud(key);
    } });
}

function runRocket() {
    setTimeout(() => {
        createRocket();
        runRocket();
    }, 1000 + Math.floor(Math.random() * (1000 - rocketSpeed * 50)));
}

function createRocket() {
    const frames = [];
            
    for (let i = 5; i >= 1; i--) {
        frames.push(
            Texture.from(`star${i}.png`)
        );
    }

    let rocket = new AnimatedSprite(frames);
    rocket.animationSpeed = 0.05;
    rocket.scale.set(scale * 0.7);
    rocket.x = 40 + Math.random() * (app.screen.width - 40);
    rocket.y = - 60 * scale;
    rocket.anchor.set(0.5);
    rocket.play();

    rocketContaner.addChild(rocket);

    gsap.to(rocket, { y: app.screen.height + 60, ease: "none", duration: 3 - rocketSpeed, onComplete: () => {
        rocketContaner.removeChild(rocket);
    } });

    if (rocketSpeed < 2) {
        rocketSpeed += 0.02;
    }
}

function createHat() {
    let hat = Sprite.from('hat');
    hat.scale.set(scale);
    hat.x = app.screen.width / 2;
    hat.y = - 100 * scale;
    hat.anchor.set(0.5);

    app.stage.addChild(hat);

    return hat;
}

function drawDialog(thing, bgSprite) {

    thing.clear();
    thing.lineStyle(15 * scale, 0x4f52ba, 1);
    thing.beginFill(0xffffff, 0.6);

    const startX = jet.x;
    const startY = jet.y - 140 * scale;

    const top = 100 * scale;
    const bottom = startY - 40 * scale;

    const left = 30 * scale;
    const right = app.screen.width - left;

    thing.moveTo(startX, startY);
    thing.lineTo(startX - 40 * scale, bottom);
    thing.lineTo(left, bottom);
    thing.lineTo(left, top);
    thing.lineTo(right, top);
    thing.lineTo(right, bottom);
    thing.lineTo(startX + 40 * scale, bottom);
    thing.lineTo(startX, startY);
    thing.closePath();

    const filter = new BlurFilter();

    bgSprite.filters = [filter];

    const richText = new Text('Rich text with a lot of options and across multiple lines', style);
    richText.x = left + 10;
    richText.y = top + 10;

    app.stage.addChild(richText);
}

function stop() {

}

function macroCollision(obj1, obj2, delta) {
    let xColl = false;
    let yColl = false;

    let obj1Left = obj1.x - obj1.width / 2;
    let obj1Right = obj1.x + obj1.width / 2;

    let obj2Left = obj2.x - (obj2.width  * delta) / 2;
    let obj2Right = obj2.x + (obj2.width  * delta) / 2;

    let obj1Top = obj1.y + obj1.height / 2;
    let obj1Bottom = obj1.y - obj1.height / 2;

    let obj2Top = obj2.y + (obj2.height * delta) / 2;
    let obj2Bottom = obj2.y - (obj2.height * delta) / 2;

    if ((obj1Left <= obj2Right) && (obj1Right >= obj2Left)) xColl = true;
    if ((obj1Top >=  obj2Bottom) && (obj1Bottom <= obj2Top)) yColl = true;

    if (xColl & yColl) {
        return true;
    }

    return false;
}