"use strict";

/**
 * Usage:
 * <img class="scroll-handle" src="images/g4170.png" data-x="0" data-y="30" />
 * <script src="js/parallax.js"></script>
 */
(function() {
    var ScrollEffect = {
        els: [],
        startY: 0, // when effect starts
        endY: 360, // when effect stops
        init: function() {
            window.onresize = this.onResize;
            this.onResize();
        },
        onResize: function(e) {
            console.log(window.innerWidth);
            if (window.innerWidth >= 980) { // only for large screen width
                ScrollEffect.els = [];
                window.onscroll = ScrollEffect.scrollHandler;
                ScrollEffect.findScrollObjects();
            } else {
                ScrollEffect.els = [];
                window.onscroll = function() {};
            }
        },
        getOffset: function(el) {
            var _x = 0;
            var _y = 0;
            _x += el.offsetLeft;
            _y += el.offsetTop;
            return {
                top: _y,
                left: _x
            };
        },
        scrollHandler: function(e) {
            var scrolled = window.pageYOffset || document.documentElement
                .scrollTop;
            if (scrolled >= ScrollEffect.startY && scrolled <=
                ScrollEffect.endY) {
                var prc = parseInt(parseInt(scrolled - ScrollEffect
                    .startY) * 100 / parseInt(ScrollEffect.endY -
                    ScrollEffect.startY));
                for (var i in ScrollEffect.els) {
                    ScrollEffect.els[i].emit(prc);
                }
            }
        },
        findScrollObjects: function() {
            var els = document.querySelectorAll('.scroll-handle');
            for (var i in els) {
                if (typeof els[i] == 'object') {
                    var offset = this.getOffset(els[i]);
                    ScrollEffect.els.push({
                        obj: els[i],
                        start: {
                            x: offset.left,
                            y: offset.top
                        },
                        moveto: {
                            x: els[i].dataset.x,
                            y: els[i].dataset.y
                        },
                        end: {
                            x: offset.left + parseInt(els[i]
                                .dataset
                                .x),
                            y: offset.top + parseInt(els[i]
                                .dataset.y)
                        },
                        emit: function(percent) {
                            var xpos = percent * (this.end
                                    .x -
                                    this.start.x) *
                                0.01;
                            var ypos = percent * (this.end
                                    .y -
                                    this.start.y) *
                                0.01;
                            this.obj.style.left =
                                parseInt(this.start.x +
                                    xpos) +
                                'px';
                            this.obj.style.top =
                                parseInt(this.start.y +
                                    ypos) +
                                'px';
                        }
                    });
                }
            }
        }
    };
    ScrollEffect.init();
})();
