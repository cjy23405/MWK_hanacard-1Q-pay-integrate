/**
 * @Version 1.0.0
 * @copyright Posicube all right reserved
 * @file WebRTC 카메라를 적용하기위한 WebCamera class 파일
 */

const ScanMode = {
  /** auto scan mode */
  AUTO: 0,
  /** manual server recog mode */
  MANUAL: 1,
};

/**
 * Camera 방향을 정하기위한 enum
 * @readonly
 * @enum {int}
 */
const CameraType = {
  /** 단말의 후면 카메라 선택 */
  FACING_BACK: 0,
  /** 단말의 셀피 카메라 선택 */
  FACING_FRONT: 1,
  /** PC와 같이 전/후 선택이 불가능한 장비에서 사용 */
  FACING_UNKOWN: -1,
};

/**
 * Scanner 타입을 선택하기 위한 enum
 * @readonly
 * @enum {int}
 */
const ScannerType = {
  /** 주민등록증 및 운전면허증용 스캐너 */
  IDCARD_SCANNER: 0,
};

/**
 * Scanner 상태를 정의하기 위한 enum
 * @readonly
 * @enum {int}
 */
const ScannerStatus = {
  /** 스캐너 로딩 실패 */
  SCANNER_READY_FAIL: -5,
  /** 스캐너 초기화 실패 */
  SCANNER_INIT_FAIL: -4,
  /** 카매라 오픈 실패 */
  CAMERA_OPENING_FAIL: -3,
  /** 시스템으로 부터 device 정보를 얻어오기 실패 */
  GET_DEVICE_FAIL: -2,
  /** 알수 없는 상태 */
  UNKOWN: -1,
  /** 시스템에서 device 정보를 얻오기 진행 */
  GET_DEVICE: 0,
  /** 카메라 오픈 진행 */
  CAMERA_OPENING: 1,
  /** 카메라 오픈 완료 */
  CAMERA_OPENNED: 2,
  /** 스캐너 초기화 진행 */
  SCANNER_INIT: 3,
  /** 스캐너 로딩 완료 */
  SCANNER_READY: 4,
  /** Card box를 찾음 */
  SCAN_DETECT: 5,
  /** 스캔이 완료됨 */
  SCAN_COMPLETE: 6,
  /** 카메라 및 스캐너 종료 진행 */
  STOP_CAMERA: 7,
  /** Detect card 시간 초과로 인식을 서버로 전송 */
  SCAN_TO_SERVER: 8,
};

/**
 * 카메라를 열기위해 사용되는 변수 FHD -> HD -> VGA 순으로 카메라를 오픈할 때 사용
 * @readonly
 */
const recommanded_resolution_low = [
  // { width: 3840, height: 2160 }, // 4K
  // { width: 1920, height: 1080 }, // FHD
  { width: 1080, height: 720 }, // FHD
  { width: 1280, height: 720 }, // HD
  { width: 640, height: 480 }, // VGA
];

const recommanded_resolution_high = [
  // { width: 3840, height: 2160 }, // 4K
  // { width: 1920, height: 1080 }, // FHD
  { width: 1920, height: 1080 }, // FHD
  { width: 1280, height: 720 }, // HD
  { width: 640, height: 480 }, // VGA
];

// WebRTC 카메라를 오픈하고 플래이하는 클래스
// 내부에서 scanner를 호출 및 인식 수행, doRecog의 scanInterval 참조

/**
 * WebRTC 카메라를 오픈하고 플래이하는 클래스<br>
 * 내부에서 scanner를 호출 및 인식 수행<br>
 * doRecog의 scanInterval 참조
 */
class WebCamera {
  /**
   * 생성자
   * @param {RobiLogger} logger - 개발 및 에러 정보 출력을 위한 로깅 클래스
   * @param {long} detectiontimelimit - 카드 검출의 시간이 오래 걸릴 경우 인식 파트를 서버에서 수행하기위해 "detect card"에 시간 제한을 설정하는 파라미터<br> 0 으로 설정하면 사용하지 않음
   */
  constructor(logger, detectiontimelimit) {
    this.camera_type = CameraType.FACING_FRONT;
    this.resolution_selector = 0;
    this.video = null;
    this.selectedCamera = null;

    this.scanner = null;
    this.scanResult = null;

    this.scanInterval = null;

    this.status = ScannerStatus.UNKOWN;
    this.scanDuration = 100;

    this.result_callback = null;
    this.detect_callback = null;

    this.logger = logger;

    this.processing = false;

    this.scanner_type = 0;

    this.detectionTimeLimit = detectiontimelimit;
    this.checkDetectionTimeLimit = false;

    this.jpegEncodedPreview = null;

    this.intervalStatus = 0;

    this.cid = 0;
    this.videoDevices = [];

    this.licenseKey = "";

    this.recommanded_resolution = [];

    this.scanMode = 0;
  }

  /**
   * 스캔 결과 및 에러 또는 현재 스캐너의 상태를 돌려받는 callback
   * @callback scanResultCallback
   * @param {ScannerStatus} statusCode - 스캐너의 상태 enum값
   * @param {ScanInfo} scanInfo - 스캔 결과 정보 오브젝트, 일부 상태에서는 null값이 들어옮
   */

  /**
   * Card box가 검출되었는지 유무를 돌려받을 callback
   * @callback detectCardCallback
   * @param {boolean} detect  -
   *      1 : card detected<br>
   *      0 : not found card
   */

  /**
   * 스캔을 시작하는 함수<br>
   * 해당함수를 call하면 자동으로 카메라를 셋팅하고 스캐너를 초기화 진행 하며<br>
   * 스캔을 자동으로 시작하는 함수<br>
   * 해당함수 call 후에 결과 처리를 위해 scanResultCallback과 detectCardCallback에서 결과를 처리
   * @param {CameraType} cameraType 카메라 방향을 적용하는 파라미터
   * @param {obj} video html의 video tag의 객체 입력
   * @param {ScannerType} scanner_type  스캐너의 종류를 적용하는 파라미터
   * @param {scanResultCallback} result_callback 스캔 결과 및 에러나 현재 스캐너의 상태를 돌려받을 callback
   * @param {detectCardCallback} detect_callback Card box가 검출되었는지 유무를 돌려받을 callback
   * @param {string} licensekey Robiscanner licensekey string을 입력하는 파라미터
   */
  open(cameraType, video, scanner_type, result_callback, detect_callback, licensekey) {
    this.camera_type = cameraType;
    this.video = video;

    this.scanner_type = scanner_type;

    this.result_callback = result_callback;
    this.detect_callback = detect_callback;

    this.licenseKey = licensekey;


    let facingMode = "environment";
    this.logger.info("camera_type = " + this.camera_type);
    if (this.camera_type == CameraType.FACING_FRONT) {
      facingMode = "user";
    }

    var videoSettings = {
      video: {
          optional: [
              {
                  facingMode: facingMode
              },
              {
                  focusMode: 'continuous'
              },
              {
                  width: { min: 0 }
              },
              {
                  height: { min: 0 }
              }
          ]
      }
    }

    navigator.mediaDevices
      .enumerateDevices(videoSettings)
      .then(this.getDevices.bind(this))
      .catch(this.handleError_getDevice.bind(this));
  }

  /**
   * 브라우저로 부터 카메라 및 오디오 정보를 취득한 후 불리는 callback 함수
   * device 중 카메라를 획득하여 openCamera를 진행
   * @param {list} deviceInfos - navigator.mediaDevices.enumerateDevices()로 부터 입력되는 정보
   */
  getDevices(deviceInfos) {
    this.status = ScannerStatus.GET_DEVICE;

    if (deviceInfos.length <= 0) {
      this.logger.error("Camera Device not found error");
      this.status = ScannerStatus.CAMERA_OPENING_FAIL;
      this.result_callback(this.status, null);
    }

    this.videoDevices = [];
    var videoDeviceIndex = 0;

    var i;
    for(i=0 ; i<deviceInfos.length ; i++ ) {
      var device = deviceInfos[i];
      console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
      if (device.kind == "videoinput") {
        this.videoDevices.push(device.deviceId);
        videoDeviceIndex++
      }
    }
    if( videoDeviceIndex > 0 ) {
      this.cid = videoDeviceIndex -= 1;
    }
    else {
      this.cid = 0;
    }
    this.logger.info("selected camera : " + this.cid);
    this.openCamera();
  }

  /**
   * navigator.mediaDevices.enumerateDevices() 실패시 호출되는 error callback
   * @param {*} error - navigator.mediaDevices.enumerateDevices() 실패 메세지
   */
  handleError_getDevice(error) {
    this.logger.error("getDevices error: " + error.message + error.name);
    this.status = ScannerStatus.CAMERA_OPENING_FAIL;
    this.result_callback(this.status, null);
  }

  /**
   * OS version을 확인하여 카메라를 해상도를 결정하는 함수,
   * iOS < 15 또는 Android < 9 인경우 FHD 대신 1080x720 해상도를 사용함
   */
  getBrowserValidataion() {
    var ua = navigator.userAgent;
    var version = 20;
    var os_name = "Unkown_os";
    // apple과 android 만 확인하여 일정 버전 이하인 경우 low 해상도 profile을 사용
    if( /(iphone|ipad)+/i.test(ua) ) { // os : appleMobile
      os_name = "iOS";
      var apple_version = ua.match(/version\/(\d+)/i);
      if( apple_version != null ) {
          version = apple_version[1];
      }
      else {
        var M1= ua.match(/(iphone os|iphoneos|cpu os|cpuso|(?=\s))\/?\s*(\d+)/i) || [];
        // apple device 는 cpu정보로 확인한다.
        if( M1 != null ) {
          version = M1[2];
        }
      }
      
      if( version < 15 ) {
        this.logger.debug("iOS : set resolution_low");
        this.recommanded_resolution = recommanded_resolution_low;
      }
      else {
        this.logger.debug("iOS : set resolution_high");
        this.recommanded_resolution = recommanded_resolution_high;
      }
    }
    else if( /android+/i.test(ua) ) { // os : android
      os_name = "Android"
      var M1 = ua.match(/android(?=\s)\/?\s*(\d+)/i);
      if( M1 != null ) {
        version = M1[1];
      }

      if( version < 9 ) {
        this.logger.debug("Android : set resolution_low");
        this.recommanded_resolution = recommanded_resolution_low;
      }
      else {
        this.logger.debug("Android : set resolution_high");
        this.recommanded_resolution = recommanded_resolution_high;
      }
    }
    else {
      this.logger.debug("unkown OS : set resolution_high");
      this.recommanded_resolution = recommanded_resolution_high;
    }
    this.logger.info("OS Version : " + os_name + " " + version);
  }


  /**
   * 카메라를 오픈하는 함수<br>
   * recommanded_resolution을 하나씩 constraints로 적용하여 성공시 까지 open을 진행
   */
  openCamera() {
    this.getBrowserValidataion();

    let facingMode = "environment";
    this.logger.info("camera_type = " + this.camera_type);
    if (this.camera_type == CameraType.FACING_FRONT) {
      facingMode = "user";
    }
    
    let constraints = {};
    if (this.camera_type == CameraType.FACING_UNKOWN) {
      constraints = {
        audio: false,
        video: {
          width: {
            exact: this.recommanded_resolution[this.resolution_selector].width,
          },
          height: {
            exact: this.recommanded_resolution[this.resolution_selector].height,
          },
          deviceId: this.videoDevices[this.cid],
          focusMode: 'continuous',
          frameRate: {
            min: '15', max: '30'
          },
        },
      };
    } else {
      constraints = {
        audio: false,
        video: {
          facingMode: { exact: facingMode },
          width: {
            exact: this.recommanded_resolution[this.resolution_selector].width,
          },
          height: {
            exact: this.recommanded_resolution[this.resolution_selector].height,
          },
          deviceId: this.videoDevices[this.cid],
          focusMode: 'continuous',
          frameRate: {
            min: '15', max: '30'
          },
        },
      };
    }

    this.status = ScannerStatus.CAMERA_OPENING;

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(this.handleSuccess.bind(this))
      .catch(this.cameraOpenError.bind(this));
  }

  /**
   * navigator.mediaDevices.getUserMedia(constraints) 실패시 호출되는 error callback<br>
   * recommanded_resolution이 남아있는 경우, 다음 resolution으로 재진행<br>
   * 모든 해상도 실패시 scanResultCallback을 ScannerStatus.CAMERA_OPENING_FAI로 호출
   * @param {*} error - navigator.mediaDevices.getUserMedia(constraints) 실패 정보
   */
  cameraOpenError(error) {
    this.logger.error("cameraOpenError : " + error);
    this.logger.error(
      "camera open fail with " +
      this.recommanded_resolution[this.resolution_selector].width +
      " x " +
      this.recommanded_resolution[this.resolution_selector].height +
      ", try other resolution"
    );

    this.resolution_selector++;
    if (this.resolution_selector < this.recommanded_resolution.length) {
      this.openCamera();
    } else {
      this.status = ScannerStatus.CAMERA_OPENING_FAIL;
      this.logger.error("Can't open camera with all predefined resolution");
      this.result_callback(this.status, null);
    }
  }

  /**
   * navigator.mediaDevices.getUserMedia(constraints) 성공시 호출되는 callback<br>
   * video tag에 프리뷰를 적용하고, doRecog를 호출하여 스캔을 시작하는 함수
   * @param {*} stream - video stream
   */
  handleSuccess(stream) {
    this.logger.info("handleSuccess called");
    window.stream = stream; // make stream available to browser console
    this.video.srcObject = stream;

    this.logger.info(
      "camera open with : " +
        this.video.videoWidth +
        " x " +
        this.video.videoHeight
    );

    this.status = ScannerStatus.CAMERA_OPENNED;
    let scanResult = new ScanInfo();
    scanResult.cameraWidth =
      this.recommanded_resolution[this.resolution_selector].width;
    scanResult.cameraHeight =
      this.recommanded_resolution[this.resolution_selector].height;
    this.result_callback(this.status, scanResult);

    // ! scanner 라이블러리가 정상적으로 초기화(로드) 될때까지 polling 방식으로 체크 후 실행
    const recogInterval = setInterval(() => {
      if (this.scanner && this.scanner.scanner) {
        clearInterval(recogInterval);
      } else {
        this.doRecog();
      }
    }, 500);
  }

  /**
   * 스캔을 진행하는 함수<br>
   * - 스캐너 초기화<br>
   * - hidden canvas 생성<br>
   * - setInterval을 통하여 스캔이 완료될 때 까지 반복 진행하며 hidden canvas에 프리뷰 스틸샷 입력 및 scanner에 전달
   */
  doRecog() {
    this.scanner = new RobiScanner(this.logger);

    this.status = ScannerStatus.SCANNER_INIT;
    this.logger.info("init scanner");
    let result = this.scanner.init(this.licenseKey); // ! 네트워크 속도에 따라 scanner 라이블러리 실행에 필요한 .data, .wawm 파일 로드 타이밍 문제로 에러 발생 가능
    this.logger.info("init scanner end");
    if (result != 0) {
      this.status = ScannerStatus.SCANNER_INIT_FAIL;
      this.result_callback(this.status, null);
      this.logger.error("error : scanner not init : " + result);
    }

    let canvas = document.createElement("canvas");
    canvas.setAttribute("hidden", "hidden");

    let ctx = canvas.getContext("2d");

    if (this.memory != null) {
      Module._free(this.memory);
      this.memory = null;
    }

    this.status = ScannerStatus.SCANNER_READY;
    this.result_callback(this.status, null);

    this.intervalStatus = 0;

    this.scanInterval = setInterval(() => {
      if (!this.processing) {
        this.processing = true;

        if( this.scanMode == ScanMode.AUTO ) {
          if (this.video.videoWidth > 0 && this.video.videoHeight > 0) {
            let width = this.video.videoWidth;
            let height = this.video.videoHeight;
            this.logger.debug("this.intervalStatue = " + this.intervalStatus);
            if (this.intervalStatus == 0) {
              if (this.memory == null) {
                this.memory = Module._malloc(width * height * 4);
              }

              canvas.width = this.video.videoWidth;
              canvas.height = this.video.videoHeight;

              ctx.drawImage(this.video, 0, 0, width, height);
              const imageData = ctx.getImageData(0, 0, width, height);
              Module.HEAP8.set(imageData.data, this.memory);

              let start_detect = performance.now();
              let scan_result = this.scanner.detect_frame(
                this.memory,
                width,
                height
              );
              this.status = ScannerStatus.SCAN_DETECT;

              let detect_time = performance.now() - start_detect;
              this.logger.info("scanner detect time : " + detect_time + " ms");

              this.detect_callback(scan_result);

              if (scan_result == 0) {
                this.intervalStatus = 1;

                if (this.detectionTimeLimit != 0) {
                  if (this.detectionTimeLimit < detect_time) {
                    this.checkDetectionTimeLimit = true;
                  }
                }
              }
            } else if (this.intervalStatus == 1) {
              this.logger.info("recog start!!");
              this.intervalStatus = 0;
              //if (this.checkDetectionTimeLimit == false) {
                let start = performance.now();
                let scan_result = this.scanner.recog_frame();
                let end = performance.now();
                recogTime = end - start; // send Log 서버 전송을 위한 recog_time set
                this.logger.info("scanner recog time : " + (end - start) + " ms");
                if (scan_result) {
                  this.scanResult = this.scanner.getResultInfo();

                  this.closeCamera();
                  this.status = ScannerStatus.SCAN_COMPLETE;
                  this.result_callback(this.status, this.scanResult);
                }
              //} else {
                // crop 사용도 고려할 수 있다.
                /*
                this.status = ScannerStatus.SCAN_TO_SERVER;
                this.scanResult = new ScanInfo();
                this.scanResult.fullImage = this.scanner.getFrameImageJPEG(
                  this.memory,
                  width,
                  height
                );
                */
                if( this.checkDetectionTimeLimit ) {
                  this.status = ScannerStatus.SCAN_TO_SERVER;
                  this.result_callback(this.status, this.scanResult);
                }
              //}
              this.logger.info("recog end!!");
            } else {
              this.intervalStatus = 0;
            }
          }
        }
        else if(this.scanMode == ScanMode.MANUAL) {
          /*
          canvas.width = this.video.videoWidth;
          canvas.height = this.video.videoHeight;

          ctx.drawImage(this.video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          Module.HEAP8.set(imageData.data, this.memory);
          */
        }
        this.processing = false;
      }
    }, this.scanDuration);
  }

  /**
   * 스캐너 초기화 함수<br>
   * 스캔이 완료된 후, 정보처리가 완료되면 반드시 호출해야 함
   */
  reset() {
    if (this.scanner != null) {
      this.scanner.reset();
    }
  }

  /**
   * 스캐너 및 카메라를 종료하고 메모리 해제를 진행하는 함수<br>
   * 스캔 완료시에는 자동으로 호출되나, 그전에 종료시에 반드시 호출해야 함<br>
   * 다음 상태에 호출하도록 권장
   * @example
   * window.addEventListener('beforeunload', ()=>{
   *          webcamera.closeCamera();
   *      });
   */
  closeCamera() {
    clearInterval(this.scanInterval);
    this.scanInterval = null;

    if (this.scanner != null) {
      this.scanner.reset();
      this.scanner.release();
      this.scanner = null;
    }

    if (this.memory != null) {
      Module._free(this.memory);
      this.memory = null;
    }

    const stream = this.video.srcObject;
    if (stream != null) {
      const tracks = stream.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });

      this.video.srcObject = null;
    }
  }

  /**
   * 스캔 모드를 설정한다.
   * @param {ScanMode} mode 
   */
  setScanMode(mode) {
    this.scanMode = mode;
  }

  /**
   * 이미지를 캡쳐 및 인코딩하여 전달 한다.
   * @returns encoded JPEG Stream
   */
  captureImage() {
    let canvas = document.createElement("canvas");
    canvas.setAttribute("hidden", "hidden");
    let ctx = canvas.getContext("2d");

    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;

    ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    Module.HEAP8.set(imageData.data, this.memory);

    return this.scanner.getFrameImageJPEG(
      this.memory,
      canvas.width,
      canvas.height
    );
  }

  /**
   * 스캐너의 가이드렉트를 설정한다
   * @param {*} orientation 카메라 회전 값
   * @param {*} x 가이드렉트의 가로 중앙 값 (0.0~1.0, 작을수록 좌측으로 이동)
   * @param {*} y 가이드렉트의 세로 중앙 값 (0,0~1.0, 작을수록 상단으로 이동)
   * @param {*} gw not support yet
   * @param {*} gh not support yet
   * @param {*} scale 1.0값 고정
   * @param {*} flip false값 고정, no need to web
   * @returns 
   */
  setFrame_config(orientation, x, y, gw, gh, scale, flip) {
    if( this.scanner != null ) {
      this.scanner.set_frame_config(orientation, x, y, gw, gh, scale, flip);
    }
    else {
      this.logger.error("webcamera scanner is null");
    }
  }
}
