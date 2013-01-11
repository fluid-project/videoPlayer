/*
Copyright 2012-2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

/*global jQuery, window, fluid*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */


(function ($) {


    /*****************************************************************************
        Language Menu subcomponent
        Used for Captions, Transcripts, Audio Descriptions.
        Starts with a list of languages and adds the "none, please" options.
        Eventually, we'll add the "Make new" and "Request new" buttons.
        Note that the language menu cannot share the model of the controls: it
        needs the list of captions (or transcripts, etc) as its model for rendering.
     *****************************************************************************/
    fluid.defaults("fluid.videoPlayer.languageMenu", {
        gradeNames: ["fluid.rendererComponent", "fluid.videoPlayer.indirectReader", "autoInit"],
        renderOnInit: true,
        preInitFunction: "fluid.videoPlayer.languageMenu.preInit",
        postInitFunction: "fluid.videoPlayer.languageMenu.postInit",
        finalInitFunction: "fluid.videoPlayer.languageMenu.finalInit",
        produceTree: "fluid.videoPlayer.languageMenu.produceTree",
        languages: [],
        currentLanguagePath: "activeLanguages",
        showHidePath: "showLanguage",
        model: {},
        events: {
            onReady: null,
            activated: null,
            hiddenByKeyboard: null,
            onControlledElementReady: null
        },
        listeners: {
            onControlledElementReady: {
                listener: "fluid.videoPlayer.languageMenu.setAriaControlsAttr",
                args: ["{languageMenu}", "{arguments}.0"]
            }
        },
        selectors: {
            menuItem: ".flc-videoPlayer-menuItem",
            language: ".flc-videoPlayer-language",
            showHide: ".flc-videoPlayer-languageNone"
        },
        repeatingSelectors: ["language"],
        strings: {
            showLanguage: "Show Language",
            hideLanguage: "Hide Language"
        },
        styles: {
            selected: "fl-videoPlayer-menuItem-selected",
            active: "fl-videoPlayer-menuItem-active"
        },
        invokers: {
            updateTracks: { funcName: "fluid.videoPlayer.languageMenu.updateTracks", args: ["{languageMenu}"] },
            updateShowHide: { funcName: "fluid.videoPlayer.languageMenu.updateShowHide", args: ["{languageMenu}"] }
        },
        hideOnInit: true
    });

    // TODO: Could this be specified declaratively, in a "protoTree" option?
    // Ans: not very effectively... the renderer still needs to be burned to the ground
    fluid.videoPlayer.languageMenu.produceTree = function (that) {
        // Silly damn renderer with its crazy JSON idiolect!
        that.model.languages = that.options.languages;
        var tree = {
            // create a menu item for each language in the model
            expander: {
                type: "fluid.renderer.repeat",
                repeatID: "language",
                controlledBy: "languages",
                pathAs: "lang",
                tree: {
                    value: "${{lang}.label}",
                    decorators: {
                        type: "attrs",
                        attributes: {
                            "role": "menuitemradio",
                            "aria-checked": "false",
                            "aria-selected": "false"
                        }
                    }
                }
            },
            // add the 'turn off' option
            showHide: {
                value: that.options.strings[that.readIndirect("showHidePath") ? "hideLanguage" : "showLanguage"],
                decorators: {
                    type: "attrs",
                    attributes: {
                        "role": "menuitemcheckbox",
                        "aria-checked": "false",
                        "aria-selected": "false"
                    }
                }
            }
        };
        return tree;
    };

    fluid.videoPlayer.languageMenu.setUpKeyboardA11y = function (that) {
        that.container.fluid("tabbable");
        that.container.fluid("selectable", {
            direction: fluid.a11y.orientation.VERTICAL,
            selectableSelector: that.options.selectors.menuItem,
            // TODO: add simple style class support to selectable 
            onSelect: function (el) {
                $(el).addClass(that.options.styles.selected);
            },
            onUnselect: function (el) {
                $(el).removeClass(that.options.styles.selected);
            },
            rememberSelectionState: false,
            autoSelectFirstItem: false,
            noWrap: false
        });

        that.locate("language").fluid("activatable", function (evt) {
            that.activate(that.locate("language").index(evt.currentTarget));
            that.events.hiddenByKeyboard.fire();
            return false;
        });
        that.locate("showHide").fluid("activatable", function (evt) {
            that.showHide();
            that.events.hiddenByKeyboard.fire();
            return false;
        });
    };

    fluid.videoPlayer.languageMenu.bindEventListeners = function (that) {
        var langList = that.locate("language");
        langList.click(function (evt) {
            that.activate(langList.index(evt.currentTarget));
        });

        that.locate("showHide").click(function (evt) {
            that.showHide();
        });

        that.applier.modelChanged.addListener(that.options.showHidePath, that.updateShowHide);
        that.applier.modelChanged.addListener(that.options.currentLanguagePath, that.updateTracks);

    };

    fluid.videoPlayer.languageMenu.updateTracks = function (that) {
        var menuItems = that.locate("menuItem");
        menuItems.removeClass(that.options.styles.selected).removeClass(that.options.styles.active);
        menuItems.attr("aria-checked", "false").attr("aria-selected", "false");
        var langIndex = that.readIndirect("currentLanguagePath")[0];
        var selectedItem = $(menuItems[langIndex]);
        selectedItem.addClass(that.options.styles.active);
        selectedItem.attr("aria-checked", "true").attr("aria-selected", "true");
    };
    
    fluid.videoPlayer.languageMenu.updateShowHide = function (that) {
        var showHide = that.readIndirect("showHidePath"); 
        that.locate("showHide").text(that.options.strings[showHide ? "hideLanguage" : "showLanguage"]);
    };

    fluid.videoPlayer.languageMenu.setAriaControlsAttr = function (that, controlledId) {
        that.container.attr("aria-controls", controlledId);
        that.locate("menuItem").attr("aria-controls", controlledId);
    };

    fluid.videoPlayer.languageMenu.preInit = function (that) {
        that.toggleView = function () {
            that.container.toggle();
            that.container.attr("aria-hidden", !that.container.is(':visible'));
        };
    };

    fluid.videoPlayer.languageMenu.postInit = function (that) {
        that.showMenu = function () {
            that.container.show();
            that.container.attr("aria-hidden", "false");
        };
        that.hideMenu = function () {
            that.container.hide();
            that.container.attr("aria-hidden", "true");
        };
        that.showAndSelect = function () {
            that.showMenu();
            that.container.fluid("selectable.select", that.locate("menuItem").last());
        };
        that.activate = function (index) {
            that.writeIndirect("currentLanguagePath", [index]);
            that.writeIndirect("showHidePath", true);
            that.hideMenu();
        };
        that.showHide = function () {
            that.writeIndirect("showHidePath", !that.readIndirect("showHidePath"), "menuButton"); 
            that.hideMenu();
        };
    };

    fluid.videoPlayer.languageMenu.finalInit = function (that) {
        fluid.videoPlayer.languageMenu.bindEventListeners(that);
        fluid.videoPlayer.languageMenu.setUpKeyboardA11y(that);

        that.container.attr("role", "menu");
        that.container.css("z-index", 9999);
        that.hideMenu();
        that.updateTracks();
        that.updateShowHide();
        that.events.onReady.fire(that);
    };


    /*****************************************************************************
        Language Controls subcomponent: a button and its associated languageMenu
        Used for Captions, Transcripts, Audio Descriptions.
        Note that the "pressed/released" state of the button reflects the show/hide
        state of the captions, and so does not become "pressed" when activated;
        activation only shows the menu
     *****************************************************************************/
    fluid.defaults("fluid.videoPlayer.languageControls", {
        gradeNames: ["fluid.viewComponent", "fluid.videoPlayer.indirectReader", "autoInit"],
        finalInitFunction: "fluid.videoPlayer.languageControls.finalInit",
        selectors: {
            button: ".flc-menuButton-button",
            label: ".flc-menuButton-label",
            menu: ".flc-menuButton-languageMenu"
        },
        events: {
            onReady: null,
            onRenderingComplete: null,
            onControlledElementReady: null,
            afterFetchResources: null
        },
        listeners: {
            afterFetchResources: {
                listener: "fluid.videoPlayer.languageControls.setUpControls",
                priority: "last"
            }
        },
        languages: [],
        currentLanguagePath: "",
        showHidePath: "",
        strings: {
            showLanguage: "Show Language",
            hideLanguage: "Hide Language"
        },
        styles: {
            button: "fl-videoPlayer-button",
            buttonWithShowing: "fl-videoPlayer-buttonWithShowing"  
        },
        components: {
            button: {
                type: "fluid.toggleButton",
                createOnEvent: "afterFetchResources",
                container: "{languageControls}.container",
                options: {
                    styles: {
                        init: "{languageControls}.options.styles.button",
                        // TODO: see if we want different style for pressed form
                        pressed: "{languageControls}.options.styles.button"  
                    },
                    selectors: {
                        button: "{languageControls}.options.selectors.button",
                        label: "{languageControls}.options.selectors.label"
                    },
                    strings: "{languageControls}.options.strings"
                }
            },
            menu: {
                type: "fluid.videoPlayer.languageMenu",
                createOnEvent: "afterFetchResources",
                container: "{languageControls}.dom.menu",
                options: {
                    model: "{languageControls}.model",
                    languages: "{languageControls}.options.languages",
                    applier: "{languageControls}.applier",
                    showHidePath: "{languageControls}.options.showHidePath",
                    currentLanguagePath: "{languageControls}.options.currentLanguagePath",
                    strings: "{languageControls}.options.strings",
                    events: {
                        onControlledElementReady: "{languageControls}.events.onControlledElementReady"
                    }
                }
            },
            eventBinder: {
                type: "fluid.videoPlayer.languageControls.eventBinder",
                createOnEvent: "onRenderingComplete"
            }
        },
        templates: {
            menuButton: {
                forceCache: true,
                href: "../html/menuButton_template.html"
            }
        },
        invokers: {
            refreshButtonClass: {
                funcName: "fluid.videoPlayer.languageControls.refreshButtonClass",
                args: ["{languageControls}"]
            }
        }
    });

    fluid.videoPlayer.languageControls.setUpKeyboardA11y = function (that) {
        fluid.tabindex(that.locate("menu"), -1);
        var button = that.locate("button");
        button.fluid("activatable", [fluid.identity, {
            additionalBindings: [{
                // in addition to space and enter, we want the UP arrow key to show the menu
                // but we also want it to automatically select the first item above the button,
                // i.e. the bottom item in the menu
                key: $.ui.keyCode.UP,
                activateHandler: function () {
                    that.menu.showAndSelect();
                    return false;
                }
            }]
        }]);
        that.container.fluid("activatable", [fluid.identity, {
            additionalBindings: [{
                key: $.ui.keyCode.ESCAPE,
                activateHandler: function () {
                    that.menu.hideMenu();
                    button.focus();
                }
            }]
        }]);
        that.menu.events.hiddenByKeyboard.addListener(function () {
            button.focus();
        });

        // TODO: Causing IE8 failure at clicking caption or transcript button due to FLUID-4762.
        // Unfortunately, removing it introduces a bug in keyboard interactions in all browsers,
        // preventing the menu from hiding when keyboard focus moves away.
        fluid.deadMansBlur(that.container, {
            exclusions: [that.menu.options.selectors.menuItem, that.options.selectors.button],
            handler: function () {
                that.menu.hideMenu();
            }
        });
    };

    fluid.videoPlayer.languageControls.setUpAria = function (that) {
        var containerID = fluid.allocateSimpleId(that.menu.container);
        that.button.locate("button").attr({
            "aria-owns": containerID,
            "aria-controls": containerID,
            "aria-haspopup": "true"
        });
    };

    fluid.videoPlayer.languageControls.refreshButtonClass = function (that) {
        var showHide = that.readIndirect("showHidePath");
        that.button.locate("button").toggleClass(that.options.styles.buttonWithShowing, showHide);
    };

    fluid.videoPlayer.languageControls.setUpControls = function (that) {
        that.container.show();
        that.events.onRenderingComplete.fire(that);

        fluid.videoPlayer.languageControls.setUpKeyboardA11y(that);
        fluid.videoPlayer.languageControls.setUpAria(that);

        that.applier.modelChanged.addListener(that.options.showHidePath, that.refreshButtonClass);
        that.refreshButtonClass();
        that.events.onReady.fire(that);
    };

    fluid.videoPlayer.languageControls.finalInit = function (that) {
        fluid.fetchResources(that.options.templates, function (resourceSpec) {
            that.container.append(that.options.templates.menuButton.resourceText);
            that.events.afterFetchResources.fire(that);
        });
    };

    /**************************************************************************************
     * LanguageControls Event Binder: Binds events between components "button" and "menu" *
     **************************************************************************************/

    fluid.defaults("fluid.videoPlayer.languageControls.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            "{button}.events.onPress": "{menu}.toggleView"
        }
    });
})(jQuery);
