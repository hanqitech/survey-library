import { IElement, settings } from "survey-core";

export class Camera {
  public static mediaDevicesCallback: ((callback: (devices: Array<MediaDeviceInfo>) => void) => void) | undefined;
  public static clear(): void {
    Camera.cameraList = undefined;
    Camera.cameraIndex = -1;
  }
  public static setCameraList(list: Array<MediaDeviceInfo>): void {
    const getDeviceType = function(device: MediaDeviceInfo): string {
      const lbl = device.label.toLocaleLowerCase();
      if(lbl.indexOf("user") > -1) return "user";
      if(lbl.indexOf("enviroment") > -1) return "enviroment";
      return "";
    };
    Camera.clear();
    if(Array.isArray(list) && list.length > 0) {
      Camera.cameraIndex = -1;
      list.sort((a: MediaDeviceInfo, b: MediaDeviceInfo): number => {
        if(a === b) return 0;
        if(a.label !== b.label) {
          const lblA = getDeviceType(a);
          const lblB = getDeviceType(b);
          if(lblA !== lblB) {
            if(lblA === "user") return -1;
            if(lblB === "user") return 1;
            if(lblA === "enviroment") return -1;
            if(lblB === "enviroment") return 1;
          }
        }
        const iA = list.indexOf(a);
        const iB = list.indexOf(b);
        return iA < iB ? -1 : 1;
      });
    }
    Camera.cameraList = list;
  }
  private static cameraList: Array<MediaDeviceInfo>;
  private static cameraIndex: number = -1;
  private static cameraFacingMode: string = "user";
  private static canSwitchFacingMode: boolean = false;
  public hasCamera(callback: (res: boolean) => void): void {
    if(Camera.cameraList !== undefined) {
      this.hasCameraCallback(callback);
      return;
    }
    if(Camera.mediaDevicesCallback) {
      const devicesCallback = (devices: Array<MediaDeviceInfo>): void => {
        this.setVideoInputs(devices);
        this.hasCameraCallback(callback);
      };
      Camera.mediaDevicesCallback(devicesCallback);
      return;
    }
    if(typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices =>{
          this.setVideoInputs(devices);
          this.hasCameraCallback(callback);
          this.updateCanFlipValue();
        })
        .catch(error => {
          Camera.cameraList = null;
          this.hasCameraCallback(callback);
        });
    } else {
      Camera.cameraList = null;
      this.hasCameraCallback(callback);
    }
  }
  public getMediaConstraints(videoEl?: any): MediaStreamConstraints {
    const devices = Camera.cameraList;
    if(!Array.isArray(devices) || devices.length < 1) return undefined;
    if(Camera.cameraIndex < 0) Camera.cameraIndex = 0;
    const selDevice = devices[Camera.cameraIndex];
    const videoConstraints: any = {};
    if (selDevice && selDevice.deviceId) {
      videoConstraints.deviceId = { exact: selDevice.deviceId };
    } else {
      videoConstraints.facingMode = Camera.cameraFacingMode;
    }
    if(videoEl) {
      videoConstraints.width = { exact: videoEl.width ? videoEl.width : videoEl.scrollWidth };
      videoConstraints.height = { exact: videoEl.height ? videoEl.height : videoEl.scrollHeight };
    }
    return {
      video: videoConstraints,
      audio: false
    };
  }
  public startVideo(videoElementId: string, callback: (stream: MediaStream) => void, imageWidth?: string, imageHeight?: string): void {
    const videoEl: any = settings.environment.root?.getElementById(videoElementId);
    if(!videoEl) {
      callback(undefined);
      return;
    }
    if(imageWidth) {
      videoEl.width = imageWidth;
    } else {
      videoEl.style.width = "100%";
    }
    if(imageHeight) {
      videoEl.height = imageHeight;
    } else {
      videoEl.style.height = "100%";
    }
    const mediaConstraints = this.getMediaConstraints(videoEl);
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(stream => {
      videoEl.srcObject = stream;
      if(!Camera.cameraList[Camera.cameraIndex]?.deviceId && !!stream.getTracks()[0].getCapabilities().facingMode) {
        Camera.canSwitchFacingMode = true;
        this.updateCanFlipValue();
      }
      videoEl.play();
      callback(stream);
    })
      .catch(error => {
        callback(undefined);
      });
  }
  public snap(videoElementId: string, callback: BlobCallback): boolean {
    if("undefined" === typeof document) return false;
    const root = document;
    const videoEl: any = root.getElementById(videoElementId);
    if(!videoEl) return false;
    const canvasEl = root.createElement("canvas");
    canvasEl.height = videoEl.scrollHeight;
    canvasEl.width = videoEl.scrollWidth;
    let context = canvasEl.getContext("2d");
    /*
    if(this._facingMode == 'user'){
      context.translate(canvasEl.width, 0);
      context.scale(-1, 1);
    }
    */
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);
    context.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    canvasEl.toBlob(callback, "image/png");
    return true;
  }

  private canFlipValue: boolean = undefined;

  private updateCanFlipValue() {
    const list = Camera.cameraList;
    this.canFlipValue = Array.isArray(list) && list.length > 1 || Camera.canSwitchFacingMode;
    if(this.onCanFlipChangedCallback) this.onCanFlipChangedCallback(this.canFlipValue);
  }
  private onCanFlipChangedCallback?: (res: boolean) => void;

  public canFlip(onCanFlipChangedCallback?: (res: boolean) => void): boolean {
    if(this.canFlipValue === undefined) {
      this.updateCanFlipValue();
    }
    if(onCanFlipChangedCallback) {
      this.onCanFlipChangedCallback = onCanFlipChangedCallback;
    }
    return this.canFlipValue;
  }
  public flip(): void {
    if(!this.canFlip()) return;
    if(Camera.canSwitchFacingMode) {
      Camera.cameraFacingMode = Camera.cameraFacingMode === "user" ? "environment" : "user";
    }
    else if(Camera.cameraIndex >= Camera.cameraList.length - 1) {
      Camera.cameraIndex = 0;
    } else {
      Camera.cameraIndex ++;
    }
  }
  private hasCameraCallback(callback: (res: boolean) => void): void {
    callback(Array.isArray(Camera.cameraList));
  }
  private setVideoInputs(devices: Array<MediaDeviceInfo>): void {
    const list: Array<MediaDeviceInfo> = [];
    devices.forEach(device => {
      if (device.kind === "videoinput") {
        list.push(device);
      }
    });
    Camera.setCameraList(list.length > 0 ? list : null);
  }
}