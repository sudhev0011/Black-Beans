export class Mutex {
    constructor() {
      this._promise = Promise.resolve();
    }
  
    acquire() {
      let release;
      const nextPromise = new Promise((resolve) => {
        release = () => resolve();
      });
      const currentPromise = this._promise;
      this._promise = nextPromise;
      return async () => {
        await currentPromise;
        return release;
      };
    }
  
    async waitForUnlock() {
      await this._promise;
    }
  
    isLocked() {
      return this._promise !== Promise.resolve();
    }
  }
  
  export const mutex = new Mutex();