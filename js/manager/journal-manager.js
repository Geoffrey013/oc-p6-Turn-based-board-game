'use strict';

const logManager = {

    init: function ($journalWrapper) {
        this.$wrapper = $journalWrapper;
    },

    resetJournal: function() {
        this.$wrapper.html("");
    },

    displayStartPlayer: function(startplayer) {
        this.$wrapper.append("<li>" + startplayer.name + " commence la partie</li>");
    },

    logEmptyCellClick: function(activePlayer, waitingPlayer) {
        this.$wrapper.prepend("<hr>");

        this.$wrapper.prepend("<li>" + activePlayer.name + " a fini son tour</li>");
        this.$wrapper.prepend("<li>Au tour de: " + waitingPlayer.name + "</li>");
    },

    logWeaponCellClick: function(activePlayer, waitingPlayer, oldPlayerWeapon) {
        this.$wrapper.prepend("<hr>");

        this.$wrapper.prepend("<li>" + activePlayer.name + " a ramassé un/une " + activePlayer.weapon.name + "</li>");
        this.$wrapper.prepend("<li>" + activePlayer.name + " a déposé " + oldPlayerWeapon.name + "</li>");

        this.$wrapper.prepend("<li>" + activePlayer.name + " a fini son tour</li>");
        this.$wrapper.prepend("<li>Au tour de " + waitingPlayer.name + "</li>");
    },

    logStartingFight: function() {
        this.$wrapper.prepend("<hr>");

        this.$wrapper.prepend("<li>Un combat à mort est engagé entre les deux joueurs</li>");
    },

    logAttackButtonClick: function(activePlayer, waitingPlayer) {
        this.$wrapper.prepend("<hr>");

        this.$wrapper.prepend("<li>" + activePlayer.name + " attaque " + waitingPlayer.name + " avec son/sa " + activePlayer.weapon.name + "</li>");
        if (waitingPlayer.isDefending === true) {
            this.$wrapper.prepend("<li>" + waitingPlayer.name + " a perdu " + activePlayer.weapon.damages / 2 + "</li>");
        } else {
            this.$wrapper.prepend("<li>" + waitingPlayer.name + " a perdu " + activePlayer.weapon.damages + "PV</li>");
        }


        this.$wrapper.prepend("<li>" + activePlayer.name + " a fini son tour</li>");
        this.$wrapper.prepend("<li>Au tour de " + waitingPlayer.name + "</li>");
    },

    logDefenseButtonClick: function(activePlayer, waitingPlayer) {
        this.$wrapper.prepend("<hr>");

        this.$wrapper.prepend("<li>" + activePlayer.name + " a chosit de défendre ce tour ci</li>");

        this.$wrapper.prepend("<li>" + activePlayer.name + " a fini son tour</li>");
        this.$wrapper.prepend("<li>Au tour de " + waitingPlayer.name + "</li>");
    }



};