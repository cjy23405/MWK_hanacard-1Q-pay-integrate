(function ($) {
	// common
	var $win = $(window);
	var $doc = $(document);

	/* #################### legacy #################### */
	$doc
		.on('click.uiWCMS', '.event-data .info_box dt a', function (e) {
			var $this = $(this);
			var $wrap = $this.closest('.info_box');
			var $blind = $wrap.find(' > dt > a em.blind');

			e.preventDefault();

			if ($wrap.hasClass('on')) {
				$wrap.removeClass('on');
				$blind.text('상세내용보기');
			} else {
				$wrap.addClass('on');
				$blind.text('상세내용닫기');
			}
		})
		.on('click.uiWCMS', '.event-data .terms_ty .terms_area .info a', function (e) {
			var $this = $(this);
			var $wrap = $this.closest('.terms_area');
			var $item = $this.closest('.list');
			var $siblings = $wrap.find('.list').not($item);
			var $blind = $item.find('.info a .blind');
			var $siblingsBlind = $siblings.find('.info a .blind');

			e.preventDefault();

			$siblings.removeClass('on');
			$siblingsBlind.text('상세내용보기');

			if ($item.hasClass('on')) {
				$item.removeClass('on');
				$blind.text('상세내용보기');
			} else {
				$item.addClass('on');
				$blind.text('상세내용닫기');
			}
		})
		.on('click.uiWCMS', '.card-detail-data .accordian_ty > .list > a', function (e) {
			var $this = $(this);
			var $wrap = $this.closest('.accordian_ty');
			var $item = $this.closest('.list');
			var $siblings = $wrap.children('.list').not($item);
			var $blind = $this.find('.blind');
			var $siblingsBlind = $siblings.children('a').find('.blind');

			e.preventDefault();

			$siblings.removeClass('on');
			$siblingsBlind.text('상세내용보기');

			if ($item.hasClass('on')) {
				$item.removeClass('on');
				$blind.text('상세내용보기');
			} else {
				$item.addClass('on');
				$blind.text('상세내용닫기');
			}
		})
		.on('click.uiWCMS', '[data-remodal-target]', function (e) {
			var $this = $(this);
			var name = $this.attr('data-remodal-target');
			var $target = $('[data-remodal-id="' + name + '"]');

			e.preventDefault();

			$target.addClass('is-opened');

			uiJSScrollBlock.block();
		})
		.on('click.uiWCMS', '[data-remodal-action="close"]', function (e) {
			var $this = $(this);
			var $target = $this.closest('[data-remodal-id]');

			e.preventDefault();

			$target.removeClass('is-opened');

			uiJSScrollBlock.clear();
		})
		.on('click.uiWCMS', '.popup .pop_close', function (e) {
			e.preventDefault();
			var obj = $(this).closest('.popup');
			pop_close(obj);
		});

	// legacy popup size
	function pop_size() {
		$('.popup.on .popup_wrap').each(function () {
			var dW = $(window).width();
			var dH = $(window).height();

			if ($(this).hasClass('full_size')) {
				$(this).width(dW);
				if ($(this).find('.popup_body').hasClass('ty02')) {
					$(this)
						.find('.popup_body')
						.css({ 'max-height': dH - 105, 'min-height': dH - 105 });
				} else {
					$(this)
						.find('.popup_body')
						.css('max-height', dH - 50);
				}
			} else {
				$(this).width(dW - 60);
				if ($(this).closest('.popup').hasClass('notice_pop')) {
					$(this)
						.find('.popup_body')
						.css('max-height', dH - 125);
				} else {
					$(this)
						.find('.popup_body')
						.css('max-height', dH - 175);
				}
			}
		});
	}

	// legacy popup open
	window.pop_open = function (t, obj) {
		t.addClass('pop_link');

		if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
			var scrollTop = $(window).scrollTop();
			$('#wrap').css({ position: 'fixed', top: -scrollTop });
		} else {
			$('body').css('overflow', 'hidden');
		}

		$('.popup_mask').fadeIn();
		$(obj).fadeIn().addClass('on');

		pop_size();

		if ($(obj).hasClass('notice_pop')) {
			$(obj).find('.popup_body').focus();
		} else {
			$(obj).find('.popup_header h2').focus();
		}

		$(obj).attr({ 'aria-hidden': 'false', tabindex: '1' });

		$('header').attr({ 'aria-hidden': 'true', tabindex: '-999999999' });
		$('#container').attr({ 'aria-hidden': 'true', tabindex: '-999999999' });

		if ($('footer').length > 0) {
			$('footer').attr({ 'aria-hidden': 'true', tabindex: '-999999999' });
		}

		if ($('#sec_mypage').length > 0) {
			$('#sec_mypage').attr({ 'aria-hidden': 'true', tabindex: '-999999999' });
		}

		$(obj).focus();
	};

	// legacy popup close
	window.pop_close = function (obj) {
		var delay = 100;

		if (typeof _isIosDeviceRequest === 'boolean' && _isIosDeviceRequest === true) {
			delay = 1000;
		}

		setTimeout(function () {
			$(obj)
				.fadeOut(function () {
					if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
						var wrapOffset = $('#wrap').offset();
						var winTop = wrapOffset.top - wrapOffset.top * 2;
						$('#wrap').removeAttr('style');
						$(window).scrollTop(winTop);
					} else {
						$('body').removeAttr('style');
					}

					$(obj).find('.popup_wrap').removeAttr('style');
					$(obj).find('.popup_body').removeAttr('style');
					$('header').attr({ 'aria-hidden': 'false', tabindex: '1' });
					if (window.location.pathname.indexOf('MPAMAIN00M.web') == 1) {
						$('.btn_home').focus();
					} else {
						$('.pop_link').focus();
					}
					setTimeout(function () {
						$('.pop_link').removeClass('pop_link');
					}, 300);
				})
				.removeClass('on');

			if ($('footer').length > 0) {
				$('footer').attr({ 'aria-hidden': 'false', tabindex: '1' });
			}

			if ($('#sec_mypage').length > 0) {
				$('#sec_mypage').attr({ 'aria-hidden': 'false', tabindex: '1' });
			}

			if (typeof $('.my_cont_area').css('display') === 'undefined' || $('.my_cont_area').css('display') == 'none') {
				$('#container').attr({ 'aria-hidden': 'false', tabindex: '1' });
			}
		}, delay);
	};

	// legacy popup
	$.fn.popup = function (is) {
		this.each(function () {
			var $this = $(this);
			var isShow = is === 'show';

			if (isShow) {
				$this.addClass('is-opened');
				uiJSScrollBlock.block();
			} else {
				$this.removeClass('is-opened');
				uiJSScrollBlock.clear();
			}
		});

		return this;
	};
	/* #################### //legacy #################### */

	// input validator
	$.fn.uiWcmsInvalid = function (valid, message) {
		this.each(function () {
			var $this = $(this);
			var $wrap = $this.closest('.wcms-form-group');
			var isLegacy = $wrap.length <= 0;

			message = typeof message === 'string' ? message : '';

			if (isLegacy) {
				if (!valid) {
					alert(message);
				}
				return;
			}

			var $message = $wrap.find('.wcms-error-message');
			var hasError = $message.length >= 1;
			var messageAria = message.replace(/\n/g, ' ');
			var messageHTML = message.replace(/\n/g, '<br />');

			if (!valid) {
				$wrap.addClass('is-error');
				$this.attr({ 'aria-invalid': true, 'aria-errormessage': messageAria });

				if (hasError) {
					$message.html(messageHTML);
				} else {
					$wrap.append('<p class="wcms-error-message" aria-role="alert" aria-live="assertive">' + messageHTML + '</p>');
				}
			} else if (valid) {
				$wrap.removeClass('is-error');
				$this.removeAttr('aria-invalid').removeAttr('aria-errormessage');
				$message.remove();
			}
		});

		return this;
	};

	// accordion
	var accordion = {
		classNames: [
			{
				item: 'wcms-accordion-item',
				layer: 'wcms-accordion-layer',
				opened: 'is-opened',
			},
			{
				item: 'wcms-notice-item',
				layer: 'wcms-notice-layer',
				opened: 'is-opened',
			},
			{
				item: 'wcms-agree-item',
				layer: 'wcms-agree-layer',
				opened: 'is-opened',
			},
		],
		open: function ($item, classNames) {
			var $layer = $item.find('.' + classNames.layer).eq(0);
			var $siblingsItem = $item.siblings('.' + classNames.item);
			var beforeH = 0;
			var afterH = 0;
			var speed = 500;

			if (!$item.hasClass(classNames.opened)) {
				$layer.stop().css('display', 'block');

				beforeH = $layer.height();

				$layer.css('height', 'auto');
				$item.addClass(classNames.opened);

				afterH = $layer.height();

				if (beforeH === afterH) {
					speed = 0;
				}

				$layer.css('height', beforeH).animate(
					{
						height: afterH,
					},
					speed,
					function () {
						$layer.css({
							height: 'auto',
						});
					}
				);

				$siblingsItem.each(function () {
					accordion.close($(this), classNames);
				});
			}
		},
		close: function ($item, classNames) {
			var $layer = $item.find('.' + classNames.layer).eq(0);
			var beforeH = 0;
			var afterH = 0;
			var speed = 500;

			if ($item.hasClass(classNames.opened)) {
				$layer.stop().css('display', 'block');

				beforeH = $layer.height();

				$layer.css('height', '');
				$item.removeClass(classNames.opened);

				afterH = $layer.height();

				if (beforeH === afterH) {
					speed = 0;
				}

				$layer.css('height', beforeH).animate(
					{
						height: afterH,
					},
					speed,
					function () {
						$layer.css({
							display: '',
							height: '',
						});
					}
				);
			}
		},
	};
	$doc
		.on('click.uiWCMS', '.wcms-accordion-opener', function () {
			var $this = $(this);
			var $item = $this.closest('.' + accordion.classNames[0].item);

			if ($item.hasClass(accordion.classNames[0].opened)) {
				accordion.close($item, accordion.classNames[0]);
			} else {
				accordion.open($item, accordion.classNames[0]);
			}
		})
		.on('click.uiWCMS', '.wcms-notice-opener', function () {
			var $this = $(this);
			var $item = $this.closest('.' + accordion.classNames[1].item);

			if ($item.hasClass(accordion.classNames[1].opened)) {
				accordion.close($item, accordion.classNames[1]);
			} else {
				accordion.open($item, accordion.classNames[1]);
			}
		})
		.on('click.uiWCMS', '.wcms-agree-opener', function () {
			var $this = $(this);
			var $item = $this.closest('.' + accordion.classNames[2].item);

			if ($item.hasClass(accordion.classNames[2].opened)) {
				accordion.close($item, accordion.classNames[2]);
			} else {
				accordion.open($item, accordion.classNames[2]);
			}
		});

	// header less
	function headerLess() {
		var $html = $('html');
		var $el = $('.wcms-header-less');

		if ($el.length) {
			$html.addClass('is-wcms-header-less');
		} else {
			$html.removeClass('is-wcms-header-less');
		}
	}

	// tab position
	var tabPosition = {
		init: function () {
			$('.wcms-tab').each(function () {
				tabPosition.positionUpdate($(this));
			});
		},
		positionUpdate: function ($wrap) {
			var $scroller = $wrap.find('.wcms-tab-inner');
			var $activeItem = (function () {
				var $el = $scroller.find('.wcms-tab-link.is-active');

				if (!$el.length) {
					$el = $scroller.find('.wcms-tab-link.js-tabpanel-active');
				}

				if ($el.length) {
					return $el.closest('.wcms-tab-item');
				} else {
					return null;
				}
			})();

			var $list = null;
			var itemLeft = null;
			var itemMarginLeft = null;
			var listLeft = null;
			var listMarginLeft = null;
			var listPaddingLeft = null;
			var scrollLeft = null;

			if ($activeItem && $activeItem.length) {
				$scroller.scrollLeft(0);

				$list = $scroller.find('.wcms-tab-list');
				itemLeft = $activeItem.offset().left;
				itemMarginLeft = Number($activeItem.css('margin-left').replace(/px/g, ''));
				listLeft = $list.offset().left;
				listMarginLeft = Number($list.css('margin-left').replace(/px/g, ''));
				listPaddingLeft = Number($list.css('padding-left').replace(/px/g, ''));
				scrollLeft = itemLeft - listLeft + listMarginLeft - listPaddingLeft - itemMarginLeft;

				$scroller.scrollLeft(scrollLeft);
			}
		},
	};

	// common
	function wcmsCommon() {
		headerLess();

		$('.wcms-tab-wrap').each(function () {
			var $this = $(this);
			var initial = $this.attr('data-initial');
			var filter = function () {
				var $thisItem = $(this);
				var $wrap = $thisItem.closest('.wcms-tab-wrap');

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

		$('.wcms-notice-item').each(function () {
			var $this = $(this);
			if ($this.is(':first-of-type:not(.is-not-init-opened)')) {
				$this.addClass('is-opened');
			} else {
				$this.removeClass('is-opened');
			}
		});

		tabPosition.init();
	}
	window.uiWcmsJSCommon = wcmsCommon;

	// dom ready
	$(function () {
		/* #################### legacy #################### */
		$('.event-data .info_box dt a').each(function () {
			var $this = $(this);
			var $item = $this.closest('.info_box');
			var text = '상세내용보기';

			if ($item.hasClass('on')) {
				text = '상세내용닫기';
			}

			$this.append('<em class="blind">' + text + '</em>');
		});
		$('.event-data .terms_ty .terms_area .info').each(function () {
			var $this = $(this);
			var $item = $this.closest('.list');
			var text = '상세내용보기';

			if ($item.hasClass('on')) {
				text = '상세내용닫기';
			}

			$this.append('<a href="#"><em class="blind">' + text + '</em></a>');
		});
		$('.card-detail-data .accordian_ty > .list > a').each(function () {
			var $this = $(this);
			var $item = $this.closest('.list');
			var text = '상세내용보기';

			if ($item.hasClass('on')) {
				text = '상세내용닫기';
			}

			$this.append('<em class="blind">' + text + '</em>');
		});
		/* #################### //legacy #################### */

		wcmsCommon();
	});

	// win load, scroll, resize
	$win
		.on('load.uiWCMS', function () {
			//
		})
		.on('scroll.uiWCMS', function () {
			pop_size();
		})
		.on('resize.uiWCMS', function () {
			//
		})
		.on('orientationchange.uiWCMS', function () {
			//
		});
})(jQuery);
