'use strict';

const CELL_STATUS_EMPTY = 'empty';
const CELL_STATUS_PLAYER = 'has-player';
const CELL_STATUS_WEAPON = 'has-weapon';
const CELL_STATUS_BLOCKED = 'is-blocked';

var Cell = {
    init: function($cellNode) {
        this.$cellNode = $cellNode;
        this.status = CELL_STATUS_EMPTY;
        this.icon = ''; // contains a relative path to an image
    }
};
