

const WIN_SCORE = 10000;
const LOSE_SCORE = -10000;

const C = 0.5;
const Monte = 5;

// let PLAYER_ONE = 0;
// let PLAYER_TWO = 1;
// let PLAYER_NONE = 2;
// let PLAYER_DRAW = 3;

const NO_PIECE = 2;
const RANDOM_MAX = Math.pow(2, 16);


class Connect4ZobristHasher { //Zobrist hasher
    constructor() {
        this.hashValues = null;
        this.calculatedWidth = null;
        this.calculatedHeight = null;
    }

    init(width, height) {
      if (
        (this.calculatedWidth !== null && this.calculatedWidth >= width) &&
        (this.calculatedHeight !== null && this.calculatedHeight >= height)
      ) {
        return;
      }
      this.calculatedWidth = width;
      this.calculatedHeight = height;

      if (this.hashValues === null) this.hashValues = [];
      for (let x = 0; x < width; x += 1) {
          if (this.hashValues[x] === undefined) this.hashValues[x] = [];
          for (let y = 0; y < height; y += 1) {
              if (this.hashValues[x][y] === undefined) {
                  this.hashValues[x][y] = [
                      Math.random() * RANDOM_MAX,
                      Math.random() * RANDOM_MAX,
                  ];
              }
          }
      }
    }

    getNextHash(player, hash, action) {
      return hash ^ this.hashValues[action[0]][action[1]][player];
    }

    getHash(state) {//GET HASH
        const { width, height } = state;
        let hash = 0;

        for (let x = 0; x < width; x += 1) {
            for (let y = 0; y < height; y += 1) {
              const color = state.board[x][y];
              if (color !== NO_PIECE) hash ^= this.hashValues[x][y][color];
            }
        }

    return hash;
  }
}

class Player_Student {// main part
    constructor(config) {
      this.config = config;
      this.searchStartTime = 0;
      this.bestAction = null;
      this.currentlyBestAction = null;
      this.currentMaxDepth = null;
      this.maxPlayer = null;
      this.hasher = new Connect4ZobristHasher();
      this.table = {};
      this.dirs = [[1,0], [0,1], [-1,0], [0,-1]];
      this.r_action = null;

      this.maxRange = 6;
      console.log("Student AB Player");
      console.log("  Time Limit: ", this.config.timeLimit);
      console.log("  Max  Depth: ", this.config.maxDepth);
    }

    // 和GridGUI的接口
    getAction(state) {
        this.maxPlayer = state.player;
        this.hasher.init(state.width, state.height);
        this.bestAction = null;
        let action = this.IDAlphaBeta(state);
        if (state.isValid(action[0], action[1]) == true) {
          return action;
        }
        else{
            while(1){
                let x = Math.floor(Math.random()*state.width);
                let y = Math.floor(Math.random()*state.height);
                if (state.isValid(x, y)){
                    console.log("random, ", x, y);
                    return [x, y];
                }
            }
        }
    }
    
    eval(state, player) {
        if (player === undefined) player = this.maxPlayer;

        let winner = state.winner();
        if (winner == player) return WIN_SCORE;
        if (winner == (player + 1) % 2) return LOSE_SCORE;

        let score = 0;

        // 计算的是棋子的数量 calculate Qi
        score += (state.totalPieces[player] - state.totalPieces[(player + 1) % 2])*10;

        if (state.r_action == null) {
            console.log("root *****");
            return score;}

        let x, y;
        let qi = 0;
        [x, y] = state.r_action;
        let new_qi = this.Compute_Qi(state.board, x, y);

        for (let k = 0;k<4; k++){
            if (state.isNotOver(x+state.dirs[k][0],y+state.dirs[k][1]) == false){
                continue;
            }
            if (state.board[x+state.dirs[k][0]][y+state.dirs[k][1]] == state.board[x][y]){ // 附近有自己一方的，已经存在的棋子
                let board = JSON.parse(JSON.stringify(state.board));
                board[x][y] = PLAYER_NONE; // 让新下的棋子归为0
                qi = this.Compute_Qi(board, x+state.dirs[k][0], y+state.dirs[k][1]);
                break;
            }
        }
        if (new_qi == 1 && qi == 1){
            score += 10;
            // console.log("one qi warning!!!!!!!!!!!!!!!!!!");
            return score;
        }
        if (new_qi ==  2 && qi == 2 ){
            score += 20;
            return score;
        }
        if (new_qi > 1 && qi == 1){
            // console.log("must be there!!!!", "action", x, y, "player", state.board[x][y]);
            score += (new_qi - qi)*11;
            return score;
        }
        return score;
    }

    Compute_Qi(board, x, y) {
        let qi = 0;
        for (let k = 0;k<4; k++){
            if (x+this.dirs[k][0] < 0 || y+this.dirs[k][1] < 0 ||
                x+this.dirs[k][0] >= board.length || y+this.dirs[k][1] >= board.length){
                continue;
            }
            if (board[x+this.dirs[k][0]][y+this.dirs[k][1]] == PLAYER_NONE){
                qi ++;
            }
        }
        return qi;
    }

    IDAlphaBeta(state) {// IDAB
        this.searchStartTime = performance.now();
        const isMaximizing = 1;
        const hash = this.hasher.getHash(state);

        let record_monte = [];
        let depth = 2;
        let max_record = 0;
        for (let p = 0; p < Monte; p++) {
            this.currentMaxDepth = depth;
            try {
                this.AlphaBeta(
                    state.copy(),
                    // The state might be changed if the time limit excessed
                    hash,
                    LOSE_SCORE - 1,
                    WIN_SCORE + 1,
                    0,
                    isMaximizing,
                );
                if (p == 0){
                    this.bestAction = this.currentlyBestAction;
                }
                // Monte Carlo method
                let figure = this.currentlyBestAction[0] * 9 + this.currentlyBestAction[1] ;
                if (record_monte[figure] == null){
                    record_monte[figure] = 1;
                }
                else{
                    record_monte[figure] ++;
                    if (record_monte[figure] > max_record){
                        this.bestAction = this.currentlyBestAction;
                        max_record = record_monte[figure];
                    }
                }

                console.log("deep", depth, "best action", this.bestAction);
            } catch (error) {
                break;
            }
        }

        // If the limit is too strict
        // if (this.bestAction === null) this.bestAction = 0;

        return this.bestAction;
    }

    AlphaBeta(state, hash, alpha, beta, depth, isMaximizing) {  // alpha beta pruning


        if (
            this.config.timeLimit !== 0 &&
            performance.now() - this.searchStartTime >= this.config.timeLimit
        ) {
            throw undefined;
        }

        const depthToEnd = this.currentMaxDepth - depth;
        const cache = this.table[hash];

        if (cache != null && state.depth >= depthToEnd) {
            // Result from deeper search is better
            if (depth == 0) this.currentlyBestAction = cache.action;

            return isMaximizing ? cache.score : -cache.score;
        }



        const score = this.eval(state);

        // 只对于非叶子节点

        if ((score == LOSE_SCORE || score == WIN_SCORE) ||
            depth >= this.currentMaxDepth
        ) {
            // console.log("return score")

            console.log("leaf", state.r_action[0], state.r_action[1], "score", score, "depth", depth, "max", isMaximizing);
            return score;
        }


        let best = null;
        while (true) {
            let k = this.analysis_for_k(state);
            if (isMaximizing == 0) {k++;}
            const action = state.getLegalActions(k);
            if (action == null) {
                // console.log("finish");
                break;
            }

            const childHash = this.hasher.getNextHash(this.hasher, hash, action);

            // 保留复制
            let copy_state = this.copy(state);

            copy_state.location = [action[0], action[1]];
            copy_state.doAction(action[0], action[1]);
            copy_state.record2 = new Array(copy_state.width).fill(0).map(x => new Array(copy_state.height).fill(0));
            copy_state.r_action = action;

            // Will undo after sub-searching
            // console.log("location", state.location);
            // console.log("action", action[0], action[1]);
            // console.log("player", copy_state.totalPieces[0], copy_state.totalPieces[1]);
            let estimated = this.AlphaBeta(
                copy_state,
                childHash,
                alpha,
                beta,
                depth + 1,
                !isMaximizing,
            );

            console.log("act ", action[0], action[1], "score", estimated, "depth", depth, "max", isMaximizing);

            // % Upper Confidence Bounds, c = 80%
            estimated = C * estimated + score;
            if ((best === null) ||
                (isMaximizing && estimated > best) ||
                (!isMaximizing && estimated < best)) {
                best = estimated; // 这里可以加个和深度有关的百分比分数


                if (isMaximizing) {
                    alpha = Math.max(alpha, best);
                } else {
                    beta = Math.min(beta, best);
                }
                if (beta <= alpha) return best;
                // The result shouldn't be stored if the search isn't completed

                if (depth === 0) this.currentlyBestAction = action;
            }
        }

        const result = {
            score: isMaximizing ? best : -best,
            // Connect 4 is a zero-sum game
            depth: depthToEnd,
        };
        if (depth === 0) result.action = this.currentlyBestAction;
        this.table[hash] = result;


        return best;
    }

    analysis_for_k(state, x, y) {
        let num = 0, num_all = 0;
        [x, y] = state.location;
        for(let i = x-1; i<=x+1; i++){
            for (let j = y-1; j<=y+1; j++){
                if (state.isNotOver(i, j) == true){ num_all ++;}
                if (state.isValid(i, j) == true){
                    num ++;
                }
            }
        }
        if (num/num_all > 0.6){ return 1;}
        else {return 2;}
    }

    copy(old_state) {
        let state = new GameState(old_state.width, old_state.height);
        state.player = JSON.parse(JSON.stringify(old_state.player));
        state.totalPieces = JSON.parse(JSON.stringify(old_state.totalPieces));
        for (let x=0; x<old_state.width; x++) {
            // state.pieces[x] = this.pieces[x];
            for (let y=0; y<old_state.height; y++) {
                state.board[x][y] = JSON.parse(JSON.stringify(old_state.board[x][y]));
            }
        }
        state.location = JSON.parse(JSON.stringify(old_state.location));
        state.area = JSON.parse(JSON.stringify(old_state.area));
        return state;
    }
}
