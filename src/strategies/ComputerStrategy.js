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
