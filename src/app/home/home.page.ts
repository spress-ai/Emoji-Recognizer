import { Component } from '@angular/core';
import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { Platform, LoadingController } from '@ionic/angular';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WebcamImage } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';

import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  public photo: SafeResourceUrl;

  showCamera: boolean = true;
  public webcamImage: WebcamImage = null;
  model: any;

  private trigger: Subject<void> = new Subject<void>();

  isMobile = false;
  showCameraErrorMessage = false;
  permissionError = false;

  isRunning: boolean = false;
  isStarting: boolean = false;
  loading: any;

  videoWidth: number = 300;
  videoHeight: number = 300;
  emojis = [
    {
      emoji: "smile",
      icon: "🙂",
      selected: false
    },
      {
      emoji: "silence",
      icon: "🤫",
      selected: false
    },
    {
      emoji: "thinking",
      icon: "🤔",
      selected: false
    },
    {
      emoji: "scream",
      icon: "😱",
      selected: false
    },
    {
      emoji: "oops",
      icon: "🤭",
      selected: false
    },
    {
      emoji: "tongue",
      icon: "😛",
      selected: false
    },
    // {
    //   emoji: "sad",
    //   icon: "🙁",
    //   selected: false
    // },
    {
      emoji: "surprised",
      icon: "😮",
      selected: false
    }
  ]

  constructor(private sanitizer: DomSanitizer, 
              public platform: Platform,
              public loadingCtrl: LoadingController) {
    this.platform.ready().then(() => {
      this.videoWidth = this.platform.width();
      this.videoHeight = this.platform.height();
      this.isMobile = this.platform.is("mobile");
    })
  }

  async ngOnInit(){
    this.model = await this.loadModel();
  }

  async loadModel(){
    const mobilenet = await tf.loadLayersModel('../../assets/tfjs_model/model.json');
    return mobilenet;
  }

  async predict(imageTensor) {
    tf.tidy(() => {
      imageTensor = imageTensor.reshape([1, 256, 256, 3]);
      const predictions = this.model.predict(imageTensor);
      const arr = Array.from(predictions.dataSync());
      const argMax = this.argMax(arr)
  
      let emojis = ["oops", "scream", "silence", "smile", "surprised", "thinking", "tongue"];
      if(this.isStarting) {
        this.loading.dismiss();
        this.isStarting = false;
      }
  
      // Update emojis state
      for(let i = 0; i < this.emojis.length; i++){
        if(this.emojis[i].emoji == emojis[argMax])
          this.emojis[i].selected = true;
        else
          this.emojis[i].selected = false;
      }
  
      if(this.isRunning)
        this.triggerSnapshot();
    });
  }

  async takePicture() {
    const image = await Plugins.Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image && (image.dataUrl));
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    setTimeout(() => {
      let imgElement: any = document.getElementById("imageScreenshot") 
      let imageTensor = tf.browser.fromPixels(imgElement)
      this.predict(imageTensor);
    }, 50)
  }

  toggleCamera(){
    this.isRunning = false;
    this.showCamera = !this.showCamera;
  }

  async toggle(){
    if(this.isRunning){
      this.isRunning = false;
    } else {
      this.showCamera = true;
      this.loading = await this.loadingCtrl.create({
        "message": "Initializing..."
      });
      this.loading.present();

      this.isRunning = true;
      this.isStarting = true;
      this.triggerSnapshot();
    }
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  cameraInitError(ev){
    this.showCameraErrorMessage = true;
    //console.log("camera error", ev)
    if(ev.mediaStreamError.name == "NotAllowedError"){
      //console.log("Camera not found");
      this.permissionError = true;
    }
  }

  argMax(array) {
    return [].map.call(array, (x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
  }

  getBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }
}
