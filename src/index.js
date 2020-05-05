import { Application } from '@pixi/app';
import { TilingSprite } from '@pixi/sprite-tiling';

import { Renderer } from '@pixi/core';

import { BatchRenderer } from '@pixi/core';
Renderer.registerPlugin('batch', BatchRenderer);

import { TilingSpriteRenderer } from '@pixi/sprite-tiling';
Renderer.registerPlugin('tilingSprite', TilingSpriteRenderer);

import { TickerPlugin } from '@pixi/ticker';
Application.registerPlugin(TickerPlugin);

import { AppLoaderPlugin } from '@pixi/loaders';
Application.registerPlugin(AppLoaderPlugin);

const app = new Application({
    width: window.innerWidth > 442 ? 442 : window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio
});

document.body.appendChild(app.view)

app.loader.add('bg', './assets/resources/earth.jpg');

app.loader.load(() => {
    const bgSprite = TilingSprite.from('bg', app.screen.width, app.screen.height);

    console.log(app.screen.width);

    bgSprite.anchor.set(0);

    app.stage.addChild(bgSprite);

    bgSprite.tilePosition.x = 0;
    bgSprite.tilePosition.y = 0;

    app.ticker.add(() => {    
        bgSprite.tilePosition.y += 0.5;
    });
});