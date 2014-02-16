/**
 * Created by semyon on 14.02.14.
 */
'use strict';

function SectionSlider(options, undefined) {
    var self = this,
        elem = options.elem,
        easing = options.easing,
        resizeTime = options.resizeTime || 50,
        activeSelector = options.activeSelector,
        timeoutID = null,
        scrollToValue = 0,
        menu = options.menu,
        scrollState = "top",
        scrolledElement = 'html,body',
        scrollOptions = {},
        section = {},
        scrollWay = "",
        displayedSection = {};

    this.init = function () {
        updateSectionHeight();
    };

    this.resize = function () {
        updateSectionHeight();
    }

    function clientHeight() {
        return document.documentElement.clientHeight;
    }

    function scrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop;
    }

    function updateSectionHeight() {
        if (options.sectionsFullScreen) {
            $(elem).css("height", clientHeight() + "px");
        }
    }

    function scrollHappens() {
        sectionShows();
        $(displayedSection).addClass(activeSelector).siblings().removeClass(activeSelector);
    }

    this.scrollTo = function (selector) {
        sectionShows();
        $(selector).addClass(activeSelector).siblings().removeClass(activeSelector);
        self.scrollActive();
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

    this.scrollPrev = function () {
        sectionsParse();

        scrollWay = "prev";

        if (scrollState == "bottom" && section.height > clientHeight()) {
            scrollInternalPrev();
            return false;
        }

        if (scrollState == "bottom" || scrollState == "top") {
            if (section.prev.height <= clientHeight()) {
                scrollCenterPrev();
            } else {
                scrollTopPrev();
            }
            return false;
        }
    }

    this.scrollActive = function () {
        sectionsParse();

        scrollWay = "active";

        if (section.height > clientHeight()) {
            scrollTopActive();
        }

        if (section.height <= clientHeight()) {
            scrollCenterActive();
        }

        scrollToValue = 0;
    }

    this.scrollNext = function () {
        sectionsParse();

        scrollWay = "next";

        if (scrollState == "top" && section.height > clientHeight()) {
            scrollInternalNext();
            return false;
        }

        if (scrollState == "bottom" || scrollState == "top") {
            if (section.next.height <= clientHeight()) {
                scrollCenterNext();
            } else {
                scrollTopNext();
            }
            return false;
        }
    }

    function scrollInternalPrev() {
        if (scrollState == "bottom") {
            scrollTo(section.offset.top, options.scrollSpeed / 3);
            scrollState = "top";
        }
    }

    function scrollInternalNext() {
        if (scrollState == "top") {
            scrollTo(section.offset.top + section.height - clientHeight(), options.scrollSpeed / 3);
            scrollState = "bottom";
        }
    }

    function scrollTo(value, speed) {
        var speed = speed || options.scrollSpeed;
        var value = value;
        if (value == scrollToValue) {
            return false;
        }
        if (scrollWay == "next" && value < scrollTop()) {
            return false;
        }
        if (scrollWay == "prev" && value > scrollTop()) {
            return false;
        }
        options['scrollTop'] = value + "px";
        $(scrolledElement).stop().animate(
            options,
            speed,
            easing);
        scrollToValue = value;
    }

    function scrollCenterPrev() {
        var value = section.prev.offset.top + (section.prev.height / 2) - (clientHeight() / 2);
        scrollTo(value);
        scrollState = "top";
    }

    function scrollCenterNext() {
        var value = section.next.offset.top + (section.next.height / 2) - (clientHeight() / 2);
        scrollTo(value);
        scrollState = "top";
    }

    function scrollCenterActive() {
        var value = section.offset.top + (section.height / 2) - (clientHeight() / 2);
        scrollTo(value, 0);
        scrollState = "top";
    }

    function scrollTopPrev() {
        var value = section.prev.offset.top;
        scrollTo(value);
        scrollState = "top";
    }

    function scrollTopNext() {
        var value = section.next.offset.top;
        scrollTo(value);
        scrollState = "top";
    }

    function scrollTopActive() {
        var value = section.offset.top;
        scrollTo(value, 0);
        scrollState = "top";
    }

    $(document).keydown(function (e) {
        switch (e.which) {
            //up key press
            case 38:
            case 33:
            {
                self.scrollPrev();
                return false;
                break;
            }
            //down key press
            case 40:
            case 34:
            {
                self.scrollNext();
                return false;
                break;
            }
            default:
                break;
        }
    });

    $(window).resize(function () {
        clearTimeout(timeoutID);
        timeoutID = setTimeout(self.resize, resizeTime);
    });

    $(window).bind('orientationchange', function () {
        self.resize();
    });

    $(window).scroll(function () {
        scrollHappens();
    });
};
