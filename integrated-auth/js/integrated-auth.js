(function ($) {
	window.uiIntegratedAuth = {};

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
	uiIntegratedAuth.userAgentCheck = userAgentCheck;

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
		init: function ($root) {
			if (!$root) {
				$root = $doc;
			}

			var $inputs = $root.find('.ui-form-item');

			$inputs.each(function () {
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
													authSelect.scrollUpdate($scroller, function () {
														setTimeout(function () {
															authSelect.formFocus($formInners.filter(':visible'));
														}, 1000);
													});
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
			var $formInners = $wrap.find('.auth-form-inner');

			authSelect.scrollUpdate($scroller);
			authSelect.formFocus($formInners.filter(':visible'));
		});

	// page class
	function pageClass($root) {
		if (!$root) {
			$root = $doc;
		}

		var $html = $('html');
		var $el = $root.find('.page-contents');

		if ($el.hasClass('page-contents--driver-license')) {
			$html.addClass('page-driver-license');
		} else {
			$html.removeClass('page-driver-license');
		}
	}

	// common js
	function uiJSCommon($root) {
		if (!$root) {
			$root = $doc;
		}

		pageClass($root);
		formLabel.init($root);
		authSelect.init($root);
	}
	uiIntegratedAuth.common = uiJSCommon;

	// uiJSResize
	function uiJSResize() {
		//
	}
	uiIntegratedAuth.resize = uiJSResize;

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

	// dom ready
	$(function () {
		var $html = $('html');
		var $body = $('body');

		// init
		uiJSCommon();

		// resize
		uiJSResize();
	});

	// win load, scroll, resize
	$win
		.on('load.uiJS', function () {
			uiJSResize();
		})
		.on('scroll.uiJS', function () {
			//
		})
		.on('resize.uiJS', function () {
			uiJSResize();
		})
		.on('orientationchange.uiJS', function () {
			uiJSResize();
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
