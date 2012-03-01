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
    fluid.defaults("fluid.videoPlayer.controllers.languageMenu", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        renderOnInit: true,
        preInitFunction: "fluid.videoPlayer.controllers.languageMenu.preInit",
        postInitFunction: "fluid.videoPlayer.controllers.languageMenu.postInit",
        finalInitFunction: "fluid.videoPlayer.controllers.languageMenu.finalInit",
        produceTree: "fluid.videoPlayer.controllers.languageMenu.produceTree",
        languages: {},
        model: {},
        events: {
            onReady: null,
            activated: null,
            languageOnOff: null,
            trackChanged: "preventable"
        },
        listeners: {
            trackChanged: {
                listener: "fluid.videoPlayer.controllers.languageMenu.updateTracks",
                priority: "last"
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
        hideOnInit: true
    });

    // TODO: Could this be specified declaratively, in a "protoTree" option?
    fluid.videoPlayer.controllers.languageMenu.produceTree = function (that) {
        var tree = {
            // create a menu item for each language in the model
            expander: {
                type: "fluid.renderer.repeat",
                repeatID: "language",
                controlledBy: "languages",
                pathAs: "lang",
                tree: {
                    value: "${{lang}.label}"
                }
            },
            // add the 'turn off' option
            showHide: {
                value: that.model.showLanguage ? that.options.strings.hideLanguage : that.options.strings.showLanguage
            }
        };
        return tree;
    };

    fluid.videoPlayer.controllers.languageMenu.selectLastItem = function (that) {
        that.container.fluid("selectable.select", that.locate("menuItem").last());
    };

    fluid.videoPlayer.controllers.languageMenu.setUpKeyboardA11y = function (that) {
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
            noWrap: true
        });

        // When a menu item is activated using the keyboard, in addition to hiding the menu,
        // focus must be return to the button
        that.locate("language").fluid("activatable", function (evt) {
            that.activate(that.locate("language").index(evt.currentTarget));
            return false;
        });
        var noneButton = that.locate("showHide");
        noneButton.fluid("activatable", function (evt) {
            that.applier.requestChange("showLanguage", !that.model.showLanguage);
            that.hide();
            return false;
        });

        // when the DOWN arrow is used on the bottom item of the menu, the menu should hide
        // and focus should return to the button
        noneButton.keydown(function (evt) {
            if (evt.which === $.ui.keyCode.DOWN) {
                that.hide();
                return false;
            }
            return true;
        });
    };

    fluid.videoPlayer.controllers.languageMenu.bindEventListeners = function (that) {
        // any click on the container must have the effect of hiding it, since its action 
        // always completes
        that.container.click(that.hide);
        
        var langList = that.locate("language");
        langList.click(function (evt) {
            that.activate(langList.index(evt.currentTarget));
        });

        that.locate("showHide").click(function (evt) {
            that.applier.requestChange("showLanguage", !that.model.showLanguage);
        });

        // TODO: We currently only support one active language. Indexing into the array will change
        //       when we support more
        that.applier.modelChanged.addListener("activeLanguages.0", function (model, oldModel, changeRequest) {
            var newTrack = model.activeLanguages;
            var oldTrack = oldModel.activeLanguages;
            if (newTrack[0] === oldTrack[0]) {
                return;
            }
            that.events.trackChanged.fire(that, newTrack, oldTrack);
        });

        that.applier.modelChanged.addListener("showLanguage", function (model, oldModel, changeRequest) {
            // Prevent the mutual triggering between the "menu" and "transcript" components from being trapped into infinite loop
            if (model.showLanguage === oldModel.showLanguage) {
                return;
            }
            that.locate("showHide").text(that.model.showLanguage ? that.options.strings.hideLanguage : that.options.strings.showLanguage);
            that.events.languageOnOff.fire(that.model.showLanguage);
        });

    };

    fluid.videoPlayer.controllers.languageMenu.updateTracks = function (that, activeTrack) {
        var menuItems = that.locate("menuItem");
        menuItems.removeClass(that.options.styles.selected).removeClass(that.options.styles.active);
        $(menuItems[that.model.activeLanguages[0]]).addClass(that.options.styles.active);
    };

    fluid.videoPlayer.controllers.languageMenu.preInit = function (that) {

        that.toggleView = function () {
            that.container.toggle();
            return false;
        };
        that.hide = function () {
            that.locate("language").removeClass(that.options.styles.selected);
            that.container.hide();
        };
    };

    fluid.videoPlayer.controllers.languageMenu.postInit = function (that) {
        that.show = function () {
            that.container.show();
        };
        that.showAndSelect = function () {
            that.show();
            that.container.fluid("selectable.select", that.locate("menuItem").last());
        };
        that.activate = function (index) {
            that.applier.requestChange("activeLanguages.0", index);
            that.applier.requestChange("showLanguage", true);
        };
        that.requestShowHide = function (showHide) {
            that.applier.requestChange("showLanguage", showHide);
        };
    };

    fluid.videoPlayer.controllers.languageMenu.finalInit = function (that) {
        fluid.videoPlayer.controllers.languageMenu.bindEventListeners(that);
        fluid.videoPlayer.controllers.languageMenu.setUpKeyboardA11y(that);
        if (that.model.languages) {
            $(that.locate("menuItem")[that.model.activeLanguages[0]]).addClass(that.options.styles.active);
        }
        that.hide();
        that.events.onReady.fire(that);
    };


    /*****************************************************************************
        Language Controls subcomponent: a button and its associated languageMenu
        Used for Captions, Transcripts, Audio Descriptions.
        Note that the "pressed/released" state of the button reflects the show/hide
        state of the captions, and so does not become "pressed" when activated;
        activation only shows the menu
     *****************************************************************************/
    fluid.defaults("fluid.videoPlayer.controllers.languageControls", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        preInitFunction: "fluid.videoPlayer.controllers.languageControls.preInit",
        finalInitFunction: "fluid.videoPlayer.controllers.languageControls.finalInit",
        selectors: {
            button: ".flc-videoPlayer-languageButton",
            menu: ".flc-videoPlayer-languageMenu"
        },
        events: {
            onReady: null,
            onRenderingComplete: null,
            activatedByKeyboard: null
        },
        languages: [],
        currentLanguagePath: "",
        showHidePath: "",
        strings: {
            showLanguage: "Show Language",
            hideLanguage: "Hide Language"
        },
        components: {
            button: {
                type: "fluid.toggleButton",
                container: "{languageControls}.container",
                options: {
                    selectors: {
                        button: "{languageControls}.options.selectors.button"
                    },
                    // TODO: Strings should be moved out into a single top-level bundle (FLUID-4590)
                    strings: "{languageControls}.options.strings",
                    events: {
                        activatedByKeyboard: "{languageControls}.events.activatedByKeyboard"
                    },
                    model: "{languageControls}.model",
                    modelPath: "{languageControls}.options.showHidePath",
                    applier: "{languageControls}.applier"
                }
            },
            menu: {
                type: "fluid.videoPlayer.controllers.languageMenu",
                container: "{languageControls}.dom.menu",
                options: {
                    model: {
                        languages: "{languageControls}.options.languages"
                    },
                    modelPath: "{languageControls}.options.modelPath",
                    showHidePath: "{languageControls}.options.showHidePath",
                    strings: "{languageControls}.options.strings"
                }
            },
            eventBinder: {
                type: "fluid.videoPlayer.controllers.languageControls.eventBinder",
                createOnEvent: "onRenderingComplete"
            }
        }
    });

    fluid.videoPlayer.controllers.languageControls.preInit = function (that) {
        that.options.components.menu.options.model.activeLanguages = fluid.get(that.model, that.options.currentLanguagePath);
        that.options.components.menu.options.model.showLanguage = fluid.get(that.model, that.options.showHidePath);
        
        that.updateLanguage = function (newIndex) {
            that.applier.requestChange(that.options.currentLanguagePath, newIndex);
        };

        that.updateShowHide = function (show) {
            that.applier.requestChange(that.options.showHidePath, show);
        };
    };

    fluid.videoPlayer.controllers.languageControls.setUpKeyboardA11y = function (that) {
        fluid.tabindex(that.locate("menu"), -1);
        that.locate("button").fluid("activatable", [fluid.identity, {
            additionalBindings: [{
                // in addition to space and enter, we want the UP arrow key to show the menu
                // but we also want it to automatically select the first item above the button,
                // i.e. the bottom item in the menu
                key: $.ui.keyCode.UP,
                activateHandler: function () {
                    that.events.activatedByKeyboard.fire();
                    return false;
                }
            }]
        }]);
        fluid.deadMansBlur(that.container, {
            exclusions: [that.menu.options.selectors.menuItem, that.options.selectors.button],
            handler: function () {
                that.menu.hide();
            }
        });

        // TODO: This is a workaround for around FLUID-4606 (there's a button tag inside the anchor;
        //       it's for styling only, and we don't want it in the tab order)
        $("button", that.locate("button")).fluid("tabindex", -1);
    };

    fluid.videoPlayer.controllers.languageControls.finalInit = function (that) {
        fluid.videoPlayer.controllers.languageControls.setUpKeyboardA11y(that);
        that.events.onRenderingComplete.fire(that);

        that.applier.modelChanged.addListener(that.options.showHidePath, function (model, oldModel, changeRequest) {
            // TODO: This assumes an API for the button subcomponent: Should this be accomplished though and event?
            that.button.updatePressedState();
        });
        that.events.onReady.fire(that);

    };

    /**************************************************************************************
     * LanguageControls Event Binder: Binds events between components "button" and "menu" *
     **************************************************************************************/

    fluid.defaults("fluid.videoPlayer.controllers.languageControls.eventBinder", {
        gradeNames: ["fluid.eventedComponent", "autoInit"],
        events: {
            onReady: null
        },
        listeners: {
            "{button}.events.onPress": "{menu}.toggleView",
            "{button}.events.activatedByKeyboard": "{menu}.showAndSelect",

            "{menu}.events.trackChanged": {
                listener: "{languageControls}.updateLanguage",
                args: ["{arguments}.1"]
            },
            "{menu}.events.languageOnOff": "{languageControls}.updateShowHide"
        },
        finalInitFunction: "fluid.videoPlayer.controllers.languageControls.eventBinder.finalInit"
    });
    fluid.videoPlayer.controllers.languageControls.eventBinder.finalInit = function (that) {
        that.events.onReady.fire();
    };
})(jQuery);
    