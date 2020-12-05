import { BitmapText, Container, Sprite, TilingSprite } from 'pixi.js';
import {
  textures,
  backgrounds,
  sliders,
  multiLoad,
  MultiLoad,
  ProgressHandler,
  store,
} from '../../util';
import Scene from '../scene';

let resolvedBytes = 0,
  resolvedBytesTotal = 0;
let bytes = 0,
  bytesTotal = 1;
let resolved = false;
let ts: number;
let timesRun = 0;
let loadProm: Promise<unknown>;

const loadingMessages = [
  'Loading resources',
  'Listen to the music to help time your jumps',
  'Back for more are ya?',
  'Use practice mode to learn the layout of a level',
  "If at first you don't succeed, try, try again...",
  "Customize your character's icon and color!",
  'You can download all songs from the level select page!',
  "Spikes are not your friends, don't forget to jump",
  'Build your own levels using the level editor',
  'Go online to play other players levels!',
  'Can you beat them all?',
  'Here be dragons...',
  "Pro tip: Don't crash",
  'Hold down to keep jumping',
  'The spikes whisper to me...',
  'Looking for pixels',
  'Loading awesome soundtracks...',
  'What if the spikes are the good guys?',
  'Pro tip: Jump',
  'Does anyone even read this?',
  'Collecting scrap metal',
  'Waiting for planets to align',
  'Starting the flux capacitor',
  'Wandering around aimlessly',
  'Where did I put that coin...',
  'Loading the progressbar',
  'Calculating chance of success',
  'Hiding secrets',
  'Drawing pretty pictures',
  'Programmer is sleeping, please wait',
  'RobTop is Love, RobTop is Life',
  'Play, Crash, Rage, Quit, Repeat',
  'Only one button required to crash',
  'Such wow, very amaze.',
  'Fus Ro DASH!',
  'Loading Rage Cannon',
  'Counting to 1337',
  "It's all in the timing",
  'Fake spikes are fake',
  'Spikes... OF DOOM!',
  "Why don't you go outside?",
  'Loading will be finished... soon',
  'This seems like a good place to hide a secret...',
  "The Vault Keeper's name is 'Spooky'...",
  "Hope the big guy doesn't wake up...",
  "Shhhh! You're gonna wake the big one!",
  'I have been expecting you.',
  'A wild RubRub appeared!',
  'So many secrets...',
  'Hiding rocket launcher',
  "It's Over 9000!",
  'Programming amazing AI',
  'Hiding secret vault',
  "Spooky doesn't get out much",
  'RubRub was here',
  'Warp Speed',
  "So, what's up?",
  'Hold on, reading the manual',
  "I don't know how this works...",
  'Why u have to be mad?',
  'It is only game...',
  'Unlock new icons and colors by completing achievements!',
];

const preloads: MultiLoad[] = [
  {
    sheets: [1, 2, 'glow'],
    sliders: [1],
    bgs: [2, 3, 4],
    groundTiles: [2, 3, 4],
  },
  {
    sheets: ['gauntlet', 'fire'],
    bgs: [5, 6, 7],
    groundTiles: [5, 6, 7],
    fonts: [1, 2, 3],
  },
  {
    sheets: ['explosion1', 'explosion2', 'explosion3', 'explosion4'],
    bgs: [8, 9, 10],
    groundTiles: [8, 9, 10],
    fonts: [4, 5, 6, 7, 8, 9, 10, 11],
  },
  {
    sheets: [
      'explosion5',
      'explosion6',
      'explosion7',
      'explosion8',
      'explosion9',
      'explosion10',
    ],
    bgs: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    groundTiles: [11, 12, 13, 14, 15, 16, 17],
  },
  {
    sheets: [
      'explosion11',
      'explosion12',
      'explosion13',
      'explosion14',
      'explosion15',
      'explosion16',
    ],
  },
];

const onProgress: ProgressHandler = (b, bt) => {
  bytes = b;
  bytesTotal = bt;
};

export default new Scene({
  init: async () => {
    await multiLoad({
      sheets: ['launch'],
      bgs: [1],
      fonts: ['gold'],
      sliders: [0],
    });
    const bg = new TilingSprite(
      backgrounds[1]
    );
    const logo = new Sprite(textures.logoGD);
    const robLogo = new Sprite(textures.logoRobTop);
    const slider = new Container();
    slider.addChild(new TilingSprite(sliders[0][1]), new Sprite(sliders[0][0]));
    let text = 'Welcome to Geometry Dash Web!';
    if (store.loadMessage != null)
      text =
        loadingMessages[
          (store.loadMessage = (store.loadMessage + 1) % loadingMessages.length)
        ];
    else store.loadMessage = 0;
    const splash = new BitmapText(text, { fontName: 'gold', fontSize: 8 });
    splash.anchor = 0.5;
    bg.tint = 0x006fff;
    logo.anchor.set(0.5);
    robLogo.anchor.set(0.5);
    loadProm = multiLoad(
      {
        sheets: [2, 3, 4],
        groundTiles: [1],
        fonts: ['base', 'chat'],
      },
      onProgress
    ).then(() => {
      resolved = true;
    });
    ts = Date.now();
    return {
      bg,
      logo,
      robLogo,
      slider,
      splash,
    };
  },
  render({ bg, logo, robLogo, slider, splash }) {
    bg.scale.set(window.innerHeight / 1100);
    logo.scale.set(
      Math.min(window.innerWidth / 2200, window.innerHeight / 1100)
    );
    robLogo.scale.set(
      Math.min(window.innerWidth / 2400, window.innerHeight / 1200)
    );
    bg.x = -40 * bg.scale.x;
    bg.y = -460 * bg.scale.y;
    bg.width = window.innerWidth / bg.scale.x + 40;
    bg.height = window.innerHeight / bg.scale.y + 460;
    logo.x = window.innerWidth / 2;
    logo.y = Math.min(
      window.innerHeight / 3 + window.innerWidth / 10,
      window.innerHeight / 2
    );
    robLogo.x = window.innerWidth / 2;
    robLogo.y = window.innerHeight / 4;
    const sliderFill = slider.children[0] as TilingSprite;
    sliderFill.texture.baseTexture.setResolution(1000 / window.innerWidth);
    sliderFill.x = Math.min(
      window.innerWidth * 0.01,
      window.innerHeight * 0.02
    );
    sliderFill.anchor.set(0, -0.5);
    const sliderGroove = slider.children[1] as Sprite;
    sliderGroove.width = Math.min(
      window.innerWidth * 0.7,
      window.innerHeight * 1.4
    );
    sliderGroove.height = sliderGroove.width / 13.125;
    slider.pivot.set(sliderGroove.width / 2, sliderGroove.height / 2);
    sliderFill.width =
      ((sliderGroove.width - 20) * (resolvedBytes + bytes * 0.9)) /
      (resolvedBytesTotal + bytesTotal);
    sliderFill.height = sliderGroove.height / 1.88;
    slider.x = window.innerWidth / 2;
    slider.y = window.innerHeight / 1.2;
    splash.x = window.innerWidth / 2;
    splash.y = window.innerHeight / 1.2 + sliderGroove.height;
    splash.fontSize = Math.min(
      window.innerWidth / 160,
      window.innerHeight / 80
    );
    if (resolved) {
      resolved = false;
      if (Date.now() - ts < 5000 && preloads[timesRun]) {
        loadProm = loadProm.then(async () => {
          resolvedBytes += bytes;
          resolvedBytesTotal += bytesTotal;
          await multiLoad(preloads[timesRun], onProgress);
          ++timesRun;
          resolved = true;
        });
      } else if (Date.now() - ts > 1000) {
        return 'home';
      }
    }
  },
});
