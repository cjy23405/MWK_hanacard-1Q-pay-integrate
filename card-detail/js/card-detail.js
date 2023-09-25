/******************************************************************************/
/*********************************** EASING ***********************************/
/******************************************************************************/

(function () {
	// Based on easing equations from Robert Penner (http://www.robertpenner.com/easing)

	var baseEasings = {};

	$.each(['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'], function (i, name) {
		baseEasings[name] = function (p) {
			return Math.pow(p, i + 2);
		};
	});

	$.extend(baseEasings, {
		Sine: function (p) {
			return 1 - Math.cos((p * Math.PI) / 2);
		},
		Circ: function (p) {
			return 1 - Math.sqrt(1 - p * p);
		},
		Elastic: function (p) {
			return p === 0 || p === 1 ? p : -Math.pow(2, 8 * (p - 1)) * Math.sin((((p - 1) * 80 - 7.5) * Math.PI) / 15);
		},
		Back: function (p) {
			return p * p * (3 * p - 2);
		},
		Bounce: function (p) {
			var pow2,
				bounce = 4;

			while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
			return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
		},
	});

	$.each(baseEasings, function (name, easeIn) {
		$.easing['easeIn' + name] = easeIn;
		$.easing['easeOut' + name] = function (p) {
			return 1 - easeIn(1 - p);
		};
		$.easing['easeInOut' + name] = function (p) {
			return p < 0.5 ? easeIn(p * 2) / 2 : 1 - easeIn(p * -2 + 2) / 2;
		};
	});
})();

(function ($) {
	var userAgent = navigator.userAgent;
	var userAgentCheck = {
		ieMode: document.documentMode,
		isIos: Boolean(userAgent.match(/iPod|iPhone|iPad/)),
		isAndroid: Boolean(userAgent.match(/Android/)),
	};
	if (userAgent.match(/Edge|Edg/gi)) {
		userAgentCheck.ieMode = 'edge';
	}
	userAgentCheck.androidVersion = (function () {
		if (userAgentCheck.isAndroid) {
			try {
				var match = userAgent.match(/Android (\d+(?:\.\d+){0,2})/);
				return match[1];
			} catch (e) {
				console.log(e);
			}
		}
	})();
	window.userAgentCheck = userAgentCheck;

	// min 포함 max 불포함 랜덤 정수
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	// 랜덤 문자열
	var hashCodes = [];
	function uiGetHashCode(length) {
		var string = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var result = '';
		var stringLength = string.length;

		length = typeof length === 'number' && length > 0 ? length : 10;

		function getCode(length) {
			var code = '';
			for (var i = 0; i < length; i++) {
				code += string[getRandomInt(0, stringLength)];
			}
			if (hashCodes.indexOf(code) > -1) {
				code = getCode(length);
			}
			return code;
		}

		result = getCode(length);
		hashCodes.push(result);

		return result;
	}

	// common
	var $win = $(window);
	var $doc = $(document);

	// top visual
	var topVisual = {
		init: function () {
			$('.detail-top-visual').each(function () {
				var $wrap = $(this);
				var isInit = $wrap.data('topVisualInit');

				if (typeof isInit === 'boolean' && isInit) return;

				$wrap.data('topVisualInit', true);

				var animationFn =
					typeof uiJSCardDetailTopVisualAnimation === 'function'
						? uiJSCardDetailTopVisualAnimation
						: function (cardDetailTopVisual) {
								cardDetailTopVisual.completeFn();
						  };
				var initCallback = typeof uiJSCardDetailTopVisualInit === 'function' ? uiJSCardDetailTopVisualInit : function () {};
				var completeCallback = typeof uiJSCardDetailTopVisualComplete === 'function' ? uiJSCardDetailTopVisualComplete : function () {};
				var $slide = $wrap.find('.detail-top-visual-slide .detail-top-visual-list');
				var $controller = $wrap.find('.detail-top-visual-controller');
				var topVisualObject = {
					$wrap: $wrap,
					completeFn: null,
				};
				var completeFn = function () {
					$wrap.addClass('is-animation-end').removeClass('swiper-no-swiping');
					completeCallback(topVisualObject);
				};

				topVisualObject.completeFn = completeFn;

				$wrap.addClass('swiper-no-swiping');

				$slide.swiperSet({
					appendController: $controller,
					pageControl: true,
					touchEventsTarget: 'container',
				});

				topVisualObject.swiper = $slide.data('swiper');

				animationFn(topVisualObject);

				initCallback(topVisualObject);
			});
		},
		scroll: function () {
			var $wrap = $('.detail-top-visual').eq(0);

			if (!$wrap.length) return;

			var $fixButton = $('.page-buttons.type-fixed.type-detail-top-visual');
			var $fixTopBar = $('.fix-top-wrap');
			var scrollTop = $win.scrollTop();
			var offsetTop = $wrap.offset().top;
			var wrapH = $wrap.outerHeight();
			var fixTopBarH = $fixTopBar.outerHeight();
			var checkPoint = offsetTop + wrapH - fixTopBarH;

			if (scrollTop >= checkPoint) {
				$fixButton.addClass('is-show');
			} else {
				$fixButton.removeClass('is-show');
			}
		},
	};

	// benefit visual
	var benefitVisual = {
		scroll: function () {
			var $section = $('.benefit-section');

			if (!$section.length) return;

			var scrollTop = $win.scrollTop();
			var winH = $win.height();
			var docH = $doc.height();
			var checkPoint = scrollTop + winH / 2;
			var isBlocking = $('html').hasClass('is-scroll-blocking');

			$section.each(function () {
				var $this = $(this);
				var offsetTop = $this.offset().top;

				if (!isBlocking && !$this.hasClass('is-in') && (checkPoint >= offsetTop || (checkPoint < offsetTop && scrollTop >= docH - winH))) {
					$this.addClass('is-in');
				}
			});
		},
	};

	// common js
	function uiJSCommon() {
		topVisual.init();
	}
	window.uiJSCardDetailCommon = uiJSCommon;

	// uiJSResize
	function uiJSResize() {
		//
	}
	window.uiJSCardDetailResize = uiJSResize;

	// dom ready
	$(function () {
		var $html = $('html');
		var $body = $('body');

		// init
		uiJSCommon();
		uiJSResize();
	});

	// win load, scroll, resize
	$win
		.on('load.uiJS', function () {
			uiJSResize();
			topVisual.scroll();
			benefitVisual.scroll();
		})
		.on('scroll.uiJS', function () {
			topVisual.scroll();
			benefitVisual.scroll();
		})
		.on('resize.uiJS', function () {
			uiJSResize();
			topVisual.scroll();
			benefitVisual.scroll();
		})
		.on('orientationchange', function () {
			uiJSResize();
			topVisual.scroll();
			benefitVisual.scroll();
		});
})(jQuery);
