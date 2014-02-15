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
        menu = options.menu,
        scrollState = "top",
        scrolledElement = 'html,body',
        scrollOptions = {},
        sections = {},
        displayedSection = {};

    this.init = function () {
        updateSectionHeight();
        if (options.activeFirst) {
            $(elem + ":first").addClass(activeSelector);
        }
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
        nowSectionDisplay();

        $(displayedSection).addClass(activeSelector).siblings().removeClass(activeSelector);
    }

    function nowSectionDisplay() {
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
        sections= {};
        sections = {
            active: {
                height: 0,
                length: 0
            }
        };

        $(elem).each(function () {
            if ($(this).hasClass(activeSelector)) {
                sections.prev = {
                    height: sections.active.height,
                    length: sections.active.length
                };
                sections.active = {
                    height: parseInt($(this).css('height')),
                    length: $(this).offset().top
                }
                sections.next = $("."+ activeSelector + " + " + elem);
                if (sections.next.length != 0) {
                    sections.next = {
                        height: parseInt($("." + activeSelector + " + " + elem).css('height')),
                        length: $("."+ activeSelector + " + " + elem).offset().top
                    }
                } else {
                    sections.next.height = sections.active.height;
                    sections.next.length = sections.active.length;
                }
                return false;
            } else {
                sections.active = {
                    height: parseInt($(this).css('height')),
                    length: $(this).offset().top
                }
            }
        });
    }

    function upKeyPressed() {
        sectionsParse();

        if (scrollState == "bottom" && sections.active.height > clientHeight()) {
            scrollLargeScreenUp();
            return false;
        }

        if (scrollState == "bottom" || scrollState == "top") {
            if (sections.prev.height <= clientHeight()) {
                nextSectionCenterUp();
            } else {
                nextSectionTopUp();
            }
            return false;
        }
    }

    function downKeyPressed() {
        sectionsParse();

        if (scrollState == "top" && sections.active.height > clientHeight()) {
            scrollLargeScreenDown();
            return false;
        }

        if (scrollState == "bottom" || scrollState == "top") {
            if (sections.next.height <= clientHeight()) {
                nextSectionCenterDown();
            } else {
                nextSectionTopDown();
            }
            return false;
        }
    }

    function scrollLargeScreenDown() {
        if (scrollState == "top") {
            internalScrollBottom();
            return;
        }
    }

    function scrollLargeScreenUp() {
        if (scrollState == "bottom") {
            internalScrollTop();
            return;
        }
    }

    function internalScrollTop() {
        scrollTo(sections.active.length, options.scrollSpeed/3);
        scrollState = "top";
    }

    function internalScrollBottom() {
        scrollTo(sections.active.length + sections.active.height - clientHeight(), options.scrollSpeed/3);
        scrollState = "bottom";
    }

    function scrollTo(scrollValue, scrollSpeed) {
        scrollSpeed = scrollSpeed || options.scrollSpeed;
        scrollOptions['scrollTop'] = scrollValue + "px";
        $(scrolledElement).stop().animate(
            scrollOptions
            , scrollSpeed, easing);
    }

    function nextSectionCenterUp() {
        var value = sections.prev.length + (sections.prev.height / 2) - (clientHeight() / 2);
        scrollTo(value);
        scrollState = "top";
    }

    function nextSectionCenterDown() {
        var value = sections.next.length + (sections.next.height / 2) - (clientHeight() / 2);
        scrollTo(value);
        scrollState = "top";
    }

    function nextSectionTopUp() {
        var value = sections.prev.length;
        scrollTo(value);
        scrollState = "top";
    }

    function nextSectionTopDown() {
        var value = sections.next.length;
        scrollTo(value);
        scrollState = "top";
    }


    $(document).keydown(function (e) {
        switch (e.which) {
            //up key press
            case 38:
            case 33:
            {
                upKeyPressed();
                return false;
                break;
            }
            //down key press
            case 40:
            case 34:
            {
                downKeyPressed();
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
