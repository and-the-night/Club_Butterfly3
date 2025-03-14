// a subclass of Tone.Player that adds a progress function to it.

class SimplePlayer extends Tone.Player {
    constructor(...args) {
      super(...args);
      this.playbackRate = 1;
    }
  
    start(...args) {
      // assuming args[0] is always time
      this.startTime = Tone.now();
      super.start(...args);
    }
  
    get duration() {
      return this._buffer.duration;
    }
  
    currentTime() {
      if(this._loop) {
        return (Tone.now() - this.startTime) % this.duration;
      } else {
        return Tone.now() - this.startTime;
      }
    }
  
    progress() {
      if (this.state == "started") {
        return this.currentTime() / (this.duration / this.playbackRate);
      } else {
        return 0;
      }
    }
  
    // disable setting playbackRate to anything other than 1
    /*
    set playbackRate(rate) {
      if(rate != 1) throw new Error("Setting the playbackRate value to any value other than 1 is disabled in SimplePlayer. If required, use Tone.Player instead.");
    }
    */
  }
  