/*
Copyright 2012 OCAD University

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
            hiddenByKeyboard: null
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
                value: that.options.strings[that.readIndirect("showHide")? "hideLanguage" : "showLanguage"],
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
            that.showHide()
        });

        that.applier.modelChanged.addListener(that.options.showHidePath, that.updateShowHide);
        that.applier.modelChanged.addListener(that.options.currentLanguagePath, that.updateTracks);

    };

    fluid.videoPlayer.languageMenu.updateTracks = function (that) {
        var menuItems = that.locate("menuItem");
        menuItems.removeClass(that.options.styles.selected).removeClass(that.options.styles.active);
        menuItems.attr("aria-checked", "false").attr("aria-selected", "false");
        var langIndex = that.readIndirect("currentLanguagePath")[0];
        $(menuItems[langIndex]).addClass(that.options.styles.active);
        $(menuItems[langIndex]).attr("aria-checked", "true").attr("aria-selected", "true");
    };
    
    fluid.videoPlayer.languageMenu.updateShowHide = function(that) {
        var showHide = that.readIndirect("showHidePath"); 
        that.locate("showHide").text(that.options.strings[showHide? "hideLanguage": "showLanguage"]);
    };

    fluid.videoPlayer.languageMenu.preInit = function (that) {

        that.toggleView = function () {
            that.container.toggle();
            that.container.attr("aria-hidden", !that.container.is(':visible'));
        };
    };

    fluid.videoPlayer.languageMenu.postInit = function (that) {
        that.showMenu = function () {
            that.container.attr("aria-hidden", "false");
            that.container.show();
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
            button: ".flc-videoPlayer-languageButton",
            menu: ".flc-videoPlayer-languageMenu"
        },
        events: {
            onReady: null,
            onRenderingComplete: null
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
                container: "{languageControls}.container",
                options: {
                    styles: {
                        init: "{languageControls}.options.styles.button",
                        // TODO: see if we want different style for pressed form
                        pressed: "{languageControls}.options.styles.button"  
                    },
                    selectors: {
                        button: "{languageControls}.options.selectors.button"
                    },
                    strings: "{languageControls}.options.strings",
                }
            },
            menu: {
                type: "fluid.videoPlayer.languageMenu",
                container: "{languageControls}.dom.menu",
                options: {
                    model: "{languageControls}.model",
                    languages: "{languageControls}.options.languages",
                    applier: "{languageControls}.applier",
                    showHidePath: "{languageControls}.options.showHidePath",
                    currentLanguagePath: "{languageControls}.options.currentLanguagePath",
                    strings: "{languageControls}.options.strings",
                    controlledEl: "{languageControls}.options.controlledEl"
                }
            },
            eventBinder: {
                type: "fluid.videoPlayer.languageControls.eventBinder",
                createOnEvent: "onRenderingComplete"
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
        fluid.deadMansBlur(that.container, {
            exclusions: [that.menu.options.selectors.menuItem, that.options.selectors.button],
            handler: function () {
                that.menu.hideMenu();
            }
        });
    };

    fluid.videoPlayer.languageControls.setUpAria = function (that) {
        var button = that.button.locate("button");
        button.attr("aria-owns", fluid.allocateSimpleId(that.menu.container));
        button.attr("aria-haspopup", "true");
        button.attr("aria-controls", fluid.allocateSimpleId(that.menu.container));
    };

    fluid.videoPlayer.languageControls.finalInit = function (that) {
        fluid.videoPlayer.languageControls.setUpKeyboardA11y(that);
        that.events.onRenderingComplete.fire(that);
        
        fluid.videoPlayer.languageControls.setUpAria(that);

        function refreshButtonClass() {
            var showHide = that.readIndirect("showHidePath");
            that.button.locate("button").toggleClass(that.options.styles.buttonWithShowing, showHide);
        };

        that.applier.modelChanged.addListener(that.options.showHidePath, refreshButtonClass);
        refreshButtonClass();
        that.events.onReady.fire(that);
    };

    /**************************************************************************************
     * LanguageControls Event Binder: Binds events between components "button" and "menu" *
     **************************************************************************************/

    fluid.defaults("fluid.videoPlayer.languageControls.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        listeners: {
            "{button}.events.onPress": "{menu}.toggleView",
        },
    });
})(jQuery);
    