'use strict';

const PlayerManager = {
    init: function(playersArray) {
        this.players = playersArray;
    },

    setPlayerInfos: function() {
        $("#player1_hp").text(this.players[0].life);
        $("#player1_weapon").text(this.players[0].weapon.name);
        $("#player1_damage").text(this.players[0].weapon.damages);

        $("#player2_hp").text(this.players[1].life);
        $("#player2_weapon").text(this.players[1].weapon.name);
        $("#player2_damage").text(this.players[1].weapon.damages);
    }
};