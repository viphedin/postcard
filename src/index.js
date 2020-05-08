import { Application } from '@pixi/app';

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

import { Jet } from './objects/jet.js';
import { Background } from './objects/background.js';
import { Stars } from './objects/stars.js';
import { Game } from './objects/game.js';

let screenWidth = window.innerWidth > 600 ? 600 : window.innerWidth;

const app = new Application({
    width: screenWidth,
    height: window.innerHeight
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

game.registerRestart(() => {
    jet.restart();
    background.restart();
    stars.restart();
})

game.registerStars(stars);

app.loader.add('desyrel', './assets/resources/bitmap-font/desyrel.xml');

app.loader.load(() => {
    background.append();
    stars.append();
    jet.append();
    game.append();

    app.ticker.add((delta) => {
        game.tick(delta);
        background.tick(delta);
        stars.tick(delta);

        if (stars.checkCollision(jet.jet)) {
            jet.collision();
        }

        jet.tick(delta);
    });

});