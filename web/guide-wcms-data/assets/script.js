(function ($) {
	// common variable
	var $win = $(window);
	var $doc = $(document);
	var GNBLIST = [
		{
			text: '미리보기 에디터',
			path: './editor.html',
		},
		{
			text: '컴포넌트',
			path: './common.html',
		},
		{
			text: '카드',
			path: './card.html',
		},
		{
			text: '약관',
			path: './clause.html',
		},
		{
			text: '이벤트',
			path: './event.html',
		},
		{
			text: '쿠폰',
			path: './coupon.html',
		},
		{
			text: 'VIP 이벤트',
			path: './vip-event.html',
		},
		{
			text: 'VIP 쿠폰',
			path: './vip-coupon.html',
		},
		{
			text: 'VIP 초청행사',
			path: './vip-promotion.html',
		},
		{
			text: '공지사항',
			path: './notice.html',
		},
		{
			text: '자주 묻는 질문',
			path: './faq.html',
		},
		{
			text: '소비자주의경보',
			path: './consumer-notice.html',
		},
		{
			text: '공지 팝업',
			path: './notice-popup.html',
		},
		{
			text: '오픈뱅킹 긴급공지 팝업',
			path: './open-banking-notice-popup.html',
		},
		{
			text: '통합검색',
			path: './search.html',
		},
	];

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

	// fixBarScroll
	function fixBarScroll() {
		var $fixBar = $('.header, .lnb');
		var scrollX = $win.scrollLeft();

		$fixBar.css('margin-left', -scrollX);
	}

	// gnb
	function gnb() {
		var $list = $('.gnb__list');
		var $homeList = $('.home__gnb');
		var $title = $('.lnb__title');
		var path = location.pathname;
		var html = '';
		var homeHtml = '';

		$.each(GNBLIST, function () {
			var pathName = this.path.match(/\/[^/]+\.html$/);
			var isActive = path.match(pathName);

			html += '<li class="gnb__item ' + (isActive ? 'is-active' : '') + '"><a href="' + this.path + '" class="gnb__link">' + this.text + '</a></li>';
			homeHtml += '<li class="home__gnb__item"><a href="' + this.path + '" class="home__gnb__link">' + this.text + '</a></li>';

			if (isActive) {
				$title.text(this.text);
			}
		});

		$list.append(html);
		$homeList.append(homeHtml);
	}

	// lnb
	function lnb() {
		var $list = $('.lnb__list');
		var $section = $('.section');
		var html = '';

		$section.each(function (i) {
			var $this = $(this);
			var id = 'lnb' + i;
			var text = $this.find('.section__title').eq(0).text();
			$this.attr('id', id);
			html += '<li class="lnb__item"><a href="#' + id + '" class="lnb__link js-hash-scroll-link">' + text + '</a></li>';
		});
		$list.append(html);
	}

	// resize
	function resize() {
		var $header = $('.header');
		var headerH = $header.outerHeight();
		var $layout = $('.layout-wrap');
		var $lnb = $('.lnb');

		$layout.css('padding-top', headerH);
		$lnb.css('top', headerH);
	}

	// hash scroll
	var hashScroll = {
		classNames: {
			active: 'is-active',
			link: 'js-hash-scroll-link',
		},
		goToScroll: function (hash) {
			var $target = $(hash);
			var $html = $('html');
			var $header = $('.header');
			var headerH = $header.outerHeight();
			var offsetTop = $target.offset().top - headerH - 30;
			var $links = $('.' + hashScroll.classNames.link);
			var $targetLink = $links.filter('[href="' + hash + '"]');

			$links.removeClass(hashScroll.classNames.active);
			$targetLink.addClass(hashScroll.classNames.active);
			$html.stop().animate(
				{
					scrollTop: offsetTop,
				},
				500
			);
		},
		updateLinkClass: function () {
			var $html = $('html');
			var $links = $('.' + hashScroll.classNames.link);

			if (!$links.length || $html.is(':animated') || !$links.eq(0).is(':visible')) {
				return;
			}

			var hashArray = [];
			var scrollTop = $win.scrollTop();
			var maxScrollTop = $('body').get(0).scrollHeight - $win.height();

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

				var $header = $('.header');
				var headerH = $header.outerHeight();
				var offsetTop = $target.offset().top - headerH - 30;
				var $targetLink = $links.filter('[href="' + v + '"]');

				if (scrollTop >= offsetTop) {
					$links.removeClass(hashScroll.classNames.active);
					$targetLink.addClass(hashScroll.classNames.active);
				}
			});

			if (scrollTop >= maxScrollTop) {
				$links.removeClass(hashScroll.classNames.active);
				$links.filter('[href="' + hashArray[hashArray.length - 1] + '"]').addClass(hashScroll.classNames.active);
			}
		},
	};
	$doc.on('click.hashScroll', '.' + hashScroll.classNames.link, function (e) {
		hashScroll.goToScroll($(this).attr('href'));
	});

	// dom ready
	$(function () {
		var $html = $('html');
		var $body = $('body');

		scrollbarsWidth.set();

		gnb();
		lnb();

		$('.viewer').css({
			width: 360 + scrollbarsWidth.width,
		});

		$('code').each(function () {
			var $this = $(this);
			var el = $this.get(0);
			el.innerHTML = el.innerHTML.replace(/^\n/, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		});
		hljs.highlightAll();
		hljs.initLineNumbersOnLoad();

		$('.code-editor').each(function () {
			var $this = $(this);
			var codeMirror = CodeMirror($this.get(0), {
				mode: 'htmlmixed',
				theme: 'vscode-dark',
				indentWithTabs: true,
				lineNumbers: true,
			});

			$this.data('codeMirror', codeMirror);
		});

		$('.js-editor').each(function () {
			var $this = $(this);
			var $tabItem = $this.find('.tab__button');
			var $submit = $this.find('.js-editor-submit');
			var $viewer = $this.find('.viewer iframe');
			var $editor = $this.find('.code-editor');
			var codeMirror = $editor.data('codeMirror');

			function run() {
				var html = codeMirror.getValue();

				$viewer.contents().find('#editorViewer').html(html);
				$viewer.get(0).contentWindow.uiWcmsJSCommon();
			}

			$tabItem.on('click', function (e) {
				var $thisTab = $(this);
				var src = $thisTab.attr('data-type');

				e.preventDefault();

				if (!$thisTab.hasClass('is-active')) {
					$tabItem.removeClass('is-active');
					$thisTab.addClass('is-active');
					$viewer.attr('src', src);
				}
			});

			$submit.on('click', function (e) {
				e.preventDefault();
				run();
			});

			$viewer.on('load', function () {
				run();
			});
		});

		hashScroll.updateLinkClass();
		resize();
	});

	// win load, scroll, resize
	$win
		.on('load.uiJS', function () {
			hashScroll.updateLinkClass();
		})
		.on('scroll.uiJS', function () {
			fixBarScroll();
			hashScroll.updateLinkClass();
		})
		.on('resize.uiJS', function () {
			fixBarScroll();
			hashScroll.updateLinkClass();
			resize();
		})
		.on('orientationchange', function () {
			fixBarScroll();
			hashScroll.updateLinkClass();
			resize();
		});
})(jQuery);
