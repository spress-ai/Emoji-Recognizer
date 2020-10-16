export class PlatformMock {
    constructor() { }

    public is(platform): any {
      return platform;
    }

    public ready(){
        return new Promise((resolve, reject) => {
            resolve();
        })
    }

}