import { Song as GDSong } from 'gd.js';
import { raw, loadRaw } from '../util';

const hasAudioContext = typeof AudioContext != 'undefined';

export type DefaultTrack = 
  | 'secretlevel'
  | 'secretshop'
  | 'secret1'
  | 'secret2'
  | 'secret3'
  | 'shop1'
  | 'shop2'
  | 'practice'
  | 'menu'

export default class Song {
  private startTime: number;
  private endTime: number;
  private src?: AudioScheduledSourceNode;
  private processor: AnalyserNode;
  private freqBuffer: Uint8Array;
  private timeBuffer: Uint8Array;
  constructor(private ctx: BaseAudioContext, private srcBuffer: AudioBuffer) {
    this.startTime = 0;
    this.endTime = 0;
    this.processor = ctx.createAnalyser();
    this.timeBuffer = new Uint8Array(this.processor.fftSize = 2048);
    this.freqBuffer = new Uint8Array(this.processor.frequencyBinCount);
  }
  static async create(src: DefaultTrack | GDSong): Promise<Song> {
    let url: string
    if (typeof src != 'string') url = src.isCustom ? src.url : `/tracks/${src.id}.mp3`;
    else url = `/tracks/${src == 'practice' ? 0 : src}.mp3`;
    if (!hasAudioContext) {
      const aud = new Audio(url);
      await new Promise((resolve, reject) => {
        aud.addEventListener('canplaythrough', resolve);
        aud.addEventListener('error', reject);
      });
      return {
        currentAmplitude: 0,
        get playing() {
          return !aud.paused;
        },
        play(time?: number) {
          if (time) aud.currentTime = time;
          aud.play();
        },
        pause() {
          if (aud.paused) throw new Error('not started');
          aud.pause();
        },
        stop() {
          if (aud.paused) throw new Error('not started');
          aud.pause();
          aud.currentTime = 0;
        }
      } as Song;
    }
    if (!raw[url]) await loadRaw([url]);
    const ctx = new AudioContext();
    const ab = await new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(raw[url], res, rej));
    return new Song(ctx, ab);
  }
  get playing() {
    return !!this.src;
  }
  play(time?: number) {
    if (this.src) throw new Error('already started');
    const bs = this.ctx.createBufferSource();
    bs.buffer = this.srcBuffer;
    bs.connect(this.processor);
    bs.connect(this.ctx.destination);
    if (time) this.endTime = time * 1000;
    bs.start(0, this.endTime / 1000);
    this.src = bs;
    this.startTime = performance.now();
  }
  stop() {
    if (!this.src) throw new Error('not started');
    this.src.stop(0);
    this.endTime = 0;
  }
  pause() {
    this.stop();
    this.endTime = performance.now() - this.startTime;
  }

  get currentAmplitude(): number {
    this.processor.getByteFrequencyData(this.freqBuffer);
    this.processor.getByteTimeDomainData(this.timeBuffer);
    let sum = 0;
    for (let i = 0; i < this.freqBuffer.length; ++i) sum += this.freqBuffer[i];
    let sumRMS = 0;
    for (let i = 0; i < this.timeBuffer.length; ++i) {
      const val = this.timeBuffer[i] - 127;
      sumRMS += val * val;
    }
    return sum * 3 / this.freqBuffer.length + Math.sqrt(sumRMS / this.timeBuffer.length) * 10;
  }
}