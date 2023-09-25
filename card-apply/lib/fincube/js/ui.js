function alignModal() {
    var modalDialog = $(this).find(".modal-dialog");
    modalDialog.css("margin-top", Math.max(0, ($(window).height() - modalDialog.height()) / 2));
}

var maskingName = function (strName) {
    if (strName.length > 2) {
        var originName = strName.split('');
        originName.forEach(function (name, i) {
            if (i === 0 || i === originName.length - 1) return;
            originName[i] = '*';
        });
        var joinName = originName.join();
        return joinName.replace(/,/g, '');
    } else {
        var pattern = /.$/; // 정규식
        return strName.replace(pattern, '*');
    }
};

// $(document).ready(function () {
//     //document.body.requestFullscreen();

//     var size = {
//         width: window.innerWidth || document.body.clientWidth,
//         height: window.innerHeight || document.body.clientHeight
//     }
//     console.log(size);
//     $(".resolution").text(size.width + ' X ' + size.height);

// });


// $(window).resize(function () {
//     var size = {
//         width: window.innerWidth || document.body.clientWidth,
//         height: window.innerHeight || document.body.clientHeight
//     }
//     console.log(size);
//     $(".resolution").text(size.width + ' X ' + size.height);
// });