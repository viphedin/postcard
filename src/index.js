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

import gsap from 'gsap';

let screenWidth = window.innerWidth > 1000 ? 1000 : window.innerWidth;
let realWidth = screenWidth * window.devicePixelRatio;

const app = new Application({
    width: screenWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio
});

document.body.appendChild(app.view)

app.loader.add('bg', './assets/resources/earth.jpg');
app.loader.add('cloud', './assets/resources/cloud.png');

app.loader.add('fighter', './assets/resources/fighter.json');

const buttonRight = "url('./assets/resources/arrow-right.png'),auto";
const buttonLeft = "url('./assets/resources/arrow-left.png'),auto";

let clouds = [];
let cloudContaner = new Container();
let jet = null;
let jetMoves = [];
let jetMoving = false;
let mouseCursor = 1;

app.renderer.plugins.interaction.cursorStyles.default = function () {
    app.renderer.plugins.interaction.interactionDOMElement.style.cursor = mouseCursor == 1 ? buttonRight : buttonLeft;
}

app.renderer.plugins.interaction.cursorStyles.left = buttonLeft;

app.loader.load(() => {

    const bgSprite = TilingSprite.from('bg', app.screen.width, app.screen.height);

    bgSprite.anchor.set(0);

    app.stage.interactive = true;
    app.stage.on('mousedown', onClick);
    app.stage.on('mouseup', onClickUp);

    app.stage.on('mousemove', function(event) {
        const next = jet.x > event.data.global.x ? -1 : 1;
        if (next != mouseCursor) {
            mouseCursor = next;
            app.renderer.plugins.interaction.setCursorMode('pointer');
            app.renderer.plugins.interaction.setCursorMode('default');
            app.renderer.plugins.interaction.update();
        }
    });

    app.stage.addChild(bgSprite);

    bgSprite.tilePosition.x = 0;
    bgSprite.tilePosition.y = 0;

    cloudContaner.x = 0;
    cloudContaner.y = 0;
    app.stage.addChild(cloudContaner);

    clouds.push(null);
    createCloud(clouds.length - 1);
    let cloudCount = 1;

    let interval = setInterval(() => {
        clouds.push(null);
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

    jet.x = app.screen.width / 2;
    jet.y = app.screen.height - 200;
    jet.anchor.set(0.5);
    jet.animationSpeed = 0.5;
    jet.zOrder = 1000;
    jet.loop = false;
    //jet.onLoop = function() { console.log('Loop'); };

    app.stage.addChild(jet);

    app.ticker.add(() => {
        bgSprite.tilePosition.y += 0.3;
    });

});

function getNexMove() {

}

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

        if (x > 20 && x < app.screen.width - 20) {
            jetMoving = true;

            gsap.to(jet, { x: x, ease: "none", duration: 1, onComplete: () => {
                jetMoving = false;
                doMove();
            }});
            jet.gotoAndPlay(0);
        }
    }
}


function createCloud(key) {
    if (clouds[key]) {
        app.stage.removeChild(clouds[key]);
    }

    clouds[key] = Sprite.from('cloud');
    clouds[key].y = -60;
    clouds[key].x = Math.random() * (app.screen.width - 60);
    cloudContaner.addChild(clouds[key]);

    gsap.to(clouds[key], { y: app.screen.height + 60, ease: "none", duration: 4, onComplete: () => {
        createCloud(key);
    } });
}
