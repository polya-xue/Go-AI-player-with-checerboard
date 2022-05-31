///\/\/\\\/\/\\\///\\/\\\//\/\//\/\/\/\\\/\/\\\///\\/\\\//\/\//\
//
//  Assignment       COMP3200 - Assignment 3
//  Professor:       David Churchill
//  Year / Term:     2021FALL
//  File Name:       Players.js
// 
//  Student Name:    Yaomin Xue
//  Student User:    yxue
//  Student Email:   yxue@mun.ca
//  Student ID:      202092282
//  Group Member(s): [enter student name(s)]
//
///\/\/\\\/\/\\\///\\/\\\//\/\//\/\/\/\\\/\/\\\///\\/\\\//\/\//\

class Player_Random {
    
    constructor() {}

    getAction(state) {
        let actions = state.getLegalActions();
        return actions[Math.floor(Math.random()*actions.length)];
    }
}

class Player_Greedy {
    
    constructor() {}

    eval(state, player) {
       
        let winner = state.winner();

        if (winner == player) { return 10000; }
        else if (winner == PLAYER_NONE) { return 0; }
        else if (winner == PLAYER_DRAW) { return 0; }
        else { return -10000; }
    }
                                                                                                               
    getAction(state) {
        let actions = state.getLegalActions();
        let player = state.player;
        let max = -10000000;
        let maxAction = -1;
        for (let a = 0; a<actions.length; a++) {
            let child = state.copy();
            child.doAction(actions[a]);
            let value = this.eval(child, player);
            if (value > max) {
                max = value;
                maxAction = actions[a];
            }
        }
        return maxAction;
    }
}

// Copyright (C) David Churchill - All Rights Reserved
// COMP3200 - 2021FALL - Assignment 3
// Written by David Churchill (dave.churchill@gmail.com)
// Unauthorized copying of these files are strictly prohibited
// Distributed only for course work at Memorial University
// If you see this file online please contact email above
