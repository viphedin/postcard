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

import { Texture } from '@pixi/core';
import { Container } from '@pixi/display';

import { OutlineFilter } from '@pixi/filter-outline';

import gsap from 'gsap';

let screenWidth = window.innerWidth > 1000 ? 1000 : window.innerWidth;
let realWidth = screenWidth * window.devicePixelRatio;

const app = new Application({
    width: screenWidth,
    height: window.innerHeight,
    //resolution: window.devicePixelRatio
});

document.body.appendChild(app.view)

app.loader.add('bg', './assets/resources/earth.jpg');
app.loader.add('cloud1', './assets/resources/cloud.png');
app.loader.add('cloud2', './assets/resources/cloud2.png');
app.loader.add('cloud3', './assets/resources/cloud3.png');
app.loader.add('rocket1', './assets/resources/rocket1.png');
app.loader.add('rocket2', './assets/resources/rocket2.png');

app.loader.add('fighter', './assets/resources/fighter.json');
app.loader.add('mc', './assets/resources/mc.json');

const buttonRight = "url('./assets/resources/arrow-right.png'),auto";
const buttonLeft = "url('./assets/resources/arrow-left.png'),auto";

let clouds = [];
let cloudFilters = [];
let cloudContaner = new Container();
let jet = null;
let jetMoves = [];
let jetMoving = false;
let mouseCursor = 1;
let rocketContaner = new Container();
let rocketSpeed = 0;

let scale = window.innerWidth > 600 ? 0.8 : (window.innerWidth > 440 ? 0.6 : 0.4);

app.renderer.plugins.interaction.cursorStyles.default = function () {
    app.renderer.plugins.interaction.interactionDOMElement.style.cursor = mouseCursor == 1 ? buttonRight : buttonLeft;
}

app.loader.load(() => {

    app.stage.interactive = true;
    app.stage.on('pointerdown', onClick);
    app.stage.on('pointerup', onClickUp);

    app.stage.on('mousemove', function(event) {
        const next = jet.x > event.data.global.x ? -1 : 1;
        if (next != mouseCursor) {
            mouseCursor = next;
            app.renderer.plugins.interaction.setCursorMode('pointer');
            app.renderer.plugins.interaction.setCursorMode('default');
            app.renderer.plugins.interaction.update();
        }
    });

    const bgSprite = TilingSprite.from('bg', app.screen.width, app.screen.height);

    bgSprite.anchor.set(0);

    app.stage.addChild(bgSprite);

    bgSprite.tilePosition.x = 0;
    bgSprite.tilePosition.y = 0;

    cloudContaner.x = 0;
    cloudContaner.y = 0;
    app.stage.addChild(cloudContaner);

    rocketContaner.x = 0;
    rocketContaner.y = 0;
    app.stage.addChild(rocketContaner);

    clouds.push(null);
    cloudFilters.push(null);
    createCloud(clouds.length - 1);
    let cloudCount = 1;

    let interval = setInterval(() => {
        clouds.push(null);
        cloudFilters.push(null);
        createCloud(clouds.length - 1);
        cloudCount++;

        if (cloudCount == 10) {
            clearInterval(interval);
        }
    }, 400);

    const frames = [];

    for (let i = 0; i < 30; i++) {
        const val = i < 10 ? `0${i}` : i;

        frames.push(Texture.from(`rollSequence00${val}.png`));
    }
    
    jet = new AnimatedSprite(frames);

    jet.scale.set(scale);
    jet.x = app.screen.width / 2;
    jet.y = app.screen.height - (300 * scale);
    jet.anchor.set(0.5);
    jet.animationSpeed = 0.8;
    jet.loop = false;

    app.stage.addChild(jet);

    const mcFrames = [];

    for (let i = 1; i <= 27; i++) {
        mcFrames.push(Texture.from(`Explosion_Sequence_A ${i}.png`));
    }
    
    let mc = new AnimatedSprite(mcFrames);

    mc.scale.set(scale);
    mc.x = 0;
    mc.y = 0;
    mc.anchor.set(0.5);
    mc.animationSpeed = 1;
    mc.loop = false;
    mc.onLoop = () => { app.stage.removeChild(mc); }

    const outlineFilter = new OutlineFilter(5 * scale, 0xff6666);

    runRocket();

    let wait = 10;

    app.ticker.add(() => {
        let collision = false;

        rocketContaner.children.forEach((value, key) => {
            if (macroCollision(value, jet)) {
                collision = true;
                mc.x = value.x;
                mc.y = value.y - value.width / 2;
                rocketContaner.removeChild(value);
            }
        });

        if (collision) {
            jet.filters = [outlineFilter];
            app.stage.addChild(mc);
            mc.gotoAndPlay(0);
            wait = 20;
        } else {
            wait--;

            if (wait == 0) {
                jet.filters = null;
            }
        }

        mc.y += 10;
        bgSprite.tilePosition.y += 0.3;
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
        let x = jet.x + jetMoves * 80;

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
    let rocket = new AnimatedSprite([
        Texture.from('rocket1'),
        Texture.from('rocket2')
    ]);

    rocket.scale.set(scale);
    rocket.x = 20 + Math.random() * (app.screen.width - 60);
    rocket.y = - 60 * scale;
    rocket.anchor.set(0.5);
    rocket.animationSpeed = 0.3;
    rocket.play();

    rocketContaner.addChild(rocket);

    gsap.to(rocket, { y: app.screen.height + 60, ease: "none", duration: 3 - rocketSpeed, onComplete: () => {
        rocketContaner.removeChild(rocket);
    } });

    if (rocketSpeed < 2) {
        rocketSpeed += 0.02;
    }
}

function macroCollision(obj1, obj2) {
    let xColl = false;
    let yColl = false;

    let obj1Left = obj1.x - obj1.width / 2;
    let obj1Right = obj1.x + obj1.width / 2;

    let obj2Left = obj2.x - (obj2.width  * 0.8) / 2;
    let obj2Right = obj2.x + (obj2.width  * 0.8) / 2;

    let obj1Top = obj1.y + obj1.height / 2;
    let obj1Bottom = obj1.y - obj1.height / 2;

    let obj2Top = obj2.y + (obj2.height * 0.8) / 2;
    let obj2Bottom = obj2.y - (obj2.height * 0.8) / 2;

    if ((obj1Left <= obj2Right) && (obj1Right >= obj2Left)) xColl = true;
    if ((obj1Top >=  obj2Bottom) && (obj1Bottom <= obj2Top)) yColl = true;

    if (xColl & yColl) {
        return true;
    }

    return false;
}