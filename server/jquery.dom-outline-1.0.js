/**
 * Firebug/Web Inspector Outline Implementation using jQuery
 * Tested to work in Chrome, FF, Safari. Buggy in IE ;(
 * Andrew Childs <ac@glomerate.com>
 *
 * Example Setup:
 * var myClickHandler = function (element) { console.log('Clicked element:', element); }
 * var myDomOutline = DomOutline({ onClick: myClickHandler, filter: '.debug' });
 *
 * Public API:
 * myDomOutline.start();
 * myDomOutline.stop();
 */
var DomOutline = function (options) {
    options = options || {};

    var pub = {};
    var self = {
        opts: {
            namespace: options.namespace || 'DomOutline',
            borderWidth: options.borderWidth || 2,
            borderColor: options.borderColor || '#09c',
            onClick: options.onClick || false,
            filter: options.filter || false,
            dontStop: !options.stopOnClick || false,
            hideLabel: options.hideLabel || false,
            fillContent: options.fillContent || false
        },
        keyCodes: {
            BACKSPACE: 8,
            ESC: 27,
            DELETE: 46
        },
        active: false,
        initialized: false,
        elements: {}
    };
    
    function ColorLuminance(hex, lum) {
	    // validate hex string
	    hex = String(hex).replace(/[^0-9a-f]/gi, '');
	    if (hex.length < 6) {
		    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	    }
	    lum = lum || 0;
	    // convert to decimal and change luminosity
	    var rgb = "#", c, i;
	    for (i = 0; i < 3; i++) {
		    c = parseInt(hex.substr(i*2,2), 16);
		    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		    rgb += ("00"+c).substr(c.length);
	    }
	    return rgb;
    }

    function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

  
    function writeStylesheet(css) {
        var element = document.createElement('style');
        element.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(element);

        if (element.styleSheet) {
            element.styleSheet.cssText = css; // IE
        } else {
            element.innerHTML = css; // Non-IE
        }
    }

    function initStylesheet() {
        if (self.initialized !== true) {
            // 30% darker color for content
            var contentColor = ColorLuminance(self.opts.borderColor, -0.3);
            var contentColorRGB = hexToRgb(contentColor).r + ', ' + hexToRgb(contentColor).g + ', ' + hexToRgb(contentColor).b;
            // build css
            var css = '' +
                '.' + self.opts.namespace + ' {' +
                '    background: ' + self.opts.borderColor + ';' +
                '    position: absolute;' +
                '    z-index: 1000000;' +
                '}' +
                '.' + self.opts.namespace + '_label {' +
                '    background: ' + self.opts.borderColor + ';' +
                '    border-radius: 2px;' +
                '    color: #fff;' +
                '    font: bold 12px/12px Helvetica, sans-serif;' +
                '    padding: 4px 6px;' +
                '    position: absolute;' +
                '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);' +
                '    z-index: 1000001;' +
                '}' +
                '.' + self.opts.namespace + '_label.hidden {' +
                '    display: none;' +
                '}' +
                '.' + self.opts.namespace + '_fill_content {' +
                '    background: rgba(' + contentColorRGB + ', 0.3) !important;' +
                '    background-color: rgba(' + contentColorRGB + ', 0.3) !important;' +
                '}';

            writeStylesheet(css);
            self.initialized = true;
        }
    }

    function createOutlineElements() {
        self.elements.label = jQuery('<div></div>').addClass(self.opts.namespace + '_label hidden').appendTo('body');
        self.elements.top = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.bottom = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.left = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
        self.elements.right = jQuery('<div></div>').addClass(self.opts.namespace).appendTo('body');
    }

    function removeOutlineElements() {
        jQuery.each(self.elements, function(name, element) {
            element.remove();
        });
    }

    function compileLabelText(element, width, height) {
        var label = element.tagName.toLowerCase();
        if (element.id) {
            label += '#' + element.id;
        }
        if (element.className) {
            label += ('.' + jQuery.trim(element.className).replace(/ /g, '.')).replace(/\.\.+/g, '.');
        }
        return label + ' (' + Math.round(width) + 'x' + Math.round(height) + ')';
    }

    function getScrollTop() {
        if (!self.elements.window) {
            self.elements.window = jQuery(window);
        }
        return self.elements.window.scrollTop();
    }

    function updateOutlinePosition(e) {
        if(e.type != 'resize'){
          if (e.target.className && e.target.className.indexOf(self.opts.namespace) !== -1) {
              return;
          }
          if (self.opts.filter) {
              if (!jQuery(e.target).is(self.opts.filter)) {
                  return;
              }
          }
          pub.element = e.target
        } else {
          if(!pub.element) return;
        }
      
        if(!self.opts.hideLabel) 
          jQuery('.' + self.opts.namespace + '_label').removeClass('hidden');

        var b = self.opts.borderWidth;
        var scroll_top = getScrollTop();
        var pos = pub.element.getBoundingClientRect();
        var top = pos.top + scroll_top;
        var label_text = compileLabelText(pub.element, pos.width, pos.height);
        pub.element.label = label_text;
        // fill content
        if (self.opts.fillContent) {
          $('body').find('.' + self.opts.namespace + '_fill_content').removeClass(self.opts.namespace + '_fill_content');
          $(pub.element).addClass(self.opts.namespace + '_fill_content');
          $(pub.element).find('*').addClass(self.opts.namespace + '_fill_content');
        }
        
        var label_top = Math.max(0, top - 20 - b, scroll_top);
        var label_left = Math.max(0, pos.left - b);

        self.elements.label.css({ top: label_top, left: label_left }).text(label_text);
        self.elements.top.css({ top: Math.max(0, top - b), left: pos.left - b, width: pos.width + b, height: b });
        self.elements.bottom.css({ top: top + pos.height, left: pos.left - b, width: pos.width + b, height: b });
        self.elements.left.css({ top: top - b, left: Math.max(0, pos.left - b), width: b, height: pos.height + b });
        self.elements.right.css({ top: top - b, left: pos.left + pos.width, width: b, height: pos.height + (b * 2) });
    }

    function stopOnEscape(e) {
        if (e.keyCode === self.keyCodes.ESC || e.keyCode === self.keyCodes.BACKSPACE || e.keyCode === self.keyCodes.DELETE) {
            pub.stop();
        }

        return false;
    }

    function clickHandler(e) {
        pub.stop();
        self.opts.onClick(pub.element);

        return false;
    }

    pub.start = function () {
        initStylesheet();
        if (self.active !== true) {
            self.active = true;
            createOutlineElements();
            jQuery('body').on('mousemove.' + self.opts.namespace, updateOutlinePosition);
            jQuery('body').on('keyup.' + self.opts.namespace, stopOnEscape);
            if (self.opts.onClick) {
                setTimeout(function () {
                    jQuery('body').on('click.' + self.opts.namespace, function(e){
                        if (self.opts.filter) {
                            if (!jQuery(e.target).is(self.opts.filter)) {
                                return false;
                            }
                        }
                        clickHandler.call(this, e);
                    });
                }, 50);
            }
        }
    };

    pub.stop = function () {
        self.active = false;
        removeOutlineElements();
        if (self.opts.fillContent) {
         $('body').find('.' + self.opts.namespace + '_fill_content').removeClass(self.opts.namespace + '_fill_content');
        }
        jQuery('body').off('mousemove.' + self.opts.namespace)
            .off('keyup.' + self.opts.namespace)
            .off('click.' + self.opts.namespace);
    };

    return pub;
};