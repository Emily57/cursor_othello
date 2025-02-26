import React, { useState } from "react";
import "../styles/Game.css";

const Game = () => {
  const initialBoard = Array(8)
    .fill()
    .map(() => Array(8).fill(null));
  initialBoard[3][3] = "white";
  initialBoard[3][4] = "black";
  initialBoard[4][3] = "black";
  initialBoard[4][4] = "white";

  const [board, setBoard] = useState(initialBoard);
  const [isBlackTurn, setIsBlackTurn] = useState(true);

  const getValidMoves = (board, isBlack) => {
    const validMoves = [];
    const currentColor = isBlack ? "black" : "white";
    const oppositeColor = isBlack ? "white" : "black";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] !== null) continue;

        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];

        for (const [dx, dy] of directions) {
          let x = row + dx;
          let y = col + dy;
          let foundOpposite = false;

          while (x >= 0 && x < 8 && y >= 0 && y < 8) {
            if (board[x][y] === oppositeColor) {
              foundOpposite = true;
            } else if (board[x][y] === currentColor && foundOpposite) {
              validMoves.push([row, col]);
              break;
            } else {
              break;
            }
            x += dx;
            y += dy;
          }
        }
      }
    }
    return validMoves;
  };

  const makeMove = (row, col) => {
    if (!isValidMove(row, col)) return;

    const newBoard = board.map((row) => [...row]);
    const currentColor = isBlackTurn ? "black" : "white";
    newBoard[row][col] = currentColor;

    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dx, dy] of directions) {
      const flips = [];
      let x = row + dx;
      let y = col + dy;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (newBoard[x][y] === null) break;
        if (newBoard[x][y] === currentColor) {
          flips.forEach(([fx, fy]) => {
            newBoard[fx][fy] = currentColor;
          });
          break;
        }
        flips.push([x, y]);
        x += dx;
        y += dy;
      }
    }

    setBoard(newBoard);
    setIsBlackTurn(!isBlackTurn);
  };

  const isValidMove = (row, col) => {
    return getValidMoves(board, isBlackTurn).some(
      ([r, c]) => r === row && c === col
    );
  };

  return (
    <div className="game">
      <div className="status">{`次は${isBlackTurn ? "黒" : "白"}の番です`}</div>
      <div className={`board ${isBlackTurn ? "black-turn" : "white-turn"}`}>
        {board.map((row, i) => (
          <div key={i} className="board-row">
            {row.map((cell, j) => (
              <div
                key={j}
                className={`cell ${cell || ""} ${
                  isValidMove(i, j) ? "valid" : ""
                }`}
                onClick={() => makeMove(i, j)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;
