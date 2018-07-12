const AdjacentCellsDetector = {

    getDiagonallyAdjacentPositions: function(position, reservedPositionsArrayArray) {
        const y = Number(position[0]);
        const x = Number(position[2]);

        const crossedTopLeftPosition = (y - 1) + "-" + (x - 1);
        const crossedTopRightPosition = (y - 1) + "-" + (x + 1);
        const crossedBottomLeftPosition = (y + 1) + "-" + (x - 1);
        const crossedBottomRightPosition = (y + 1) + "-" + (x + 1);

        reservedPositionsArrayArray.push(crossedTopLeftPosition);
        reservedPositionsArrayArray.push(crossedTopRightPosition);
        reservedPositionsArrayArray.push(crossedBottomLeftPosition);
        reservedPositionsArrayArray.push(crossedBottomRightPosition);
    },

    getAllAdjacentPositions: function(position, reservedPositionsArray) {
        const y = Number(position[0]);
        const x = Number(position[2]);

        const reservedTopLeftPosition = (y - 1) + "-" + (x - 1);
        const reservedTopPosition = (y - 1) + "-" + x;
        const reservedTopRightPosition = (y - 1) + "-" + (x + 1);
        const reservedLeftPosition = y + "-" + (x - 1);
        const reservedRightPosition = y + "-" + (x + 1);
        const reservedBottomLeftPosition = (y + 1) + "-" + (x - 1);
        const reservedBottomPosition = (y + 1) + "-" + x;
        const reservedBottomRightPosition = (y + 1) + "-" + (x + 1);

        reservedPositionsArray.push(reservedTopLeftPosition);
        reservedPositionsArray.push(reservedTopPosition);
        reservedPositionsArray.push(reservedTopRightPosition);
        reservedPositionsArray.push(reservedLeftPosition);
        reservedPositionsArray.push(reservedRightPosition);
        reservedPositionsArray.push(reservedBottomLeftPosition);
        reservedPositionsArray.push(reservedBottomPosition);
        reservedPositionsArray.push(reservedBottomRightPosition);
    },

    getThreeCrossedAdjacentPositions: function(position, reservedPositionsArray) {
        const yRandom = Number(position[0]);
        const xRandom = Number(position[2]);

        //+ 3 cases in X axis
        for (var x = xRandom + 1; x <= xRandom + 3; x++) {
            const tempPosition = yRandom + "-" + x;
            reservedPositionsArray.push(tempPosition);
        }

        //-3 cases in X axis
        for (var x = xRandom - 1; x >= xRandom - 3; x--) {
            const tempPosition = yRandom + "-" + x;
            reservedPositionsArray.push(tempPosition);
        }

        //+ 3 cases in Y axis
        for (var y = yRandom + 1; y <= yRandom + 3; y++) {
            const tempPosition = y + "-" + xRandom;
            reservedPositionsArray.push(tempPosition);
        }

        //- 3 cases in Y axis
        for (var y = yRandom - 1; y >= yRandom - 3; y--) {
            const tempPosition = y + "-" + xRandom;
            reservedPositionsArray.push(tempPosition);
        }
    },

    getAllowedMovementPositions: function(selectedPlayerPosition, allowedMovementsCellArray, boardManagerCells) {
        const yPlayer = Number(selectedPlayerPosition[0]);
        const xPlayer = Number(selectedPlayerPosition[2]);


        //+ 3 cases in X axis
        for (var x = xPlayer + 1; x <= xPlayer + 3; x++) {
            const tempPosition = yPlayer + "-" + x;

            for(var position in boardManagerCells) {
                if (tempPosition === position) {
                    const tempCell = boardManagerCells[tempPosition];

                    if (tempCell.status === CELL_STATUS_EMPTY || tempCell.status === CELL_STATUS_WEAPON) {
                        allowedMovementsCellArray.push(tempCell);
                    }  else if (tempCell.status === CELL_STATUS_BLOCKED || tempCell.status === CELL_STATUS_PLAYER) {
                        x = xPlayer + 3;
                    }
                }
            }

        }

        //-3 cases in X axis
        for (var x = xPlayer - 1; x >= xPlayer - 3; x--) {
            const tempPosition = yPlayer + "-" + x;

            for(var position in boardManagerCells) {
                if (tempPosition === position) {
                    const tempCell = boardManagerCells[tempPosition];

                    if (tempCell.status === CELL_STATUS_EMPTY || tempCell.status === CELL_STATUS_WEAPON) {
                        allowedMovementsCellArray.push(tempCell);
                    } else if (tempCell.status === CELL_STATUS_BLOCKED || tempCell.status === CELL_STATUS_PLAYER) {
                        x = xPlayer - 3;
                    }
                }
            }
        }

        //+ 3 cases in Y axis
        for (var y = yPlayer + 1; y <= yPlayer + 3; y++) {
            const tempPosition = y + "-" + xPlayer;

            for(var position in boardManagerCells) {
                if (tempPosition === position) {
                    const tempCell = boardManagerCells[tempPosition];

                    if (tempCell.status === CELL_STATUS_EMPTY || tempCell.status === CELL_STATUS_WEAPON) {
                        allowedMovementsCellArray.push(tempCell);

                    } else if (tempCell.status === CELL_STATUS_BLOCKED || tempCell.status === CELL_STATUS_PLAYER) {
                        y = yPlayer + 3;
                    }
                }
            }

        }

        //- 3 cases in Y axis
        for (var y = yPlayer - 1; y >= yPlayer - 3; y--) {
            const tempPosition = y + "-" + xPlayer;

            for(var position in boardManagerCells) {
                if (tempPosition === position) {
                    const tempCell = boardManagerCells[tempPosition];

                    if (tempCell.status === CELL_STATUS_EMPTY || tempCell.status === CELL_STATUS_WEAPON) {
                        allowedMovementsCellArray.push(tempCell);


                    } else if (tempCell.status === CELL_STATUS_BLOCKED || tempCell.status === CELL_STATUS_PLAYER) {
                        y = yPlayer - 3;
                    }
                }
            }

        }
    },

    getFightPositions: function(chosenEmptyPosition, playerFightPositionsArray, boardManagerCells) {
        const xChosenEmptyCell = Number(chosenEmptyPosition[2]);
        const yChosenEmptyCell = Number(chosenEmptyPosition[0]);

        const fightEventCellPosition1 = yChosenEmptyCell + "-" + (xChosenEmptyCell + 1);
        const fightEventCellPosition2 = yChosenEmptyCell + "-" + (xChosenEmptyCell - 1);
        const fightEventCellPosition3 = (yChosenEmptyCell + 1) + "-" + xChosenEmptyCell;
        const fightEventCellPosition4 = (yChosenEmptyCell - 1) + "-" + xChosenEmptyCell;

        //test if the position (array index) is part of the key contained in the table this.cells
        if (fightEventCellPosition1 in boardManagerCells) {
            playerFightPositionsArray.push(fightEventCellPosition1);
        }
        if (fightEventCellPosition2 in boardManagerCells) {
            playerFightPositionsArray.push(fightEventCellPosition2);
        }
        if (fightEventCellPosition3 in boardManagerCells) {
            playerFightPositionsArray.push(fightEventCellPosition3);
        }
        if (fightEventCellPosition4 in boardManagerCells) {
            playerFightPositionsArray.push(fightEventCellPosition4);
        }
    }
}