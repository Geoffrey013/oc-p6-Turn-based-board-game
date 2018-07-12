var GameEffectManager = {

    updateCellTextures: function(cells) {
        for (var cellPosition in cells) {
            const cell = cells[cellPosition];

            if (cell.status !== CELL_STATUS_EMPTY) {
                cell.$cellNode.css('background', 'url(img/' + cell.icon + ') center center no-repeat');
                cell.$cellNode.css('background-size', 'cover');
            } else {
                cell.$cellNode.css('background', '');
            }
            cell.$cellNode.css("status", "");
        }
    },

    handleBoardResizing: function(boardSize) {
        //Ajustement de la largeur Cellule
        const columnWidth = 100 / boardSize + "%";

        const $cell = $(".cell");

        $cell.css("width", columnWidth);

        //Ajustement de la hauteur de la cellule
        //Lors de la génération
        const width = $cell.width();
        $cell.css("height", width);

        //Lors d'un redimensionnement de la fenêtre
        window.onresize = function () {
            var width = $cell.width(); // VOIR CALLBACK
            $cell.height(width)
        }
    },

    displayOrHideRules: function() {
        if ($("#rules").css("display") === "none") {
            $("#rules").show();
        } else if ($("#rules").css("display") === "block") {
            $("#rules").hide();
        }
    },

    removeAfterMovementDOM: function() {
        $(".blur-cell").remove();
        $("[data-available-movement]").removeAttr("data-available-movement");
    },

    resetBoardDOM: function() {
        $("#rules").hide();
        $("#victory").html("");
        $("#victory").hide();
        $('.blur-cell').remove();
    },

    displayFightButtons: function() {
        $("#fight_buttons_container").show();
    },

    hideFightButtons: function() {
        $("#fight_buttons_container").hide();
    },

    displayEndGame: function(winnerPlayer, looserPlayer) {
        $("#victory").append("<h3>" + winnerPlayer.name + " a tué " + looserPlayer.name + "</h3>");
        $("#victory").append("<h2>'Chicken Dinner' pour " + winnerPlayer.name + "</h2>");
        $("#victory").show();
    }


};
