import { Song as GDSong } from 'gd.js';
import { raw, loadRaw } from '../util';


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
  static async create(src: DefaultTrack | GDSong, play = true) {
    let url: string
    if (typeof src != 'string') url = src.isCustom ? src.url : `/tracks/${src.id}.mp3`;
    else url = `/tracks/${src == 'practice' ? 0 : src}.mp3`;
    if (!raw[url]) await loadRaw([url]);
    const ctx = play ? new AudioContext() : new BaseAudioContext();
    const ab = await new Promise<AudioBuffer>((res, rej) => ctx.decodeAudioData(raw[url], res, rej));
    return new Song(ctx, ab);
  }
  play(time?: number) {
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
    // return sum * 3 / this.freqBuffer.length;
    return Math.sqrt(sumRMS / this.timeBuffer.length) * 10;
  }
}