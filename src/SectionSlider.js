/**
 * Created by Semyon Morozov jsemyonom@gmail.com  on 14.02.14.
 */


(function (window, undefined) {
    'use strict';
    var sectionSlider = {},
        elem = "",
        easing = "",
        resizeTime = "",
        activeSelector = "",
        timeoutID = null,
        scrollToValue = null,
        menu = "",
        scrolledElement = 'html,body',
        section = {},
        scrollWay = "",
        scrollSpeed = 0,
        displayedSection = {},
        activeMenuItem = "",
        fullScreenSelector = [];

    sectionSlider.options = function (options) {
        sectionSlider.options = options || {};
        sectionSlider.init();
    }

    sectionSlider.init = function () {
        elem = sectionSlider.options.elem || ".section";
        easing = sectionSlider.options.easing || "linear";
        resizeTime = sectionSlider.options.resizeDelay || 50;
        activeSelector = sectionSlider.options.activeSelector || "section-active";
        scrollSpeed = sectionSlider.options.scrollSpeed || 400;
        menu = sectionSlider.options.menu;
        fullScreenSelector = sectionSlider.options.fullScreenSelector || [];

        updateSectionHeight();
        scrollHash();
        scrollHappens();

        $(menu + ' a').on('click', function (e) {
            scrollToValue = null;
            e.preventDefault();
            location.hash = $(this).attr('href');
            $(window).trigger('hashchange');
        });
    };

    sectionSlider.resize = function () {
        updateSectionHeight();
    }

    function getScrollState() {
        if (scrollTop() === section.offset.top) {
            return "top";
        }
        if (scrollTop() + clientHeight() === section.offset.top + section.height) {
            return "bottom"
        }
        if (scrollTop() + clientHeight() > section.offset.top + section.height) {
            return "after"; //out
        }
        if (scrollTop() < section.offset.top) {
            return "before"; //prev
        }
        return "inside"; //enter
    }

    function clientHeight() {
        return document.documentElement.clientHeight;
    }

    function scrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop;
    }

    function updateSectionHeight() {
        $(fullScreenSelector).css("min-height", clientHeight() + "px");
    }

    function scrollHappens() {
        sectionShows();
        var sectionMenuItem = $(displayedSection).data('menu-item');
        if (activeMenuItem !== sectionMenuItem) {
            $(activeMenuItem).removeClass("active");
            activeMenuItem = sectionMenuItem;
            //window.history.pushState("text", "hello", activeMenuItem);
            //scrollToValue = null;
        }
        $(activeMenuItem).addClass("active");
        $(displayedSection).addClass(activeSelector).siblings().removeClass(activeSelector);
    }

    sectionSlider.scrollTo = function ($selector) {
        sectionShows();
        $selector.addClass(activeSelector).siblings().removeClass(activeSelector);
        sectionSlider.scrollActive();
    }

    function sectionShows() {
        var centerScrollPos = scrollTop() + clientHeight() / 2;

        $(elem).each(function () {
            var positionTop = $(this).offset().top;
            var positionBottom = positionTop + $(this).height();

            if (centerScrollPos > positionTop && centerScrollPos < positionBottom) {
                displayedSection = $(this);
            }
        });
    }

    function sectionsParse() {
        var sections = $(elem);
        for (var i = 0; i < sections.length; i++) {
            if ($(sections[i]).hasClass(activeSelector)) {
                section = {
                    height: parseInt($(sections[i]).css('height')),
                    offset: $(sections[i]).offset()
                }
                section.prev = {
                    height: parseInt($(sections[i - 1]).css('height')) || 0,
                    offset: $(sections[i - 1]).offset() || 0
                };
                section.next = {
                    height: parseInt($(sections[i + 1]).css('height')) || section.height,
                    offset: $(sections[i + 1]).offset() || section.offset
                }
                return false;
            }
        }
    }

    sectionSlider.scrollPrev = function () {
        sectionsParse();
        scrollWay = "back";

        if (getScrollState() === "after"
            && section.offset.top < scrollTop()
            && section.height < clientHeight()) {
            scrollInternalCenter();
            return false;
        }

        if (getScrollState() === "after" && section.height > clientHeight()) {
            scrollInternalBottom();
            return false;
        }

        if (getScrollState() !== "top" && getScrollState() !== "before" && section.height > clientHeight()) {
            scrollInternalTop();
            return false;
        }

        if (section.prev.height <= clientHeight()) {
            scrollCenterPrev();
        } else {
            scrollBottomPrev();
        }

        return false;
    }

    sectionSlider.scrollActive = function () {
        sectionsParse();
        scrollWay = "active";

        if (section.height > clientHeight()) {
            scrollTopActive();
        }

        if (section.height <= clientHeight()) {
            scrollCenterActive();
        }

        return false;
    }

    sectionSlider.scrollNext = function () {
        sectionsParse();
        scrollWay = "next";

        if (getScrollState() === "before"
            && section.offset.top + section.height > scrollTop() + clientHeight()
            && section.height < clientHeight()) {
            scrollInternalCenter();
            return false;
        }

        if (getScrollState() === "before" && section.height > clientHeight()) {
            scrollInternalTop();
            return false;
        }

        if (getScrollState() !== "bottom" && getScrollState() !== "after" && section.height > clientHeight()) {
            scrollInternalBottom();
            return false;
        }

        if (section.next.height <= clientHeight()) {
            scrollCenterNext();
        } else {
            scrollTopNext();
        }

        return false;
    }

    function scrollInternalTop() {
        scrollTo(section.offset.top, scrollSpeed);
    }

    function scrollInternalBottom() {
        scrollTo(section.offset.top + section.height - clientHeight(), scrollSpeed);
    }

    function scrollTo(value, speed) {
        speed = speed || 0;
        //console.log(value + " "+ scrollToValue);
        if (scrollToValue === value ||
            isNaN(value) ||
            (scrollWay === "next" && value < scrollTop()) ||
            (scrollWay === "back" && value > scrollTop())
            ) {
            return false;
        }

        scrollAnimate(value, speed);
    }

    function scrollAnimate(value, speed) {
        sectionSlider.options.scrollTop = value + "px";
        $(scrolledElement).stop().animate(
            sectionSlider.options, {
                duration: speed,
                always: function () {
                    scrollToValue = null;
                },
                complete: function () {
                    scrollToValue = null;
                },
                fail: function () {
                    scrollToValue = null;
                },
                done: function () {
                    scrollToValue = null;
                }
            });
        scrollToValue = value;
    }

    function scrollCenterPrev() {
        var value = section.prev.offset.top + (section.prev.height / 2) - (clientHeight() / 2);
        scrollTo(value, scrollSpeed);
    }

    function scrollCenterNext() {
        var value = section.next.offset.top + (section.next.height / 2) - (clientHeight() / 2);
        scrollTo(value, scrollSpeed);
    }

    function scrollCenterActive() {
        var value = section.offset.top + (section.height / 2) - (clientHeight() / 2);
        scrollTo(value);
    }

    function scrollInternalCenter() {
        var value = section.offset.top + (section.height / 2) - (clientHeight() / 2);
        scrollTo(value, scrollSpeed);
    }

    function scrollTopPrev() {
        var value = section.prev.offset.top;
        scrollTo(value, scrollSpeed);
    }

    function scrollBottomPrev() {
        var value = section.prev.offset.top + section.prev.height - clientHeight();
        scrollTo(value, scrollSpeed);
    }

    function scrollTopNext() {
        var value = section.next.offset.top;
        scrollTo(value, scrollSpeed);
    }

    function scrollTopActive() {
        var value = section.offset.top;
        scrollTo(value);
    }

    $(document).keydown(function (e) {
        switch (e.which) {
            //up key press
            case 38:
            case 33:
            {
                sectionSlider.scrollPrev();
                e.preventDefault();
                break;
//                return;
            }
            //down key press
            case 40:
            case 34:
            {
                sectionSlider.scrollNext();
                e.preventDefault();
                break;
//                return;
            }
            default:
                break;
        }
    });

    function scrollHash() {
        var value = window.location.hash.split('/');
        var section = value[0].replace("#", ".");

        //sectionSlider.scrollTo($(elem+section).first());
        $(elem).each(function () {
            if ($(this).data('menu-item') === section) {
                sectionSlider.scrollTo($(this));
                return false;
            }
        });
    }

    $(window).on('hashchange', function () {
        scrollHash();
    });

    $(window).resize(function () {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(sectionSlider.resize, resizeTime);
    });

    $(window).bind('orientationchange', function () {
        sectionSlider.resize();
    });

    $(window).scroll(function () {
        scrollHappens();
    });
    window.sectionSlider = sectionSlider;

    sectionSlider.init();
}(this));
