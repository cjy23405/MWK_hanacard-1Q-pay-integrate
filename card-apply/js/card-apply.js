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

	// form label
	var formLabel = {
		init: function () {
			$('.ui-form-item').each(function () {
				var $this = $(this);
				formLabel.inputed($this);
				$this.addClass('is-init');
			});
		},
		focus: function ($key) {
			var name = $key.attr('data-focus-input');
			var $item = $key.closest('.ui-form-item');
			var $target = $item.find('[data-focus-input-target="' + name + '"]');
			var isButton = $target.is('a, button');

			$target.focus();

			if (isButton) {
				$target.click();
			}

			var targetY = $target.offset().top;
			var scrollTop = $win.scrollTop();
			var winH = $win.height();

			if (!isButton && userAgentCheck.isIos && targetY - scrollTop > winH / 4) {
				setTimeout(function () {
					$win.scrollTop(targetY - winH / 4);
				}, 0);
			}
		},
		inputed: function ($item) {
			var $inputs = $item.find('input, .in-select').filter(function () {
				var $this = $(this);
				var $parentSide = $this.closest('.ui-form-side, .ui-form-fix-side');

				if ($parentSide.length > 0) {
					return false;
				} else {
					return true;
				}
			});
			var isInputed = false;

			$inputs.each(function () {
				var $this = $(this);
				var val = $this.val() || '';
				var isCheckbox = $this.is('[type="checkbox"], [type="radio"]');

				if ($this.hasClass('in-select')) {
					val = $(this).text() || '';
				}

				if ((isCheckbox && $this.is(':checked')) || (!isCheckbox && typeof val === 'string' && val.length)) {
					isInputed = true;
					return false;
				}
			});

			if (isInputed) {
				$item.addClass('is-form-inputed');
			} else {
				$item.removeClass('is-form-inputed');
			}
		},
	};
	$doc
		.on('click.formLabel', '.ui-form-key[data-focus-input]', function () {
			formLabel.focus($(this));
		})
		.on('focus.formLabel blur.formLabel keydown.formLabel keyup.formLabel change.formLabel securityKeypadOpened.formLabel securityKeypadClosed.formLabel', '.ui-form-item', function () {
			formLabel.inputed($(this));
		})
		.on('securityKeypadOpened.formLabel', '.ui-form-item', function () {
			var $this = $(this);
			$this.addClass('is-security-keypad-opened');
		})
		.on('securityKeypadClosed.formLabel', '.ui-form-item', function () {
			var $this = $(this);
			$this.removeClass('is-security-keypad-opened');
		});

	// security keypad
	function uiJSSecurityKeypadOpened($input, isOpened) {
		if (isOpened) {
			$input.trigger('securityKeypadOpened');
		} else {
			$input.trigger('securityKeypadClosed');
		}
	}
	window.uiJSSecurityKeypadOpened = uiJSSecurityKeypadOpened;

	// apply slide banner
	var applySlideBanner = {
		init: function () {
			$('.apply-slide-banner').each(function () {
				var $this = $(this);
				var $list = $this.find('.apply-slide-banner-list');
				var $item = $this.find('.apply-slide-banner-item');
				// var $controller = $this.find('.slide-banner-controller');
				var autoHeightOption = $(this).hasClass('type-fix-height') ? false : true;
				var length = $item.length;

				if (length <= 1) {
					$this.addClass('is-once');
				}

				$list.swiperSet({
					pageControl: true,
					// pagination: {
					// 	type: 'fraction',
					// },
					autoHeight: autoHeightOption,
					autoplay: {
						delay: 3500,
					},
					loop: true,
				});
			});
		},
	};

	// card design
	var cardDesign = {
		init: function () {
			$('.card-design').each(function () {
				var $wrap = $(this);

				if ($wrap.hasClass('is-init')) return;

				var $list = $wrap.find('.card-design-list');
				var $frame = $wrap.find('.card-design-frame');
				var $shadow = $wrap.find('.card-design-shadow');
				var $cards = $wrap.find('.card-design-card');
				var $textItems = $wrap.find('.card-design-text-item');

				$wrap.addClass('is-init');

				$cards.each(function () {
					var $this = $(this);
					var $img = $this.find('.card-design-card-object img');
					var imgHTML = '';

					if ($img.length) {
						imgHTML = '<img src="' + $img.attr('src') + '" alt="" onerror="this.parentNode.className += \' is-error\';" />';
					}

					$this.append('<div class="card-design-card-back"><div class="card-image"><div class="card-image-inner">' + imgHTML + '</div></div></div>');
					$shadow.append('<div class="card-design-shadow-item"><div class="card-image"><div class="card-image-inner">' + imgHTML + '</div></div></div>');
				});

				var $shadowItems = $shadow.find('.card-design-shadow-item');

				function update(i) {
					$frame.css('opacity', 1);
					$textItems.css('opacity', 0).eq(i).css('opacity', 1);
					$shadowItems.css('opacity', 0).eq(i).css('opacity', 0.7);
				}

				$list.swiperSet({
					a11yHidden: true,
					slidesPerView: 'auto',
					centeredSlides: true,
					touchEventsTarget: 'container',
					on: {
						init: function (swiper) {
							var index = swiper.realIndex;
							update(index);
							$wrap.trigger('cardDesignInit', [index]);
						},
						slideChange: function (swiper) {
							var index = swiper.realIndex;
							update(index);
							$wrap.trigger('cardDesignChange', [index]);
						},
						setTranslate: function (swiper, translate) {
							var crrPosition = Math.round(translate);
							var crrIndex = swiper.snapIndex;
							var prevIndex = crrIndex - 1;
							var nextIndex = crrIndex + 1;
							var crrGrid = swiper.snapGrid[crrIndex] * -1;
							var prevGrid = (function () {
								if (typeof swiper.snapGrid[prevIndex] === 'number') {
									return swiper.snapGrid[prevIndex] * -1;
								} else {
									return null;
								}
							})();
							var nextGrid = (function () {
								if (typeof swiper.snapGrid[nextIndex] === 'number') {
									return swiper.snapGrid[nextIndex] * -1;
								} else {
									return null;
								}
							})();
							var direction = (function () {
								if (translate > crrGrid) {
									return 'prev';
								} else if (translate < crrGrid) {
									return 'next';
								} else {
									return 'none';
								}
							})();
							var animateIndex = (function () {
								if (direction === 'prev' && prevGrid) {
									return prevIndex;
								} else if (direction === 'next' && nextGrid) {
									return nextIndex;
								} else {
									return null;
								}
							})();
							var movePer = (function () {
								if (direction === 'prev' && prevGrid) {
									return Number(((1 / (prevGrid - crrGrid)) * (crrPosition - crrGrid)).toFixed(8));
								} else if (direction === 'next' && nextGrid) {
									return Number(((1 / (crrGrid - nextGrid)) * (crrGrid - crrPosition)).toFixed(8));
								} else {
									return 0;
								}
							})();
							var crrOpacityPer = (function () {
								if (movePer > 0.4) {
									return 0;
								} else if (movePer < 0) {
									return 1;
								} else {
									return 1 - movePer * 2.5;
								}
							})();
							var nextOpacityPer = (function () {
								if (movePer > 1) {
									return 1;
								} else if (movePer < 0.6) {
									return 0;
								} else {
									return 1 - (1 - movePer) * 2.5;
								}
							})();
							var frameOpacityPer = (function () {
								var sum = 0;

								if (movePer <= 0.1 && movePer >= 0) {
									sum = 1 - movePer * 10;
								} else if (movePer >= 0.9 || movePer <= 1) {
									sum = 1 - (1 - movePer) * 10;
								}

								if (sum > 1) {
									return 1;
								} else if (sum < 0) {
									return 0;
								} else {
									return sum;
								}
							})();

							$frame.css('opacity', frameOpacityPer);
							$textItems.eq(crrIndex).css('opacity', crrOpacityPer);
							$shadowItems.eq(crrIndex).css('opacity', 0.7 * crrOpacityPer);

							if (typeof animateIndex === 'number') {
								$textItems.eq(animateIndex).css('opacity', nextOpacityPer);
								$shadowItems.eq(animateIndex).css('opacity', 0.7 * nextOpacityPer);
							}
						},
					},
				});
			});
		},
		scroll: function () {
			var scrollTop = $win.scrollTop();
			var $top = $('.fix-top-wrap');
			var topH = $top.length ? $top.outerHeight() : 0;

			$('.card-design').each(function () {
				var $wrap = $(this);

				if (!$wrap.hasClass('is-init')) return;

				var $container = $wrap.find('.card-design-container');
				var $frame = $wrap.find('.card-design-frame');
				var $shadow = $wrap.find('.card-design-shadow');
				var $crrItem = $wrap.find('.card-design-item.swiper-slide-active');
				var $crrCard = $crrItem.find('.card-design-card');
				var $otherItems = $wrap.find('.card-design-item').not($crrItem);
				var $downButton = $wrap.find('.card-design-down');
				var isVertical = $wrap.hasClass('type-vertical');
				var isNoRotated = $wrap.hasClass('type-no-rotated');
				var offsetTop = $container.offset().top;
				var startPoint = offsetTop - topH;
				var $bgHeight = $wrap.find('.card-bg');
				var moveHeight = isVertical ? 189 : 142;
				var movePer = (function () {
					if (scrollTop < startPoint) {
						return 0;
					} else if (scrollTop > startPoint + moveHeight) {
						return 1;
					} else {
						return Number(((1 / (startPoint + moveHeight - startPoint)) * (scrollTop - startPoint)).toFixed(8));
					}
				})();
				var scalePer = (function () {
					if (movePer <= 0) {
						return 1;
					} else if (movePer >= 1) {
						return 0.4884;
					} else {
						return 1 - 0.5116 * movePer;
					}
				})();
				var positionYPer = (function () {
					if (movePer <= 0) {
						return 0;
					} else if (movePer >= 1) {
						return 20;
					} else {
						return 20 * movePer;
					}
				})();
				var bgHeightPer = (function () {
					if (movePer <= 0) {
						return 236;
					} else if (movePer >= 1) {
						if (isVertical) {
							return 342;
						} else {
							return 268;
						}
					} else {
						if (isVertical) {
							return 236 + 106 * movePer;
						} else {
							return 236 + 32 * movePer;
						}
					}
				})();

				var innerHeight = $win.innerHeight();
				var scrollHeight = $('body').prop('scrollHeight');
				var movePer2 = (function () {
					if (scrollTop < startPoint) {
						return 0;
					} else if (scrollTop > startPoint + moveHeight) {
						return 1;
					} else if (scrollTop + innerHeight + 1 >= scrollHeight) {
						return 1;
					} else {
						return Number(((1 / (startPoint + moveHeight - startPoint)) * (scrollTop - startPoint)).toFixed(8));
					}
				})();

				if (scrollTop > startPoint) {
					$wrap.addClass('swiper-no-swiping');
				} else {
					$wrap.removeClass('swiper-no-swiping');
				}

				$bgHeight.css('height', bgHeightPer + 'px');

				$frame.css({
					'-webkit-transform': 'translateY(' + positionYPer + 'px) scale(' + scalePer + ') translateZ(0)',
					transform: 'translateY(' + positionYPer + 'px) scale(' + scalePer + ') translateZ(0)',
				});
				$shadow.css({
					'-webkit-transform': 'translateY(' + positionYPer + 'px) scale(' + scalePer + ') translateZ(0)',
					transform: 'translateY(' + positionYPer + 'px) scale(' + scalePer + ') translateZ(0)',
				});
				$crrItem.css({
					'-webkit-transform': 'translateY(' + positionYPer + 'px) scale(' + scalePer + ') translateZ(0)',
					transform: 'translateY(' + positionYPer + 'px) scale(' + scalePer + ') translateZ(0)',
				});
				if (!isNoRotated) {
					$crrCard.css({
						'-webkit-transform': 'rotateY(' + -180 * movePer2 + 'deg) translateZ(0)',
						transform: 'rotateY(' + -180 * movePer2 + 'deg) translateZ(0)',
					});
				}
				$otherItems.css({
					opacity: 1 - movePer,
					'-webkit-transform': 'translateY(' + positionYPer + 'px) scale(' + scalePer + ') translateZ(0)',
					transform: 'translateY(' + positionYPer + 'px) scale(' + scalePer + ') translateZ(0)',
				});
				if (scrollTop > startPoint + moveHeight - 1) {
					if (!$downButton.hasClass('is-hide')) {
						$downButton.stop().addClass('is-hide').fadeOut(300);
					}
				} else {
					if ($downButton.hasClass('is-hide')) {
						$downButton.stop().removeClass('is-hide').fadeIn(300);
					}
				}
			});
		},
		goScroll: function ($wrap) {
			if (!$wrap.hasClass('is-init')) return;

			var $top = $('.fix-top-wrap');
			var topH = $top.length ? $top.outerHeight() : 0;
			var $container = $wrap.find('.card-design-container');
			var isVertical = $wrap.hasClass('type-vertical');
			var offsetTop = $container.offset().top;
			var moveHeight = isVertical ? 189 : 142;
			var afterScrollTop = offsetTop - topH + moveHeight;
			var scrollTop = $win.scrollTop();

			if (scrollTop < afterScrollTop) {
				$('html').stop().animate(
					{
						scrollTop: afterScrollTop,
					},
					350
				);
			}
		},
	};
	$doc
		.on('click.cardDesign', '.card-design-down', function () {
			cardDesign.goScroll($(this).closest('.card-design'));
		})
		.on('click.cardDesign', '.js-card-design-scroll', function () {
			cardDesign.goScroll($('.card-design').eq(0));
		});

	// 2023.03.21 : add : 스크립트 추가 : start
	// auth select
	var authSelect = {
		init: function ($root) {
			if (!$root) {
				$root = $doc;
			}

			var $html = $('html');

			$html.removeClass('is-auth-selected-in is-auth-selected');

			$root.find('.auth-wrap').each(function () {
				var $wrap = $(this);
				var isInit = $wrap.hasClass('is-init');
				var isTwin = $wrap.hasClass('type-twin');

				if (isTwin) {
					$html.addClass('is-auth-twin');
				}

				if (isInit || isTwin) return;

				$wrap.addClass('is-init');

				var $scroller = $wrap.find('.auth-select-scroller');
				var $list = $wrap.find('.auth-select-list');
				var $items = $wrap.find('.auth-select-item');
				var $checkboxs = $wrap.find('.auth-select-checkbox');
				var $formInners = $wrap.find('.auth-form-inner');
				var listPosition = {
					top: 0,
					left: 0,
				};
				var beforeCSS = [];
				var afterCSS = [];

				$wrap.removeClass('is-auth-selected-in is-transition is-auth-selected is-auth-selected-scroll');
				$scroller.scrollLeft(0);
				$items.removeAttr('style');
				$checkboxs.prop('checked', false).removeAttr('checked');

				$scroller.on('scroll.authSelect', function () {
					authSelect.blockLeft = $scroller.scrollLeft();
				});

				$checkboxs.off('change.authSelect').on('change.authSelect', function () {
					var isSelectedIn = $wrap.hasClass('is-auth-selected-in');

					if (!isSelectedIn) {
						$wrap.addClass('is-auth-selected-in');

						$win.scrollTop(0);

						listPosition = $list.offset();

						$items.each(function (i) {
							var $this = $(this);
							var position = $this.offset();

							beforeCSS[i] = {
								top: position.top - listPosition.top,
								left: position.left - listPosition.left,
							};
						});

						$wrap.addClass('is-auth-selected');

						$scroller.scrollLeft(0);

						$items.each(function (i) {
							var $this = $(this);
							var position = $this.offset();

							afterCSS[i] = {
								top: position.top - listPosition.top,
								left: position.left - listPosition.left,
							};
						});

						$wrap.removeClass('is-auth-selected');

						setTimeout(function () {
							$wrap.addClass('is-transition');
							$wrap.addClass('is-auth-selected');
							$html.addClass('is-auth-selected');

							var lastI = $items.length - 1;

							$items.each(function (i) {
								var $this = $(this);

								if (i > 1) {
									$this
										.css({
											position: 'absolute',
											top: beforeCSS[i].top,
											left: beforeCSS[i].left,
										})
										.animate(
											{
												top: afterCSS[i].top,
												left: afterCSS[i].left,
											},
											300,
											function () {
												$this.removeAttr('style');

												if (i === lastI && !$wrap.hasClass('is-auth-selected-scroll')) {
													$wrap.addClass('is-auth-selected-scroll');
													$html.addClass('is-auth-selected-scroll');
													// 2023.03.29 : mod : 포커스 기능 원상복구 : start
													authSelect.scrollUpdate($scroller, function () {
														setTimeout(function () {
															authSelect.formFocus($formInners.filter(':visible'));
														}, 1000);
													});
													// 2023.03.29 : mod : 포커스 기능 원상복구 : end
												}
											}
										);
								}
							});
						}, 0);
					}
				});
			});
		},
		beforeLeft: 0,
		scrollUpdate: function ($scroller, callback) {
			var $inner = $scroller.find('.auth-select-inner');
			var $checkedCheckbox = $scroller.find('.auth-select-checkbox:checked');
			var $block = $checkedCheckbox.closest('.auth-select-block');
			var scrollerW = $scroller.width();
			var blockW = $block.outerWidth();
			var innerLeft = $inner.offset().left;
			var blockLeft = $block.offset().left;
			var left = blockLeft - innerLeft - (scrollerW / 2 - blockW / 2);

			$scroller
				.stop()
				.scrollLeft(authSelect.blockLeft)
				.animate(
					{
						scrollLeft: left,
					},
					300,
					function () {
						if (typeof callback === 'function') {
							callback();
						}
					}
				);
		},
		/* 2023.03.29 : add : 스크립트 추가 : start */
		formFocus: function ($formInner) {
			if (!$formInner.length) return;

			var $target = $formInner.find('.in-input:visible, .in-select:visible').eq(0);

			if (!$target.length) return;

			if ($target.is('.in-select')) {
				$target.click();
			} else {
				$target.focus();
			}
		},
		/* 2023.03.29 : add : 스크립트 추가 : end */
	};

	$doc
		.on('focus.authSelect', '.auth-select-scroller', function () {
			var $scroller = $(this);
			var left = $scroller.scrollLeft();

			if (authSelect.blockLeft !== left) {
				authSelect.blockLeft = authSelect.blockLeft;
			}
		})
		.on('change.authSelect', '.auth-select-checkbox', function () {
			var $this = $(this);
			var $wrap = $this.closest('.auth-wrap');
			var isInit = $wrap.hasClass('is-init');
			var isTwin = $wrap.hasClass('type-twin');

			if (!isInit || isTwin) return;

			var $scroller = $this.closest('.auth-select-scroller');
			var $formInners = $wrap.find('.auth-form-inner'); // 2023.03.29 : add : 스크립트 추가

			authSelect.scrollUpdate($scroller);
			authSelect.formFocus($formInners.filter(':visible')); // 2023.03.29 : add : 스크립트 추가
		});
	// 2023.03.21 : add : 스크립트 추가 : end

	/*
	// page class
	function pageClass() {
		var $html = $('html');

		function registerClass(pageSelector, className) {
			var isPage = (function () {
				var result = false;

				for (var i = 0; i <= pageSelector.length; i++) {
					if ($(pageSelector[i]).length) {
						result = true;
						break;
					}
				}

				return result;
			})();

			if (isPage) {
				if (!$html.hasClass(className)) {
					$html.addClass(className);
				}
			} else {
				if ($html.hasClass(className)) {
					$html.removeClass(className);
				}
			}
		}

		registerClass(['.page-contents.type-ocr'], 'ocr-page');
	}
	*/

	// common js
	function uiJSCommon() {
		/* pageClass(); */
		formLabel.init();
		cardDesign.init();
		authSelect.init(); // 2023.03.21 : add : 스크립트 추가
		applySlideBanner.init(); // 2023.04.18 : add : 스크립트 추가
	}
	window.uiJSCardApplyCommon = uiJSCommon;

	// uiJSResize
	function uiJSResize() {
		//
	}
	window.uiJSCardApplyResize = uiJSResize;

	// area focus
	function areaFocus(area) {
		$doc
			.on('focus.areaFocus', area, function (e) {
				var $this = $(this);
				var timer = $this.data('areaFocusTimer');
				var $target = $(e.target);
				var isIgnore = $target.is('.ui-form-side, .ui-form-fix-side') || $target.closest('.ui-form-side, .ui-form-fix-side').length > 0;

				if (!isIgnore) {
					clearTimeout(timer);
					$this.addClass('is-focus').trigger('areaFocusIn');
				}
			})
			.on('blur.areaFocus', area, function () {
				var $this = $(this);
				var timer = $this.data('areaFocusTimer');

				clearTimeout(timer);
				$this.data(
					'areaFocusTimer',
					setTimeout(function () {
						$this.removeClass('is-focus').trigger('areaFocusOut');
					}, 100)
				);
			});
	}
	areaFocus('.in-input-block');
	areaFocus('.ui-form-item');

	// inputed
	function inputedCheck($input, parent) {
		var val = $input.val();
		var $wrap = $input.closest(parent);

		if ($wrap.length) {
			if (typeof val === 'string' && val.length > 0) {
				$wrap.addClass('is-inputed');
			} else {
				$wrap.removeClass('is-inputed');
			}
		}
	}
	$doc.on('focus.inputedCheck blur.inputedCheck keydown.inputedCheck keyup.inputedCheck change.inputedCheck', '.in-input', function () {
		inputedCheck($(this), '.in-input-block');
	});

	// input delete
	$doc
		.on('focus.inputDelete', 'input.in-input', function () {
			var $this = $(this);
			var $wrap = $this.closest('.in-input-block');
			var isNoDelete = $wrap.hasClass('type-no-delete');
			var type = $this.attr('type');
			var isText = Boolean(type.match(/text|password|search|email|url|number|tel|date|time/));
			var $delete = $wrap.find('.in-input-delete');
			var isDisabled = $this.is('[readonly]') || $this.is('[disabled]');

			if (isText && !isNoDelete) {
				if (!$delete.length && !isDisabled) {
					$wrap.append('<button type="button" class="in-input-delete"><span class="for-a11y">입력 내용 지우기</span></button>');
					$delete = $wrap.find('.in-input-delete');
				}

				if (isDisabled) {
					$delete.prop('disabled', true).attr('disabled', '');
				} else {
					$delete.prop('disabled', false).removeAttr('disabled', '');
				}
			}
		})
		.on('click.inputDelete', '.in-input-delete', function () {
			var $this = $(this);
			var $input = $this.closest('.in-input-block').find('.in-input');

			$input.val('').trigger('focus');
		});

	// invalid
	$.fn.uiFormInvalid = function (isInvalid, message) {
		message = typeof message === 'string' ? message : '';

		this.each(function () {
			var $this = $(this);
			var $el = (function () {
				if ($this.is('.in-select, .in-input')) {
					return $this.closest('.in-select-block, .in-input-block');
				} else {
					return $this;
				}
			})();
			var $formFlex = $el.closest('.flex-box');
			var $formItem = $el.closest('.ui-form-item');
			var isFlex = Boolean($formFlex.length);
			var $target = (function () {
				if (isFlex) {
					return $formFlex;
				} else {
					return $el;
				}
			})();
			var $message = $target.next('.ui-form-invalid-message');

			if (typeof isInvalid === 'boolean' && isInvalid) {
				if (!$message.length) {
					$message = $('<p class="ui-form-invalid-message" aria-role="alert" aria-live="assertive"></p>');
					$target.after($message);
				}

				if ($this.attr('tabindex')) {
					$this.focus();
				} else {
					$this.attr('tabindex', '-1').focus().removeAttr('tabindex');
				}

				$message.html(message.replace(/\n/g, '<br />'));

				$el.addClass('is-invalid');
				$formItem.addClass('is-invalid');
			} else {
				if ($message.length) {
					$message.remove();
				}

				$el.removeClass('is-invalid');
				$formItem.removeClass('is-invalid');
			}
		});

		return $(this);
	};

	// getOffsetTop
	function getOffsetTop($target, margin) {
		var $top = $('.fix-top-wrap');
		var $fixTopElements = $('.js-fix-top-element');
		var topH = $top.length ? $top.outerHeight() : 0;
		var offsetTop = $target.is(':visible') ? $target.offset().top : 0;
		var scrollTop = offsetTop - topH - (typeof margin === 'number' ? margin : 40);

		if ($fixTopElements.length) {
			$fixTopElements.each(function () {
				var $this = $(this);
				if (!$this.is(':visible')) {
					return;
				}
				scrollTop -= $this.outerHeight();
			});
		}

		return scrollTop;
	}

	// scroll to input when keyboard opened
	var scrollToInput = {
		input:
			'textarea:focus, [type="text"]:focus, [type="password"]:focus, [type="search"]:focus, [type="email"]:focus, [type="url"]:focus, [type="number"]:focus, [type="tel"]:focus, [type="date"]:focus, [type="time"]:focus',
		update: function () {
			var $input = $(scrollToInput.input);

			if (!$input.length) return;

			var offsetTop = getOffsetTop($input, 100);

			$win.scrollTop(offsetTop);

			setTimeout(function () {
				$win.scrollTop(offsetTop);
			}, 0);
		},
	};

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
			cardDesign.scroll();
		})
		.on('scroll.uiJS', function () {
			cardDesign.scroll();
		})
		.on('resize.uiJS', function () {
			uiJSResize();
			cardDesign.scroll();
		})
		.on('orientationchange.uiJS', function () {
			uiJSResize();
			cardDesign.scroll();
		})
		.on('keyboardOpened.uiJS', function () {
			scrollToInput.update();
		})
		.on('keyboardClosed.uiJS', function () {
			//
		});

	// visualViewport resize
	var uiJSVisualViewport = {
		resize: function () {
			var _ = uiJSVisualViewport;
			var width = window.visualViewport.width;
			var height = window.visualViewport.height;
			var gapHeight = height - _.height;

			if (_.width === width) {
				if (gapHeight < -150) {
					$win.trigger('keyboardOpened');
				} else if (gapHeight > 150) {
					$win.trigger('keyboardClosed');
				}
			}

			_.width = width;
			_.height = height;
		},
		width: 0,
		height: 0,
	};
	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', uiJSVisualViewport.resize);
	}
})(jQuery);
