///\/\/\\\/\/\\\///\\/\\\//\/\//\/\/\/\\\/\/\\\///\\/\\\//\/\//\
//
//  Assignment       COMP3200 - Assignment 3
//  Professor:       David Churchill
//  Year / Term:     2021FALL
//  File Name:       GameState.js
// 
//  Student Name:    Yaomin Xue
//  Student User:    yxue
//  Student Email:   yxue@mun.ca
//  Student ID:      202092282
//  Group Member(s): [enter student name(s)]
//
///\/\/\\\/\/\\\///\\/\\\//\/\//\/\/\/\\\/\/\\\///\\/\\\//\/\//\

let PLAYER_ONE = 0;
let PLAYER_TWO = 1;
let PLAYER_NONE = 2;
let PLAYER_DRAW = 3;
                                                                                                               
class GameState { 
    
    constructor (width, height) {
                                                                                                               
        this.width = width;
        this.height = height;
        // this.pieces = (new Array(width)).fill(0);
        this.totalPieces = [0, 0];
        this.board = new Array(width).fill(0).map(x => new Array(height).fill(PLAYER_NONE));
        this.player = 0;
        this.dirs = [[1,0], [0,1], [-1,0], [0,-1]];
        this.location = [0, 0];
        this.winInfo = [null, null, null];
        this.record = new Array(this.width).fill(0).map(x => new Array(this.height).fill(0));
        this.area = [0, 0];
        this.cover = new Array(this.width).fill(0).map(x => new Array(this.height).fill(PLAYER_NONE));

        this.qi = [0, 0];
        this.qi_last = [0, 0];
        this.record2 = new Array(this.width).fill(0).map(x => new Array(this.height).fill(0));
        this.hash = [];
    }


    // Returns the piece type at the given x,y position
    get(x, y) {
        return this.board[x][y];
    }

    isNotOver(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height){
            return false;
        }
        return true;
    }

    // Returns whether or not the given x,y position is on the board
    isValid(x, y) {
        // console.log("isvalid", x, y, this.board[x][y]);
        if (!this.isNotOver(x, y)){
            return false;
        }
        if (this.board[x][y] != PLAYER_NONE){
            return false;
        }
        let p = (this.player + 1) % 2;
        if (this.isNotOver(x + this.dirs[0][0], y + this.dirs[0][1]) &&
            this.board[x + this.dirs[0][0]][y + this.dirs[0][1]] ==  p &&
            this.isNotOver(x + this.dirs[1][0], y + this.dirs[1][1]) &&
            this.board[x + this.dirs[1][0]][y + this.dirs[1][1]] ==  p &&
            this.isNotOver(x + this.dirs[2][0], y + this.dirs[2][1]) &&
            this.board[x + this.dirs[2][0]][y + this.dirs[2][1]] ==  p &&
            this.isNotOver(x + this.dirs[3][0], y + this.dirs[3][1]) &&
            this.board[x + this.dirs[3][0]][y + this.dirs[3][1]] ==  p){
            return false;
        }
        return true;

    }

    // Do the given action
    // An action is an integer representing the column to place the piece in
    // Doing the action puts the piece in the given column and switches players
    doAction(x, y) {
        // console.log("6", x, y);
        if ( this.board[x][y] != PLAYER_NONE) {
            console.log("error");
            return;
        }
        this.board[x][y] = this.player;
        this.totalPieces[this.player] ++;
        // console.log("total", this.totalPieces);

        // 消除死棋
        for (let x=0; x<this.width; x++) {
            for (let y=0; y<this.height; y++) {
                this.kill(x, y);
            }
        }
        this.player = (this.player + 1) % 2;

        // if (x == 3 && y == 3){
        //     console.log("do action");
        //     for (let p = 0; p< 9;p++){
        //         console.log(this.board[p]);
        //     }
        // }
    }

    kill(x, y) {
        for (let d=0; d<this.dirs.length; d++) {
            let ax = x + this.dirs[d][0];
            let ay = y + this.dirs[d][1];
            // console.log("test", ax, ay);
            // 如果邻间棋子是不合规的，空棋，或者自己的棋子，就不算死棋的开始
            if (ax < 0 || ay < 0 || ax >= this.width || ay >= this.height ||
                this.board[ax][ay] == PLAYER_NONE || this.board[ax][ay] == this.player
            ){
                continue;
            }
            // 是对方的棋，计算这块子的气
            // console.log("in", ax, ay);
            let alive = 0;
            this.record = new Array(this.width).fill(0).map(x => new Array(this.height).fill(0));
            let q = [];
            let q_dead = []
            q.push([ax, ay]);
            q_dead.push([ax, ay]);
            let sum = 0;
            while(q.length != 0){ //
                sum ++;
                // console.log("q", ax, ay);
                [ax, ay] = q.shift();
                // 这个位置被计算过了
                this.record[ax][ay] = 1;
                for (let i=0; i<this.dirs.length; i++) {
                    // 如果邻间棋子是不合规的，对方还是没有气，有可能是死棋
                    // 该位置已经被计算过，continue
                    // 空棋（有一口气）,已经不是死棋了,break
                    // 或者己方的棋子，对方还可能是死棋
                    // 是对方自己的棋子，继续往下计算

                    if ( ax + this.dirs[i][0] < 0 || ay + this.dirs[i][1] < 0 ||
                        ax + this.dirs[i][0] >= this.width || ay + this.dirs[i][1] >= this.height) {
                        continue;
                    }
                    if (this.record[ax + this.dirs[i][0]][ay + this.dirs[i][1]] == 1){
                        continue;
                    }

                    if (this.board[ax + this.dirs[i][0]][ay + this.dirs[i][1]] == PLAYER_NONE){
                        alive = 1;
                        break;
                    }

                    if(this.board[ax + this.dirs[i][0]][ay + this.dirs[i][1]] == this.player){
                        continue;
                    }
                    q.push([ax + this.dirs[i][0], ay + this.dirs[i][1]]);
                    q_dead.push([ax + this.dirs[i][0], ay + this.dirs[i][1]]);
                }
            }
            // console.log("end", alive);
            if (alive == 0){
                while(q_dead.length != 0) {
                    [ax, ay] = q_dead.shift();
                    this.board[ax][ay] = PLAYER_NONE;
                    this.totalPieces[(this.player + 1) % 2]--;
                }
            }
        }
    }

    sort(arr) {
        for (let i = 0; i < arr.length; i++) {
            let rand = parseInt(Math.random() * arr.length);
            /* 这段代码的意思简单来说，就是不停地交换索引值对应的数 假如rand=[2,2,4,3,7,1,9,5,6,3]
            那么第0次交换 arr[0],arr[2] 生成新数组0 [3, 2, 1, 4, 5, 6, 7, 8, 9, 10]
            1: arr[1],arr[2] 新数组 0 再交换生成新数组1 [3, 1,2, 4, 5, 6, 7, 8, 9, 10]
            2: arr[2],arr[4] 生成新数组2 [3, 1,5, 4, 2, 6, 7, 8, 9, 10]
            依次类推 换到退出循环为止 所以生成的随机数重复也没有影响，因为每次进行交换的数组都是不一样的
            */
            let temp = arr[rand];
            arr[rand] = arr[i];
            arr[i] = temp;

        }
        return arr;
    }

    getLegalActions(kk) {
        // let legal = [];
        let x, y;
        [x, y] = this.location;
        let action = null;
        let arr = this.sort([1,2,3,4]); // choose action randomly

        // 以 x y 为中心，逆时针旋转寻找可用点


        for (let k = 1; k <= kk; k++) {
            for (let p = 1; p<4; p++){
                if (arr[p] == 1){
                    for (let i = y - k; i <= y + k; i++) {

                        if (this.isValid(x - k, i) == true && this.record2[x - k][i] == 0 //&&
                        ) {
                            this.record2[x - k][i] = 1;
                            return [x - k, i];
                        }
                    }
                }
                else if (arr[p] == 2){
                    for (let i = x - k; i <= x + k; i++) {

                        if (this.isValid(i, y + k) == true && this.record2[i][y + k] == 0 //&&
                        ) {
                            this.record2[i][y + k] = 1;
                            return [i, y + k];

                        }
                    }
                }
                else if (arr[p] == 3){
                    for (let i = y + k; i >= y - k; i--) {
                        if (this.isValid(x + k, i) == true && this.record2[x + k][i] == 0 //&&
                        ) {
                            this.record2[x + k][i] = 1;
                            return [x + k, i];
                        }
                    }
                }
                else{
                    for (let i = x + k; i >= x - k; i--) {
                        if (this.isValid(i, y - k) == true && this.record2[i][y - k] == 0 //&&
                        ) {
                            this.record2[i][y - k] = 1;
                            return [i, y - k];

                        }
                    }
                }
            }
        }
        return action;
    }

                                                                                                               
    // 检查这颗棋子的覆盖面积，分别保存在area0 和 area1中
    checkArea(x, y) {
        if (this.board[x][y] == PLAYER_NONE){
            return;
        }
        let line = this.width/2;
        // console.log("line", line, x, y);
        // 四个方向
        if (x < line && y < line){
            for (let i = 0; i <= x; i++){
                for (let j = 0; j <= y; j++){
                    if (this.cover[i][j] == PLAYER_NONE){
                        this.cover[i][j] = this.board[x][y];
                        this.area[this.board[x][y]] ++;
                    }
                }
            }
        }
        // x 0 to line, y line to height
        if (x < line && y >= line){
            for (let i = 0; i <= x; i++){
                for (let j = y; j < this.height; j++){
                    if (this.cover[i][j] == PLAYER_NONE){
                        this.cover[i][j] = this.board[x][y];
                        this.area[this.board[x][y]] ++;
                    }
                }
            }
        }
        // x line to width, y 0 to line
        if (x >= line && y < line){
            for (let i = x; i < this.width; i++){
                for (let j = 0; j <= y; j++){
                    if (this.cover[i][j] == PLAYER_NONE){
                        this.cover[i][j] = this.board[x][y];
                        this.area[this.board[x][y]] ++;
                    }
                }
            }
        }
        // over line
        if (x >= line && y >= line){
            for (let i = x; i < this.width; i++){
                for (let j = y; j < this.height; j++){
                    if (this.cover[i][j] == PLAYER_NONE){
                        this.cover[i][j] = this.board[x][y];
                        this.area[this.board[x][y]] ++;
                    }
                }
            }
        }

    }

    // Checks to see if there is a win on the board
    // Returns PLAYER_ONE if Player One has won
    // Returns PLAYER_TWO if Player Two has won
    // Returns PLAYER_NONE if the game is not over
    // Returns PLAYER_DRAW if the game is a draw (board filled with no winner)
    winner() {
        this.area = [0, 0];

        // 计算棋子占用面积，消掉死棋
        // 顺时针打印。
        let left = 0, right = this.height - 1, up = 0, down = this.width - 1; // 记录 上下左右的边界。

        // this.area = [0, 0];
        this.cover = Array(this.width).fill(0).map(x => new Array(this.height).fill(PLAYER_NONE));
        while (left < right && up < down)
        {
            // 打印 上面边界
            for (let i = left; i <= right; i ++ ) {
                this.checkArea(up, i)
                // this.kill(up, i);
            }
            up ++ ;
            // 打印 左边列。
            for (let i = up; i <= down; i ++ ) {
                this.checkArea(i, right)
            }
            right -- ;
            // 打印 下边界。
            for (let i = right; i >= left; i -- ){
                this.checkArea(down, i)
            }

            down -- ;
            // 打印 右边界
            for (let i = down; i >= up; i -- ) {
                this.checkArea(i ,left)
            }
            left ++ ;
        }

        // 打印区域面积
        // if (this.area[0] > this.area[1]){
        //     console.log("win", 0, this.area[0]);
        // }
        // else{
        //     console.log("win", 1, this.area[1]);
        // }

        if (this.area[0] > 45 && this.totalPieces[0] > this.totalPieces[1] + 20){
            return PLAYER_ONE;
        }

        if (this.area[1] > 45 && this.totalPieces[1] > this.totalPieces[0] + 20){
            return PLAYER_TWO;
        }

        // // If the number of pieces on the board is the same size as the board, it's a draw
        // if (this.totalPieces == this.width * this.height) { return PLAYER_DRAW; }
        // // Otherwise there is no winner
        return PLAYER_NONE;
    }

    // does a deep-copy of a state
    // similar to Java's clone() function
    copy() {
        let state = new GameState(this.width, this.height);
        state.player = this.player;
        state.totalPieces = this.totalPieces;
        for (let x=0; x<this.width; x++) {
            // state.pieces[x] = this.pieces[x];
            for (let y=0; y<this.height; y++) {
                state.board[x][y] = this.board[x][y];
            }
        }
        state.location = this.location;
        state.area = this.area;
        return state;
    }
}

// Copyright (C) David Churchill - All Rights Reserved
// COMP3200 - 2021FALL - Assignment 3
// Written by David Churchill (dave.churchill@gmail.com)
// Unauthorized copying of these files are strictly prohibited
// Distributed only for course work at Memorial University
// If you see this file online please contact email above
