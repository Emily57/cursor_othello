// 基本戦略クラス（後で他の戦略を追加できるように）
export class BaseStrategy {
  selectMove(board, validMoves) {
    throw new Error("Strategy must implement selectMove method");
  }
}

// ランダムに手を選ぶ戦略
export class RandomStrategy extends BaseStrategy {
  selectMove(board, validMoves) {
    if (validMoves.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }
}

// 取れる石の数が最大となる手を選ぶ戦略
export class MaxCaptureStrategy extends BaseStrategy {
  selectMove(board, validMoves) {
    if (validMoves.length === 0) return null;

    let bestMove = validMoves[0];
    let maxCaptures = -1;

    validMoves.forEach(([row, col]) => {
      const captures = this.calculateCaptures(board, row, col, "white");
      if (captures > maxCaptures) {
        maxCaptures = captures;
        bestMove = [row, col];
      }
    });

    return bestMove;
  }

  calculateCaptures(board, row, col, color) {
    let captures = 0;
    const oppositeColor = color === "white" ? "black" : "white";

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
      let tempCaptures = 0;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (board[x][y] === null) break;
        if (board[x][y] === oppositeColor) {
          tempCaptures++;
        } else if (board[x][y] === color) {
          captures += tempCaptures;
          break;
        }
        x += dx;
        y += dy;
      }
    }

    return captures;
  }
}

export class AdvancedStrategy extends BaseStrategy {
  // 盤面の位置による重要度
  positionWeights = [
    [120, -20, 20, 5, 5, 20, -20, 120],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [5, -5, 3, 3, 3, 3, -5, 5],
    [20, -5, 15, 3, 3, 15, -5, 20],
    [-20, -40, -5, -5, -5, -5, -40, -20],
    [120, -20, 20, 5, 5, 20, -20, 120],
  ];

  selectMove(board, validMoves) {
    if (validMoves.length === 0) return null;

    const gamePhase = this.determineGamePhase(board);
    let bestMove = validMoves[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    validMoves.forEach(([row, col]) => {
      const score = this.evaluateMove(board, row, col, gamePhase);
      if (score > bestScore) {
        bestScore = score;
        bestMove = [row, col];
      }
    });

    return bestMove;
  }

  determineGamePhase(board) {
    let pieceCount = 0;
    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell) pieceCount++;
      });
    });

    if (pieceCount <= 20) return "early";
    if (pieceCount <= 50) return "middle";
    return "late";
  }

  evaluateMove(board, row, col, gamePhase) {
    let score = 0;

    // 1. 位置の価値を評価
    score += this.positionWeights[row][col];

    // 2. 石を返せる数を評価
    const captureScore = this.calculateCaptures(board, row, col, "white") * 2;
    score += captureScore;

    // 3. 角の近くの位置の評価
    if (this.isNearCorner(row, col)) {
      score -= 30;
    }

    // 4. ゲームフェーズに応じた評価
    switch (gamePhase) {
      case "early":
        // 序盤: モビリティ（移動可能性）を重視
        score += this.evaluateMobility(board, row, col) * 3;
        break;
      case "middle":
        // 中盤: 石の安定性を重視
        score += this.evaluateStability(board, row, col) * 2;
        break;
      case "late":
        // 終盤: 石の数を重視
        score += captureScore * 2;
        break;
      default:
        // 予期せぬフェーズの場合は通常の評価を使用
        score += captureScore;
        break;
    }

    // 5. パリティ（奇数・偶数）の考慮
    if (this.hasParityAdvantage(board, row, col)) {
      score += 10;
    }

    return score;
  }

  isNearCorner(row, col) {
    const nearCornerPositions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [0, 6],
      [1, 6],
      [1, 7],
      [6, 0],
      [6, 1],
      [7, 1],
      [6, 6],
      [6, 7],
      [7, 6],
    ];
    return nearCornerPositions.some(([r, c]) => r === row && c === col);
  }

  evaluateMobility(board, row, col) {
    // 仮の盤面を作成して移動可能性を評価
    const tempBoard = board.map((row) => [...row]);
    tempBoard[row][col] = "white";

    let opponentMoves = this.getValidMovesCount(tempBoard, "black");
    return -opponentMoves; // 相手の手を制限する方が有利
  }

  evaluateStability(board, row, col) {
    let stability = 0;
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

    // 周囲の石の状態を評価
    directions.forEach(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      if (x >= 0 && x < 8 && y >= 0 && y < 8 && board[x][y] === "white") {
        stability += 1;
      }
    });

    return stability;
  }

  hasParityAdvantage(board, row, col) {
    let emptyCount = 0;
    board.forEach((row) => {
      row.forEach((cell) => {
        if (!cell) emptyCount++;
      });
    });
    return emptyCount % 2 === 0;
  }

  getValidMovesCount(board, color) {
    let count = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.isValidMove(board, i, j, color)) {
          count++;
        }
      }
    }
    return count;
  }

  isValidMove(board, row, col, color) {
    if (board[row][col]) return false;

    const oppositeColor = color === "black" ? "white" : "black";
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

    return directions.some(([dx, dy]) => {
      let x = row + dx;
      let y = col + dy;
      let foundOpposite = false;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (board[x][y] === null) return false;
        if (board[x][y] === oppositeColor) foundOpposite = true;
        else if (board[x][y] === color && foundOpposite) return true;
        else return false;
        x += dx;
        y += dy;
      }
      return false;
    });
  }

  calculateCaptures(board, row, col, color) {
    let captures = 0;
    const oppositeColor = color === "white" ? "black" : "white";
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
      let tempCaptures = 0;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (board[x][y] === null) break;
        if (board[x][y] === oppositeColor) {
          tempCaptures++;
        } else if (board[x][y] === color) {
          captures += tempCaptures;
          break;
        }
        x += dx;
        y += dy;
      }
    }

    return captures;
  }
}
