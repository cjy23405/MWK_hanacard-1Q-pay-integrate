(function ($) {
	var userAgent = navigator.userAgent;
	var userAgentCheck = {
		ieMode: document.documentMode,
		isIos: Boolean(userAgent.match(/iPod|iPhone|iPad/)),
		isAndroid: Boolean(userAgent.match(/Android/)),
	};
	if (userAgent.match(/Edge/gi)) {
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

	// swiperSet
	// https://github.com/nolimits4web/swiper/blob/Swiper5/API.md
	// init ex: $(element).swiperSet({/* customOptions */});
	// method ex: $(element).data('swiper').update();
	$.fn.swiperSet = function (customOption) {
		var defaultOption = {
			wrapTagName: 'div',
			containerTagName: 'div',
			customClass: null,
			appendController: null,
			pageControl: false,
			nextControl: false,
			prevControl: false,
			playControl: false,
			pauseControl: false,
			togglePlayControl: false,
			scrollbarControl: false,
			observer: true,
			observeParents: true,
			a11yHidden: false,
			//slideToClickedSlide: true,//22.07.21 슬라이드 옵션 추가
			//centeredSlides: true,//22.07.21 슬라이드 옵션 추가
			a11y: {
				firstSlideMessage: '첫번째 슬라이드',
				lastSlideMessage: '마지막 슬라이드',
				nextSlideMessage: '다음 슬라이드',
				prevSlideMessage: '이전 슬라이드',
				paginationBulletMessage: '{{index}}번째 슬라이드로 이동',
			},
			on: {},
		};

		this.each(function () {
			var option = $.extend({}, defaultOption, customOption);

			if (!(typeof customOption.a11y === 'object')) {
				customOption.a11y = {};
			}

			$.extend(option.a11y, defaultOption.a11y, customOption.a11y);

			var $this = $(this);
			var isA11y = !(typeof option.a11y.enabled === 'boolean' && !option.a11y.enabled);

			if ($this.data('swiper') || !$.isFunction(window.Swiper)) return;

			var $items = $this.children();
			var length = $items.length;

			if (!$this.parent('.swiper').length) {
				$this.wrap('<' + option.wrapTagName + ' class="swiper-object"><' + option.containerTagName + ' class="swiper"></' + option.containerTagName + '></' + option.wrapTagName + '>');
			}
			$this.addClass('swiper-wrapper');

			$items.addClass('swiper-slide').each(function (i) {
				var $this = $(this);

				$this.attr('data-swiper-set-slide-index', i);

				if (isA11y && userAgentCheck.isAndroid) {
					$this.attr('title', i + 1 + '/' + length);
				}
			});

			var $container = $this.parent('.swiper');
			var $wrap = $container.parent('.swiper-object');
			var $appendController = $wrap;
			var length = $items.length;

			if (typeof option.customClass === 'string') {
				$wrap.addClass(option.customClass);
			}

			option.pagination = option.pagination || {};
			option.navigation = option.navigation || {};
			option.scrollbar = option.scrollbar || {};

			option.autoplay = length > 1 && option.autoplay ? option.autoplay : false;
			option.loop = length > 1 && option.loop ? option.loop : false;

			if (option.appendController) {
				$appendController = $(option.appendController);
			}

			if (length === 1) {
				$wrap.addClass('swiper-object-once');
				//$wrap.find('.swiper').css("text-align", "center");
				//$wrap.find('.swiper-wrapper').css("display", "inline-block").css("width", "inherit");
				//if($('#card-detail').length){$('.swiper-wrapper').css("display", "inherit");}
			} else if (length <= 0) {
				$wrap.addClass('swiper-object-empty');
			}

			if (option.prevControl) {
				$appendController.append('<button type="button" class="swiper-button-prev"><span class="swiper-button-prev-text">이전 슬라이드</span></button>');
				option.navigation.prevEl = $appendController.find('.swiper-button-prev').get(0);
			}
			if (option.nextControl) {
				$appendController.append('<button type="button" class="swiper-button-next"><span class="swiper-button-next-text">다음 슬라이드</span></button>');
				option.navigation.nextEl = $appendController.find('.swiper-button-next').get(0);
			}
			if (option.scrollbarControl) {
				$appendController.append('<span class="swiper-scrollbar"></span>');
				option.scrollbar.el = $appendController.find('.swiper-scrollbar').get(0);
			}
			if (option.playControl) {
				$appendController.append('<button type="button" class="swiper-button-play"><span class="swiper-button-play-text">자동 슬라이드 재생</span></button>');
				option.playButton = $appendController.find('.swiper-button-play').get(0);
			}
			if (option.pauseControl) {
				$appendController.append('<button type="button" class="swiper-button-pause"><span class="swiper-button-pause-text">자동 슬라이드 정지</span></button>');
				option.pauseButton = $appendController.find('.swiper-button-pause').get(0);
			}
			if (option.togglePlayControl) {
				$appendController.append('<button type="button" class="swiper-button-toggle-play"><span class="swiper-button-toggle-play-text">자동 슬라이드 재생</span></button>');
				option.togglePlayButton = $appendController.find('.swiper-button-toggle-play').get(0);
			}
			if (option.pageControl) {
				$appendController.append('<span class="swiper-pagination"></span>');
				option.pagination.el = $appendController.find('.swiper-pagination').get(0);
			}
			if (option.autoplay && option.playControl) {
				$(option.playButton).addClass('active').attr('disabled', '').prop('disabled', true);
			} else if (!option.autoplay && option.pauseControl) {
				$(option.pauseButton).addClass('active').attr('disabled', '').prop('disabled', true);
			}
			if (option.autoplay && option.togglePlayControl) {
				$(option.togglePlayButton).addClass('is-pause').removeClass('is-play').find('.swiper-button-toggle-play-text').text('자동 슬라이드 정지');
			} else if (!option.autoplay && option.togglePlayControl) {
				$(option.togglePlayButton).removeClass('is-pause').addClass('is-play').find('.swiper-button-toggle-play-text').text('자동 슬라이드 재생');
			}

			var on = $.extend({}, option.on);
			var isInit = false;

			function callEvent(name, swiper, args1, args2, args3) {
				if (typeof on[name] === 'function') {
					on[name](swiper, args1, args2, args3);
				}
			}

			var bulletClick = false;

			if (option.a11yHidden && option.pagination.clickable) {
				$(option.pagination.el).on('click.swiperSet', '.swiper-pagination-bullet', function () {
					bulletClick = true;
				});
			}

			function setA11yHidden(swiper) {
				var $slides = $(swiper.slides);
				var $activeItem = $slides.eq(swiper.activeIndex);

				if (option.a11yHidden) {
					$activeItem.removeAttr('aria-hidden');
					$slides.not($activeItem).attr('aria-hidden', 'true');
				}
			}

			function init(swiper) {
				var $slides = $(swiper.slides);

				if (!isInit && $slides.length) {
					isInit = true;

					if (isA11y && userAgentCheck.isAndroid) {
						$slides.removeAttr('aria-label role');
					}

					if (option.a11yHidden) {
						$slides.attr('tabindex', '0');
					}

					setA11yHidden(swiper);
				}
			}

			option.on.init = function (swiper) {
				var $slides = $(swiper.slides);

				if (isA11y && userAgentCheck.isAndroid && $slides.length) {
					$slides.removeAttr('aria-label role');
				}

				init(swiper);
				callEvent('init', swiper);
			};

			option.on.observerUpdate = function (swiper) {
				init(swiper);
				callEvent('observerUpdate', swiper);
			};

			option.on.slideChange = function (swiper) {
				setA11yHidden(swiper);

				$container.scrollTop(0).scrollLeft(0);

				callEvent('slideChange', swiper);
			};

			option.on.slideChangeTransitionEnd = function (swiper) {
				var $slides = $(swiper.slides);
				var $activeItem = $slides.eq(swiper.activeIndex);

				if (option.a11yHidden && bulletClick) {
					$activeItem.focus();
				}

				bulletClick = false;

				callEvent('slideChangeTransitionEnd', swiper);
			};

			option.on.autoplayStart = function (swiper) {
				if (option.playControl) {
					$(option.playButton).addClass('active').attr('disabled', '').prop('disabled', true);
				}
				if (option.pauseControl) {
					$(option.pauseButton).removeClass('active').removeAttr('disabled', '').prop('disabled', false);
				}
				if (option.togglePlayButton) {
					$(option.togglePlayButton).addClass('is-pause').removeClass('is-play').find('.swiper-button-toggle-play-text').text('자동 슬라이드 정지');
				}

				if (isA11y) {
					$this.attr('aria-live', 'off');
				}

				callEvent('autoplayStart', swiper);
			};

			option.on.autoplayStop = function (swiper) {
				if (option.playControl) {
					$(option.playButton).removeClass('active').removeAttr('disabled', '').prop('disabled', false);
				}
				if (option.pauseControl) {
					$(option.pauseButton).addClass('active').attr('disabled', '').prop('disabled', true);
				}
				if (option.togglePlayButton) {
					$(option.togglePlayButton).removeClass('is-pause').addClass('is-play').find('.swiper-button-toggle-play-text').text('자동 슬라이드 재생');
				}

				if (isA11y) {
					$this.attr('aria-live', 'polite');
				}

				callEvent('autoplayStop', swiper);
			};

			if ($.isFunction(window.Swiper)) {
				var swiper = new Swiper($container.get(0), option);
				$this.data('swiper', swiper);

				if (option.playControl) {
					$(option.playButton).on('click.swiperSet', function () {
						swiper.autoplay.start();
					});
				}
				if (option.pauseControl) {
					$(option.pauseButton).on('click.swiperSet', function () {
						swiper.autoplay.stop();
					});
				}
				if (option.togglePlayButton) {
					$(option.togglePlayButton).on('click.swiperSet', function () {
						var $this = $(this);

						if ($this.hasClass('is-play')) {
							swiper.autoplay.start();
						} else if ($this.hasClass('is-pause')) {
							swiper.autoplay.stop();
						}
					});
				}

				var $slides = $(swiper.slides);

				if (isA11y && userAgentCheck.isAndroid) {
					$slides.removeAttr('aria-label role');
				}
			}
		});
	};

	// UiTabPanel
	var UiTabPanel = function (target, option) {
		var _ = this;
		var $wrap = $(target).eq(0);

		_.className = {
			active: 'js-tabpanel-active',
			opened: 'js-tabpanel-opened',
		};
		_.options = option;
		_.wrap = $wrap;
		_.crrTarget = '';
		_.init();
		_.on();
	};
	$.extend(UiTabPanel.prototype, {
		init: function () {
			var _ = this;
			var initialOpen = typeof _.options.initialOpen === 'string' && _.options.initialOpen;

			if (_.options.opener) {
				if (typeof _.options.opener === 'string') {
					_.opener = _.wrap.find(_.options.opener);
				} else {
					_.opener = _.options.opener;
				}
			}

			_.openerItems = _.opener;

			_.openerList = (function () {
				var $list = _.wrap;
				var eachBreak = false;

				if (_.opener && _.opener.length >= 2) {
					_.opener
						.eq(0)
						.parents()
						.each(function () {
							var $this = $(this);
							_.opener
								.eq(1)
								.parents()
								.each(function () {
									var $secondThis = $(this);
									var $children = $this.children();

									if ($this.is($secondThis)) {
										$list = $this;
										eachBreak = true;

										if ($children.filter(_.opener).length <= 0) {
											_.openerItems = $this.children().filter(function () {
												if ($(this).find(_.opener).length) {
													return true;
												} else {
													return false;
												}
											});
										}

										return false;
									}
								});

							if (eachBreak) {
								return false;
							}
						});
				}

				return $list;
			})();

			if (_.options.item) {
				if (typeof _.options.item === 'string') {
					_.item = _.wrap.find(_.options.item);
				} else {
					_.item = _.options.item;
				}
			}

			if (_.opener.length && _.item.length) {
				_.hashCode = uiGetHashCode();

				if (!initialOpen) {
					initialOpen = _.opener.eq(0).attr('data-tab-open');
				}

				if (_.options.a11y) {
					_.initA11y();
				}

				_.open(initialOpen, false);
			}
		},
		on: function () {
			var _ = this;
			var openerFocus = false;
			var $focusOpener = null;
			var itemClickCheck = false;

			if (_.opener.length && _.item.length) {
				if (!_.openerItems.is(_.opener)) {
					_.openerItems.on('click.uiTabPanel' + _.hashCode, function (e) {
						var $this = $(this);
						var $target = $(e.target);

						if ($target.is($this)) {
							itemClickCheck = true;
							$target.find(_.opener).trigger('click');
						}
					});
				}
				_.opener.on('click.uiTabPanel' + _.hashCode, function (e) {
					var $this = $(this);
					var target = $this.attr('data-tab-open');

					_.open(target);

					if ($this.is('a')) {
						e.preventDefault();
					}

					if (itemClickCheck) {
						e.stopPropagation();
						itemClickCheck = false;
					}
				});
				$doc.on('focusin.uiTabPanel' + _.hashCode, function (e) {
					var $panel = ($(e.target).is(_.item) && $(e.target)) || ($(e.target).closest(_.item).length && $(e.target).closest(_.item));

					if ($panel && !$panel.is(':hidden')) {
						_.open($panel.attr('data-tab'));
					}
				});
				_.openerItems
					.on('focus.uiTabPanel' + _.hashCode, function () {
						openerFocus = true;
						$focusOpener = $(this);
					})
					.on('blur.uiTabPanel' + _.hashCode, function () {
						openerFocus = false;
						$focusOpener = null;
					});
				$doc
					.on('keydown.uiTabPanel' + _.hashCode, function (e) {
						var keyCode = e.keyCode;
						if (_.options.a11y && openerFocus) {
							if ([13, 32, 35, 36, 37, 38, 39, 40].indexOf(keyCode) > -1) {
								e.preventDefault();
							}
						}
					})
					.on('keyup.uiTabPanel' + _.hashCode, function (e) {
						var keyCode = e.keyCode;
						var target = $focusOpener && $focusOpener.attr('data-tab-open');
						if (_.options.a11y && openerFocus) {
							switch (keyCode) {
								case 35:
									_.goEnd();
									break;
								case 36:
									_.goStart();
									break;
								case 37:
									_.prev();
									break;
								case 38:
									_.prev();
									break;
								case 39:
									_.next();
									break;
								case 40:
									_.next();
									break;
								case 13:
									_.open(target);
									break;
								case 32:
									_.open(target);
									break;
								default:
									break;
							}
						}
					});
			}
		},
		open: function (target, focus) {
			var _ = this;
			target = String(target);
			focus = focus instanceof Boolean ? (String(focus) === 'false' ? false : null) : focus;
			var $opener = _.opener.filter('[data-tab-open="' + target + '"]');
			var $panel = _.item.filter('[data-tab="' + target + '"]');

			if (!$panel.hasClass(_.className.opened)) {
				if (_.options.a11y) {
					_.setActiveA11y(target, focus);
				}

				_.crrTarget = target;
				_.opener.not($opener).removeClass(_.className.active);
				_.item.not($panel).removeClass(_.className.opened);
				$opener.addClass(_.className.active);
				$panel.addClass(_.className.opened).trigger('uiTabPanelChange', [$opener, $panel, _.opener, _.item]);
			}
		},
		indexOpen: function (i, focus) {
			var _ = this;
			target = Number(i);
			var target = _.opener.eq(i).attr('data-tab-open');

			_.open(target, focus);
		},
		next: function () {
			var _ = this;
			var length = _.opener.length;
			var i = _.opener.index(_.opener.filter('[data-tab-open="' + _.crrTarget + '"]')) + 1;
			if (i >= length) {
				i = 0;
			}
			_.indexOpen(i);
		},
		prev: function () {
			var _ = this;
			var length = _.opener.length;
			var i = _.opener.index(_.opener.filter('[data-tab-open="' + _.crrTarget + '"]')) - 1;
			if (i < 0) {
				i = length - 1;
			}
			_.indexOpen(i);
		},
		goStart: function () {
			var _ = this;
			_.indexOpen(0);
		},
		goEnd: function () {
			var _ = this;
			_.indexOpen(_.opener.length - 1);
		},
		initA11y: function () {
			var _ = this;

			_.opener.each(function (i) {
				var $this = $(this);
				var target = $this.attr('data-tab-open');
				var $item = (function () {
					var $item = $this.closest(_.openerItems);

					if ($item.length) {
						return $item;
					} else {
						return $this;
					}
				})();
				var $replaceWith = $this;

				$item
					.attr('role', 'tab')
					.attr('id', 'tabpanel-opener-' + target + '-' + _.hashCode)
					.attr('aria-controls', 'tabpanel-' + target + '-' + _.hashCode);

				if (!$this.is($item)) {
					$replaceWith = $(
						$this
							.get(0)
							.outerHTML.replace(/^<[a-zA-Z]+/, '<span')
							.replace(/\/[a-zA-Z]+>$/, '/span>')
					);

					$this.replaceWith($replaceWith);

					_.opener[i] = $replaceWith.get(0);
				}
			});

			_.item.each(function () {
				var $this = $(this);
				var target = $this.attr('data-tab');

				$this
					.attr('role', 'tabpanel')
					.attr('id', 'tabpanel-' + target + '-' + _.hashCode)
					.attr('aria-labelledby', 'tabpanel-opener-' + target + '-' + _.hashCode);
			});

			_.openerList.attr('role', 'tablist');
		},
		setActiveA11y: function (target, focus) {
			var _ = this;

			focus = focus === false ? false : true;

			_.opener.each(function () {
				var $this = $(this);
				var crrTarget = $this.attr('data-tab-open');
				var $item = (function () {
					var $item = $this.closest(_.openerItems);

					if ($item.length) {
						return $item;
					} else {
						return $this;
					}
				})();

				if (crrTarget === target) {
					$item.attr('tabindex', '0').attr('aria-selected', 'true');
					if (focus) {
						$item.focus();
					}
				} else {
					$item.attr('tabindex', '-1').attr('aria-selected', 'false');
				}
			});

			_.item.each(function () {
				var $this = $(this);
				var crrTarget = $this.attr('data-tab');

				if (crrTarget === target) {
					$this.removeAttr('hidden');
				} else {
					$this.attr('hidden', '');
				}
			});
		},
		addA11y: function () {
			var _ = this;

			if (!_.options.a11y) {
				_.options.a11y = true;
				_.initA11y();
				_.setActiveA11y(_.crrTarget);
			}
		},
		clearA11y: function () {
			var _ = this;

			if (_.options.a11y) {
				_.options.a11y = false;
				_.opener.removeAttr('role').removeAttr('id').removeAttr('aria-controls').removeAttr('tabindex').removeAttr('aria-selected');

				_.item.removeAttr('role').removeAttr('id').removeAttr('aria-labelledby').removeAttr('hidden');

				_.wrap.removeAttr('role');
			}
		},
	});
	$.fn.uiTabPanel = function (custom) {
		var defaultOption = {
			item: null,
			opener: null,
			initialOpen: null,
			a11y: false,
		};
		var other = [];

		custom = custom || {};

		$.each(arguments, function (i) {
			if (i > 0) {
				other.push(this);
			}
		});

		this.each(function () {
			var options = {};
			var uiTabPanel = this.uiTabPanel;

			if (typeof custom === 'object' && !uiTabPanel) {
				options = $.extend({}, defaultOption, custom);
				this.uiTabPanel = new UiTabPanel(this, options);
			} else if (typeof custom === 'string' && uiTabPanel) {
				switch (custom) {
					case 'addA11y':
						uiTabPanel.addA11y();
						break;
					case 'clearA11y':
						uiTabPanel.clearA11y();
						break;
					case 'open':
						uiTabPanel.open(other[0], other[1]);
						break;
					case 'indexOpen':
						uiTabPanel.indexOpen(other[0], other[1]);
						break;
					case 'next':
						uiTabPanel.next();
						break;
					case 'prev':
						uiTabPanel.prev();
						break;
					case 'goStart':
						uiTabPanel.goStart();
						break;
					case 'goEnd':
						uiTabPanel.goEnd();
						break;
					default:
						break;
				}
			}
		});

		return this;
	};

	// UiAccordion
	var UiAccordion = function (target, option) {
		var _ = this;
		var $wrap = $(target).eq(0);

		_.className = {
			opened: 'js-accordion-opened',
			active: 'js-accordion-active',
			animated: 'js-accordion-animated',
		};
		_.options = option;
		_.wrap = $wrap;
		_.init();
		_.on();
	};
	$.extend(UiAccordion.prototype, {
		init: function () {
			var _ = this;

			_.hashCode = uiGetHashCode();
			_.getElements();

			if (_.layer.length && _.item.length && _.item.filter('[data-initial-open]').length) {
				_.item.each(function () {
					var $this = $(this);
					if ($this.attr('data-initial-open') === 'true') {
						_.open($this, 0);
					}
				});
			}

			_.options.onInit();
		},
		getElements: function () {
			var _ = this;

			if (_.options.opener) {
				if (typeof _.options.opener === 'string') {
					_.opener = _.wrap.find(_.options.opener);
				} else {
					_.opener = _.options.opener;
				}
			}

			if (_.options.layer) {
				if (typeof _.options.layer === 'string') {
					_.layer = _.wrap.find(_.options.layer);
				} else {
					_.layer = _.options.layer;
				}
			}

			if (_.options.item) {
				if (typeof _.options.item === 'string') {
					_.item = _.wrap.find(_.options.item);
				} else {
					_.item = _.options.item;
				}
			}
		},
		on: function () {
			var _ = this;

			if (_.opener.length && _.layer.length) {
				_.opener.on('click.uiAccordion' + _.hashCode, function () {
					_.toggle($(this).closest(_.item));
				});

				$doc
					.on('keydown.uiAccordion' + _.hashCode, function (e) {
						if (e.keyCode === 9 && _.blockTabKey) {
							e.preventDefault();
						}
					})
					.on('focusin.uiAccordion' + _.hashCode, function (e) {
						var $item = ($(e.target).is(_.layer) || $(e.target).closest(_.layer).length) && $(e.target).closest(_.item);

						if (_.options.focusInOpen && $item) {
							_.open($item, 0);
						}
					});
			}
		},
		off: function () {
			var _ = this;

			if (_.opener.length && _.layer.length) {
				_.opener.off('click.uiAccordion' + _.hashCode);
				$doc.off('keydown.uiAccordion' + _.hashCode).off('focusin.uiAccordion' + _.hashCode);
			}
		},
		toggle: function ($item) {
			var _ = this;

			if ($item.hasClass(_.className.opened)) {
				_.close($item);
			} else {
				_.open($item);
			}
		},
		open: function ($item, speed) {
			var _ = this;
			var $layer = null;
			var $opener = null;
			var beforeH = 0;
			var afterH = 0;
			speed = speed instanceof Number ? Number(speed) : typeof speed === 'number' ? speed : _.options.speed;

			if (!$item.hasClass(_.className.opened)) {
				$layer = $item.find(_.layer);
				$layer.stop().css('display', 'block');
				beforeH = $layer.height();
				$layer.css('height', 'auto');
				$opener = $item.find(_.opener);
				$item.addClass(_.className.opened);
				$opener.addClass(_.className.active);
				$layer.addClass(_.className.opened);
				afterH = $layer.height();
				if (beforeH === afterH) {
					speed = 0;
				}
				if (speed > 0) {
					$item.addClass(_.className.animated);
				}
				$layer
					.css('height', beforeH)
					.animate(
						{
							height: afterH,
						},
						speed,
						function () {
							$item.removeClass(_.className.animated);
							$layer
								.css({
									height: 'auto',
								})
								.trigger('uiAccordionAfterOpened');
						}
					)
					.trigger('uiAccordionOpened', [beforeH, afterH]);

				if (_.options.once) {
					_.item.not($item).each(function () {
						_.close($(this));
					});
				}
			}
		},
		close: function ($item, speed) {
			var _ = this;
			var $layer = null;
			var $opener = null;
			var beforeH = 0;
			var itemBeforeH = 0;
			var afterH = 0;
			speed = speed instanceof Number ? Number(speed) : typeof speed === 'number' ? speed : _.options.speed;

			if ($item.hasClass(_.className.opened)) {
				_.blockTabKey = true;
				$layer = $item.find(_.layer);
				$layer.stop().css('display', 'block');
				beforeH = $layer.height();
				itemBeforeH = $item.height();
				$item.css('height', itemBeforeH);
				$layer.css('height', '');
				$opener = $item.find(_.opener);
				$item.removeClass(_.className.opened);
				$opener.removeClass(_.className.active);
				$layer.removeClass(_.className.opened);
				afterH = $layer.height();
				if (beforeH === afterH) {
					speed = 0;
				}
				if (speed > 0) {
					$item.addClass(_.className.animated);
				}
				$item.css('height', '');
				$layer
					.css('height', beforeH)
					.animate(
						{
							height: afterH,
						},
						speed,
						function () {
							$item.removeClass(_.className.animated);
							$layer
								.css({
									display: '',
									height: '',
								})
								.trigger('uiAccordionAfterClosed');
							_.blockTabKey = false;
						}
					)
					.trigger('uiAccordionClosed', [beforeH, afterH]);
			}
		},
		allClose: function () {
			var _ = this;

			_.item.each(function () {
				_.close($(this));
			});
		},
		// 22.05.17 allOpen 추가
		allOpen: function () {
			var _ = this;

			_.item.each(function () {
				_.open($(this));
			});
		},
		update: function (newOptions) {
			var _ = this;

			_.off();
			$.extend(_.options, newOptions);
			_.getElements();
			_.on();
		},
	});
	$.fn.uiAccordion = function (custom) {
		var defaultOption = {
			item: null,
			opener: null,
			layer: null,
			once: false,
			speed: 500,
			focusInOpen: true,
			onInit: function () {},
		};
		var other = [];

		custom = custom || {};

		$.each(arguments, function (i) {
			if (i > 0) {
				other.push(this);
			}
		});

		this.each(function () {
			var options = {};
			var uiAccordion = this.uiAccordion;

			if (typeof custom === 'object' && !uiAccordion) {
				options = $.extend({}, defaultOption, custom);
				this.uiAccordion = new UiAccordion(this, options);
			} else if (typeof custom === 'string' && uiAccordion) {
				switch (custom) {
					case 'allClose':
						uiAccordion.allClose();
						break;
					case 'allOpen': // 22.05.17 allOpen 추가
						uiAccordion.allOpen();
						break;
					case 'close':
						uiAccordion.close(other[0], other[1]);
						break;
					case 'open':
						uiAccordion.open(other[0], other[1]);
						break;
					case 'update':
						uiAccordion.update(other[0]);
						break;
					default:
						break;
				}
			}
		});

		return this;
	};

	// UiDropDown
	var UiDropDown = function (target, option) {
		var _ = this;
		var $wrap = $(target).eq(0);

		_.className = {
			opened: 'js-dropdown-opened',
			top: 'js-dropdown-top',
			bottom: 'js-dropdown-bottom',
		};
		_.css = {
			hide: {
				position: 'absolute',
				top: '',
				left: '',
				bottom: '',
				marginLeft: '',
				display: 'none',
			},
			show: {
				position: 'absolute',
				top: '100%',
				left: '0',
				display: 'block',
			},
		};
		_.options = option;
		_.wrap = $wrap;
		_.closeTimer = null;
		_.init();
		_.on();
	};
	$.extend(UiDropDown.prototype, {
		init: function () {
			var _ = this;

			if (_.options.opener) {
				if (typeof _.options.opener === 'string') {
					_.opener = _.wrap.find(_.options.opener).eq(0);
				} else {
					_.opener = _.options.opener;
				}
			}

			if (_.options.layer) {
				if (typeof _.options.layer === 'string') {
					_.layer = _.wrap.find(_.options.layer).eq(0);
				} else {
					_.layer = _.options.layer;
				}
				_.layer.css(_.css.hide);
			}

			if (_.layer.length) {
				_.wrap.css('position', 'relative');
			}

			_.options.init();
		},
		on: function () {
			var _ = this;

			if (_.layer.length) {
				_.hashCode = uiGetHashCode();

				if (_.opener && _.opener.length && _.options.event === 'click') {
					_.opener.on('click.uiDropDown' + _.hashCode, function () {
						_.toggle();
					});
					$doc.on('click.uiDropDown' + _.hashCode, function (e) {
						var check = $(e.target).is(_.wrap) || $(e.target).closest(_.wrap).length;

						if (!check) {
							_.close();
						}
					});
					$doc.on('focusin.uiDropDown' + _.hashCode, function (e) {
						var check = $(e.target).is(_.layer) || $(e.target).closest(_.layer).length || ($(e.target).is(_.opener) && _.wrap.hasClass(_.className.opened));

						if (check) {
							_.open();
						} else {
							_.close();
						}
					});
				} else if (_.options.event === 'hover') {
					_.wrap
						.on('mouseenter.uiDropDown' + _.hashCode, function () {
							_.open();
						})
						.on('mouseleave.uiDropDown' + _.hashCode, function () {
							_.close();
						});
					$doc.on('focusin.uiDropDown' + _.hashCode, function (e) {
						var check = $(e.target).is(_.wrap) || $(e.target).closest(_.wrap).length || ($(e.target).is(_.opener) && _.wrap.hasClass(_.className.opened));

						if (check) {
							_.open();
						} else {
							_.close();
						}
					});
				}
				$win.on('resize.uiDropDown' + _.hashCode, function () {
					_.update();
				});
			}
		},
		update: function () {
			var _ = this;
			var docW = 0;
			var winH = 0;
			var wrapT = 0;
			var wrapH = 0;
			var scrollTop = 0;
			var layerT = 0;
			var layerL = 0;
			var layerH = 0;
			var layerW = 0;
			var $overflow = null;
			var overflowH = 0;
			var overflowT = 0;
			var overflowL = 0;
			var overflowR = 0;
			var style = {
				marginTop: _.options.marginTop,
				marginLeft: _.options.marginLeft,
			};
			var isTopAlign = _.options.defaultVertical === 'top';
			var isOverflow = false;
			var isTopOverflow = false;
			var isBottomOverflow = false;

			if (_.wrap.hasClass(_.className.opened)) {
				_.layer.css({
					top: '',
					left: '-999999px',
					right: '',
					bottom: '',
					marginLeft: '',
					marginRight: '',
				});
				_.wrap.removeClass(_.className.top + ' ' + _.className.bottom);

				docW = $doc.width();
				docH = $doc.height();
				winW = $win.width();
				winH = $win.height();
				scrollLeft = $win.scrollLeft();
				scrollTop = $win.scrollTop();

				_.layer.css(_.css.show);

				if (_.options.align === 'right') {
					style.marginLeft = 0;
					style.marginRight = _.options.marginRight;
					_.layer.css({
						left: 'auto',
						right: '0',
					});
				} else if (_.options.align === 'center') {
					_.layer.css({
						left: '50%',
					});
				}

				function setTopPosition() {
					_.wrap.addClass(_.className.top);
					_.layer.css({
						top: 'auto',
						bottom: '100%',
					});
					style.marginTop = 0;
					style.marginBottom = _.options.marginBottom;
				}
				function setBottomPosition() {
					_.wrap.removeClass(_.className.top).addClass(_.className.bottom);
					_.layer.css({
						top: '',
						bottom: '',
					});
					style.marginTop = _.options.marginTop;
					style.marginBottom = 0;
				}

				if (isTopAlign) {
					setTopPosition();
				}

				wrapT = _.wrap.offset().top;
				wrapH = _.wrap.outerHeight();
				layerT = _.layer.offset().top;
				layerL = _.layer.offset().left;
				trueLayerW = _.layer.outerWidth();
				layerH = _.layer.outerHeight() + _.options.marginTop + _.options.marginBottom;
				layerW = trueLayerW + _.options.marginLeft + _.options.marginRight;

				if (_.options.align === 'center') {
					layerL -= Math.ceil(trueLayerW / 2);
					style.marginLeft = -Math.ceil(trueLayerW / 2);
				}

				_.wrap.parents().each(function () {
					var $this = $(this);
					if ($this.css('overflow').match(/hidden|auto|scroll/) && !$this.is('html')) {
						$overflow = $this;
						return false;
					}
				});

				isOverflow = $overflow !== null && $overflow.length;

				if (isOverflow) {
					overflowH = $overflow.height();
					overflowT = $overflow.offset().top;
					overflowL = $overflow.offset().left;
					overflowR = docW - (overflowL + $overflow.width());
				}

				isTopOverflow = wrapT - layerH < (isOverflow ? overflowT : scrollTop);
				isBottomOverflow = isOverflow ? (isTopAlign ? wrapT + wrapH : layerT) + layerH > overflowT + overflowH : (isTopAlign ? wrapT + wrapH : layerT) + layerH - scrollTop > winH;

				if (isTopAlign) {
					if (isTopOverflow && !isBottomOverflow) {
						setBottomPosition();
					} else {
						_.wrap.addClass(_.className.top);
					}
				} else {
					if (isBottomOverflow && !isTopOverflow) {
						setTopPosition();
					} else {
						_.wrap.addClass(_.className.bottom);
					}
				}

				if (docW - overflowR < layerL + layerW && docW - overflowL - overflowR - layerW > 0) {
					if (_.options.align === 'right') {
						style.marginRight = Math.ceil(layerL + layerW - (docW - overflowR) - _.options.marginLeft);
					} else if (_.options.align === 'center') {
						style.marginLeft -= Math.ceil(layerL + layerW - (docW - overflowR) - _.options.marginLeft);
					} else {
						style.marginLeft = -Math.ceil(layerL + layerW - (docW - overflowR) - _.options.marginLeft);
					}
				} else if (overflowL > layerL || (_.options.align === 'center' && overflowL < layerL && layerL - overflowL < _.options.marginLeft)) {
					if (_.options.align === 'right') {
						style.marginRight = -Math.ceil(overflowL - layerL + _.options.marginLeft);
					} else if (_.options.align === 'center') {
						style.marginLeft += Math.ceil(overflowL - layerL + _.options.marginLeft);
					} else {
						style.marginLeft = Math.ceil(overflowL - layerL + _.options.marginLeft);
					}
				}

				_.layer.css(style);
			}
		},
		toggle: function () {
			var _ = this;

			if (_.wrap.hasClass(_.className.opened)) {
				_.close();
			} else {
				_.open();
			}
		},
		open: function () {
			var _ = this;

			if (!_.wrap.hasClass(_.className.opened)) {
				clearTimeout(_.closeTimer);
				_.wrap.addClass(_.className.opened).css('z-index', '1200');
				_.layer.css(_.css.show);
				_.update();
				_.layer.trigger('uiDropDownOpened');
			}
		},
		close: function () {
			var _ = this;

			if (_.wrap.hasClass(_.className.opened)) {
				clearTimeout(_.closeTimer);
				_.wrap.removeClass(_.className.opened + ' ' + _.className.top + ' ' + _.className.bottom).css('z-index', '');
				_.layer.css(_.css.hide).trigger('uiDropDownClosed');
			}
		},
		btnClose: function () {
			var _ = this;

			if (_.wrap.hasClass(_.className.opened)) {
				clearTimeout(_.closeTimer);

				if (userAgentCheck.isAndroid) {
					_.wrap.removeClass(_.className.opened + ' ' + _.className.top + ' ' + _.className.bottom).css('z-index', '');
					_.layer.css(_.css.hide);

					_.closeTimer = setTimeout(function () {
						clearTimeout(_.closeTimer);
						_.opener.focus();
						_.layer.trigger('uiDropDownClosed');
					}, 10);
				} else if (userAgentCheck.isIos) {
					_.opener.focus();

					_.closeTimer = setTimeout(function () {
						clearTimeout(_.closeTimer);
						_.wrap.removeClass(_.className.opened + ' ' + _.className.top + ' ' + _.className.bottom).css('z-index', '');
						_.layer.css(_.css.hide).trigger('uiDropDownClosed');
					}, 100);
				} else {
					_.opener.focus();
					_.wrap.removeClass(_.className.opened + ' ' + _.className.top + ' ' + _.className.bottom).css('z-index', '');
					_.layer.css(_.css.hide).trigger('uiDropDownClosed');
				}
			}
		},
	});
	$.fn.uiDropDown = function (custom) {
		var defaultOption = {
			opener: null,
			layer: null,
			event: 'click',
			marginTop: 0,
			marginBottom: 0,
			marginLeft: 0,
			marginRight: 0,
			align: 'left',
			defaultVertical: 'bottom',
			init: function () {},
		};
		var other = [];

		custom = custom || {};

		$.each(arguments, function (i) {
			if (i > 0) {
				other.push(this);
			}
		});

		this.each(function () {
			var options = {};
			var uiDropDown = this.uiDropDown;

			if (typeof custom === 'object' && !uiDropDown) {
				options = $.extend({}, defaultOption, custom);
				this.uiDropDown = new UiDropDown(this, options);
			} else if (typeof custom === 'string' && uiDropDown) {
				switch (custom) {
					case 'btnClose':
						uiDropDown.btnClose();
						break;
					case 'close':
						uiDropDown.close();
						break;
					case 'open':
						uiDropDown.open();
						break;
					case 'update':
						uiDropDown.update();
						break;
					default:
						break;
				}
			}
		});

		return this;
	};

	// UiSlot
	var UiSlot = function (target, option) {
		var _ = this;
		var $wrap = $(target).eq(0);

		_.className = {
			wrap: 'ui-slot',
			item: 'ui-slot__item',
			numWrap: 'ui-slot__num-wrap',
			num: 'ui-slot__num',
			comma: 'ui-slot__item-comma',
			loop: 'is-loop',
		};
		_.options = option;
		_.wrap = $wrap;
		_.init();
	};
	$.extend(UiSlot.prototype, {
		init: function () {
			var _ = this;

			_.valueArray = (_.options.value + '').split('');
			_.length = _.valueArray.length;

			var html = '';

			for (var i = 0; i < _.length; i++) {
				if (!(i === 0) && (i + (3 - (_.length % 3))) % 3 === 0) {
					html += '<div class="' + _.className.comma + '">,</div>';
				}

				html +=
					'<div class="' +
					_.className.item +
					'">' +
					'<div class="' +
					_.className.numWrap +
					'">' +
					'<div class="' +
					_.className.num +
					'">0</div>' +
					'<div class="' +
					_.className.num +
					'">1</div>' +
					'<div class="' +
					_.className.num +
					'">2</div>' +
					'<div class="' +
					_.className.num +
					'">3</div>' +
					'<div class="' +
					_.className.num +
					'">4</div>' +
					'<div class="' +
					_.className.num +
					'">5</div>' +
					'<div class="' +
					_.className.num +
					'">6</div>' +
					'<div class="' +
					_.className.num +
					'">7</div>' +
					'<div class="' +
					_.className.num +
					'">8</div>' +
					'<div class="' +
					_.className.num +
					'">9</div>' +
					'<div class="' +
					_.className.num +
					'">0</div>' +
					'</div>' +
					'</div>';
			}

			_.wrap.addClass(_.className.wrap).append(html);

			_.item = _.wrap.find('.' + _.className.item);
			_.numWrap = _.wrap.find('.' + _.className.numWrap);

			_.numWrap.addClass(_.className.loop);

			_.numWrap.each(function (i) {
				var $this = $(this);

				setTimeout(function () {
					$this.css({
						'animation-play-state': 'paused',
					});

					var transform = $this.css('transform');

					$this
						.css({
							'animation-play-state': '',
							transform: transform,
							transition: 'transform 0.3s',
						})
						.removeClass(_.className.loop);

					setTimeout(function () {
						$this.css('transform', 'translateY(-' + Number(_.valueArray[i]) * 100 + '%)');
					}, 0);
				}, (_.length - i) * 100);
			});
		},
	});
	$.fn.uiSlot = function (custom) {
		var defaultOption = {
			value: 0,
			comma: true,
		};
		var other = [];

		custom = custom || {};

		$.each(arguments, function (i) {
			if (i > 0) {
				other.push(this);
			}
		});

		this.each(function () {
			var options = {};
			var uiSlot = this.uiSlot;

			if (typeof custom === 'object' && !uiSlot) {
				options = $.extend({}, defaultOption, custom);
				this.uiSlot = new UiSlot(this, options);
			} else if (typeof custom === 'string' && uiSlot) {
				/*
				switch (custom) {
					case 'aaa':
						uiSlot.aaa(other[0], other[1]);
						break;
					default:
						break;
				}
				*/
			}
		});

		return this;
	};

	// scrollbars width
	var scrollbarsWidth = {
		width: 0,
		set: function () {
			var _ = scrollbarsWidth;
			var $html = $('html');
			var $wrap = $('#wrap');
			$html.css('overflow', 'hidden');
			var beforeW = $wrap.width();
			$html.css('overflow', 'scroll');
			var afterW = $wrap.width();
			$html.css('overflow', '');
			_.width = beforeW - afterW;
		},
	};
	function checkScrollbars() {
		var $html = $('html');
		if (Boolean(scrollbarsWidth.width)) {
			$html.addClass('is-scrollbars-width');
		}
	}

	// scrollBlock
	var scrollBlock = {
		scrollTop: 0,
		scrollLeft: 0,
		className: {
			block: 'is-scroll-blocking',
		},
		block: function () {
			var _ = scrollBlock;
			var $html = $('html');
			var $wrap = $('#wrap');

			if (!$html.hasClass(_.className.block)) {
				scrollBlock.scrollTop = $win.scrollTop();
				scrollBlock.scrollLeft = $win.scrollLeft();

				$html.addClass(_.className.block);
				$win.scrollTop(0);
				$wrap.scrollTop(_.scrollTop);
				$win.scrollLeft(0);
				$wrap.scrollLeft(_.scrollLeft);
			}
		},
		clear: function () {
			var _ = scrollBlock;
			var $html = $('html');
			var $wrap = $('#wrap');

			if ($html.hasClass(_.className.block)) {
				$html.removeClass(_.className.block);
				$wrap.scrollTop(0);
				$win.scrollTop(_.scrollTop);
				$wrap.scrollLeft(0);
				$win.scrollLeft(_.scrollLeft);
			}
		},
	};
	window.uiJSScrollBlock = scrollBlock;

	// layer
	var uiLayer = {
		zIndex: 10000,
		open: function (target, opener, speed) {
			var _ = uiLayer;
			var $html = $('html');
			var $layer = $('[data-layer="' + target + '"]');
			var timer = null;
			var hasScrollBlock = true;
			var isFocus = true;
			var isCycleFocus = true;
			var speed = typeof speed === 'number' ? speed : 350;
			var $label = null;
			var hashCode = '';
			var labelID = '';
			var $layers = $('[data-layer]');
			var $preOpenLayers = $layers.filter('.js-layer-opened').not($layer);
			var notOhterElements = 'script, link, style, base, meta, br, [aria-hidden], [inert], .js-not-inert, .js-not-inert *, [data-ui-js], .ownKeypadBG, .ownKeypadWrap, .ownKeypadWrap *'; // 2022.11.01 : mod : 예외 선택자 추가 (보안 키패드 이슈 보완)
			var $ohterElements = $('body')
				.find('*')
				.not('[data-layer], [data-layer] *, ' + notOhterElements);
			var $preLayersElements = $preOpenLayers.find('*').not(notOhterElements);

			$layers.parents().each(function () {
				$ohterElements = $ohterElements.not($(this));
			});

			if ($layer.length && !$layer.hasClass('js-layer-opened')) {
				$label = $layer.find('h1, h2, h3, h4, h5, h6, p').eq(0);
				hashCode = (function () {
					var code = $layer.data('uiJSHashCode');
					if (!(typeof code === 'string')) {
						code = uiGetHashCode();
						$layer.data('uiJSHashCode', code);
					}
					return code;
				})();
				hasScrollBlock = (function () {
					var val = $layer.data('scroll-block');
					if (typeof val === 'boolean' && !val) {
						return false;
					} else {
						return hasScrollBlock;
					}
				})();
				isFocus = (function () {
					var val = $layer.data('focus');
					if (typeof val === 'boolean' && !val) {
						return false;
					} else {
						return isFocus;
					}
				})();
				isCycleFocus = (function () {
					var val = $layer.data('cycle-focus');
					if (typeof val === 'boolean' && !val) {
						return false;
					} else {
						return isCycleFocus;
					}
				})();

				_.zIndex++;
				$layer.trigger('layerBeforeOpened').attr('role', 'dialog').attr('aria-hidden', 'true').css('visibility', 'hidden').attr('hidden', '');
				if ($label.length) {
					labelID = (function () {
						var id = $label.attr('id');
						if (!(typeof id === 'string' && id.length)) {
							id = target + '-' + hashCode;
							$label.attr('id', id);
						}
						return id;
					})();
					$layer.attr('aria-labelledby', labelID);
				}
				$html.addClass('js-html-layer-opened js-html-layer-opened-' + target);

				$ohterElements.attr('aria-hidden', 'true').attr('inert', '').attr('data-ui-js', 'hidden');
				$preLayersElements.attr('aria-hidden', 'true').attr('inert', '').attr('data-ui-js', 'hidden');
				$preOpenLayers.attr('aria-hidden', 'true').attr('inert', '').removeAttr('aria-modal');

				if (isCycleFocus && !$layer.children('.js-loop-focus').length) {
					$('<div class="js-loop-focus" tabindex="0"></div>')
						.on('focusin.uiLayer', function () {
							$layer.focus();
						})
						.appendTo($layer);
				}

				$layer
					.stop()
					.removeClass('js-layer-closed')
					.css({
						display: 'block',
						zIndex: _.zIndex,
					})
					.animate(
						{
							opacity: 1,
						},
						speed,
						function () {
							if (isFocus) {
								$layer.focus();
							}
							$layer.removeClass('js-layer-animated').trigger('layerAfterOpened');
						}
					)
					.attr('tabindex', '0')
					.attr('aria-hidden', 'false')
					.attr('aria-modal', 'true')
					.css('visibility', 'visible')
					.removeAttr('hidden')
					.data('layerIndex', $('.js-layer-opened').length);

				if (hasScrollBlock) {
					scrollBlock.block();
				}

				if (Boolean(opener) && $(opener).length) {
					$layer.data('layerOpener', $(opener));
				}

				timer = setTimeout(function () {
					clearTimeout(timer);
					$layer.addClass('js-layer-opened js-layer-animated').trigger('layerOpened');
				}, 0);
			}
		},
		close: function (target, speed) {
			var $html = $('html');
			var $layer = $('[data-layer="' + target + '"]');
			var $opener = $layer.data('layerOpener');
			var $preOpenLayers = $('[data-layer].js-layer-opened').not($layer);
			var $preOpenLayerHasScrollBlock = $preOpenLayers.not(function () {
				var val = $(this).data('scroll-block');
				if (typeof val === 'boolean' && !val) {
					return true;
				} else {
					return false;
				}
			});
			var isScrollBlock = $html.hasClass(scrollBlock.className.block);
			var timer = null;
			var speed = typeof speed === 'number' ? speed : 350;
			var $ohterElements = $('body').find('[data-ui-js="hidden"]');
			var preOpenLayersHigherZIndex = (function () {
				var array = [];
				$preOpenLayers.each(function () {
					var zIndex = $(this).css('z-index');
					array.push(zIndex);
				});
				array.sort();
				return array[array.length - 1];
			})();
			var $preOpenLayer = $preOpenLayers.filter(function () {
				var zIndex = $(this).css('z-index');

				return zIndex === preOpenLayersHigherZIndex;
			});
			var $preOpenLayerOhterElements = $preOpenLayer.find('[data-ui-js="hidden"]');

			if ($layer.length && $layer.hasClass('js-layer-opened')) {
				$layer
					.trigger('layerBeforeClosed')
					.stop()
					.removeClass('js-layer-opened')
					.addClass('js-layer-closed js-layer-animated')
					.css('display', 'block')
					.data('layerIndex', null)
					.attr('aria-hidden', 'true')
					.removeAttr('aria-modal')
					.animate(
						{
							opacity: 0,
						},
						speed,
						function () {
							$(this).css('display', 'none').css('visibility', 'hidden').attr('hidden', '').removeClass('js-layer-closed');

							$html.removeClass('js-html-layer-closed-animate js-html-layer-opened-' + target);

							if ($preOpenLayer.length) {
								$preOpenLayerOhterElements.removeAttr('aria-hidden').removeAttr('inert').removeAttr('data-ui-js');
								$preOpenLayer.attr('aria-hidden', 'false').removeAttr('inert').attr('aria-modal', 'true');
							}

							if (!$preOpenLayers.length) {
								$html.removeClass('js-html-layer-opened');
								$ohterElements.removeAttr('aria-hidden').removeAttr('inert').removeAttr('data-ui-js');
							}

							if (!$preOpenLayerHasScrollBlock.length && isScrollBlock) {
								scrollBlock.clear();
							}

							if ($opener && $opener.length) {
								$opener.focus();
								$layer.data('layerOpener', null);
							} else {
								$html.attr('tabindex', '0').focus().removeAttr('tabindex');
							}

							$layer.removeClass('js-layer-animated').trigger('layerAfterClosed');
						}
					)
					.trigger('layerClosed');

				timer = setTimeout(function () {
					clearTimeout(timer);
					$html.addClass('js-html-layer-closed-animate');
				}, 0);
			}
		},
		checkFocus: function (e) {
			var $layer = $('[data-layer]')
				.not(':hidden')
				.not(function () {
					var val = $(this).data('scroll-block');
					if (typeof val === 'boolean' && !val) {
						return true;
					} else {
						return false;
					}
				});
			var $target = $(e.target);
			var $closest = $target.closest('[data-layer]');
			var lastIndex = (function () {
				var index = 0;
				$layer.each(function () {
					var crrI = $(this).data('layerIndex');
					if (crrI > index) {
						index = crrI;
					}
				});
				return index;
			})();
			var checkLayer = $layer.length && !($target.is($layer) && $target.data('layerIndex') === lastIndex) && !($closest.length && $closest.is($layer) && $closest.data('layerIndex') === lastIndex);

			if (checkLayer) {
				$layer
					.filter(function () {
						return $(this).data('layerIndex') === lastIndex;
					})
					.focus();
			}
		},
	};
	window.uiJSLayer = uiLayer;

	$doc
		.on('focusin.uiLayer', uiLayer.checkFocus)
		.on('click.uiLayer', '[data-role="layerClose"]', function () {
			var $this = $(this);
			var $layer = $this.closest('[data-layer]');
			var $opener = $layer.data('layerOpener');

			if ($layer.length) {
				uiLayer.close($layer.attr('data-layer'));
			}

			if ($this.is('.ui-label') && $layer.hasClass('layer-wrap--select')) {
				var value = $(this).find('.ui-label-text').text();
				if ($opener.is('.ui-select')) {
					$opener.text(value);
					$opener.closest('.type-placeholder').removeClass('type-placeholder');
				}
			}
		})
		.on('click.uiLayer', '[data-layer-open]', function (e) {
			var $this = $(this);
			var layer = $this.attr('data-layer-open');
			var $layer = $('[data-layer="' + layer + '"]');
			if ($layer.length) {
				uiLayer.open(layer);
				$layer.data('layerOpener', $this);
			}
			e.preventDefault();
		})
		.on('layerAfterOpened.uiLayer', '[data-layer-timer-close]', function () {
			var $this = $(this);
			var layer = $this.attr('data-layer');
			var delay = Number($this.attr('data-layer-timer-close'));
			var timer = setTimeout(function () {
				uiLayer.close(layer);
				clearTimeout(timer);
			}, delay);
			$this.data('layer-timer', timer);
		})
		.on('layerBeforeClosed.uiLayer', '[data-layer-timer-close]', function () {
			var $this = $(this);
			var timer = $this.data('layer-timer');
			clearTimeout(timer);
		});

	// input disabled class
	function checkDisabledClass() {
		var $inputs = $('.ui-input, .ui-select');
		$inputs.each(function () {
			var $this = $(this);
			var $parent = $this.parent('.ui-input-block, .ui-select-block');
			var $formItem = $this.closest('.form-item');
			var $formTitle = $formItem.find('.form-title');
			var $form = $formItem.find('.form-group').find('.ui-input, .ui-select, .ui-radio, ui-checkbox');
			var $formButton = $formItem.find('.ui-basic-button, .form-title .ui-arrow:not(.disabled-no-count)');
			var disabledClassName = 'is-disabled';
			var isDisabled = $this.is(':disabled');
			var disabledHasClass = $parent.hasClass(disabledClassName);
			var readonlyClassName = 'is-readonly';
			var isReadonly = $this.is('[readonly]');
			var readonlyHasClass = $parent.hasClass(readonlyClassName);

			if (isDisabled && !disabledHasClass) {
				$parent.addClass(disabledClassName);
			} else if (!isDisabled && disabledHasClass) {
				$parent.removeClass(disabledClassName);
			}

			if (isReadonly && !readonlyHasClass) {
				$parent.addClass(readonlyClassName);
			} else if (!isReadonly && readonlyHasClass) {
				$parent.removeClass(readonlyClassName);
			}

			if ($form.filter(':disabled').length + $formButton.filter(':disabled').length == $form.length + $formButton.length) {
				$formTitle.addClass(disabledClassName);
			} else {
				$formTitle.removeClass(disabledClassName);
			}

			if ($form.filter('[readonly]').length == $form.length) {
				$formTitle.addClass(readonlyClassName);
			} else {
				$formTitle.removeClass(readonlyClassName);
			}
		});
	}

	// textarea auto height
	function textareaAutoHeight() {
		var $textarea = $('textarea.ui-input');
		$textarea.each(function () {
			var rows = $(this).attr('rows');
			if (rows === undefined) {
				$(this).attr('rows', 1);
			}
			$(this).attr('rows', rows);
			resize($(this));
		});
		$textarea.on('input', function () {
			resize($(this));
		});
		function resize($textarea) {
			$textarea.css('height', 'auto');
			$textarea.css('height', $textarea[0].scrollHeight + 'px');
		}
	}

	// fixBarSet
	function fixBarSet() {
		var $layoutWrap = $('.layout-wrap');
		var $fixedPageButton = $('.page-buttons.type-fixed');
		var $bottom = $('.fix-bottom-wrap');
		var $fakeBottom = $('.js-fake-bottom');
		var bottomH = 0;

		if ($bottom.length && !$bottom.is(':hidden')) {
			bottomH = $bottom.outerHeight();
			if (!$fakeBottom.length) {
				$layoutWrap.append('<div class="js-fake-bottom"></div>');
				$fakeBottom = $('.js-fake-bottom');
			}
			$fixedPageButton.css('bottom', bottomH);
			$fakeBottom.height(bottomH);
		}
	}

	// fixPageButtonsSet
	function fixPageButtonSet() {
		var $contentsWrap = $('.contents-wrap');
		var $button = $('.page-buttons.type-fixed');
		var $fakeButton = $('.js-fake-button');
		var buttonH = 0;

		if ($button.length && !$button.is(':hidden')) {
			buttonH = $button.outerHeight();
			if (!$fakeButton.length) {
				$contentsWrap.append('<div class="js-fake-button"></div>');
				$fakeButton = $('.js-fake-button');
			}
			$fakeButton.height(buttonH);
		}
	}

	// header scroll
	function headerScroll() {
		var $header = $('.header');
		var scrollTop = $win.scrollTop();
		var className = 'is-scroll';

		if (scrollTop > 0) {
			$header.addClass(className);
		} else {
			$header.removeClass(className);
		}
	}

	// checkbox tab
	var checkboxTab = {
		init: function () {
			$('[data-checkbox-tab]:not(:checked)').each(function () {
				checkboxTab.update($(this));
			});
			$('[data-checkbox-tab]:checked').each(function () {
				checkboxTab.update($(this));
			});
		},
		update: function ($input) {
			var name = $input.data('checkbox-tab');
			var $panels = $('[data-checkbox-tab-panel]');
			var $panel = $panels.filter(function () {
				var $this = $(this);
				var val = $this.attr('data-checkbox-tab-panel');
				var array = val.replace(/\s/g, '').split(',');

				return array.indexOf(name) >= 0;
			});
			var isChecked = $input.is(':checked');

			if (isChecked) {
				$panel.show();
			} else {
				$panel.css('display', 'none');
			}

			$panel.trigger('checkboxTabChange');

			textareaAutoHeight();
		},
	};
	$doc.on('change.checkboxTab', '[data-checkbox-tab]', function () {
		var $this = $(this);
		var group = $this.attr('data-checkbox-tab-group');
		var $groupSiblings = $('[data-checkbox-tab-group="' + group + '"]');
		var name = $this.attr('name');
		var $siblings = $('[name="' + name + '"]').not($this);

		if (typeof group === 'string') {
			$groupSiblings.not(':checked').each(function () {
				checkboxTab.update($(this));
			});
			$groupSiblings.filter(':checked').each(function () {
				checkboxTab.update($(this));
			});
		} else {
			if ($this.is('[type="radio"]')) {
				$siblings.each(function () {
					checkboxTab.update($(this));
				});
			}
			checkboxTab.update($this);
		}
	});

	// checkbox group
	var checkboxGroup = {
		init: function () {
			$($('[data-checkbox-group-child]').get().reverse()).each(function () {
				checkboxGroup.update($(this));
			});
		},
		on: function () {
			$doc.on('change.uiJSCheckboxGroup', '[data-checkbox-group], [data-checkbox-group-child]', function (e, eventBy) {
				checkboxGroup.update($(this), eventBy);
			});
		},
		update: function ($input, eventBy) {
			var parentName = $input.attr('data-checkbox-group');
			var childName = $input.attr('data-checkbox-group-child');

			if (typeof childName === 'string' && childName.length) {
				checkboxGroup.updateChild(childName, eventBy);
			}
			if (typeof parentName === 'string' && parentName.length) {
				checkboxGroup.updateParent(parentName, eventBy);
			}
		},
		updateParent: function (name, eventBy) {
			var $parent = $('[data-checkbox-group=' + name + ']').not('[disabled]');
			var $child = $('[data-checkbox-group-child=' + name + ']').not('[disabled]');
			var checked = $parent.is(':checked');

			if (!(typeof eventBy === 'string' && eventBy === 'checkboxGroupUpdateChild')) {
				$child.each(function () {
					var $thisChild = $(this);
					var beforeChecked = $thisChild.is(':checked');

					if (checked) {
						$thisChild.prop('checked', true).attr('checked', '');
					} else {
						$thisChild.prop('checked', false).removeAttr('checked');
					}

					var afterChecked = $thisChild.is(':checked');

					if (beforeChecked !== afterChecked) {
						$thisChild.trigger('change');
					}
				});
			}
		},
		updateChild: function (name, eventBy) {
			var $parent = $('[data-checkbox-group=' + name + ']').not('[disabled]');
			var $child = $('[data-checkbox-group-child=' + name + ']').not('[disabled]');
			var length = $child.length;
			var checkedLength = $child.filter(':checked').length;

			$parent.each(function () {
				var $thisParent = $(this);
				var beforeChecked = $thisParent.is(':checked');

				if (length === checkedLength) {
					$thisParent.prop('checked', true).attr('checked', '');
				} else {
					$thisParent.prop('checked', false).removeAttr('checked');
				}

				var afterChecked = $thisParent.is(':checked');

				if (beforeChecked !== afterChecked) {
					$thisParent.trigger('change', 'checkboxGroupUpdateChild');
				}
			});
		},
	};
	checkboxGroup.on();

	// selet tab
	var selectTab = {
		init: function () {
			$('.ui-select').each(function () {
				selectTab.update($(this));
			});
		},
		update: function ($select) {
			var $tapOption = $select.find('[data-select-tab]');

			if (!$tapOption.length) {
				return;
			}

			$tapOption.not(':selected').each(function () {
				var $this = $(this);
				var name = $this.attr('data-select-tab');
				var $panel = $('[data-select-tab-panel="' + name + '"]');

				$panel.css('display', 'none');
			});
			$tapOption.filter(':selected').each(function () {
				var $this = $(this);
				var name = $this.attr('data-select-tab');
				var $panel = $('[data-select-tab-panel="' + name + '"]');

				$panel.css('display', 'block');
			});
		},
	};
	$doc.on('change.selectTab', '.ui-select', function () {
		selectTab.update($(this));
	});

	// area disabled
	var areaDisabled = {
		className: {
			disabled: 'is-area-disabled',
		},
		init: function () {
			$('[data-area-disabled]').each(function () {
				var $this = $(this);
				areaDisabled.eventCall($this);
			});
		},
		eventCall: function ($this) {
			var isRadio = $this.attr('type') === 'radio';
			var name = $this.attr('name');

			if (isRadio) {
				$('[name="' + name + '"]')
					.not($this)
					.each(function () {
						areaDisabled.update($(this));
					});
			}

			areaDisabled.update($this);
		},
		update: function ($input) {
			var target = $input.attr('data-area-disabled');
			var $sameInput = $('[data-area-disabled="' + target + '"]').not($input);
			var $target = $('[data-area-disabled-target="' + target + '"]');
			var selector = 'input, select, button, textarea, fieldset, optgroup, duet-date-picker';
			var $duetDateInput = $target.find('.duet-date__input');
			var isChecked = $input.is(':checked') || $sameInput.filter(':checked').length;

			if ($input.attr('data-area-disabled-type') === 'multi') {
				isChecked = $input.is(':checked') && $sameInput.length === $sameInput.filter(':checked').length;
			}

			if (isChecked) {
				$target.removeClass(areaDisabled.className.disabled);
				if ($target.is(selector)) {
					$target.prop('disabled', false).removeAttr('disabled');
				}
				$target.find(selector).prop('disabled', false).removeAttr('disabled');
				$duetDateInput.prop('readonly', true).attr('readonly', '');
			} else {
				$target.addClass(areaDisabled.className.disabled);
				if ($target.is(selector)) {
					$target.prop('disabled', true).attr('disabled', '');
				}
				$target.find(selector).prop('disabled', true).attr('disabled', '');
				$duetDateInput.prop('readonly', false).removeAttr('readonly');
			}
			checkDisabledClass();
		},
	};
	$doc.on('change.areaDisabled', '[data-area-disabled]', function () {
		var $this = $(this);
		areaDisabled.eventCall($this);
	});

	// menu nav bar
	var menuNavBar = {
		init: function () {
			var $nav = $('.menu-nav-bar-list');

			if (!$nav.length) {
				return;
			}

			hashScroll.updateLinkClass();
			var index = $('.menu-nav-bar-link.is-active').closest('.menu-nav-bar-item').index();
			$nav.swiperSet({
				slidesPerView: 'auto',
				freeMode: true,
				freeModeMomentumBounce: false,
				touchReleaseOnEdges: true,
				mousewheel: true,
				initialSlide: index,
			});

			var $layerWrap = $('.page-contents .menu-nav-layer-wrap');
			var $bottom = $('.fix-bottom-wrap');
			var bottomH = $bottom.length && $bottom.is(':visible') ? $bottom.outerHeight() : 0;
			$layerWrap.css('bottom', bottomH);
		},
		scrollTo: function ($link) {
			var $item = $link.closest('.menu-nav-bar-item');
			var $list = $link.closest('.menu-nav-bar-list');
			var $scroller = $link.closest('.menu-nav-bar-scroller');
			var swiper = $list.data('swiper');
			var index = $item.attr('data-swiper-set-slide-index');
			var isOverflow = (function () {
				if ($scroller.length && $item.length) {
					return $scroller.width() < $item.offset().left + $item.width() - $scroller.offset().left || $scroller.offset().left > $item.offset().left;
				} else {
					return false;
				}
			})();

			if (swiper && isOverflow) {
				swiper.slideTo(index);
			}
		},
		openLayer: function ($wrap) {
			var $layerWrap = $wrap.find('.menu-nav-layer-wrap');

			$layerWrap.stop().css('display', 'block').animate(
				{
					opacity: 1,
				},
				350
			);
			$wrap.addClass('is-opened');
		},
		closeLayer: function ($wrap) {
			var $layerWrap = $wrap.find('.menu-nav-layer-wrap');

			$layerWrap.stop().animate(
				{
					opacity: 0,
				},
				350,
				function () {
					$layerWrap.css('display', 'none');
				}
			);
			$wrap.removeClass('is-opened');
		},
		toggleLayer: function ($wrap) {
			if ($wrap.hasClass('is-opened')) {
				menuNavBar.closeLayer($wrap);
			} else {
				menuNavBar.openLayer($wrap);
			}
		},
	};
	$doc
		.on('click.menuNavBar', '.menu-nav-bar-link', function () {
			menuNavBar.scrollTo($(this));
		})
		.on('click.menuNavBar', '.menu-nav-bar-opener', function () {
			menuNavBar.toggleLayer($(this).closest('.menu-nav'));
		})
		.on('click.menuNavBar', '.menu-nav-layer-link', function () {
			var $this = $(this);
			menuNavBar.closeLayer($this.closest('.menu-nav'));
			menuNavBar.scrollTo($('.menu-nav-bar-link[href="' + $this.attr('href') + '"]'));
		})
		.on('click.menuNavBar', function (e) {
			menuNavBar.closeLayer($('.menu-nav'));
		})
		.on('click.menuNavBar', '.menu-nav-layer, .menu-nav-bar-opener', function (e) {
			e.stopPropagation();
		});

	// slide banner
	var slideBanner = {
		init: function () {
			$('.slide-banner').each(function () {
				var $this = $(this);
				var $list = $this.find('.slide-banner-list');
				var $item = $this.find('.slide-banner-item');
				var $controller = $this.find('.slide-banner-controller');
				var autoHeightOption = $(this).hasClass('type-fix-height') ? false : true;
				var length = $item.length;

				function update(swiper) {
					if ($(swiper.slides).eq(swiper.activeIndex).hasClass('is-white')) {
						$this.addClass('type-white');
					} else {
						$this.removeClass('type-white');
					}
				}

				if (length <= 1) {
					$this.addClass('is-once');
				}

				$list.swiperSet({
					appendController: $controller,
					prevControl: true,
					nextControl: true,
					togglePlayControl: true,
					pageControl: true,
					pagination: {
						type: 'fraction',
					},
					autoHeight: autoHeightOption,
					autoplay: {
						delay: 3500,
					},
					loop: true,
					on: {
						init: update,
						slideChange: update,
					},
				});
			});
		},
	};
	$doc.on('layerOpened.slideBanner', '.layer-wrap', function () {
		var $this = $(this);
		var $banner = $this.find('.slide-banner-list');

		if ($banner.length) {
			$banner.each(function () {
				var $this = $(this);
				var swiper = $this.data('swiper');

				if (swiper) {
					swiper.update();
				}
			});
		}
	});

	// card slide
	var slideCard = {
		init: function () {
			$('.slide-card').each(function () {
				var $this = $(this);
				var $list = $this.find('.slide-card-list');
				var swiper = $list.data('swiper');

				if (swiper) return;

				var $items = $this.find('.slide-card-item');
				var $body = $('body');
				var $slideEl = $('.js-slide-card-el');
				var $dimTarget = $('.slide-card-dim, .slide-card-dim-close');
				var dimActiveClass = 'is-dim';
				var length = $items.length;
				var $detail = $this.closest('.card-detail');
				var $labels = $items.find('.js-slide-card-label');
				var isDetail = Boolean($detail.length);
				var $pagination = (function () {
					if (isDetail) {
						return $detail.find('.slide-card-pagination');
					} else {
						return $this.find('.slide-card-pagination');
					}
				})();
				var $paginationList = (function () {
					var label = '';
					var html = '<div class="slide-card-pagination-list">';
					for (var i = 0; i < length; i++) {
						label = $labels.eq(i).length ? $labels.eq(i).text() : i + 1 + '번째 카드로 이동';
						html +=
							'<div class="slide-card-pagination-item"><button type="button" class="slide-card-pagination-button" aria-label="' + label + '" ' + (i === 0 ? 'title="선택됨"' : '') + '></button></div>';
					}
					html += '</div>';
					$pagination.append(html);
					return $pagination.find('.slide-card-pagination-list');
				})();
				var $paginationButtons = $paginationList.find('.slide-card-pagination-button');
				var paginationClick = false;

				if (length <= 1) {
					$pagination.addClass('is-hide');
				}

				$paginationList.swiperSet({
					slidesPerView: 'auto',
					centerInsufficientSlides: true,
					a11y: {
						enabled: false,
					},
				});

				var paginationSwiper = $paginationList.data('swiper');

				$list.swiperSet({
					prevControl: true,
					nextControl: true,
					a11yHidden: true,
					slidesPerView: 'auto',
					centeredSlides: true,
					thumbs: {
						swiper: paginationSwiper,
					},
					on: {
						init: function (swiper) {
							var index = swiper.realIndex;

							$paginationButtons.removeAttr('title').eq(index).attr('title', '선택됨');

							slideCard.change(index);

							$this.trigger('slideCardInit', [index]);
						},
						slideChange: function (swiper) {
							var index = swiper.realIndex;

							$paginationButtons.removeAttr('title').eq(index).attr('title', '선택됨');

							slideCard.change(index);

							if ($('[data-aria-hidden-target]').length) {
								if (index == 0) {
									$body.removeClass(dimActiveClass);
									$dimTarget.fadeOut();
									$slideEl.fadeOut();
								} else {
									$body.addClass(dimActiveClass);
									$dimTarget.fadeIn();
									$slideEl.fadeIn();
								}
							}

							$this.trigger('slideCardChange', [index]);
						},
						slideChangeTransitionEnd: function (swiper) {
							var $slides = $(swiper.slides);
							var $activeItem = $slides.eq(swiper.activeIndex);
							var resetClick = $list.data('slideCardResetClick');
							var isResetClick = typeof resetClick === 'boolean' ? resetClick : false;

							if (paginationClick || isResetClick) {
								$activeItem.attr('tabindex', '0').focus();
							}
							paginationClick = false;
						},
					},
				});

				$paginationButtons.on('click.slideCard', function () {
					var $this = $(this);
					var i = $paginationButtons.index($this);

					paginationClick = true;

					$list.data('swiper').slideTo(i);
				});
			});
		},
		reset: function ($wrap) {
			var $list = $wrap.find('.slide-card-list');
			var swiper = $list.data('swiper');
			if (swiper) {
				$list.data('slideCardResetClick', true);
				swiper.slideTo(0);
			}
		},
		change: function (index) {
			$('.slide-card-info-item').each(function () {
				$(this).removeClass('is-active');
				if ($(this).index() == index) {
					$(this).addClass('is-active');
				}
			});
		},
	};
	$doc.on('click.slideCard', '.slide-card-dim-close', function () {
		slideCard.reset($(this).closest('.card-detail').find('.slide-card'));
	});

	// benefit slide
	var benefitSlide = {
		init: function () {
			$('.slide-benefit').each(function () {
				var $this = $(this);
				var $list = $this.find('.slide-benefit-list');

				$list.swiperSet({
					slidesPerView: 'auto',
					pageControl: true,
					pagination: {
						clickable: true,
					},
					a11yHidden: true,
				});
			});
		},
	};

	// slide account-empty
	var accountEmptySlide = {
		init: function () {
			$('.slide-account-empty').each(function () {
				var $this = $(this);
				var $list = $this.find('.slide-account-empty-list');
				var $controller = $this.find('.slide-account-controller');

				$list.swiperSet({
					appendController: $controller,
					prevControl: true,
					nextControl: true,
					togglePlayControl: true,
					slidesPerView: 'auto',
					centeredSlides: true,
					pageControl: false,
					autoplay: {
						delay: 1500,
					},
					loop: true,
				});
			});
		},
	};

	// mbti slide
	var mbtiSlide = {
		init: function () {
			$('.slide-mbti-tags').each(function () {
				var $this = $(this);
				var $controller = $this.find('.slide-mbti-controller');
				var $reverseList = $this.find('.slide-mbti-reverse .mbti-tags-list');
				var $forwardList = $this.find('.slide-mbti-forward .mbti-tags-list');
				var reverseItemLastIndex = $reverseList.find('.mbti-tags-item').length - 1;
				var prevIndex = 0;
				var isInit = false;

				$forwardList.swiperSet({
					slidesPerView: 'auto',
					centeredSlides: true,
					pageControl: false,
					loop: true,
				});

				$reverseList.swiperSet({
					appendController: $controller,
					prevControl: true,
					nextControl: true,
					togglePlayControl: true,
					slidesPerView: 'auto',
					centeredSlides: true,
					pageControl: false,
					autoplay: {
						delay: 1500,
						reverseDirection: true,
					},
					loop: true,
					on: {
						init: function () {
							isInit = true;
						},
						slideChange: function (swiper) {
							if (!isInit) return;

							var index = swiper.realIndex;

							if (prevIndex === index) return;

							var direction = 'Next';
							var forwardSwiper = $forwardList.data('swiper');

							if (prevIndex > index || (prevIndex === reverseItemLastIndex && index === reverseItemLastIndex) || (prevIndex === 0 && index === reverseItemLastIndex)) {
								direction = 'Prev';
							}
							if ((prevIndex < index && index < reverseItemLastIndex) || (prevIndex === 0 && index == 0) || (prevIndex === reverseItemLastIndex && index === 0)) {
								direction = 'Next';
							}

							if (direction == 'Prev') {
								forwardSwiper.slideNext();
							} else if (direction == 'Next') {
								forwardSwiper.slidePrev();
							}

							prevIndex = index;
						},
					},
				});
			});
		},
	};

	// postcard select
	var postcardSelect = {
		init: function () {
			$('.postcard').each(function () {
				postcardSelect.checkedUpdate($(this));
			});
		},
		checkedUpdate: function ($wrap) {
			var $previewImg = $wrap.find('.postcard-preview-image');
			var $selectImg = $wrap.find('.postcard-block .ui-radio:checked + .ui-label .postcard-image');

			$previewImg.attr('src', $selectImg.attr('src')).attr('alt', $selectImg.attr('alt'));
		},
	};
	$doc
		.on('change.postcardSelect', '.postcard-block .ui-radio', function () {
			var $this = $(this);
			var $wrap = $this.closest('.postcard');

			postcardSelect.checkedUpdate($wrap);
		})
		.on('checkboxTabChange.postcardSelect', '.postcard-list', function (e) {
			var $this = $(this);
			var timer = $this.data('timer');

			clearTimeout(timer);

			timer = setTimeout(function () {
				clearTimeout(timer);

				var $wrap = $this.closest('.postcard');
				var $items = $this.find('.postcard-item');
				var $visibleItems = $items.filter(':visible');

				if ($wrap.is(':visible')) {
					$items.each(function () {
						var $thisItem = $(this);
						var $input = $thisItem.find('.ui-radio');

						if ($thisItem.is($visibleItems.eq(0))) {
							$input.prop('checked', true).attr('checked', '').trigger('change');
						} else {
							$input.prop('checked', false).removeAttr('checked');
						}
					});
				}
			});

			$this.data('timer', timer);
		});

	// tutorial slide
	var tutorialSlide = {
		init: function () {
			$('.tutorial-slide').each(function () {
				var $this = $(this);
				var $list = $this.find('.tutorial-slide-list');
				var $scroller = $this.find('.tutorial-slide-scroller-inner');

				$list.swiperSet({
					direction: 'vertical',
					pageControl: true,
					pagination: {
						clickable: true,
					},
					touchReleaseOnEdges: true,
				});
				$scroller.swiperSet({
					direction: 'vertical',
					slidesPerView: 'auto',
					freeMode: true,
					freeModeMomentumBounce: false,
					touchReleaseOnEdges: true,
					mousewheel: true,
					nested: true,
				});
			});
		},
		resize: function () {
			var $wrap = $('.tutorial-slide');
			var winH = $win.height();
			var hasClass;

			if ($wrap.length) {
				hasClass = $wrap.hasClass('is-min-size');

				if (winH < 736 && !hasClass) {
					$wrap.addClass('is-min-size');
				} else if (winH >= 736 && hasClass) {
					$wrap.removeClass('is-min-size');
				}
			}
		},
	};

	// guide slide
	var guideSlide = {
		init: function () {
			$('.guide-slide').each(function () {
				var $this = $(this);
				var $list = $this.find('.guide-slide-list');
				var $controller = $this.find('.guide-slide-controller');

				$list.swiperSet({
					appendController: $controller,
					prevControl: true,
					nextControl: true,
					togglePlayControl: true,
					pageControl: true,
					pagination: {
						clickable: true,
					},
					autoplay: {
						delay: 3500,
					},
					loop: true,
					a11yHidden: true,
					on: {
						init: function (swiper) {
							var $scroller = $(swiper.slides).find('.guide-slide-scroller-inner');

							$scroller.swiperSet({
								direction: 'vertical',
								slidesPerView: 'auto',
								freeMode: true,
								freeModeMomentumBounce: false,
								touchReleaseOnEdges: true,
								mousewheel: true,
								nested: true,
								a11y: {
									enabled: false,
								},
							});
						},
					},
				});
			});
		},
	};

	// text slide
	var textSlide = {
		init: function () {
			$('.text-slide').each(function () {
				var $this = $(this);
				var $list = $this.find('.text-slide-list');
				var $controller = $this.find('.text-slide-controller');

				$list.swiperSet({
					wrapTagName: 'span',
					containerTagName: 'span',
					effect: 'fade',
					fadeEffect: {
						crossFade: true,
					},
					allowTouchMove: false,
					autoplay: {
						delay: 2000,
					},
					loop: true,
					appendController: $controller,
					prevControl: true,
					nextControl: true,
					togglePlayControl: true,
					pageControl: true,
					pagination: {
						type: 'fraction',
					},
					a11yHidden: true,
				});
			});
		},
	};

	// button toggle
	var buttonToggle = {
		className: 'is-active',
		init: function () {
			$('[data-toggle="true"]').each(function () {
				var $this = $(this);
				if (!$this.find('.toggle-for-a11y').length) {
					$this.append('<span class="for-a11y toggle-for-a11y"></span>');
				}
				var $forA11y = $this.find('.toggle-for-a11y');
				if ($this.is('.card-button-add, .ui-badge.type-icon-more, .coupon-detail-button.type-heart')) {
					if (!$this.hasClass(buttonToggle.className)) {
						$forA11y.text('추가하기');
					} else {
						$forA11y.text('삭제하기');
					}
				} else {
					if (!$this.hasClass(buttonToggle.className)) {
						$forA11y.text('비활성화');
					} else {
						$forA11y.text('활성화');
					}
				}
			});
		},
		update: function ($this) {
			$this.toggleClass(buttonToggle.className);
			buttonToggle.init();
		},
	};
	$doc.on('click.buttonToggle', '[data-toggle="true"]', function () {
		var $this = $(this);
		buttonToggle.update($this);
	});

	/* step slide */
	var stepSlide = {
		init: function () {
			$('.step-slide').each(function () {
				var $this = $(this);
				var $list = $this.find('.step-slide-list');
				var name = $this.attr('data-step-slide');

				$list.swiperSet({
					autoHeight: true,
					allowTouchMove: false,
					a11yHidden: true,
					on: {
						init: function (swiper) {
							stepSlide.update($this, swiper, name);
							stepSlide.a11yChange(swiper);
						},
						slideChange: function (swiper) {
							$list.removeAttr('aria-live');
							stepSlide.update($this, swiper, name);
							stepSlide.a11yChange(swiper);
						},
						slideChangeTransitionEnd: function (swiper) {
							stepSlide.a11yFocus(swiper);
						},
					},
				});
			});
		},
		update: function ($wrap, swiper, name) {
			$wrap.attr('data-step-slide-index', swiper.realIndex);
			$('[data-step-slide-counting="' + name + '"]').text(swiper.realIndex + 1);

			var $mbtiLoading = $(swiper.slides[swiper.realIndex]).find('.mbti-loading');
			if ($mbtiLoading.length) {
				mbtiLoading.init();
			}
		},
		next: function (name) {
			var $wrap = $('.step-slide[data-step-slide="' + name + '"]').eq(0);
			var $list = $wrap.find('.step-slide-list');
			var swiper = $list.data('swiper');

			if (swiper) {
				swiper.slideNext();
			}
		},
		prev: function (name) {
			var $wrap = $('.step-slide[data-step-slide="' + name + '"]').eq(0);
			var $list = $wrap.find('.step-slide-list');
			var swiper = $list.data('swiper');

			if (swiper) {
				swiper.slidePrev();
			}
		},
		start: function (name) {
			var $wrap = $('.step-slide[data-step-slide="' + name + '"]').eq(0);
			var $list = $wrap.find('.step-slide-list');
			var swiper = $list.data('swiper');

			if (swiper) {
				swiper.slideTo(0);
			}
		},
		goTo: function (name, page) {
			var $wrap = $('.step-slide[data-step-slide="' + name + '"]').eq(0);
			var $list = $wrap.find('.step-slide-list');
			var swiper = $list.data('swiper');

			if (swiper) {
				swiper.slideTo(page);
			}
		},
		a11yChange: function (swiper) {
			var $slides = $(swiper.slides);
			var $activeItem = $slides.eq(swiper.activeIndex);
			var target = '[data-step-slide-next], [data-step-slide-prev], [data-step-slide-start]';

			if ($activeItem.is(':visible')) {
				$slides.not($activeItem).find(target).prop('disabled', true).attr({
					'aria-hidden': 'true',
					disabled: '',
					inert: '',
				});
				$activeItem.find(target).prop('disabled', false).removeAttr('aria-hidden disabled inert');
			}
		},
		a11yFocus: function (swiper) {
			var $slides = $(swiper.slides);
			var $activeItem = $slides.eq(swiper.activeIndex);

			if ($activeItem.is(':visible')) {
				$activeItem.focus();
			}
		},
	};
	window.uiJSStepSlide = stepSlide;

	$doc
		.on('click.stepSlide', '[data-step-slide-next]', function (e) {
			var $this = $(this);
			var name = $this.attr('data-step-slide-next');

			if ($this.is('a')) {
				e.preventDefault();
			}

			stepSlide.next(name);
		})
		.on('click.stepSlide', '[data-step-slide-prev]', function (e) {
			var $this = $(this);
			var name = $this.attr('data-step-slide-prev');

			if ($this.is('a')) {
				e.preventDefault();
			}

			stepSlide.prev(name);
		})
		.on('click.stepSlide', '[data-step-slide-start]', function (e) {
			var $this = $(this);
			var name = $this.attr('data-step-slide-start');

			if ($this.is('a')) {
				e.preventDefault();
			}

			stepSlide.start(name);
		});

	// mbti loading
	var mbtiLoading = {
		timer: [null, null],
		init: function () {
			var $wrap = $('.mbti-loading');

			if ($wrap.length <= 0) return;

			for (var i = 0; i < mbtiLoading.timer.length; i++) {
				clearTimeout(mbtiLoading.timer[i]);
			}

			$wrap.removeClass('is-animation').css('opacity', 1);

			mbtiLoading.timer[0] = setTimeout(function () {
				$wrap.addClass('is-animation');

				mbtiLoading.timer[1] = setTimeout(function () {
					$wrap.animate(
						{
							opacity: 0,
						},
						500,
						function () {
							mbtiLoading.init();
						}
					);
				}, 6000);
			}, 1000);
		},
	};

	// query keywords
	var queryKeywords = {
		checkEmpty: function () {
			var $wrap = $('[data-query-keywords]');
			var $items = $wrap.find('.keywords-item');

			if ($items.length) {
				$wrap.removeClass('is-empty');
			} else {
				$wrap.addClass('is-empty');
			}
		},
		add: function (name, textArray) {
			var $wrap = $('[data-query-keywords="' + name + '"]');
			var $list = $wrap.find('.keywords-list');

			for (var i = 0; i < textArray.length; i++) {
				$list.append('<li class="keywords-item"><div class="keywords-tag"><div class="keywords-text">' + textArray[i] + '</div></div></li>');
			}

			queryKeywords.checkEmpty();
		},
		next: function ($form) {
			var name = $form.attr('data-query-keywords-form');
			var $checkboxsWrap = $form.find('.js-query-keywords-checkboxs');

			$checkboxsWrap.each(function () {
				var $this = $(this);
				var $checkedInput = $this.find('[type="radio"]:checked, [type="checkbox"]:checked');
				var textArray = [];
				var limitMax = (function () {
					var val = $this.attr('data-limit-max');

					if (val) {
						return Number(val);
					} else {
						return null;
					}
				})();

				if (typeof limitMax === 'number' && limitMax < $checkedInput.length) {
					return;
				}

				$checkedInput.each(function () {
					var text = $(this).attr('data-query-keywords-text');
					textArray.push(text);
				});

				queryKeywords.add(name, textArray);
			});

			$form.trigger('uiQueryKeywordsNext');
		},
		empty: function (name) {
			var $wrap = $('[data-query-keywords="' + name + '"]');
			var $list = $wrap.find('.keywords-list');

			$list.empty();

			queryKeywords.checkEmpty();
		},
	};
	$doc
		.on('click.queryKeywords', '.js-query-keywords-next', function () {
			var $this = $(this);
			var $form = $this.closest('[data-query-keywords-form]');

			queryKeywords.next($form);
		})
		.on('click.queryKeywords', '[data-query-keywords-reset]', function () {
			var $this = $(this);
			var name = $this.attr('data-query-keywords-reset');

			queryKeywords.empty(name);
		});

	// page class
	function pageClass() {
		var $html = $('html');

		if ($('.tutorial-slide').length && $('.dock-menu').length <= 0) {
			$html.addClass('is-full-contents');
		}
	}

	// duet-date-picker
	var datePickerTimer = null;
	function datePickerInit() {
		$('duet-date-picker').each(function () {
			var $this = $(this);
			var $layer = $this.find('.duet-date__dialog');
			var initTimer = $this.data('datePickerInitTimer');
			var picker = this;

			picker.firstDayOfWeek = 0;
			picker.localization = {
				buttonLabel: '날짜 선택',
				placeholder: '연도-월-일',
				selectedDateMessage: '선택 된 날짜',
				prevMonthLabel: '이전 달',
				nextMonthLabel: '다음 달',
				monthSelectLabel: '월',
				yearSelectLabel: '연도',
				closeLabel: '닫기',
				calendarHeading: '날짜 선택',
				dayNames: ['일 요일', '월 요일', '화 요일', '수 요일', '목 요일', '금 요일', '토 요일'],
				monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
				monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
				locale: 'ko-KR',
			};

			clearTimeout(initTimer);

			initTimer = setTimeout(function () {
				clearTimeout(initTimer);
				if (!$layer.hasClass('is-active')) {
					$this.find('.duet-date__select select').prop('disabled', true).attr({
						disabled: '',
						'aria-hidden': 'true',
						inert: '',
					});
				}

				var $duetDateInput = $this.find('.duet-date__input');

				if (!$duetDateInput.is(':disabled')) {
					$duetDateInput.prop('readonly', true).attr('readonly', '');
				}
			}, 200);

			$this.data('datePickerInitTimer', initTimer);
		});
	}
	function datePickerAnimated() {
		var $html = $('html');

		$html.addClass('is-date-picker-animated');

		clearTimeout(datePickerTimer);
		datePickerTimer = setTimeout(function () {
			clearTimeout(datePickerTimer);
			$html.removeClass('is-date-picker-animated');
		}, 300);
	}
	$doc
		.on('duetOpen.uiJSCommon', 'duet-date-picker', function () {
			var $this = $(this);
			var $html = $('html');

			$html.addClass('is-date-picker-opened');
			$this.find('.duet-date__select select').prop('disabled', false).removeAttr('aria-hidden inert');

			datePickerAnimated();
		})
		.on('duetClose.uiJSCommon', 'duet-date-picker', function () {
			var $this = $(this);
			var $html = $('html');

			$html.removeClass('is-date-picker-opened');
			$this.find('.duet-date__select select').prop('disabled', true).attr({
				disabled: '',
				'aria-hidden': 'true',
				inert: '',
			});

			datePickerAnimated();
		});

	// A11y Init
	function selectedA11y(selector, hasClass, title, child) {
		$(selector).each(function () {
			var $this = $(this);
			var $target = (function () {
				if (typeof child === 'string') {
					return $this.find(child);
				} else {
					return $this;
				}
			})();

			if ($this.hasClass(hasClass)) {
				$target.attr('title', title);
			} else {
				$target.removeAttr('title');
			}
		});
	}
	function a11yInit() {
		// accordion
		var a11yAccordionOpener =
			'.accordion-opener.js-ui-accordion__opener:not(.js-accordion-active), ' +
			'.faq-opener.js-ui-accordion__opener:not(.js-accordion-active), ' +
			'.accordion-step-opener.js-ui-accordion__opener:not(.js-accordion-active)';
		$(a11yAccordionOpener).each(function () {
			$(this).attr('title', '상세 내용 열기');
		});

		// header
		selectedA11y('.header-button.type-push', 'is-new', '신규 알림 있음');

		// tab nav
		selectedA11y('.ui-tab-link:not([data-tab-open])', 'is-active', '현재 메뉴 선택 됨');

		// dock bar
		selectedA11y('.dock-menu-item', 'is-active', '현재 메뉴 선택 됨', '.dock-menu-link');

		// sorting
		selectedA11y('.sorting-item .ui-radio-block.type-tab a.ui-label', 'is-active', '현재 메뉴 선택 됨');

		// layer select option
		$('.js-layer-select-option[role="button"]').each(function () {
			var $this = $(this);
			var $thisInput = $this.find('input[type="radio"]');

			if ($thisInput.is(':checked')) {
				$this.attr('title', '선택 됨');
			} else {
				$this.removeAttr('title');
			}
		});
		$('[data-layer-select-option]').each(function () {
			var $this = $(this);

			if ($this.hasClass('is-checked')) {
				$this.attr('title', '선택 됨');
			} else {
				$this.removeAttr('title');
			}
		});
	}
	window.uiJSA11yInit = a11yInit;

	// common js
	function uiJSCommon() {
		textareaAutoHeight();
		checkScrollbars();
		checkDisabledClass();
		checkboxGroup.init();
		checkboxTab.init();
		selectTab.init();
		areaDisabled.init();
		buttonToggle.init();
		datePickerInit();
		pageClass();

		$('a').each(function () {
			var $this = $(this);

			if (!(typeof $this.attr('href') === 'string')) {
				$this.attr('tabindex', '0').attr('role', 'button');
			}
		});

		// 검색바 UI 변경 관련 내용 asis, tobe 스타일 둘 다 공존 할 수 있도록 하기 위한 임시 스크립트
		// tobe가 모두 반영 되면 삭제 예정
		$('.ui-input-block.type-search').each(function () {
			var $this = $(this);
			var $submit = $this.find('.ui-input-search');

			if (Boolean($submit) === false || $submit.length <= 0) {
				$this.addClass('type-no-button');
			}
		});

		$('.js-ui-tab-panel').each(function () {
			var $this = $(this);
			var initial = $this.attr('data-initial');
			var filter = function () {
				var $thisItem = $(this);
				var $wrap = $thisItem.closest('.js-ui-tab-panel');

				if ($wrap.is($this)) {
					return true;
				} else {
					return false;
				}
			};
			var $items = $this.find('[data-tab]').filter(filter);
			var $openers = $this.find('[data-tab-open]').filter(filter);

			$this.uiTabPanel({
				a11y: true,
				item: $items,
				opener: $openers,
				initialOpen: initial,
			});
		});

		$('.js-ui-accordion').each(function () {
			var $this = $(this);
			var once = $this.attr('data-once') === 'true';
			var focusInOpen = !($this.attr('data-focus-open') === 'false');
			var filter = function () {
				var $thisItem = $(this);
				var $wrap = $thisItem.closest('.js-ui-accordion');

				if ($wrap.is($this)) {
					return true;
				} else {
					return false;
				}
			};
			var $items = $this.find('.js-ui-accordion__item').filter(filter);
			var $openers = $this.find('.js-ui-accordion__opener').filter(filter);
			var $layers = $this.find('.js-ui-accordion__layer').filter(filter);

			if ($this.get(0).uiAccordion) {
				$this.uiAccordion('update', {
					item: $items,
					opener: $openers,
					layer: $layers,
				});
			} else {
				$this.uiAccordion({
					item: $items,
					opener: $openers,
					layer: $layers,
					once: once,
					focusInOpen: focusInOpen,
				});
			}
		});

		$('.ui-tooltip.js-ui-dropdown').each(function () {
			var $this = $(this);
			var vertical = $this.attr('data-vertical');

			$this.uiDropDown({
				opener: '.js-ui-dropdown__opener',
				layer: '.js-ui-dropdown__layer',
				marginLeft: 24,
				marginRight: 24,
				align: 'center',
				defaultVertical: typeof vertical === 'string' && vertical === 'top' ? 'top' : 'bottom',
			});
		});

		$('.js-ui-dropdown:not(.ui-tooltip)').uiDropDown({
			opener: '.js-ui-dropdown__opener',
			layer: '.js-ui-dropdown__layer',
		});

		$('.ui-rangeslider').each(function () {
			var $this = $(this);
			var $input = $this.find('[type="range"]');
			var $bubble = $this.find('.chart-bubble');
			var watch = $this.attr('data-rangeslider-watch');
			var $watch = null;
			var isComma = $this.attr('data-rangeslider-watch-comma') === 'true';
			var orientation = $input.attr('data-orientation') || 'horizontal';

			if (typeof watch === 'string') {
				$watch = $(watch);
			}

			function bubbleUpdate(position, value) {
				if ($bubble.length) {
					if (orientation === 'horizontal') {
						$bubble.css('left', position);
					} else if (orientation === 'vertical') {
						$bubble.css('bottom', position);
					}
				}
				if ($watch && $watch.length) {
					if (isComma) {
						$watch.text(value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
					} else {
						$watch.text(value);
					}
				}
			}

			$input.rangeslider({
				polyfill: false,
				onInit: function () {
					bubbleUpdate(this.position, this.value);
				},
				onSlide: function (position, value) {
					bubbleUpdate(position, value);
				},
			});
		});

		menuNavBar.init();
		slideBanner.init();
		slideCard.init();
		stepSlide.init();
		mbtiLoading.init();
		queryKeywords.checkEmpty();
		postcardSelect.init();
		multiCard.init();
		tutorialSlide.init();
		benefitSlide.init();
		guideSlide.init();
		textSlide.init();
		accountEmptySlide.init();
		mbtiSlide.init();

		// A11y
		a11yInit();
	}
	window.uiJSCommon = uiJSCommon;

	// uiJSResize
	function uiJSResize() {
		fixBarSet();
		fixPageButtonSet();
		buttonScroll();
	}
	window.uiJSResize = uiJSResize;

	// accordion A11y
	function a11yAccordionEvent(item, opener) {
		$doc
			.on('uiAccordionOpened.uiJSCommon', item, function () {
				$(this).find(opener).eq(0).attr('title', '상세 내용 닫기');
			})
			.on('uiAccordionClosed.uiJSCommon', item, function () {
				$(this).find(opener).eq(0).attr('title', '상세 내용 열기');
			});
	}
	a11yAccordionEvent('.accordion-item.js-ui-accordion__item', '.accordion-opener.js-ui-accordion__opener');
	a11yAccordionEvent('.faq-item.js-ui-accordion__item', '.faq-opener.js-ui-accordion__opener');
	a11yAccordionEvent('.accordion-step-item.js-ui-accordion__item', '.accordion-step-opener.js-ui-accordion__opener');

	// layer select option
	$doc
		.on('click.uiJSCommon', '.js-layer-select-option[role="button"]', function () {
			var $this = $(this);
			var $thisInput = $this.find('input[type="radio"]');

			$thisInput.trigger('click');
		})
		.on('click.uiJSCommon', '.js-layer-select-option[role="button"] input[type="radio"]', function (e) {
			var $this = $(this);
			var layerName = $this.closest('[data-layer]').attr('data-layer');
			var name = $this.attr('name');
			var $thisButton = $this.closest('.js-layer-select-option[role="button"]');
			var $otherInput = $('[name="' + name + '"]').not($this);
			var $otherButtons = $otherInput.closest('.js-layer-select-option[role="button"]');

			$thisButton.attr('title', '선택 됨');
			$otherButtons.removeAttr('title');

			uiLayer.close(layerName);

			e.stopPropagation();
		})
		.on('change.uiJSCommon', '.js-layer-select-option[role="button"] input[type="radio"]', function (e) {
			e.stopPropagation();
		})
		.on('click.uiJSCommon', '.js-layer-select-option[role="button"] label', function (e) {
			e.stopPropagation();
		})
		.on('click.uiJSCommon', '[data-layer-select-option]', function () {
			var $this = $(this);
			var layerName = $this.closest('[data-layer]').attr('data-layer');
			var name = $this.attr('data-layer-select-option');
			var $otherButtons = $('[data-layer-select-option="' + name + '"]').not($this);

			$this.addClass('is-checked').attr('title', '선택 됨');
			$otherButtons.removeClass('is-checked').removeAttr('title');

			uiLayer.close(layerName);
		})
		.on('layerClosed.uiJSCommon', '.layer-wrap--select', function () {
			var $layer = $(this);
			var $opener = $layer.data('layerOpener');
			var $selected = $layer.find('[data-layer-select-option].is-checked .ui-label-text, .js-layer-select-option[role="button"] input[type="radio"]:checked ~ .ui-label .ui-label-text');

			if ($opener && $opener.hasClass('ui-select') && $selected.length) {
				$opener.text($selected.text());
				$opener.closest('.type-placeholder').removeClass('type-placeholder');
			}
		});

	// area focus
	function areaFocus(area) {
		$doc
			.on('focus.areaFocus', area, function () {
				var $this = $(this);
				var timer = $this.data('areaFocusTimer');

				clearTimeout(timer);
				$this.addClass('is-focus');
			})
			.on('blur.areaFocus', area, function () {
				var $this = $(this);
				var timer = $this.data('areaFocusTimer');

				clearTimeout(timer);
				$this.data(
					'areaFocusTimer',
					setTimeout(function () {
						$this.removeClass('is-focus');
					}, 100)
				);
			});
	}
	areaFocus('.ui-select-block');
	areaFocus('.ui-input-block');
	areaFocus('.ui-search-form');

	// inputed
	var inputedEvent = 'focus.inputedCheck blur.inputedCheck keydown.inputedCheck keyup.inputedCheck change.inputedCheck';
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
	$doc
		.on(inputedEvent, '.ui-input', function () {
			inputedCheck($(this), '.ui-input-block');
		})
		.on(inputedEvent, '.ui-search-form .ui-input-block.type-search .ui-input', function () {
			inputedCheck($(this), '.ui-search-form');
		});

	// input delete
	$doc.on('click.inputDelete', '.ui-input-delete', function () {
		var $this = $(this);
		var $input = $this.closest('.ui-input-block').find('.ui-input');

		$input.val('').trigger('focus');
	});

	// input validator
	$.fn.invalid = function (valid, message) {
		var $this = $(this);
		var $formGroup = $this.closest('.form-group');
		var $formFlex = $this.closest('.form-flex');
		if ($formGroup.length) {
			var $parent = $formGroup;
		} else {
			var $parent = $this.closest('.ui-input-block, .ui-select-block, .ui-date-picker');
		}
		var $message = $parent.find('.ui-invalid');
		$message.remove();
		if (valid === true) {
			$this.removeAttr('aria-invalid aria-errormessage');
			$parent.removeClass('is-invalid');
		} else {
			$this.attr({ 'aria-invalid': true, 'aria-errormessage': message });
			if (message) {
				$parent.addClass('is-invalid').append('<span class="ui-invalid" aria-role="alert" aria-live="assertive">' + message + '</span>');
				if ($formFlex.length) {
					$message = $parent.find('.ui-invalid');
					$parent.find('.form-flex').last().after($message);
				}
			} else {
				$parent.addClass('is-invalid');
			}
		}
	};

	// layer opened scroll to start
	$doc.on('layerOpened.layerOpenedScrollToStart', '.layer-wrap', function () {
		var $this = $(this);
		var $scroller = $this.find('.ui-layer-body');

		$this.scrollTop(0).scrollLeft(0);
		$scroller.scrollTop(0).scrollLeft(0);
	});

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

	// input focus class
	var inputFocusClass = {
		input: 'textarea, [type="text"], [type="password"], [type="search"], [type="email"], [type="url"], [type="number"], [type="tel"], [type="date"], [type="time"]',
		className: 'is-text-input-focus',
		update: function ($input, isFocus) {
			var $html = $('html');
			var offsetTop = getOffsetTop($input);

			if (isFocus) {
				$html.addClass(inputFocusClass.className);
				if (userAgentCheck.isAndroid) {
					$win.scrollTop(offsetTop);
				}
			} else {
				$html.removeClass(inputFocusClass.className);
			}

			uiJSResize();
		},
	};
	$doc
		.on('focus.inputFocusClass', inputFocusClass.input, function () {
			inputFocusClass.update($(this), true);
		})
		.on('blur.inputFocusClass', inputFocusClass.input, function () {
			inputFocusClass.update($(this), false);
		});

	// hash scroll
	var hashScroll = {
		classNames: {
			active: 'is-active',
			link: 'js-hash-scroll-link',
		},
		goToScroll: function (hash) {
			var $target = $(hash);
			var $html = $('html');
			var $scroller = $html;
			var offsetTop = getOffsetTop($target, 35);
			var $links = $('.' + hashScroll.classNames.link);
			var $targetLink = $links.filter('[href="' + hash + '"]');
			var $gnbLayer = $('.layer-gnb.js-layer-opened');
			var $gnbLayerBody = $gnbLayer.find('.gnb-body');

			if ($gnbLayer.length) {
				$scroller = $gnbLayerBody;
				offsetTop += $gnbLayerBody.scrollTop();
			}

			$links.removeClass(hashScroll.classNames.active);
			$targetLink.addClass(hashScroll.classNames.active);
			$scroller.stop().animate(
				{
					scrollTop: offsetTop,
				},
				500,
				function () {
					$target.attr('tabindex', '-1').focus();
				}
			);
		},
		updateLinkClass: function () {
			var $html = $('html');
			var $scroller = $html;
			var $links = $('.' + hashScroll.classNames.link);
			var $gnbLayer = $('.layer-gnb.js-layer-opened');
			var $gnbLayerBody = $gnbLayer.find('.gnb-body');

			if ($gnbLayer.length) {
				$scroller = $gnbLayerBody;
			}

			if (!$links.length || $scroller.is(':animated') || !$links.eq(0).is(':visible')) {
				return;
			}

			var hashArray = [];
			var scrollTop = $win.scrollTop();
			var maxScrollTop = $('body').get(0).scrollHeight - $win.height() - 60;

			if ($gnbLayer.length) {
				scrollTop = $gnbLayerBody.offset().top + $gnbLayerBody.scrollTop();
				maxScrollTop = $gnbLayerBody.get(0).scrollHeight - $gnbLayerBody.height() + $gnbLayerBody.offset().top - 60;
			}

			$links.each(function () {
				var hash = $(this).attr('href');

				if (hashArray.indexOf(hash) === -1) {
					hashArray.push(hash);
				}
			});

			if (!hashArray.length) {
				return;
			}

			$.each(hashArray, function (i, v) {
				var $target = $(v);

				if (!$target.length || $target.is(':hidden')) {
					return;
				}

				var offsetTop = getOffsetTop($target, 35);
				var $targetLink = $links.filter('[href="' + v + '"]');

				if ($gnbLayer.length) {
					offsetTop += $gnbLayerBody.scrollTop() + $gnbLayerBody.offset().top;
				}

				if (scrollTop >= offsetTop - 1) {
					$links.removeClass(hashScroll.classNames.active);
					$targetLink.addClass(hashScroll.classNames.active);
				}
			});

			if (scrollTop >= maxScrollTop) {
				$links.removeClass(hashScroll.classNames.active);
				$links.filter('[href="' + hashArray[hashArray.length - 1] + '"]').addClass(hashScroll.classNames.active);
			}

			menuNavBar.scrollTo($('.menu-nav-bar-link.' + hashScroll.classNames.link + '.' + hashScroll.classNames.active));
		},
	};
	$doc
		.on('click.hashScroll', '.' + hashScroll.classNames.link, function (e) {
			hashScroll.goToScroll($(this).attr('href'));
		})
		.on('layerOpened.hashScroll', '.layer-gnb', function () {
			var $body = $(this).find('.gnb-body');

			$body
				.off('scroll.hashScroll')
				.on('scroll.hashScroll', function () {
					hashScroll.updateLinkClass();
				})
				.scrollTop(0);

			hashScroll.updateLinkClass();
		});

	// contents loading
	var uiLoading = {
		activeClass: 'loading',
		start: function (target) {
			$(target).addClass(uiLoading.activeClass).attr('aria-hidden', 'true');
		},
		end: function (target) {
			$(target).removeClass(uiLoading.activeClass).attr('aria-hidden', 'false');
		},
	};
	window.uiLoading = uiLoading;

	// top button
	var topButtonTimer = null;
	function buttonScroll() {
		var $topButtonWrap = $('.page-button-top-wrap');
		var $topButton = $('.page-button-top');
		var $pageButton = $('.page-buttons.type-fixed');
		var $footer = $('.footer-wrap');
		var isFooter = $footer.length && $footer.is(':visible');
		var footerH = isFooter ? $footer.outerHeight() : 0;
		var $bottom = $('.fix-bottom-wrap');
		var bottomH = $bottom.length && $bottom.is(':visible') ? $bottom.outerHeight() : 0;
		var isPageButtonH = $pageButton.length && $pageButton.is(':visible');
		var pageButtonH = isPageButtonH ? $pageButton.innerHeight() : 0;
		var pageButtomCalc = isPageButtonH ? bottomH + (pageButtonH - $pageButton.height()) / 2 - bottomH : 0;
		var scrollTop = $win.scrollTop();
		var winH = $win.height();
		var docH = $doc.height();
		var isStatic = scrollTop - bottomH >= docH - winH - bottomH - footerH - pageButtomCalc;
		var topButtonPosition = $topButtonWrap.data('position') || 0;
		var topButtonAfterPosition = 0;
		var fixedClassName = 'is-bottom';

		// $pageButton
		if ($pageButton.length) {
			if (isStatic) {
				// 2022.09.16 : mod : 조건문 수정
				if (isFooter || docH > winH) {
					if (!$pageButton.hasClass(fixedClassName)) {
						$pageButton.addClass(fixedClassName);
					}
				} else {
					if ($pageButton.hasClass(fixedClassName)) {
						$pageButton.removeClass(fixedClassName);
					}
				}
			} else {
				if ($pageButton.hasClass(fixedClassName)) {
					$pageButton.removeClass(fixedClassName);
				}
			}
		}

		// $topButtonWrap
		if ($topButtonWrap.length) {
			clearTimeout(topButtonTimer);

			if (scrollTop > 0) {
				$topButton.removeAttr('aria-hidden').prop('inert', false).removeAttr('inert').removeAttr('tabindex');
				topButtonTimer = setTimeout(function () {
					$topButtonWrap
						.stop()
						.css({
							left: 0,
						})
						.animate(
							{
								opacity: 1,
							},
							300
						);
				}, 100);
			} else {
				topButtonTimer = setTimeout(function () {
					$topButton.attr('aria-hidden', 'true').prop('inert', true).attr('inert', '').attr('tabindex', '-1');
					$topButtonWrap.stop().animate(
						{
							opacity: 0,
						},
						300,
						function () {
							$topButtonWrap.css({
								left: '-999999px',
							});
						}
					);
				}, 100);
			}

			if (isStatic) {
				if (!$topButtonWrap.hasClass(fixedClassName)) {
					$topButtonWrap.addClass(fixedClassName);
				}
				topButtonAfterPosition = pageButtonH + footerH + pageButtomCalc;
				if (!(topButtonPosition === topButtonAfterPosition)) {
					$topButtonWrap
						.css({
							transform: 'translateY(-' + topButtonAfterPosition + 'px) translateZ(0)',
						})
						.data('position', topButtonAfterPosition);
				}
			} else {
				if ($topButtonWrap.hasClass(fixedClassName)) {
					$topButtonWrap.removeClass(fixedClassName);
				}
				topButtonAfterPosition = bottomH + pageButtonH;
				if (!(topButtonPosition === topButtonAfterPosition)) {
					$topButtonWrap
						.css({
							transform: 'translateY(-' + topButtonAfterPosition + 'px) translateZ(0)',
						})
						.data('position', topButtonAfterPosition);
				}
			}
		}
	}
	function onScrollFixed() {
		var $fixed = $('.js-on-scroll-fixed');
		var $fixedTarget = $fixed.find('.js-on-scroll-fixed__target');
		var offsetTop = getOffsetTop($fixed, 0);
		if ($fixed.length) {
			if ($win.scrollTop() >= offsetTop) {
				$fixed.addClass('is-fixed').css('height', $fixedTarget.height());
				$fixedTarget.css({
					top: $('.fix-top-wrap').outerHeight() + 'px',
				});
			} else {
				$fixed.removeClass('is-fixed').css('height', '');
				$fixedTarget.css({
					top: '',
				});
			}
		}
	}

	// toggleSearch
	$doc
		.on('click.toggleSearch', '.toggle-search-button.type-open', function () {
			var $this = $(this);
			var $wrap = $this.closest('.toggle-search');
			var $input = $wrap.find('.toggle-search-form .search-word-area .ui-input');

			$wrap.addClass('is-opened');
			$input.focus();
			$wrap.data('opener', $this);
		})
		.on('click.toggleSearch', '.toggle-search-button.type-close', function () {
			var $this = $(this);
			var $wrap = $this.closest('.toggle-search');
			var $tab = $wrap.find('.toggle-search-tab');
			var $opener = $wrap.data('opener') || $tab.attr('tabindex', '0');

			$wrap.removeClass('is-opened');
			$opener.focus();
		})
		.on('click.toggleSearch', '[data-toggle-search-button]', function () {
			var $this = $(this);
			var name = $this.attr('data-toggle-search-button');
			var $wrap = $('[data-toggle-search="' + name + '"]');
			var $input = $wrap.find('.toggle-search-form .search-word-area .ui-input');

			if ($wrap.hasClass('is-opened')) {
				$wrap.removeClass('is-opened');
				$this.focus();
			} else {
				$wrap.addClass('is-opened');
				$input.focus();
				$wrap.data('opener', $this);
			}
		});

	// dropdown
	$doc.on('click.uiJSDropdown', '.js-ui-dropdown__closer', function () {
		var $this = $(this);
		var $wrap = $this.closest('.js-ui-dropdown');

		$wrap.uiDropDown('btnClose');
	});

	// keyword delete
	$doc.on('click.keywordDelete', '.keywords-delete', function () {
		var $this = $(this);
		var $item = $this.closest('.keywords-item');

		$item.remove();
		queryKeywords.checkEmpty();
	});

	// set date
	var setDate = {
		classNames: {
			wrap: 'js-set-date',
			buttonInit: 'js-set-date-button-init',
			buttonSubmit: 'js-set-date-button-submit',
			buttonCancel: 'js-set-date-button-cancel',
			buttonEdit: 'js-set-date-button-edit',
			buttonClear: 'js-set-date-button-clear',
			isInit: 'is-init',
			isEdit: 'is-edit',
			isSet: 'is-set',
			allIs: 'is-init is-edit is-set',
		},
	};
	$doc
		.on('click.setDate', '.' + setDate.classNames.buttonInit + ', .' + setDate.classNames.buttonEdit, function () {
			var $this = $(this);
			var $wrap = $this.closest('.' + setDate.classNames.wrap);
			$wrap.removeClass(setDate.classNames.allIs).addClass(setDate.classNames.isEdit);
		})
		.on('click.setDate', '.' + setDate.classNames.buttonClear, function () {
			var $this = $(this);
			var $wrap = $this.closest('.' + setDate.classNames.wrap);
			$wrap.removeClass(setDate.classNames.allIs).addClass(setDate.classNames.isInit);
		})
		.on('click.setDate', '.' + setDate.classNames.buttonSubmit, function () {
			var $this = $(this);
			var $wrap = $this.closest('.' + setDate.classNames.wrap);
			$wrap.removeClass(setDate.classNames.allIs).addClass(setDate.classNames.isSet);
		});

	// multi card
	var multiCard = {
		classNames: {
			wrap: 'multi-home',
			currentView: 'multi-current-swipe',
			currentCardSwipe: 'multi-current-swipe',
			currentCard: 'multi-current-card-block',
			list: 'multi-cards-list',
			item: 'multi-cards-item',
			registBtn: 'multi-cards-btn-register',
			register: 'multi-cards-register-inner',
			registerItem: 'multi-cards-register-item',
			cardBlock: 'multi-cards-block',
			dummy: 'type-dummy',
			card: 'multi-cards-card',
			guideItem: 'multi-home-guide-item',
			guideItemAdd: 'type-add',
			guideItemRegister: 'type-register',
			guideItemUse: 'type-use',
			isRegist: 'is-regist',
			isMoved: 'is-moved',
			isRotated: 'is-rotated',
			isRegisting: 'is-registing',
			isAnimate: 'is-animate',
			isBeforeAnimate: 'is-before-animate',
			isAdd: 'is-add',
			isMinSize: 'is-min-size',
		},
		init: function () {
			var _ = multiCard;
			var $currentView = $('.' + _.classNames.currentView);
			var $list = $('.' + _.classNames.list);
			var $activeItem = $list.find('.' + _.classNames.item + '.' + _.classNames.isRegist);
			var $activeRegistBtns = $activeItem.find('.' + _.classNames.registBtn);
			var $guideItem = $('.' + _.classNames.guideItem);
			var $guideItemAdd = $('.' + _.classNames.guideItem + '.' + _.classNames.guideItemAdd);
			var $guideItemRegister = $('.' + _.classNames.guideItem + '.' + _.classNames.guideItemRegister);
			var $guideItemUse = $('.' + _.classNames.guideItem + '.' + _.classNames.guideItemUse);
			var isNotCurrentViewInit = $currentView.length && !$currentView.data('swiper');
			var isNotListInit = $list.length && !$list.data('swiper');

			if (isNotCurrentViewInit) {
				$currentView.swiperSet({
					slidesPerView: 'auto',
					effect: 'creative',
					creativeEffect: {
						prev: {
							rotate: [0, -90, 0],
						},
						next: {
							rotate: [0, 90, 0],
						},
					},
				});
			}

			_.registerSlideInit();

			if (isNotListInit) {
				$activeRegistBtns.prop('disabled', true).attr('disabled', '');

				if ($activeItem.length) {
					$guideItemUse.css('display', 'block');
				} else {
					$guideItemAdd.css('display', 'block');
				}

				$list.swiperSet({
					slidesPerView: 'auto',
					centeredSlides: true,
					initialSlide: $activeItem.length ? $activeItem.index() : 0,
					on: {
						slideChange: function (swiper) {
							var $swiper = $(swiper.$el);
							var $slide = $(swiper.slides).eq(swiper.realIndex);
							var $thisGuideItem = null;

							$swiper.find('.' + _.classNames.isRotated).removeClass(_.classNames.isRotated);

							if ($slide.hasClass(_.classNames.isAdd)) {
								$thisGuideItem = $guideItemAdd;
							} else if ($slide.hasClass(_.classNames.isRegist)) {
								$thisGuideItem = $guideItemUse;
							} else {
								$thisGuideItem = $guideItemRegister;
							}

							$thisGuideItem
								.stop()
								.removeClass(_.classNames.isBeforeAnimate + ' ' + _.classNames.isAnimate)
								.fadeIn(150);
							$guideItem.not($thisGuideItem).stop().fadeOut(150);
						},
					},
				});
			}
		},
		registerSlideInit: function ($root) {
			$root = $root && $root.length ? $root : $doc;
			var _ = multiCard;
			var $register = $root.find('.' + _.classNames.register);
			var timer = null;
			var touched = false;
			var isNotRegisterInit = $register.length && !$register.data('swiper');

			function checkRegist(swiper) {
				clearTimeout(timer);

				var $swiper = $(swiper.$el);
				var $item = $swiper.closest('.' + _.classNames.item);

				$swiper.removeClass(_.classNames.isMoved);

				if (swiper.realIndex === 1) {
					_.regist($item);
				}
			}

			if (isNotRegisterInit) {
				$register.swiperSet({
					slidesPerView: 'auto',
					direction: 'vertical',
					effect: 'creative',
					creativeEffect: {
						prev: {
							translate: [0, '-120%', 0],
							rotate: [0, 0, -90],
						},
					},
					noSwipingSelector: '.' + _.classNames.isRotated + ', .' + _.classNames.isRegist,
					on: {
						sliderMove: function (swiper) {
							$(swiper.$el).addClass(_.classNames.isMoved);
						},
						slideChangeTransitionEnd: function (swiper) {
							clearTimeout(timer);
							if (!touched) {
								checkRegist(swiper);
							}
						},
						slideResetTransitionEnd: function (swiper) {
							clearTimeout(timer);
							if (!touched) {
								checkRegist(swiper);
							}
						},
						touchStart: function (swiper) {
							touched = true;
							clearTimeout(timer);
						},
						touchEnd: function (swiper) {
							touched = false;
							clearTimeout(timer);
							timer = setTimeout(function () {
								checkRegist(swiper);
							}, 350);
						},
					},
				});
			}
		},
		regist: function ($item) {
			var _ = multiCard;
			var $wrap = $item.closest('.' + _.classNames.wrap);
			var value = $item.attr('data-multi-card-value');
			var index = $item.index();
			var $registBtns = $wrap.find('.' + _.classNames.registBtn);

			$wrap.addClass(_.classNames.isRegisting);
			$registBtns.prop('disabled', true).attr('disabled', '');

			$item.trigger('multiCardRegist', [index, value, $item]);
		},
		addRotateClass: function ($btn, parentClassName, isClass) {
			var $block = $btn.closest('.' + parentClassName);
			$block.addClass(isClass);
		},
		removeRotateClass: function ($btn, parentClassName, isClass) {
			var $block = $btn.closest('.' + parentClassName);
			$block.removeClass(isClass);
		},
		registAnimate: function ($item, type) {
			var _ = multiCard;
			var $wrap = $item.closest('.' + _.classNames.wrap);
			var $register = $item.find('.' + _.classNames.register);
			var $siblings = $item.siblings();
			var $card = $item.find('.' + _.classNames.registerItem + ':not(.' + _.classNames.dummy + ') .' + _.classNames.cardBlock);
			var $cardImg = $card.find('.' + _.classNames.card + ' img');
			var $dummyCard = $item.find('.' + _.classNames.registerItem + '.' + _.classNames.dummy + ' .' + _.classNames.cardBlock);
			var $currentCardSwipe = $wrap.find('.' + _.classNames.currentCardSwipe);
			var $currentCard = $wrap.find('.' + _.classNames.currentCard);
			var $registBtns = $wrap.find('.' + _.classNames.registBtn);
			var $activeRegistBtn = $wrap.find('.' + _.classNames.item + '.' + _.classNames.isRegist + ' .' + _.classNames.registBtn);
			var isComplete = type === 'complete';
			var isFail = type === 'fail';
			var currentCardSwiper = $currentCardSwipe.data('swiper');
			var $guideItemRegister = $('.' + _.classNames.guideItem + '.' + _.classNames.guideItemRegister);
			var $guideItemUse = $('.' + _.classNames.guideItem + '.' + _.classNames.guideItemUse);

			function currentAnimate() {
				$currentCard
					.css({
						transition: 'transform 0s',
						transform: 'translate(10px, -14px) rotate(-4.6deg)',
					})
					.prop('transformPer', 1)
					.animate(
						{
							transformPer: 0,
						},
						{
							duration: 150,
							step: function (now, fx) {
								if (fx.prop === 'transformPer') {
									$currentCard.css('transform', 'translate(' + now * 10 + 'px, ' + now * -14 + 'px) rotate(' + now * -4.6 + 'deg)');
								}
							},
							complete: function () {
								$currentCard.find('.multi-current-card-img').remove();
								$currentCard.append('<div class="multi-current-card-img"><img src="' + $cardImg.attr('src') + '" alt="" onerror="this.parentNode.className += \' is-error\';" /></div>');
								$currentCard.delay(100).animate(
									{
										transformPer: 1,
									},
									{
										duration: 150,
										step: function (now, fx) {
											if (fx.prop === 'transformPer') {
												$currentCard.css('transform', 'translate(' + now * 10 + 'px, ' + now * -14 + 'px) rotate(' + now * -4.6 + 'deg)');
											}
										},
										complete: function () {
											$currentCard.css({
												transform: '',
												transition: '',
											});
											$wrap.removeClass(_.classNames.isRegisting);
											$activeRegistBtn = $item.find('.' + _.classNames.registBtn);
											$registBtns.not($activeRegistBtn).prop('disabled', false).removeAttr('disabled');
										},
									}
								);
							},
						}
					);
			}

			$card
				.css('transition', 'transform 0s, opacity 0s')
				.prop('transformScale', 1)
				.animate(
					{
						transformScale: 0.8,
						opacity: 0,
					},
					{
						duration: 180,
						step: function (now, fx) {
							if (fx.prop === 'transformScale') {
								$card.css('transform', 'scale(' + now + ')');
							}
						},
						complete: function () {
							$dummyCard.delay(100).animate(
								{
									opacity: 1,
								},
								180,
								function () {
									var swiper = $register.data('swiper');
									if (swiper) {
										swiper.slideTo(0, 0);
										$card.css({
											transform: '',
											opacity: '',
										});
										$dummyCard.css('opacity', '');
										setTimeout(function () {
											$card.css('transition', '');

											if (isFail) {
												$wrap.removeClass(_.classNames.isRegisting);
												$registBtns.not($activeRegistBtn).prop('disabled', false).removeAttr('disabled');
											}
										}, 0);
									}
								}
							);

							if (isComplete) {
								if (currentCardSwiper) {
									if (currentCardSwiper.realIndex === 0) {
										currentAnimate();
									} else {
										currentCardSwiper.slideTo(0, 100);
										$currentCard.css('transition', 'transform 0.1s');
										var currentTimer = setTimeout(function () {
											clearTimeout(currentTimer);
											currentAnimate();
										}, 150);
									}
								}

								$siblings.removeClass(_.classNames.isRegist);
								$item.addClass(_.classNames.isRegist);

								$guideItemRegister.stop().fadeOut(150);
								$guideItemUse
									.stop()
									.removeClass(_.classNames.isAnimate)
									.addClass(_.classNames.isBeforeAnimate)
									.fadeIn(150, function () {
										var timer = setTimeout(function () {
											$guideItemUse.addClass(_.classNames.isAnimate);
											clearTimeout(timer);
										}, 100);
									});
							}
						},
					}
				);
		},
		registCompleteAnimate: function ($item) {
			var _ = multiCard;
			_.registAnimate($item, 'complete');
		},
		registFailAnimate: function ($item) {
			var _ = multiCard;
			_.registAnimate($item, 'fail');
		},
		buttonRegist: function ($btn) {
			var _ = multiCard;
			var $wrap = $btn.closest('.' + _.classNames.wrap);
			var $item = $btn.closest('.' + _.classNames.item);
			var $card = $btn.closest('.' + _.classNames.cardBlock);
			var $btns = $wrap.find('.' + _.classNames.registBtn);
			var swiper = $btn.closest('.' + _.classNames.register).data('swiper');

			$btns.prop('disabled', true).attr('disabled', '');
			$wrap.addClass(_.classNames.isRegisting);

			if ($card.hasClass(_.classNames.isRotated)) {
				$item.find('.' + _.classNames.isRotated).removeClass(_.classNames.isRotated);
				setTimeout(function () {
					if (swiper) {
						swiper.slideTo(1, 300, function () {
							_.regist($item);
						});
					}
				}, 350);
			} else {
				if (swiper) {
					swiper.slideTo(1, 300, function () {
						_.regist($item);
					});
				}
			}
		},
		delete: function ($btn) {
			var _ = multiCard;
			var $item = $btn.closest('.' + _.classNames.item);
			var value = $item.attr('data-multi-card-value');
			var index = $item.index();

			$item.trigger('multiCardDelete', [index, value, $item]);
		},
		deleteAction: function ($item) {
			var _ = multiCard;
			var $list = $item.closest('.' + _.classNames.list);
			var swiper = $list.data('swiper');

			if (swiper) {
				$item.remove();
				swiper.update();
			}
		},
		resize: function () {
			var _ = multiCard;
			var $wrap = $('.' + _.classNames.wrap);
			var winH = $win.height();
			var hasClass;

			if ($wrap.length) {
				hasClass = $wrap.hasClass(_.classNames.isMinSize);

				if (winH < 736 && !hasClass) {
					$wrap.addClass(_.classNames.isMinSize);
				} else if (winH >= 736 && hasClass) {
					$wrap.removeClass(_.classNames.isMinSize);
				}
			}
		},
	};
	window.uiJSMultiCard = multiCard;
	$doc
		.on('click.multiCard', '.multi-current-action-rotate', function () {
			multiCard.addRotateClass($(this), 'multi-current-action-block', 'is-rotated');
		})
		.on('click.multiCard', '.multi-current-action-rotate-reverse', function () {
			multiCard.removeRotateClass($(this), 'multi-current-action-block', 'is-rotated');
		})
		.on('click.multiCard', '.multi-cards-rotate:not(div)', function () {
			multiCard.addRotateClass($(this), 'multi-cards-block', 'is-rotated');
			multiCard.addRotateClass($(this), 'multi-cards-register', 'is-rotated');
		})
		.on('click.multiCard', '.multi-cards-info-action-rotate', function () {
			multiCard.removeRotateClass($(this), 'multi-cards-block', 'is-rotated');
			multiCard.removeRotateClass($(this), 'multi-cards-register', 'is-rotated');
		})
		.on('click.multiCard', '.multi-cards-btn-register', function () {
			multiCard.buttonRegist($(this));
		})
		.on('click.multiCard', '.multi-cards-info-action-delete', function () {
			multiCard.delete($(this));
		});

	// copy clipboard
	$doc.on('click.uiCopyClipboard', '[data-clipboard]', function (e) {
		var $this = $(this);
		var name = $(this).attr('data-clipboard');
		var $target = $('[data-clipboard-target="' + name + '"]');
		var text = (function () {
			var $clone = $target.clone();
			$clone.find('br').replaceWith('{**#&줄바꿈&#**}');
			var result = $clone
				.text()
				.replace(/\s/g, '')
				.replace(/\{\*\*\#&줄바꿈&\#\*\*\}/g, '\n');
			$clone.remove();
			return result;
		})();

		$this.after('<div data-clipboard-dummy="' + name + '"><textarea>' + text + '</textarea></div>');

		var $dummy = $('[data-clipboard-dummy="' + name + '"]');

		$dummy.find('textarea').get(0).select();
		document.execCommand('copy');
		$dummy.remove();
		$this.focus();
	});

	// sorting
	var sorting = {
		initPosition: function () {
			$('.sorting-contents').each(function () {
				sorting.positionUpdate($(this));
			});
		},
		positionUpdate: function ($scroller) {
			var $activeItem = (function () {
				var $el = $scroller.find('.ui-radio:checked');

				if (!$el.length) {
					$el = $scroller.find('.ui-label.is-active');
				}
				if (!$el.length) {
					$el = $scroller.find('.ui-label.js-tabpanel-active');
				}

				if ($el.length) {
					return $el.closest('.ui-radio-block');
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

				$list = $scroller.find('.sorting-list');
				itemLeft = $activeItem.offset().left;
				listLeft = $list.offset().left;
				listMarginLeft = Number($list.css('margin-left').replace(/px/g, ''));
				listPaddingLeft = Number($list.css('padding-left').replace(/px/g, ''));
				scrollLeft = itemLeft - listLeft + listMarginLeft - listPaddingLeft;

				$scroller.scrollLeft(scrollLeft);
			}

			if (!$scroller.hasClass('is-init')) {
				$scroller.addClass('is-init');
			}
		},
	};
	window.uiJSSorting = sorting;

	$doc
		.on('uiAccordionClosed.sorting', '.sorting-area', function () {
			var $this = $(this);
			var $scroller = $this.find('.sorting-contents');

			sorting.positionUpdate($scroller);
		})
		.on('click.sorting', '.ui-label', function (e) {
			var $this = $(this);
			var $wrap = $this.closest('.sorting-area');

			$wrap.uiAccordion('allClose');
		});

	// masking button
	$doc.on('click.maskingButton', '.ui-masking-button', function () {
		var $this = $(this);
		var $wrap = $this.closest('.mypage-section');

		if (!$this.hasClass('is-active')) {
			$this
				.addClass('is-active')
				.prop('disabled', true)
				.attr('disabled', '')
				.fadeOut(300, function () {
					$wrap.removeClass('is-masking');
					scrollPointEvent();
				});
		}
	});
	function mypageMasking($section) {
		$section.addClass('is-masking');
		$section.find('.ui-masking-button').removeClass('is-active').prop('disabled', false).removeAttr('disabled').removeAttr('style');
	}
	window.uiJSMypageMasking = mypageMasking;

	// mypage scroll
	function mypageScrollUpdate() {
		var $mypageTop = $('.mypage-top');

		if (!$mypageTop.length) return;

		var $fixTop = $('.fix-top-wrap');
		var fixTopH = $fixTop.length ? $fixTop.outerHeight() : 0;
		var offsetTop = $mypageTop.offset().top;
		var height = $mypageTop.outerHeight();
		var positionTop = offsetTop + height - fixTopH;
		var scrollTop = $win.scrollTop();
		var $html = $('html');

		if (scrollTop > positionTop && !$html.hasClass('is-mypage-scroll')) {
			$html.addClass('is-mypage-scroll');
		} else if (scrollTop <= positionTop && $html.hasClass('is-mypage-scroll')) {
			$html.removeClass('is-mypage-scroll');
		}
	}

	// toast alert
	function toastAlert(wrap, message) {
		var $wrap = $(wrap);
		var $inner = (function () {
			var $el = $wrap.find('.ui-toast-alert-inner');
			if (!$el.length) {
				$wrap.append('<div class="ui-toast-alert-inner"></div>');
				$el = $wrap.find('.ui-toast-alert-inner');
			}
			return $el;
		})();
		var $message = $('<p class="ui-toast-alert-text">' + message.replace(/\n/g, '<br />') + '</p>');

		$message.css('opacity', 0);
		$inner.append($message);
		$message.animate({ opacity: 1 }, 500, function () {
			var timer = setTimeout(function () {
				$message.prop('translateY', 0).animate(
					{
						translateY: -100,
						opacity: 0,
					},
					{
						duration: 500,
						step: function (now, fx) {
							if (fx.prop === 'translateY') {
								$message.css('transform', 'translateY(' + now + '%)');
							}
						},
						complete: function () {
							$message.remove();
							clearTimeout(timer);
						},
					}
				);
			}, 3000);
		});
	}
	window.uiJSToastAlert = toastAlert;

	// scroll point event
	function scrollPointEvent() {
		var $el = $('.scroll-point');

		if (!$el.length) return;

		var winH = $win.height();
		var scrollTop = $win.scrollTop() + (winH - 100);

		$el.each(function () {
			var $this = $(this);
			var offsetTop = $this.offset().top;
			var hasEvent = $this.data('scrollPointEvent');
			var ishasEvent = typeof hasEvent === 'boolean' && hasEvent === true;

			if (scrollTop >= offsetTop && $this.is(':visible') && !ishasEvent) {
				$this.data('scrollPointEvent', true).trigger('scrollPoint');
			}
		});
	}

	// card detail tip
	function cardDetailTip() {
		$('.card-detail-tip').each(function () {
			var $this = $(this);

			if ($this.hasClass('is-show')) return;

			var $tip = $this.find('.card-detail-tip-inner');
			var height = $tip.outerHeight();

			$tip.stop().css('margin-top', -height);
			$this.addClass('is-show');

			var timer = setTimeout(function () {
				$tip.animate(
					{
						'margin-top': 0,
					},
					350
				);
				clearTimeout(timer);
			}, 1500);
		});
	}

	// slide layer back click close
	$(document)
		.on('click.backClickClose', '.layer-wrap--slide:not(.is-not-background-close)', function () {
			var name = $(this).attr('data-layer');
			uiLayer.close(name);
		})
		.on('click.backClickClose', '.layer-wrap--slide .ui-layer', function (e) {
			e.stopPropagation();
		});

	// scroll point
	$(document).on('scrollPoint', '.usage-default-slot.scroll-point', function () {
		var $this = $(this);
		var timer = setTimeout(function () {
			clearTimeout(timer);
			$this.find('[data-slot]').each(function () {
				var $this = $(this);
				var val = Number($this.attr('data-slot'));

				$this.uiSlot({
					value: val,
				});
			});
		}, 500);
	});

	// dom ready
	$(function () {
		var $html = $('html');
		var $body = $('body');

		if (userAgentCheck.isIos) {
			$('meta[name="viewport"]').attr('content', 'width=device-width, initial-scale=1, minimum-scale=1, user-scalable=no');
			$html.addClass('is-ios-os');
		}

		if (userAgentCheck.isAndroid) {
			$html.addClass('is-android-os');
		}

		scrollbarsWidth.set();
		uiJSCommon();
		headerScroll();
		onScrollFixed();
		mypageScrollUpdate();
		scrollPointEvent();

		// css set
		if (scrollbarsWidth.width > 0) {
			$body.prepend(
				'<style type="text/css">' +
					'.is-scroll-blocking.is-scrollbars-width #wrap {' +
					'margin-right: ' +
					scrollbarsWidth.width +
					'px;' +
					'}\n' +
					'.is-scroll-blocking.is-scrollbars-width .fix-top-wrap {' +
					'right: ' +
					scrollbarsWidth.width +
					'px;' +
					'}\n' +
					'.is-scroll-blocking.is-scrollbars-width .fix-bottom-wrap {' +
					'right: ' +
					scrollbarsWidth.width +
					'px;' +
					'}' +
					'</style>'
			);
		}

		// resize
		uiJSResize();
		multiCard.resize();
		tutorialSlide.resize();

		// sorting
		sorting.initPosition();

		// card detail tip
		cardDetailTip();
	});

	// win load, scroll, resize
	$win
		.on('load.uiJS', function () {
			uiJSResize();
			multiCard.resize();
			tutorialSlide.resize();
		})
		.on('scroll.uiJS', function () {
			headerScroll();
			buttonScroll();
			onScrollFixed();
			hashScroll.updateLinkClass();
			mypageScrollUpdate();
			scrollPointEvent();
		})
		.on('resize.uiJS', function () {
			uiJSResize();
			headerScroll();
			onScrollFixed();
			hashScroll.updateLinkClass();
			multiCard.resize();
			tutorialSlide.resize();
			mypageScrollUpdate();
			scrollPointEvent();
		})
		.on('orientationchange.uiJS', function () {
			uiJSResize();
			headerScroll();
			onScrollFixed();
			hashScroll.updateLinkClass();
			multiCard.resize();
			tutorialSlide.resize();
			mypageScrollUpdate();
			scrollPointEvent();
		});
})(jQuery);
