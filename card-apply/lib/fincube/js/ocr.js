webcam.setupWebcam();

// const ipAddr = document.getElementById("ipAddr").value;
var expCookie = new Date();
expCookie.setTime(expCookie.getTime() + 5 * 60 * 1000); // 5분

let transactionId = undefined;
let failCount = 1;
let idcardFileURL = undefined;
// Check camera stream is playing by getting its width
const video = document.querySelector('video');
var videoWidth, videoHeight;


var getVideoSize = function () {
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    console.log(videoWidth + 'x' + videoHeight);
    w = $("video").width();
    h = $("video").height();
    video.removeEventListener('playing', getVideoSize, false);
};

const isNotNumber = (value) => {
    return value < 48 || value > 57;
}

video.addEventListener('playing', getVideoSize, false);

$("#takePictureAgain").click(function () {
    $(".text-take-picture").html("신분증 촬영을 진행해 주세요.");

    $(".text-guide").removeClass("d-none");
    $("canvas").addClass("d-none");
    $("video").removeClass("d-none");
    $(this).addClass("d-none");
});


$("#takePicture").click(function () {
    $(this).addClass("d-none");
    $(".button-block").removeClass("d-none");
    $("#takePictureAgain").attr("disabled", false);
});

(function ($) {
    $.fn.inputFilter = function (inputFilter) {
        return this.on("input keydown keyup select contextmenu drop", function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
                $("#identity").val(this.value);
                $("#juminNoShow").val(this.value);
                $(".birthDate").val(this.value.slice(0, 6));
                if (this.value.length > 6) {
                    const removeDash = this.value.replace(/-/gi, '');
                    const front = removeDash.slice(0, 6) + '-' + removeDash.slice(6, 7);
                    const back = removeDash.slice(7).replace(/\d/gi, "*");
                    this.value = front + removeDash.slice(7);
                    $("#juminNoHide").val(front + back);
                } else {
                    $("#juminNoHide").val(this.value);
                }
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            }
        });
    };
}(jQuery));
