var webcam = (function () {
    var video = document.querySelector('video');
    var setupWidth = 0;
    var setupHeight = 0;
    var pictureWidth = $("video").width();
    var pictureHeight = $("video").height();
    var canvas = document.querySelector('canvas');
    var PrevImage = null;
    var PrevWidth = 0;
    var PrevHeight = 0;
    var ResolutionOk = false;
    var osSimple;
    var cid = 0;
    var camSetCompleted = false;
    var camState = false;
    var videoDevices = [0, 0];
    var stage = document.getElementById('test-stage');

    function changeStage(val) {

        if (val === 1) {
            //var stage = document.querySelector('.stage');
            stage.style.borderColor = "white"; // 흰색
            stage.style.backgroundColor = "white";
        }
        else if (val === 0) {
            stage.style.borderColor = "#796f6f69"; // 회색
            stage.style.backgroundColor = "#796f6f69";
        }
        else if (val === 3) {
            stage.style.borderColor = "#FF5675"; // 분홍색
            stage.style.backgroundColor = "#FF5675";
        }
        else {
            stage.style.borderColor = "#FF9614"; // 주황색
            stage.style.backgroundColor = "#FF9614";
        }
    }

    function setupVideo() {
        camSetCompleted = false;
        //$(".stage video").addClass("d-none");
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                var deferred = new $.Deferred();
                var videoSettings = {
                    video: {
                        optional: [
                            {
                                facingMode: 'user'
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
                };


                var videoDevices = [0, 0];
                var videoDeviceIndex = 0;
                devices.forEach(function (device) {
                    console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
                    if (device.kind == "videoinput") {
                        videoDevices[videoDeviceIndex++] = device.deviceId;
                        console.log("setupVideo  device.deviceId: " + device.deviceId);
                    }
                });
                console.log(`videoDevices : ${videoDevices}`);

                var cid = 0;

                if (videoDeviceIndex === 1) {
                    cid = 0;
                }
                else if (videoDeviceIndex === 2) {
                    cid = 1;
                }
                else if (videoDeviceIndex === 3) {
                    cid = 2;
                }
                else if (videoDeviceIndex === 4) {
                    cid = 3;
                }
                else if (videoDeviceIndex === 5) {
                    cid = 4;
                }
                else if (videoDeviceIndex === 6) {
                    cid = 5;
                }
                else {
                    cid = 0;
                }
                var os, ua = navigator.userAgent;

                if (ua.match(/Win(dows )?NT 6\.0/)) {
                    os = "Windows Vista";
                    osSimple = "WIN";
                } else if (ua.match(/Win(dows )?(NT 5\.1|XP)/)) {
                    os = "Windows XP";
                    osSimple = "WIN";
                } else {
                    if ((ua.indexOf("Windows NT 5.1") != -1) || (ua.indexOf("Windows XP") != -1)) {
                        os = "Windows XP";
                        osSimple = "WIN";
                    } else if ((ua.indexOf("Windows NT 7.0") != -1) || (ua.indexOf("Windows NT 6.1") != -1)) {
                        os = "Windows 7";
                        osSimple = "WIN";
                    } else if ((ua.indexOf("Windows NT 8.0") != -1) || (ua.indexOf("Windows NT 6.2") != -1)) {
                        os = "Windows 8";
                        osSimple = "WIN";
                    } else if ((ua.indexOf("Windows NT 8.1") != -1) || (ua.indexOf("Windows NT 6.3") != -1)) {
                        os = "Windows 8.1";
                        osSimple = "WIN";
                    } else if ((ua.indexOf("Windows NT 10.0") != -1) || (ua.indexOf("Windows NT 6.4") != -1)) {
                        os = "Windows 10";
                        osSimple = "WIN";
                    } else if ((ua.indexOf("iPad") != -1) || (ua.indexOf("iPhone") != -1) || (ua.indexOf("iPod") != -1)) {
                        os = "Apple iOS";
                        osSimple = "IOS";
                    } else if (ua.indexOf("Android") != -1) {
                        os = "Android OS";
                        osSimple = "ANDROID";
                    } else if (ua.match(/Win(dows )?NT( 4\.0)?/)) {
                        os = "Windows NT";
                        osSimple = "WIN";
                    } else if (ua.match(/Mac|PPC/)) {
                        os = "Mac OS";
                        osSimple = "MAC";
                    } else if (ua.match(/Linux/)) {
                        os = "Linux";
                        osSimple = "LINUX";
                    } else if (ua.match(/(Free|Net|Open)BSD/)) {
                        os = RegExp.$1 + "BSD";
                    } else if (ua.match(/SunOS/)) {
                        os = "Solaris";
                        osSimple = "SOLARIS";
                    }
                }
                // console.log("setupVideo :: facing :" + facing );
                console.log("setupVideo :: cid :" + cid);

                var onCameraFail = function (e) {
                    alert("카메라에 액세스할 수 없습니다.");
                };

                function snapshot() {
                    if (localMediaStream) {
                        ctx.drawImage(video, 0, 0);
                    }
                }

                // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                // window.URL = window.URL || window.webkitURL;
                // navigator.getUserMedia({video:true}, function (stream) {
                //     video.srcObject = stream;
                //     stopStreamedVideo();
                if (window.orientation == -90 || window.orientation == 90 || window.orientation == undefined) {
                    // Landscape 모드일 때 실행할 스크립트

                    var constraints = {
                        video: true,
                        video: {
                            zoom: true,
                            facingMode: "environment", //'environment',
                            focusMode: 'continuous',
                            width: 1080,
                            height: 720,
                            // width: { min: 0, ideal: 1080, max: 1080 },
                            // height: { min: 0, ideal: 720, max: 720 },   // this line is required for android
                            deviceId: videoDevices[cid]
                        }
                    }

                    setupWidth = 1080, setupHeight = 720;
                }
                else {
                    // Portrait 모드일 때 실행할 스크립트
                    var constraints = {
                        video: true,
                        video: {
                            zoom: true,
                            facingMode: "environment",
                            focusMode: 'continuous',
                            width: 720,
                            height: 1080,
                            // width: { min: 0, ideal: 720, max: 720 },
                            // height: { min: 0, ideal: 1080, max: 1080 },   // this line is required for android
                            deviceId: videoDevices[cid]
                        }
                    }

                    setupWidth = 720, setupHeight = 1080;
                }

                navigator.mediaDevices.getUserMedia(constraints)
                    .then(function (stream) {
                        video.srcObject = stream;
                        camSetCompleted = true;
                        $(".stage video").removeClass("d-none");
                    }).catch(function (err) {
                        $(".stage video").addClass("d-none");
                        alert("카메라의 설정 해상도가 지원 해상도 1080 x 720, 720 x 1080 를 지원 할 수 없습니다.");
                    });

                //}, onCameraFail);


                return deferred.promise();

            })
    }

    async function getMedia(constraints) {
        let stream = null;

        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            /* 스트림 사용 */

        } catch (err) {
            camState = false;
            return;
        }
        camState = true;
        return;
    }

    function stopStreamedVideo() {
        // const videoStream = video.srcObject;

        // if (videoStream !== null) {
        //     const track = videoStream.getTracks()[0];
        //     track.stop();
        //     video.srcObject = null;
        // }

        const stream = video.srcObject;
        if (stream !== null) {
            const tracks = stream.getTracks();
        
            tracks.forEach(function(track) {
            track.stop();
            });
        
            video.srcObject = null;
        }
    }



    function setupWebcam() {

        stopStreamedVideo();
        setupVideo();

    }

    function sleep(ms) {
        const wakeUpTime = Date.now() + ms;
        while (Date.now() < wakeUpTime) { }
    }

    function getResolution() {

        if (!camSetCompleted)
            return "";

        if (video.videoWidth == 0 && video.videoHeight == 0) {
            console.log(`width: ${video.videoWidth}, height: ${video.videoHeight}`);
            return "";
        }

        if ((video.videoWidth == 1080 && video.videoHeight == 720) || (video.videoWidth == 720 && video.videoHeight == 1080)) {
            ResolutionOk = true;
        }
        else {
            // $(".stage video").addClass("d-none");
            // alert("카메라의 설정 해상도가 지원 해상도 1080 x 720, 720 x 1080 를 지원 할 수 없습니다.");            
            var resultStr = "resolution error " + video.videoWidth + " x " + video.videoHeight;
            video.srcObject = null;
            return resultStr;
        }

        // console.log(`width: ${video.videoWidth}, height: ${video.videoHeight}`);
        return video.videoWidth + " x " + video.videoHeight;
    }

    function getResolutionCompatibility() {

        if (!camSetCompleted)
            return false;

        if (video.videoWidth == 0 && video.videoHeight == 0) {
            console.log(`width: ${video.videoWidth}, height: ${video.videoHeight}`);
            return false;
        }


        if ((video.videoWidth == 1080 && video.videoHeight == 720) || (video.videoWidth == 720 && video.videoHeight == 1080)) {
            ResolutionOk = true;
        }
        else {
            //$(".stage video").addClass("d-none");
            //alert("카메라의 설정 해상도가 지원 해상도 1080 x 720, 720 x 1080 를 지원 할 수 없습니다.");               
            video.srcObject = null;
            return false;
        }

        // console.log(`width: ${video.videoWidth}, height: ${video.videoHeight}`);
        return true;
    }

    function detectCardbox(address) {

        // console.log(`width: ${video.videoWidth}, height: ${video.videoHeight}`);
        if (address == null) {
            return 0;
        }
        else if (address == -1) {
            return 0;
        }
        else if (!ResolutionOk) {
            return 0;
        }

        if (video.videoWidth == 0 && video.videoHeight == 0) {
            return 0
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        var Buffer = Module._malloc(canvas.width * canvas.height * 4);

        Module.HEAP8.set(imgData.data, Buffer);

        var detect_card = detect_idcard(Buffer, canvas.width, canvas.height, 0);
        console.log(`detectCardbox : ${detect_card}`);
        Module._free(Buffer);

        return detect_card;

    }

    function startScanBarcode() {

        if (!ResolutionOk) {
            return "";
        }

        if (video.videoWidth == 0 && video.videoHeight == 0) {
            return "";
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        var Buffer = Module._malloc(canvas.width * canvas.height * 4);

        Module.HEAP8.set(imgData.data, Buffer);
        var resultBuf = Module._malloc(256);
        var detect_card = null;


        detect_card = scanBarcode(Buffer, canvas.width, canvas.height, resultBuf);
        console.log(`detectCardbox : ${detect_card}`);
        if (detect_card == null || detect_card === ""|| detect_card === undefined) {
            console.log(`scan fail.`);
        }

        if (detect_card !== "") {
            PrevWidth = canvas.width;
            PrevHeight = canvas.height;
            if(PrevImage == null && PrevWidth !== 0 && PrevHeight !== 0)
                PrevImage = Module._malloc(PrevWidth * PrevHeight * 4);
            
            if(PrevImage != null && PrevWidth !== 0 && PrevHeight !== 0)
                Module.HEAP8.set(imgData.data, PrevImage);
        }


        Module._free(resultBuf);
        Module._free(Buffer);
        return detect_card;

    }

    function startRecognition(address, type) {
        // console.log(`width: ${video.videoWidth}, height: ${video.videoHeight}`);
        if (address == null) {
            return "";
        } else if (address == -1) {
            return "checkValidation Fail";
        } else if (!ResolutionOk) {
            return "";
        }

        //canvas = document.querySelector('canvas');

        //canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        //setup screenshot size
        if (video.videoWidth == 0 && video.videoHeight == 0) {
            return "";
        }


        canvas.width = video.videoWidth; //480 * 2;
        canvas.height = video.videoHeight; //640 * 2;

        var ctx = canvas.getContext('2d');
        //draw picture from video on canvas

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // console.log(`width: ${canvas.width}, height: ${canvas.height}`);

        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        var pixels = imgData.data;

        var resultBuf = Module._malloc(256);


        var Buffer = Module._malloc(canvas.width * canvas.height * 4);



        Module.HEAP8.set(imgData.data, Buffer);

        var result = null;

        if (type === 0)
            result = scanIDCard(Buffer, canvas.width, canvas.height, address, resultBuf);
        else if (type === 1)
            result = scanPassport(Buffer, canvas.width, canvas.height, address, resultBuf);
        else if (type === 2)
            result = scanAlien(Buffer, canvas.width, canvas.height, address, resultBuf);
        else if (type === 3)
            result = scanCredit(Buffer, canvas.width, canvas.height, address, resultBuf);

        // destroyCardScanner(address);

        if (result == null || result === "") {
            console.log(`scan fail.`);
        }

        if (result !== "false") {
            PrevWidth = canvas.width;
            PrevHeight = canvas.height;
            if(PrevImage == null && PrevWidth !== 0 && PrevHeight !== 0)
                PrevImage = Module._malloc(PrevWidth * PrevHeight * 4);
            
            if(PrevImage != null && PrevWidth !== 0 && PrevHeight !== 0)
                Module.HEAP8.set(imgData.data, PrevImage);
        }


        Module._free(resultBuf);
        Module._free(Buffer);


        return result;
    }

    function destroyPrevImage() {
        if(PrevImage != null)
        {
            Module._free(PrevImage);
            PrevImage = null;
        }

        PrevWidth = 0;
        PrevHeight = 0;
    }

    function drawImage() {

        if (PrevImage === null)
            return;

        var width = PrevWidth;
        var height = PrevHeight;
        const RGBA = PrevImage;

        const resultView = new Uint8Array(Module.HEAP8.buffer, RGBA, width * height * 4);
        const result = new Uint8ClampedArray(resultView);

        const img = new ImageData(result, width, height);

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(img, 0, 0);
    }

    function drawJpg(address) {

        encodeJpegDetectedImage(address, 1);
        var jpgSize = getJpegSize();
        var jpgPointer = getJpegBuffer();

        const resultView = new Uint8Array(Module.HEAP8.buffer, jpgPointer, jpgSize);
        const result = new Uint8Array(resultView);

        const blob = new Blob([result], { type: 'image/jpg' });
        const blobURL = URL.createObjectURL(blob);

        drawDataURIOnCanvas(blobURL, canvas);

        webcam.destroyJpeg();
    }

    function drawDataURIOnCanvas(strDataURI, canvas) {
        var img = new window.Image();
        img.addEventListener("load", function () {
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext("2d").drawImage(img, 0, 0, img.width, img.height);
        });

        img.setAttribute("src", strDataURI);
    }

    function encodeJpegDetectedImage(address, mask) {
        return encodeJpgDetectedFrameImage(address, mask);
    }

    function getJpegSize() {
        return getEncodedJpgSize();
    }

    function getJpegBuffer() {
        return getEncodedJpgBuffer();
    }

    function destroyJpeg() {
        return destroyEncodedJpg();
    }


    function drawRgba(address) {

        initRgbaDetectedImage(address, 1);
        var width = getRgbaWidth();
        var height = getRgbaHeight();
        const RGBA = getRgbaBuffer();

        const resultView = new Uint8Array(Module.HEAP8.buffer, RGBA, width * height * 4);
        const result = new Uint8ClampedArray(resultView);

        const img = new ImageData(result, width, height);

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.putImageData(img, 0, 0);
    }

    function initRgbaDetectedImage(address, mask) {
        return initRgbaDetectedFrameImage(address, mask);
    }

    function getRgbaWidth() {
        return getRgbaImageWidth();
    }

    function getRgbaHeight() {
        return getRgbaImageHeight();
    }

    function getRgbaBuffer() {
        return getRgbaImage();
    }


    return {
        destroyPrevImage, setupWebcam, startRecognition, drawImage, sleep, getResolution, getResolutionCompatibility, stopStreamedVideo,
        drawJpg, encodeJpegDetectedImage, getJpegSize, getJpegBuffer, destroyJpeg,
        initRgbaDetectedImage, drawRgba, getRgbaWidth, getRgbaHeight, getRgbaBuffer, detectCardbox, changeStage, startScanBarcode
    };



})();
