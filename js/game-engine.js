'use strict';

const GameEngine = {
    init: function ($boardWrapper) {
        this.boardManager = Object.create(BoardManager);
        this.boardManager.init($boardWrapper);

        this.playerManager = Object.create(PlayerManager);
        this.logManager = Object.create(logManager);
        this.logManager.init($("#logger-list-events"));

        this.isFightMode = false;

        this.selectedPlayerIndex = "";

        this.registerHandlers();
    },
    //associative array on which we will loop to record all our listeners
    // - the key of this pattern: nameOfSelector (a space) the event name
    // - the value is the name of our callback
    _handlers: {
        "#start_button click": "onNewGameButtonClick",
        "#help_button click": "onRulesButtonClick",
        "[data-available-movement][data-status='empty'] click": "onEmptyCellClick",
        "[data-available-movement][data-status='has-weapon'] click": "onWeaponCellClick",
        "[data-active-turn][data-status='has-player'] click": "onActiveCellPlayerClick",
        "#attack_button click": "onAttackButtonClick",
        "#defense_button click": "onDefenseButtonClick"
    },

    initBoard: function (boardSize) {
        this.boardManager.generateBoard(boardSize);
    },

    resetGame: function() {
        this.isFightMode = false;
        this.boardManager.resetBoard();
        this.logManager.resetJournal();
    },

    startGame: function() {
        // Create players
        this.boardManager.createPlayers();

        // Create weapons
        this.boardManager.createWeapons();

        // Create barriers
        this.boardManager.createBarrier();

        // Distribute weapons to players
        this.boardManager.attachWeaponToPlayers();

        // assigns a random position to obstacles
        this.boardManager.assignPositionToBarriers();

        // assigns a random position to weapons
        this.boardManager.assignPositionToWeapons();

        // assigns a random position to players
        this.boardManager.assignPositionToPlayers();

        // Determine which player will start
        const startPlayer = this.boardManager.players[this.startPlayerToss()];
        startPlayer.isActiveTurn = true;

        this.boardManager.cells[startPlayer.cell.$cellNode.attr("data-position")].$cellNode.attr("data-active-turn", "");

        // Displays logbook info
        this.logManager.displayStartPlayer(startPlayer);

        // update DOM elements
        this.boardManager.displayAllElements();
    },

    /**
     * permitt to reccord all listeners
     */
    registerHandlers: function() {
        const self = this; //represent game-engine

        // loop on all defined selectors
        $.each(self._handlers, function(selectorEvent, handler) {

            const split = selectorEvent.split(" "),
                el = split[0],
                trigger = split[1];

            // we declare our event listeners with "on ()"
            $(document).on(trigger, el, self[handler].bind(self));
        });
    },

    startPlayerToss: function() {
        return Math.floor(Math.random() * this.boardManager.players.length);
    },

    onNewGameButtonClick: function(event) {
        this.resetGame();
        this.startGame();
        this.playerManager.init(this.boardManager.players);
        this.playerManager.setPlayerInfos();
    },

    onRulesButtonClick: function(event) {
        this.boardManager.gameEffectsManager.displayOrHideRules();
    },

    onActiveCellPlayerClick: function(event) {
        if (this.isFightMode) {
            return;
        }

        //1- Player identification and recovery
        this.selectedPlayerIndex = ($(event.currentTarget).attr("data-player")) - 1;
        const activePlayer = this.boardManager.players[this.selectedPlayerIndex];

        // avoid 2nd click on same player
        if(activePlayer.isMoving) {
            return;
        }

        activePlayer.isMoving = true;

        //2- Recovery of authorized cells
        const selectedPlayerPosition = $(event.currentTarget).attr("data-position");
        const allowedMovements = [];

        this.boardManager.adjacentGameDetector.getAllowedMovementPositions(selectedPlayerPosition, allowedMovements, this.boardManager.cells);

        //3-Appearance of authorized cells on the board
        allowedMovements.forEach(function (cell) {
            const blur = "<div class='blur-cell'></div>";
            cell.$cellNode.append(blur);
            cell.$cellNode.attr("data-available-movement", "");
        });

        //update DOM elements
        this.boardManager.displayAllElements(this.boardManager.cells);
    },

    onEmptyCellClick: function(event) {
        if (this.isFightMode) {
            return;
        }

        //the player made his move, we update isMoving
        const activePlayer = this.boardManager.players[this.selectedPlayerIndex];

        activePlayer.isMoving = false;

        //the active player made his move, we update isActiveTurn for the 2 players
        const waitingMatchingPlayer = this.boardManager.players.filter(function(player) {
            return player.isActiveTurn === false;
        });

        const waitingPlayer = waitingMatchingPlayer[0];
        waitingPlayer.isActiveTurn = true;

        activePlayer.isActiveTurn = false;

        waitingPlayer.cell.$cellNode.attr("data-active-turn", "");

        // 0- store old player cell and remove its data-active-turn
        const previousPlayerCell = activePlayer.cell;
        previousPlayerCell.$cellNode.removeAttr("data-active-turn");

        //1- store the selected cell in a variable
        const chosenEmptyPosition = $(event.currentTarget).attr("data-position");
        const chosenEmptyCell = this.boardManager.cells[chosenEmptyPosition];

        //3- assign fightPositions to the current player
        //3.1- Delete old fightPositions of current player
        activePlayer.fightPositions = [];

        //3.2- assign new fightPositions to the current player
        this.boardManager.adjacentGameDetector.getFightPositions(chosenEmptyPosition, activePlayer.fightPositions, this.boardManager.cells);

        //4- assign new cell to current player
        activePlayer.setPosition(chosenEmptyCell);

        //4.1- update cell
        chosenEmptyCell.status = CELL_STATUS_PLAYER;
        chosenEmptyCell.icon = this.boardManager.players[this.selectedPlayerIndex].icon;
        chosenEmptyCell.$cellNode.attr("data-status", CELL_STATUS_PLAYER);
        chosenEmptyCell.$cellNode.attr("data-player", this.selectedPlayerIndex + 1);

        // Deleting the "authorized movements" blur
        this.boardManager.gameEffectsManager.removeAfterMovementDOM();

        //5- update old player cell
        if (previousPlayerCell.$cellNode.attr("data-future-status") === CELL_STATUS_WEAPON) {
            const weaponMatchingCell = this.boardManager.weapons.filter(function(weapon) {
                return !$.isEmptyObject(weapon.cell) //eviter doublon matching
                    && weapon.cell.$cellNode.attr("data-position") === previousPlayerCell.$cellNode.attr("data-position");

            });

            const oldPlayerWeapon = weaponMatchingCell[0];

            previousPlayerCell.status = CELL_STATUS_WEAPON;
            previousPlayerCell.$cellNode.attr("data-status", CELL_STATUS_WEAPON);
            previousPlayerCell.$cellNode.removeAttr("data-future-status");
            previousPlayerCell.$cellNode.removeAttr("data-player");
            previousPlayerCell.icon = oldPlayerWeapon.icon;
        } else {
            previousPlayerCell.status = CELL_STATUS_EMPTY;
            previousPlayerCell.$cellNode.attr("data-status", CELL_STATUS_EMPTY);
            previousPlayerCell.icon = "";
            previousPlayerCell.$cellNode.removeAttr("data-player");
        }

        this.logManager.logEmptyCellClick(activePlayer, waitingPlayer);
        this.playerManager.setPlayerInfos();

        // test if cell is a fight cell
        if (waitingPlayer.fightPositions.indexOf(chosenEmptyPosition) !== -1) {
            this.isFightMode = true;
            this.boardManager.gameEffectsManager.displayFightButtons();
            this.logManager.logStartingFight();
        }

        this.boardManager.displayAllElements(this.boardManager.cells);
    },

    onWeaponCellClick: function(event) {
        if (this.isFightMode) {
            return;
        }

        //the player made his move, we update isMoving
        const activePlayer = this.boardManager.players[this.selectedPlayerIndex];

        activePlayer.isMoving = false;

        //the active player made his move, we update isActiveTurn for the 2 players
        const waitingMatchingPlayer = this.boardManager.players.filter(function(player) {
            return player.isActiveTurn === false;
        });

        const waitingPlayer = waitingMatchingPlayer[0];
        waitingPlayer.isActiveTurn = true;

        activePlayer.isActiveTurn = false;
        waitingPlayer.cell.$cellNode.attr("data-active-turn", "");

        //0- store old player cell and remove its data-active-turn
        const previousPlayerCell = activePlayer.cell;
        previousPlayerCell.$cellNode.removeAttr("data-active-turn");

        //1- store the selected cell in a variable
        const chosenWeaponPosition = $(event.currentTarget).attr("data-position");
        const chosenWeaponCell = this.boardManager.cells[chosenWeaponPosition];

        //1.2- Create a data-future-status = CELL_STATUS_WEAPON attribute on the current cell
        chosenWeaponCell.$cellNode.attr("data-future-status", CELL_STATUS_WEAPON);

        //1.3- Delete old fightPositions of current player
        activePlayer.fightPositions = [];

        //1.3- assign new fightPositions to the current player
        this.boardManager.adjacentGameDetector.getFightPositions(chosenWeaponPosition, activePlayer.fightPositions, this.boardManager.cells);

        //Stock player old weapon before assigning him the new
        const oldPlayerWeapon = activePlayer.weapon;

        //get weapon from the current cell
        const weaponMatchingCell = this.boardManager.weapons.filter(function(weapon) {
            return weapon.cell.$cellNode === chosenWeaponCell.$cellNode;
        });

        const newWeapon = weaponMatchingCell[0];
        newWeapon.setPosition({}); // Une nouvelle arme équipée n'a pas besoin de position
        activePlayer.setWeapon(newWeapon);

        //2- assign new cell to current player
        activePlayer.setPosition(chosenWeaponCell);

        //2.1- update DOM cell
        chosenWeaponCell.status = CELL_STATUS_PLAYER;
        chosenWeaponCell.icon = activePlayer.icon;
        chosenWeaponCell.$cellNode.attr("data-status", CELL_STATUS_PLAYER);
        chosenWeaponCell.$cellNode.attr("data-player", this.selectedPlayerIndex + 1);

        // Deleting the "authorized movements" blur
        this.boardManager.gameEffectsManager.removeAfterMovementDOM();

        //3- update old player cell
        oldPlayerWeapon.setPosition(chosenWeaponCell);

        if (previousPlayerCell.$cellNode.attr("data-future-status") === CELL_STATUS_WEAPON) {
            previousPlayerCell.status = CELL_STATUS_WEAPON;
            previousPlayerCell.$cellNode.attr("data-status", CELL_STATUS_WEAPON);
            previousPlayerCell.$cellNode.removeAttr("data-future-status");
            previousPlayerCell.$cellNode.removeAttr("data-player");

            const previousWeaponMatchingCell = this.boardManager.weapons.filter(function(weapon) {
                return weapon.cell.$cellNode === previousPlayerCell.$cellNode;
            });

            const previousWeapon = previousWeaponMatchingCell[0];

            previousPlayerCell.icon = previousWeapon.icon;
        } else {
            previousPlayerCell.status = CELL_STATUS_EMPTY;
            previousPlayerCell.$cellNode.attr("data-status", CELL_STATUS_EMPTY);
            previousPlayerCell.icon = "";
            previousPlayerCell.$cellNode.removeAttr("data-player");
        }

        this.logManager.logWeaponCellClick(activePlayer, waitingPlayer, oldPlayerWeapon);
        this.playerManager.setPlayerInfos();

        // test if cell is a fight cell
        if (waitingPlayer.fightPositions.indexOf(chosenWeaponPosition) !== -1) {
            this.isFightMode = true;
            this.boardManager.gameEffectsManager.displayFightButtons();
            this.logManager.logStartingFight();
        }

        this.boardManager.displayAllElements(this.boardManager.cells);
    },

    onAttackButtonClick: function() {
        if (!this.isFightMode) {
            return;
        }

        // get active an waiting player
        const activePlayerMatching = this.boardManager.players.filter(function(player) {
            return player.isActiveTurn === true;
        });
        const waitingPlayerMatching = this.boardManager.players.filter(function (player) {
            return player.isActiveTurn === false;
        });

        const activePlayer = activePlayerMatching[0];
        const waitingPlayer = waitingPlayerMatching[0];

        if (waitingPlayer.isDefending) {
            waitingPlayer.life -= activePlayer.weapon.damages / 2;
        } else {
            waitingPlayer.life -= activePlayer.weapon.damages;
        }

        if (waitingPlayer.life <= 0) {
            waitingPlayer.life = 0;
            this.boardManager.gameEffectsManager.displayEndGame(activePlayer, waitingPlayer);
            this.isFightMode = false;
        }

        activePlayer.isActiveTurn = false;
        waitingPlayer.isActiveTurn = true;

        this.playerManager.setPlayerInfos();
        this.logManager.logAttackButtonClick(activePlayer, waitingPlayer);

        waitingPlayer.isDefending = false;
    },

    onDefenseButtonClick: function() {
        if (!this.isFightMode) {
            return;
        }

        // get active an waiting player
        const activePlayerMatching = this.boardManager.players.filter(function(player) {
            return player.isActiveTurn === true;
        });
        const waitingPlayerMatching = this.boardManager.players.filter(function (player) {
            return player.isActiveTurn === false;
        });

        const activePlayer = activePlayerMatching[0];
        const waitingPlayer = waitingPlayerMatching[0];

        activePlayer.isDefending = true;

        activePlayer.isActiveTurn = false;
        waitingPlayer.isActiveTurn = true;
        this.logManager.logDefenseButtonClick(activePlayer, waitingPlayer);
    }
};
