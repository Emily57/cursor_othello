import React, { useState, useEffect, useMemo } from "react";
import { AdvancedStrategy } from "../strategies/ComputerStrategy";
import "../styles/Game.css";

const Game = () => {
  const createInitialBoard = () => {
    const board = Array(8)
      .fill()
      .map(() => Array(8).fill(null));
    board[3][3] = "white";
    board[3][4] = "black";
    board[4][3] = "black";
    board[4][4] = "white";
    return board;
  };

  const [board, setBoard] = useState(createInitialBoard());
  const [isBlackTurn, setIsBlackTurn] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const computerStrategy = useMemo(() => new AdvancedStrategy(), []);

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
    if (!isValidMove(row, col) || !isBlackTurn) return;

    const newBoard = executeMove(row, col, board, isBlackTurn);
    setBoard(newBoard);
    setIsBlackTurn(false);
  };

  const executeMove = (row, col, currentBoard, isBlack) => {
    const newBoard = currentBoard.map((row) => [...row]);
    const currentColor = isBlack ? "black" : "white";
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

    return newBoard;
  };

  const isValidMove = (row, col) => {
    return getValidMoves(board, isBlackTurn).some(
      ([r, c]) => r === row && c === col
    );
  };

  useEffect(() => {
    if (!isBlackTurn && !isGameOver) {
      const validMoves = getValidMoves(board, false);

      if (validMoves.length === 0) {
        setIsBlackTurn(true);
        return;
      }

      const timer = setTimeout(() => {
        const [row, col] = computerStrategy.selectMove(board, validMoves);
        const newBoard = executeMove(row, col, board, false);
        setBoard(newBoard);
        setIsBlackTurn(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isBlackTurn, board, isGameOver, computerStrategy]);

  useEffect(() => {
    const blackMoves = getValidMoves(board, true);
    const whiteMoves = getValidMoves(board, false);

    if (blackMoves.length === 0 && whiteMoves.length === 0) {
      setIsGameOver(true);
    }
  }, [board]);

  const calculateScore = (currentBoard) => {
    let blackCount = 0;
    let whiteCount = 0;

    currentBoard.forEach((row) => {
      row.forEach((cell) => {
        if (cell === "black") blackCount++;
        if (cell === "white") whiteCount++;
      });
    });

    return { blackCount, whiteCount };
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setIsBlackTurn(true);
    setIsGameOver(false);
  };

  const score = calculateScore(board);

  return (
    <div className="game">
      <div className="status">
        {isGameOver ? (
          <div className="game-over">
            <p className="winner-text">ゲーム終了</p>
            <p>
              最終スコア
              <br />
              黒: {score.blackCount} vs 白: {score.whiteCount}
              <br />
              <strong>
                {score.blackCount > score.whiteCount
                  ? "黒の勝利！ 🏆"
                  : score.blackCount < score.whiteCount
                  ? "白の勝利！ 🏆"
                  : "引き分け！ 🤝"}
              </strong>
            </p>
          </div>
        ) : (
          <div>
            {isBlackTurn ? "あなた" : "CPU"}の番です
            <div style={{ fontSize: "0.8em", opacity: 0.8 }}>
              {isBlackTurn
                ? "置ける場所が緑色で表示されています"
                : "CPUが考え中..."}
            </div>
          </div>
        )}
      </div>

      <div className="score-board">
        黒: {score.blackCount} / 白: {score.whiteCount}
      </div>

      <div className={`board ${isBlackTurn ? "black-turn" : "white-turn"}`}>
        {board.map((row, i) => (
          <div key={i} className="board-row">
            {row.map((cell, j) => (
              <div
                key={j}
                className={`cell ${cell || ""} ${
                  isBlackTurn && isValidMove(i, j) ? "valid" : ""
                }`}
                onClick={() => makeMove(i, j)}
              />
            ))}
          </div>
        ))}
      </div>

      <button className="reset-button" onClick={resetGame}>
        ゲームをリセット
      </button>
    </div>
  );
};

export default Game;
