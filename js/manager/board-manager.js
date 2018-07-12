'use strict';

const BoardManager = {
    init: function($boardWrapper) {
        this.gameEffectsManager = Object.create(GameEffectManager);
        this.adjacentGameDetector = Object.create(AdjacentCellsDetector);
        this.$wrapper = $boardWrapper;

        this.cells = [];
        this.players = [];
        this.weapons = [];
        this.barriers = [];
    },

    generateBoard: function(boardSize) {
        if (!(boardSize <= 6) && !(boardSize > 15)) {
            this.boardSize = boardSize;

            for (var i = 0; i < this.boardSize; i++) {

                for (var j = 0; j < this.boardSize; j++) {
                    const position = i + "-" + j;
                    const newCell = Object.create(Cell);
                    const cellNode = "<div class='cell' data-position="+ position +"></div>";

                    newCell.init($(cellNode));

                    newCell.$cellNode.attr("data-status", newCell.status);
                    // now we can push the new cell to the stores
                    this.cells[position] = newCell;

                    this.$wrapper.append(newCell.$cellNode);
                }
            }

            this.gameEffectsManager.handleBoardResizing(this.boardSize);
        } else {
            alert('Error: board size must be at least 6 and maximum 15');
        }
    },

    resetBoard: function() {
        this.players = [];
        this.weapons = [];
        this.barriers = [];

        for(const position in this.cells) {
            const currentCell = this.cells[position];
            currentCell.status = CELL_STATUS_EMPTY;
            currentCell.icon = "";
            currentCell.$cellNode.attr("data-status", CELL_STATUS_EMPTY);
        }
        this.gameEffectsManager.hideFightButtons();
        this.gameEffectsManager.resetBoardDOM();
        this.gameEffectsManager.updateCellTextures(this.cells);
    },

    displayAllElements: function() {
        this.gameEffectsManager.updateCellTextures(this.cells); //Everything has a place, now show it
    },

    assignPositionToBarriers: function() {
        const reservedPositions = [];
        while ($('[data-status=is-blocked]').length < 10) {
            const randomPosition = this.getRandomPosition();
            const randomCell = this.cells[randomPosition];
            const barrier = this.barriers[Math.floor(Math.random() * this.barriers.length)];

            //in order to avoid blocking a player completely, the cells "barriers" cannot be adjacent
            this.adjacentGameDetector.getDiagonallyAdjacentPositions(randomPosition, reservedPositions);

            if(randomCell.status === CELL_STATUS_EMPTY && reservedPositions.indexOf(randomPosition) === -1) {
                randomCell.status = CELL_STATUS_BLOCKED;
                randomCell.icon = barrier.icon;
                randomCell.$cellNode.attr("data-status", CELL_STATUS_BLOCKED);
            }
        }
    },

    assignPositionToPlayers: function() {
        const reservedPositions = [];
        for (var i = 0; i < this.players.length; i++) {
            const randomPosition = this.getRandomPosition();

            this.adjacentGameDetector.getAllAdjacentPositions(randomPosition, reservedPositions);

            const randomCell = this.cells[randomPosition];
            const player = this.players[i];

            if(randomCell.status === CELL_STATUS_EMPTY && reservedPositions.indexOf(randomPosition) === -1) {
                randomCell.status = CELL_STATUS_PLAYER;
                randomCell.$cellNode.attr("data-status", CELL_STATUS_PLAYER);
                randomCell.$cellNode.attr("data-player", i + 1);

                player.setPosition(randomCell);
                randomCell.icon = player.icon;

                this.adjacentGameDetector.getFightPositions(randomPosition, player.fightPositions, this.cells);
            } else {
                i = i - 1;
            }
        }
    },

    assignPositionToWeapons: function() {
        // Both knives (index 0 and 1) are assigned to the players
        const randomWeapon2position = this.getRandomPosition();
        const randomCellForWeapon2 = this.cells[randomWeapon2position];

        this.weapons[2].setPosition(randomCellForWeapon2);
        this.cells[randomWeapon2position].status = CELL_STATUS_WEAPON;
        this.cells[randomWeapon2position].icon = this.weapons[2].icon;
        this.cells[randomWeapon2position].$cellNode.attr("data-status", CELL_STATUS_WEAPON);

        // assign a random cell to the remaining weapons, with a minimum spacing of 3 squares
        const reservedPositions = [];

        var availableWeaponIndex = 3; // because the knifes has been associated to the player

        while (availableWeaponIndex < this.weapons.length) {
            const weapon = this.weapons[availableWeaponIndex];

            const previousWeaponPosition = this.weapons[availableWeaponIndex - 1].cell.$cellNode.attr("data-position");

            // position of placed weapons must be excluded too
            reservedPositions.push(previousWeaponPosition);

            const randomPosition = this.getRandomPosition();
            const randomCell = this.cells[randomPosition];

            //2- Recovery of reserved cells
            this.adjacentGameDetector.getThreeCrossedAdjacentPositions(previousWeaponPosition, reservedPositions);

            if (randomCell.status === CELL_STATUS_EMPTY && reservedPositions.indexOf(randomPosition) === -1) {
                randomCell.status = CELL_STATUS_WEAPON;
                randomCell.$cellNode.attr("data-status", CELL_STATUS_WEAPON);
                randomCell.icon = weapon.icon;

                weapon.setPosition(randomCell);

                availableWeaponIndex++;
            }
        }
    },

    attachWeaponToPlayers: function() {
        this.players.forEach(function(player, index) {
            const weapon = this.weapons[index];   /* assign knifes to players */

            player.setWeapon(weapon);
        }, this);
    },

    createBarrier: function() {
        const tree = Object.create(Barrier);
        tree.init("tree.png", "");

        const rock = Object.create(Barrier);
        rock.init("rock.png", "");

        this.barriers.push(tree);
        this.barriers.push(rock);
    },


    createPlayers: function() {
        const player1 = Object.create(Player);
        player1.init("Player 1", "player1.jpg");

        const player2 = Object.create(Player);
        player2.init("Player 2", "player2.jpg");

        this.players.push(player1);
        this.players.push(player2);
    },

    createWeapons: function() {
        const knife1 = Object.create(Weapon);
        knife1.init("Couteau", 10, "knife1.png");

        const knife2 = Object.create(Weapon);
        knife2.init("Couteau", 10, "knife2.png");

        const machete = Object.create(Weapon);
        machete.init("Machette", 70, "machete.png");

        const sickle = Object.create(Weapon);
        sickle.init("Faucille", 60, "sickle.png");

        const crowbar = Object.create(Weapon);
        crowbar.init("Pied de biche", 30, "crowbar.png");

        const bate = Object.create(Weapon);
        bate.init("Baté", 40, "bate.png");

        this.weapons.push(knife1);
        this.weapons.push(knife2);
        this.weapons.push(machete);
        this.weapons.push(sickle);
        this.weapons.push(crowbar);
        this.weapons.push(bate);
    },

    getRandomPosition: function () {
        return Math.floor(Math.random() * this.boardSize) + "-" + Math.floor(Math.random() * this.boardSize);
    }
};
