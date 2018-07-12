'use strict';

var Player = {
    init: function(name, icon) {
        this.name = name;
        this.icon = icon;
        this.life = 100;
        this.cell = {};
        this.weapon = {};
        this.isDefending = false;
        this.fightPositions = [];
        this.isActiveTurn = false;
        this.isMoving = false;
    },

    setPosition: function(cell) {
        this.cell = cell;
    },

    setWeapon: function(weapon) {
        this.weapon = weapon;
    }
};
