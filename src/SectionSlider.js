/**
 * Created by semyon on 14.02.14.
 */
//'use strict';

function SectionSlider(options, undefined) {
    var self = this,
        elem = options.elem,
        scrollingSpeed = options.scrollingSpeed,
        easing = options.easing,
        resizeTime = options.resizeTime || 50,
        timeoutID = null,
        menu = options.menu,
        internalScrollState = "top",
        scrolledElement = 'html,body',
        sectionsActiveLength = 0,
        sectionActiveHeight = 0,
        sectionsLengthWithOutAction = 0,
        scrollOptions = {},
        nextSectionsHeight = 0,
        nextSectionsLength = 0,
        prevSectionsHeight = 0,
        prevSectionsLength = 0;

    this.init = function () {
        updateSectionHeight();
        //add active class to first section slide
        $(elem + ":first").addClass('section-active');


        //$(elem).css("background-color","red");
    };

    this.resize = function () {
        updateSectionHeight();
    }

    function clientHeight() {
        return document.documentElement.clientHeight;
    }

    function updateSectionHeight() {
        $(elem).css("height", clientHeight() + "px");
    }

    function upKeyPressed() {
        keyPressed();

        if (internalScrollState == "bottom" && sectionActiveHeight > clientHeight()) {
            //scrollLargeScreen(localActiveSection, "up");
            return false;
        }

        if (internalScrollState == "bottom" || internalScrollState == "top") {
            if (prevSectionsHeight <= clientHeight()) {
                nextSectionCenterUp();
            } else {
                nextSectionTopUp();
            }
            return false;
        }
    }

    function downKeyPressed() {
        keyPressed();

        if (internalScrollState == "top" && sectionActiveHeight > clientHeight()) {
            //scrollLargeScreen(localActiveSection);
            return false;
        }

        if (internalScrollState == "bottom" || internalScrollState == "top") {
            if (nextSectionsHeight <= clientHeight()) {
                nextSectionCenterDown();
            } else {
                nextSectionTopDown();
            }
            return false;
        }
    }

    function internalScrollTop() {
        scrollTo(sectionsLengtsWithOutAction);
        internalScrollState = "top";
    }

    function internalScrollBottom() {
        scrollTo(sectionsActiveLength - clientHeight());
        internalScrollState = "bottom";
    }

    function scrollTo(scrollValue) {
        scrollOptions['scrollTop'] = scrollValue + "px";
        $(scrolledElement).stop().animate(
            scrollOptions
            , scrollingSpeed / 3, easing);
    }

    function nextSectionCenterUp() {
        var value = prevSectionsLength - (prevSectionsHeight / 2) - (clientHeight() / 2);
        scrollTo(value);
        internalScrollState = "top";
    }

    function nextSectionCenterDown() {
        var value = nextSectionsLength - (nextSectionsHeight / 2) - (clientHeight() / 2);
        scrollTo(value);
        internalScrollState = "top";
    }

    function nextSectionTopUp() {
        nextSectionCenterUp();
        internalScrollState = "top";
    }

    function nextSectionTopDown() {
        nextSectionCenterDown();
        internalScrollState = "top";
    }

    function keyPressed() {
        sectionsLengthWithOutAction = 0;
        sectionsActiveLength = 0;
        sectionActiveHeight = 0;
        nextSectionsHeight = 0;
        nextSectionsLength = 0;
        prevSectionsHeight = 0;
        prevSectionsLength = 0;

        $(elem).each(function (index) {
            if ($(this).hasClass('section-active')) {
                sectionsLengthWithOutAction = sectionsActiveLength;
                prevSectionsHeight = sectionActiveHeight;
                prevSectionsLength = sectionsActiveLength;
                sectionActiveHeight = parseInt($(this).css('height'));
                sectionsActiveLength += sectionActiveHeight;
                nextSectionsHeight = parseInt($(".section-active" + " + " + elem).css('height'));
                nextSectionsLength = sectionsActiveLength + nextSectionsHeight;
                return false;
            } else {
                sectionActiveHeight = parseInt($(this).css('height'));
                sectionsActiveLength += sectionActiveHeight;
            }
        });
    }

    $(document).keydown(function (e) {
        switch (e.which) {
            //up key press
            case 38:
            case 33:
            {
                upKeyPressed();
                break;
            }
            //down key press
            case 40:
            case 34:
            {
                downKeyPressed();
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
};

$(document).ready(function () {
    var sectionSlider = new SectionSlider({
        elem: ".section-slider",
        easing: 'easeOutCubic',
        scrollingSpeed: 1100,
        menu: ".menu"
    });
    sectionSlider.init();
});
