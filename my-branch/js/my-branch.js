/******************************************************************************/
/*********************************** EASING ***********************************/
/******************************************************************************/
(function () {
	// Based on easing equations from Robert Penner (https://gsgd.co.uk/sandbox/jquery/easing/)

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

	// common
	var $win = $(window);
	var $doc = $(document);

	// top visual
	var topVisual = {
		init: function () {
			$('.branch-visual').each(function () {
				var $wrap = $(this);

				if ($wrap.data('branchInit')) return;

				$wrap.data('branchInit', true);

				var $view = $wrap.find('.branch-visual-view');
				var $slide = $wrap.find('.branch-visual-slide-list');
				var $contents = $wrap.find('.branch-visual-contents');
				var $contentsItems = $contents.find('.branch-visual-contents-item');
				var $contentsItemsAll = null;
				var length = $contentsItems.length;
				var lengthAll = 0;
				var preActiveI = 0;

				$slide.swiperSet({
					loop: true,
					pageControl: true,
					followFinger: false,
					speed: 900,
					on: {
						init: function (swiper) {
							$contentsItems.each(function () {
								var $this = $(this);
								var $inner = $this.find('.branch-visual-contents-card-inner');
								var $card = $this.find('.card-image');
								var $shadow = $card.clone();

								$inner.append($shadow);
								$shadow.wrap('<div class="branch-visual-contents-card-shadow"></div>');
							});

							$contents.append($contentsItems.eq(0).clone());
							$contents.prepend($contentsItems.eq(-1).clone());

							$contentsItemsAll = $contents.find('.branch-visual-contents-item');
							lengthAll = $contentsItemsAll.length;
							preActiveI = swiper.realIndex;

							$view.addClass('is-init');

							cardChange(swiper.realIndex, swiper.activeIndex);
						},
						slideChangeTransitionStart: function (swiper) {
							cardChange(swiper.realIndex, swiper.activeIndex);
							preActiveI = swiper.realIndex;
						},
						touchStart: function () {
							$view.addClass('is-touch');
						},
						touchEnd: function () {
							$view.removeClass('is-touch');
						},
					},
				});

				function checkIndex(x) {
					if (x < 0) {
						return lengthAll - 1;
					} else if (x >= lengthAll) {
						return 0;
					} else {
						return x;
					}
				}

				function checkDirection(i) {
					var maxI = length - 1;
					if (i === preActiveI) {
						return 'none';
					} else if (i === maxI) {
						if (preActiveI === 0) {
							return 'prev';
						} else {
							return 'next';
						}
					} else if (i === 0) {
						if (preActiveI === maxI) {
							return 'next';
						} else {
							return 'prev';
						}
					} else {
						if (preActiveI < i) {
							return 'next';
						} else {
							return 'prev';
						}
					}
				}

				function getBeforePosition($item) {
					var $info = $item.find('.branch-visual-contents-info');
					var $card = $item.find('.branch-visual-contents-card');

					$info.stop().css('transform', 'translateX(0) translateZ(0)');
					$card.stop().css('transform', 'translateX(0) translateZ(0)');

					var infoLeft = $info.offset().left;
					var cardLeft = $card.offset().left;

					$info.data('beforeLeft', infoLeft);
					$card.data('beforeLeft', cardLeft);
				}

				function animatePosition($item, is) {
					var $info = $item.find('.branch-visual-contents-info');
					var $card = $item.find('.branch-visual-contents-card');
					var infoBeforeLeft = $info.data('beforeLeft');
					var cardBeforeLeft = $card.data('beforeLeft');
					var infoAfterLeft = $info.offset().left;
					var cardAfterLeft = $card.offset().left;
					var infoSetLeft = infoBeforeLeft - infoAfterLeft;
					var cardSetLeft = cardBeforeLeft - cardAfterLeft;
					var infoSpeed = (function () {
						if (is === 'active' || is === 'nextIn') {
							return 700;
						} else {
							return 200;
						}
					})();
					var cardSpeed = (function () {
						if (is === 'active') {
							return 750;
						} else {
							return 200;
						}
					})();
					var easing = (function () {
						if (is === 'active') {
							return 'easeOutBack';
						} else {
							return 'swing';
						}
					})();

					$info
						.css('transform', 'translateX(' + infoSetLeft + 'px) translateZ(0)')
						.prop('transformPer', 1)
						.animate(
							{
								transformPer: 0,
							},
							{
								duration: infoSpeed,
								easing: easing,
								step: function (now, fx) {
									if (fx.prop === 'transformPer') {
										$info.css('transform', 'translateX(' + now * infoSetLeft + 'px) translateZ(0)');
									}
								},
							}
						);

					$card.css('transform', 'translateX(' + cardSetLeft + 'px) translateZ(0)').prop('transformPer', 1);

					if (is === 'active') {
						$card.delay(150);
					}

					$card.animate(
						{
							transformPer: 0,
						},
						{
							duration: cardSpeed,
							easing: easing,
							step: function (now, fx) {
								if (fx.prop === 'transformPer') {
									$card.css('transform', 'translateX(' + now * cardSetLeft + 'px) translateZ(0)');
								}
							},
						}
					);
				}

				function cardChange(realI, i) {
					if (!$view.hasClass('is-init')) return;

					var direction = checkDirection(realI);
					var prevI = checkIndex(i - 1);
					var nextI = checkIndex(i + 1);
					var prevBeforeI = checkIndex(prevI - 1);
					var nextAfterI = checkIndex(nextI + 1);
					var $activeItem = $contentsItemsAll.eq(i);
					var $prevItem = $contentsItemsAll.eq(prevI);
					var $nextItem = $contentsItemsAll.eq(nextI);
					var $prevBeforeItem = $contentsItemsAll.eq(prevBeforeI);
					var $nextAfterItem = $contentsItemsAll.eq(nextAfterI);
					var isDirectionPrev = direction === 'prev';
					var isDirectionNext = direction === 'next';

					$contentsItemsAll.removeClass('is-active is-prev is-next is-prev-before is-next-after');

					if (isDirectionPrev) {
						$activeItem.addClass('is-prev');
						$prevItem.addClass('is-prev-before');
						$nextItem.addClass('is-active');
						$prevBeforeItem.addClass('is-prev-before');
						$nextAfterItem.addClass('is-next');
					} else if (isDirectionNext) {
						$activeItem.addClass('is-next');
						$prevItem.addClass('is-active');
						$nextItem.addClass('is-next-after');
						$prevBeforeItem.addClass('is-prev');
						$nextAfterItem.addClass('is-next-after');
					}

					if (isDirectionPrev || isDirectionNext) {
						getBeforePosition($activeItem);
						getBeforePosition($prevItem);
						getBeforePosition($nextItem);
						getBeforePosition($prevBeforeItem);
						getBeforePosition($nextAfterItem);
					}

					$contentsItemsAll.removeClass('is-active is-prev is-next is-prev-before is-next-after');
					$activeItem.addClass('is-active');
					$prevItem.addClass('is-prev');
					$nextItem.addClass('is-next');
					$prevBeforeItem.addClass('is-prev-before');
					$nextAfterItem.addClass('is-next-after');

					if (isDirectionPrev || isDirectionNext) {
						animatePosition($activeItem, 'active');
						animatePosition($prevItem);
						animatePosition($nextItem, isDirectionNext ? 'nextIn' : null);
						animatePosition($prevBeforeItem);
						animatePosition($nextAfterItem);
					}
				}
			});
		},
	};

	// branch nav
	var branchNav = {
		init: function () {
			$('.branch-nav-area').each(function () {
				var isOpened = false;
				var $fixedWrap = $('.branch-nav-area.type-fixed');
				var $fixedItem = $fixedWrap.find('.js-ui-accordion__item');
				var $normalWrap = $('.branch-nav-area.type-normal');
				var $normalItem = $normalWrap.find('.js-ui-accordion__item');

				$fixedItem.off('uiAccordionOpened.branchNav').on('uiAccordionOpened.branchNav', function () {
					if (!isOpened) {
						isOpened = true;

						$normalWrap.uiAccordion('open', $normalItem);
					}
					isOpened = false;
				});
				$normalItem.off('uiAccordionOpened.branchNav').on('uiAccordionOpened.branchNav', function () {
					if (!isOpened) {
						isOpened = true;

						$fixedWrap.uiAccordion('open', $fixedItem);
					}
					isOpened = false;
				});
				$fixedItem.off('uiAccordionClosed.branchNav').on('uiAccordionClosed.branchNav', function () {
					if (!isOpened) {
						isOpened = true;

						$normalWrap.uiAccordion('close', $normalItem);
					}
					isOpened = false;
				});
				$normalItem.off('uiAccordionClosed.branchNav').on('uiAccordionClosed.branchNav', function () {
					if (!isOpened) {
						isOpened = true;

						$fixedWrap.uiAccordion('close', $fixedItem);
					}
					isOpened = false;
				});
			});
		},
		initPosition: function () {
			$('.branch-nav-contents').each(function () {
				branchNav.positionUpdate($(this));
			});
		},
		positionUpdate: function ($scroller) {
			var $activeItem = (function () {
				var $el = $scroller.find('.branch-nav-link.is-active');

				if ($el.length) {
					return $el.closest('.branch-nav-item');
				} else {
					return null;
				}
			})();

			var $list = null;
			var itemLeft = null;
			var listLeft = null;
			var listMarginLeft = null;
			var listPaddingLeft = null;
			var scrollLeft = null;

			if ($activeItem && $activeItem.length) {
				$scroller.scrollLeft(0);

				$list = $scroller.find('.branch-nav-list');
				itemLeft = $activeItem.offset().left;
				listLeft = $list.offset().left;
				listMarginLeft = Number($list.css('margin-left').replace(/px/g, ''));
				listPaddingLeft = Number($list.css('padding-left').replace(/px/g, ''));
				scrollLeft = itemLeft - listLeft + listMarginLeft - listPaddingLeft;

				$scroller.scrollLeft(scrollLeft);
			}
		},
		scroll: function () {
			var $fixNav = $('.branch-nav-area.type-fixed');
			var $branchNav = $('.branch-nav-area.type-normal');
			var branchNavH = $branchNav.outerHeight();
			var scrollTop = $win.scrollTop();
			var offsetTop = $branchNav.offset().top;
			var checkPoint = offsetTop + branchNavH;

			if (scrollTop >= checkPoint) {
				$fixNav.addClass('is-show');
			} else {
				$fixNav.removeClass('is-show');
			}
		},
	};

	$doc
		.on('uiAccordionClosed.branchNav', '.branch-nav-area.type-fixed', function () {
			var $this = $(this);
			var $scroller = $this.find('.branch-nav-contents');

			branchNav.positionUpdate($scroller);
		})
		.on('click.branchNav', '.branch-nav-link', function (e) {
			var $wrap = $('.branch-nav-area');

			$wrap.uiAccordion('allClose');
		});

	// common js
	function uiJSCommon() {
		topVisual.init();
		branchNav.init();
	}
	window.uiJSMyBranchCommon = uiJSCommon;

	// uiJSResize
	function uiJSResize() {
		//
	}
	window.uiJSMyBranchResize = uiJSResize;

	// dom ready
	$(function () {
		var $html = $('html');
		var $body = $('body');

		// init
		uiJSCommon();
		uiJSResize();

		// branchNav
		branchNav.initPosition();
	});

	// win load, scroll, resize
	$win
		.on('load.uiJS', function () {
			uiJSResize();
			branchNav.scroll();
		})
		.on('scroll.uiJS', function () {
			branchNav.scroll();
		})
		.on('resize.uiJS', function () {
			uiJSResize();
			branchNav.scroll();
		})
		.on('orientationchange.uiJS', function () {
			uiJSResize();
			branchNav.scroll();
		});
})(jQuery);
