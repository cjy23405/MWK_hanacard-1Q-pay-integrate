/**
 * @Version 1.0.0
 * @copyright Posicube all right reserved
 * @file scanner.js wasm과 연결을 위한 scanner wrapper 및 scaninfo class 파일
 */

//const isWindows = require("cross-env/src/is-windows");

/**
 * 스캔된 카드이 종류를 나타내는 enum
 * @readonly
 * @enum {int}
 */
const ScanCardType = {
    /** 0 - 변수 초기화를 위한 값 */
    UNKOWN: 0,
    /** 1 - 주민등록증 */
    IDCARD: 1,
    /** 2 - 운전면허증 */
    DRIVERLICENSE: 2,
};

/**
 * 스캔 결과 error enum
 * @readonly
 * @enum {int}
 */
const ScanErrorCode = {
    /** -2 - 카드파입 규정 실패 */
    ERROR_UNKOWN_CARD_TYPE: -2,
    /** -1 - 알수없는 에러 발생 */
    ERROR_UNKOWN: -1,
    /** 0 - 스캔에 문제 없음 */
    OK: 0,
};

/**
 * 스캐너에 입력될 정보 클래스
 */
class ScanConfig {
    /**
     * 정보 객체 생성자
     */
    constructor() {
        this.memory = null;
        this.width = 0;
        this.height = 0;
    }

    /**
     * 프래임 정보를 셋팅하기 위한 함수
     * @param {Int8Array} memory video에서 가져온 frame buffer RGB 
     * @param {int} wdt video width
     * @param {int} hgt video height
     */
    setFrame(memory, wdt, hgt) {
        this.memory = memory;
        this.width = wdt;
        this.height = hgt;
    }
}

/**
 * 스캔 결과가 저장된 클래스<br>
 * 스캔 정보에는 WASM native allocation memory가 존재함<br>
 * <span style="font-weight:bold;">사용 후 반드시 release를 호출하여 해당 메모리를 제거해야함</span><br><br>
 * @example
 * ScanInfo에 존재하는 이미지 사용 예시
 * // get image from scanresult
 * let robiImage = scan_result.maskedCardImage;
 * 
 * var encodedstream = robiImage.encodedstream;
 * var encodedLength = robiImage.encodedsize;
 * 
 * // test code for show result image
 *     // base64 encoding
 * var binaryString = [encodedLength];
 * while(encodedLength--) {
 *     binaryString[encodedLength] = String.fromCharCode(encodedstream[encodedLength]);
 * }
 * var encodeddata = binaryString.join('');
 * var base64 = window.btoa(encodeddata);
 *     // locad image form base64 buffer
 * var img = new Image();
 * img.src = "data:image/jpeg;base64," + base64;
 * img.onload = function() {
 *     result_ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
 * }
 * img.onerror = function(stuff) {
 *     logger.error("img load fail : ", stuff);
 * }
 * 
 * // release wasm native allocation memory
 * scan_result.release();
 */
class ScanInfo {
    /**
     * 정보 객체 생성자
     */
    constructor() {
        /** @member {ScanCardType} cardType 스캔된 카드의 종류 */
        this.cardType = -1;
        /** @member {String} idNumber 주민등록 번호 */
        this.idNumber = "";
        /** @member {String} name 이름 */
        this.name = "";
        /** @member {String} issueDate 발행일자 */
        this.issueDate = "";
        /** @member {String} issuer 발행처 */
        this.issuer = "";

        // for ID only
        /** @member {int} overseas 1 : 재외국민 */
        this.overseas = "";

        // for DriverLicense only
        /** @member {String} driverLicenseNumber 운전면허 번호 */
        this.driverLicenseNumber = "";
        /** @member {String} aptitude 적성검사 기간 */
        this.aptitude = "";
        /** @member {String} driverLicenseType 운전면허 종류 */
        this.driverLicenseType = "";
        /** @member {String} serial 운전면허 시리얼 번호 */
        this.serial = "";
        /** @member {String} driverLicenseKor ??? */
        this.driverLicenseKor = "";

        /** @member {int} cardDetected 0 : 카드박스가 찾아짐 <br>others : 카드박스 검출 실패 */
        this.cardDetected = false;
        /** @member {int} completed 0 : 스캔이 완료되지 않음<br>1 : 스캔이 완료됨 */
        this.completed = false;

        /** @member {int} error_code 에러 코드 */
        this.error_code = 0;

        /** @member {int} scanTime 스캔 시간 ms */
        this.scanTime = 0;

        /** @member {int} cameraWidth 카메라 가로 해상도 */
        this.cameraWidth = 0;
        /** @member {int} cameraHeight 카메라 세로 해상도 */
        this.cameraHeight = 0;

        /** @member {float} faceScore 얼굴 점수 */
        this.faceScore = 0.0;
        /** @member {float} colorScore 입력 프레임의 칼라/흑백 정도 점수 */
        this.colorScore = 0.0;
        /** @member {float} specularRatio 빛반사 점수 */
        this.specularRatio = 0.0;

        /** @member {RobiImage} cardImage 카드만 잘라낸 이미지 객체 */
        this.cardImage = null;
        /** @member {RobiImage} maskedCardImage 카드만 잘라낸 개인정보 삭제 이미지 객체 */
        this.maskedCardImage = null;
        /** @member {RobiImage} fullImage 전체 프리뷰 이미지 객체 */
        this.fullImage = null;
        /** @member {RobiImage} portraitImage 얼굴만 잘라낸 이미지 객체 */
        this.portraitImage = null;
        /** @member {RobiImage} portraitImage400 400x400(fit center)으로 크기 조정된 얼굴 이미지 객체 */
        this.portraitImage400 = null;
    }

    /**
     * ScanInfo 내에 존재하는 WASM native alloc 메모리를 해제한다.
     */
    release() {
        if( this.cardImage != null ) {
            this.cardImage.release();
            this.cardImage = null;
        }
        if( this.maskedCardImage != null ) {
            this.maskedCardImage.release();
            this.maskedCardImage = null;
        }
        if( this.fullImage != null ) {
            this.fullImage.release();
            this.fullImage = null;
        }
        if( this.portraitImage != null ) {
            this.portraitImage.release();
            this.portraitImage = null;
        }
        if( this.portraitImage400 != null ) {
            this.portraitImage400.release();
            this.portraitImage400 = null;
        }
    }

    /**
     * 주민등록증 정보를 저장하는 함수
     * @param {String} idnumber 주민등록번호
     * @param {String} name 이름
     * @param {String} issueDate 발행일 
     * @param {String} issuer 발행처
     * @param {boolean} overseas 재외국민 유무
     */
    setIDCardScanInfo(idnumber, name, issueDate, issuer, overseas) {
        this.cardType = ScanCardType.IDCARD;
        this.idNumber = idnumber;
        this.name = name;
        this.issueDate = issueDate;
        this.issuer = issuer;

        this.overseas = overseas;
    }

    /**
     * 운전면허증 정보를 저장하는 함수
     * @param {String} idnumber 주민등록번호
     * @param {String} name 이름
     * @param {String} issueDate 발행일 
     * @param {String} issuer 발행처
     * @param {String} licenseNumber 운전면허번호 
     * @param {String} aptitude 적성검사 기간
     * @param {String} licenseType 운전면허 종류
     * @param {String} serial 운전면허 시리얼 번호
     * @param {String} licenseKor ??
     */
    setDriverLicenseScanInfo(idnumber, name, issueDate, issuer, licenseNumber, aptitude, licenseType, serial, licenseKor) {
        this.cardType = ScanCardType.DRIVERLICENSE;
        this.idNumber = idnumber;
        this.name = name;
        this.issueDate = issueDate;
        this.issuer = issuer;

        this.driverLicenseNumber = licenseNumber;
        this.aptitude = aptitude;
        this.licenseType = licenseType;
        this.serial = serial;
        this.licenseKor = licenseKor;
    }

    /**
     * 이미지 정보를 저장하는 함수
     * @param {RobiImage} cardimage 카드만 잘라낸 이미지 객체
     * @param {RobiImage} maskedcardimage 카드만 잘라낸 개인정보 삭제 이미지 객체
     * @param {RobiImage} fullimage 전체 프리뷰 이미지 객체
     * @param {RobiImage} portraitimage 얼굴만 잘라낸 이미지 객체
     * @param {RobiImage} portraitimage400 400x400(fit center)으로 크기 조정된 얼굴 이미지 객체
     */
    setImages(cardimage, maskedcardimage, fullimage, portraitimage, portraitimage400) {
        this.cardImage = cardimage;
        this.maskedCardImage = maskedcardimage;
        this.fullImage = fullimage;
        this.portraitImage = portraitimage;
        this.portraitImage400 = portraitimage400;
    }
}

/**
 * JPEG으로 인코딩된 이미지를 전달하기 위한 클래스
 */
class RobiImage {
    /**
     * 생성자
     */
    constructor() {
        /** @member {Object} image wasm image object  */
        this.image = null;
        /** @member {typed_memory_view} encodedstream encoded jpeg stream*/
        this.encodedstream = null;
        /** @member {int} encodedsize encoded jpeg size */
        this.encodedsize = 0;
        /** @member {int} width jpeg width */
        this.width = 0;
        /** @member {int} height jpeg height */
        this.height = 0;
    }

    /**
     * wasm에서 생성된 메모리를 해제하기 위한 함수
     * 이미지 객체 사용 후, 반드시 release()를 호출해야 함
     * @example 
     * //
     * // RobiImage 사용 예시
     * //
     * let image = scanner.getCropCardImageJPEG(90);
     * // get encoded image info
     * var encodedstream = robiImage.encodedstream;
     * var encodedLength = robiImage.encodedsize;
     * 
     * // test code for show result image
     *     // base64 encoding
     * var binaryString = [encodedLength];
     * while(encodedLength--) {
     *     binaryString[encodedLength] = String.fromCharCode(encodedstream[encodedLength]);
     * }
     * var encodeddata = binaryString.join('');
     * var base64 = window.btoa(encodeddata);
     *     // locad image form base64 buffer
     * var img = new Image();
     * img.src = "data:image/jpeg;base64," + base64;
     * img.onload = function() {
     *     ctxout.drawImage(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height);
     * }
     * img.onerror = function(stuff) {
     *     logger.error("img load fail : ", stuff);
     * }
     * 
     * // delete(free) encode image info
     * robiImage.release();
     */
    release() {
        if( this.image != null ) {
            this.image.delete();
        }
    }
}

/**
 * scanner/scanner_simd.js의 wasm 코드를 warpping하는 스캐너 클래스
 */
class RobiScanner {
    /**
     * 생성자
     * @param {RobiLogger} logger - 개발 및 에러 정보 출력을 위한 로깅 클래스
     */
    constructor(logger) {
        this.scanner = null;
        this.recog_process = null;

        this.logger = logger;
    }

    /**
     * 스캐너를 생성하고 초기화 하는 함수
     * @returns {ScanErrorCode} 스캔 실패 유무
     */
    init(licenseKey) {
        let start = performance.now();
        this.scanner = new Module.RobiCardScanner();
        let result_code = this.scanner.initEngine(licenseKey);
        let end = performance.now();
        this.logger.info("scanner init time : " + (end - start) + " ms");
        this.logger.info("scanner info = " + this.scanner.getEngine_Info());
        return result_code;
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
    set_frame_config(orientation, x, y, gw, gh, scale, flip) {
        if( this.scanner == null ) {
            this.logger.error("scanner is null");
            return;
        }

        this.scanner.setFrameConfig(orientation, x, y, gw, gh, scale, flip);
        return;
    }

    /**
     * 프래임에서 카드 박스를 검출하는 함수
     * @param {Int8Array} memory video에서 가져온 frame buffer RGB 
     * @param {int} width video.videoWidth
     * @param {int} height video.videoHeight
     * @returns {ScanErrorCode} 스캔 실패 유무
     */
    detect_frame(memory, width, height) {
        let result_code = -1;
        if (this.scanner != null) {
            result_code =  this.scanner.detect(memory, width, height);
        }
        else {
            this.logger.error("error : runtime error, RobiCardScanner not created!");
        }
        return result_code;
    }

    /**
     * 프레임에서 신분증 정보를 인식하는 함수
     * @returns {ScanErrorCode} 스캔 실패 유무
     */
    recog_frame() {
        let result_code = -1;
        if (this.scanner != null) {
            result_code =  this.scanner.recog();
        }
        else {
            this.logger.error("error : runtime error, RobiCardScanner not created!");
        }
        return result_code;
    }

    /**
     * 스캔된 정보를 ScanInfo에 저장하는 함수
     * @returns {ScanInfo} 스캔 결과
     */
    getResultInfo() {
        let scanInfo = new ScanInfo();

        let cardType = this.scanner.getScanInfo_CardType();

        if (cardType == ScanCardType.IDCARD) {
            scanInfo.setIDCardScanInfo(
                this.scanner.getIdInfo_IDnum(),
                this.scanner.getIdInfo_Name(),
                this.scanner.getIdInfo_IssueDate(),
                this.scanner.getIdInfo_Issuer(),
                this.scanner.getIdInfo_Overseas()
            );
            scanInfo.setImages(
                this.getCropCardImageJPEG(90),
                this.getMaskedCropCardImageJPEG(90),
                this.getFullImageJPEG(90),
                this.getFaceImageJPEG(90),
                this.getFace400ImageJPEG(90)
            );
        }
        else if (cardType == ScanCardType.DRIVERLICENSE) {
            scanInfo.setDriverLicenseScanInfo(
                this.scanner.getDlInfo_IDnum(),
                this.scanner.getDlInfo_Name(),
                this.scanner.getDlInfo_IssueDate(),
                this.scanner.getDlInfo_Issuer(),
                this.scanner.getDlInfo_LicenseNumber(),
                this.scanner.getDlInfo_Aptitude(),
                this.scanner.getDlInfo_LicenseType(),
                this.scanner.getDlInfo_Serial(),
                this.scanner.getDlInfo_LicneseKor()
            );
            scanInfo.setImages(
                this.getCropCardImageJPEG(90),
                this.getMaskedCropCardImageJPEG(90),
                this.getFullImageJPEG(90),
                this.getFaceImageJPEG(90),
                this.getFace400ImageJPEG(90)
            );
        }
        else {
            scanInfo.error_code = ScanErrorCode.ERROR_UNKOWN_CARD_TYPE;
        }

        // set evaluation points
        scanInfo.faceScore = this.scanner.getFaceScore();
        scanInfo.colorScore = this.scanner.getColorScore();
        scanInfo.specularRatio = this.scanner.getSpecularRatio();

        return scanInfo;
    }

    /**
     * 스캔된 카드의 이미지만 크롭된 결과물을 jpeg으로 인코딩된 상태로 받아오는 함수<br>
     * 사용이 완료된 후, 반드시 객체의 release()를 호출해야 함 @see {@link RobiImage#release}
     * @param {int} quality jpeg 인코딩시 적용할 화질 레벨(0~100)
     * @returns {RobiImage} 결과 이미지 객체
     */
    getCropCardImageJPEG(quality) {
        let ret_image = new RobiImage();
        ret_image.image = this.scanner.getCropCardImageJPEG(quality);
        ret_image.encodedstream = ret_image.image.getBuffer();
        ret_image.width = ret_image.image.getWidth();
        ret_image.height = ret_image.image.getHeight();
        ret_image.encodedsize = ret_image.image.getCompressedSize();
        return ret_image;
    }

    /**
     * 스캔된 카드의 이미지만 크롭한구 개인정보를 마스킹처리한 결과물을 jpeg으로 인코딩된 상태로 받아오는 함수<br>
     * 사용이 완료된 후, 반드시 객체의 release()를 호출해야 함 @see {@link RobiImage#release}
     * @param {int} quality jpeg 인코딩시 적용할 화질 레벨(0~100)
     * @returns {RobiImage} 결과 이미지 객체
     */
     getMaskedCropCardImageJPEG(quality) {
        let ret_image = new RobiImage();
        ret_image.image = this.scanner.getMaskedCropCardImageJPEG(quality);
        ret_image.encodedstream = ret_image.image.getBuffer();
        ret_image.width = ret_image.image.getWidth();
        ret_image.height = ret_image.image.getHeight();
        ret_image.encodedsize = ret_image.image.getCompressedSize();

        return ret_image;
    }

    /**
     * 스캔된 카메라 프리뷰 영상을 jpeg으로 인코딩된 상태로 받아오는 함수<br>
     * 사용이 완료된 후, 반드시 객체의 release()를 호출해야 함 @see {@link RobiImage#release}
     * @param {int} quality jpeg 인코딩시 적용할 화질 레벨(0~100)
     * @returns {RobiImage} 결과 이미지 객체
     */
    getFullImageJPEG(quality) {
        let ret_image = new RobiImage();
        ret_image.image = this.scanner.getFullImageJPEG(quality);
        ret_image.encodedstream = ret_image.image.getBuffer();
        ret_image.width = ret_image.image.getWidth();
        ret_image.height = ret_image.image.getHeight();
        ret_image.encodedsize = ret_image.image.getCompressedSize();

        return ret_image;
    }

    /**
     * 스캔된 신분증의 사진을 jpeg으로 인코딩된 상태로 받아오는 함수<br>
     * 사용이 완료된 후, 반드시 객체의 release()를 호출해야 함 @see {@link RobiImage#release}
     * @param {int} quality jpeg 인코딩시 적용할 화질 레벨(0~100)
     * @returns {RobiImage} 결과 이미지 객체
     */
    getFaceImageJPEG(quality) {
        let ret_image = new RobiImage();
        ret_image.image = this.scanner.getFaceImageJPEG(quality);
        ret_image.encodedstream = ret_image.image.getBuffer();
        ret_image.width = ret_image.image.getWidth();
        ret_image.height = ret_image.image.getHeight();
        ret_image.encodedsize = ret_image.image.getCompressedSize();

        return ret_image;
    }

    /**
     * 스캔된 신분증의 사진을 400x400에 fillcenter 크기의 jpeg으로 인코딩된 상태로 받아오는 함수<br>
     * 사용이 완료된 후, 반드시 객체의 release()를 호출해야 함 @see {@link RobiImage#release}
     * @param {int} quality jpeg 인코딩시 적용할 화질 레벨(0~100)
     * @returns {RobiImage} 결과 이미지 객체
     */
     getFace400ImageJPEG(quality) {
        let ret_image = new RobiImage();
        ret_image.image = this.scanner.getFace400ImageJPEG(quality);
        ret_image.encodedstream = ret_image.image.getBuffer();
        ret_image.width = ret_image.image.getWidth();
        ret_image.height = ret_image.image.getHeight();
        ret_image.encodedsize = ret_image.image.getCompressedSize();

        return ret_image;
    }

    /**
     * 
     * @param {intptr_t*} buffer 프레임 버퍼
     * @param {int} width 입력 프레임의 가로 값(pixels)
     * @param {int} height 입력 프레임의 세로 값(pixels)
     * @param {int} quality jpeg 인코딩시 적용할 회질 레벨(0-100)
     * @returns {RobiImage} 결과 이미지 객체
     */
    getFrameImageJPEG(buffer, width, height, quality) {
        let ret_image = new RobiImage();
        ret_image.image = this.scanner.getFrameImageJPEG(buffer, width, height, quality);
        ret_image.encodedstream = ret_image.image.getBuffer();
        ret_image.width = ret_image.image.getWidth();
        ret_image.height = ret_image.image.getHeight();
        ret_image.encodedsize = ret_image.image.getCompressedSize();

        return ret_image;
    }

    /**
     * 스캐너를 초기화 하는 함수
     */
    reset() {
        if( this.scanner != null ) {
            this.scanner.destroyEngine();
        }
    }

    /** 
     * 스캐너를 메모리에서 해제하는 함수 
     */
    release() {
        if (this.scanner != null) {
            this.scanner.delete();
        }
    }
}