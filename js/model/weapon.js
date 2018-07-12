'use strict';

var Weapon = {
    init: function(name, damages, icon) {
        this.name = name;
        this.damages = damages;
        this.icon = icon;
        this.cell = {};
    },

    setPosition: function(cell) {
        this.cell = cell;
    }
};
