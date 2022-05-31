// let PLAYER_ONE = 0;
// let PLAYER_TWO = 1;
// let PLAYER_NONE = 2;
// let PLAYER_DRAW = 3;

class GridGUI extends GUI {

    constructor (container, mapText) {

        super(container);

        this.pixelWidth = 568;
        this.pixelHeight = 568;

        this.humanAction = [-1, -1];
        this.prevMouseClickX = -1;
        this.prevMouseClickY = -1;
        this.mx = -1;
        this.my = -1;
        this.message = "";

        // this.colors = ['#ffff00', '#ff0000', '#ffffff']
        this.colors = ['#000000', '#ffffff', '#006FB9']
        this.bgColor = '#006FB9'
        this.moveColor = '#00acee'

        this.width = 19;
        this.height = 19;
        this.state = new GameState(this.width, this.height);
        this.players = [null, null];
        this.autoplay = true;
        this.doturn = false;
        this.history = [];
        this.area = [0, 0];
        this.cover = new Array(this.width).fill(0).map(x => new Array(this.height).fill(PLAYER_NONE));
        this.location = [0,0];

        this.setHTML();
        this.resetGame();
        this.setAlgorithm();
        this.addEventListeners();

    }

    update() {
        let winner = this.state.winner();
        // this.area = this.state.area;
        // do the move for the current player
        if (winner == PLAYER_NONE) {
            this.textDiv.innerHTML = this.message;
            if (this.players[this.state.player] == null) {
                if (this.humanAction[0] != -1 && this.state.isValid(this.humanAction[0], this.state.height-this.humanAction[1]-1)) {
                    this.humanAction[1] = this.state.height-this.humanAction[1]-1;
                    console.log("human action", this.humanAction[0], this.humanAction[1]);
                    this.doAction(this.humanAction[0], this.humanAction[1]);
                    this.state.location = [this.humanAction[0], this.humanAction[1]];
                    document.getElementById("con1").innerHTML="Human action:";
                    document.getElementById("con2").innerHTML="Position: " +
                        this.humanAction[1] + " line, " + this.humanAction[0] + " column";


                    this.humanAction[0] = -1;
                    this.autoplay = true;

                    }
            } else if (this.autoplay) {
                let aiAction = this.players[this.state.player].getAction(this.state.copy());
                this.doAction(aiAction[0], aiAction[1]);
                this.autoplay = false;

                document.getElementById("con3").innerHTML="AI action:";
                document.getElementById("con4").innerHTML="Position: " +
                    aiAction[1] + " line, " + aiAction[0] + " column";

            }
        } else {
            if (winner == PLAYER_ONE)  { document.getElementById("con5").innerHTML="Human player win"; }
            if (winner == PLAYER_TWO)  {
                document.getElementById("con5").setAttribute("style", "color:red");
                document.getElementById("con5").innerHTML="AI player win!";
            } //#ffff00
            if (winner == PLAYER_DRAW) { this.textDiv.innerHTML = "<h1>The Game is a Draw!</h1>"; }
        }

        this.draw();

        // this.textDiv.innerHTML = "<h1>Hint:<br>Player  + (Math.max(this.state.area[0],  this.state.area[1]) + " + win + ")</h1>";
    }

    doAction(x, y) {
        // console.log("location:", x, y);
        this.state.doAction(x, y);
        // this.history.push([x, y]);
    }


    resetGame() {
        this.state = new GameState(this.width, this.height);
        // this.state = new GameState(parseInt(document.getElementById('sliderwidth').value), parseInt(document.getElementById('sliderheight').value));
        this.sqSize = Math.min(this.pixelWidth / this.state.width, this.pixelHeight / this.state.height);
        // this.sqSize_board = Math.min(this.pixelWidth / (this.state.width+1), this.pixelHeight / (this.state.height+1));
        this.sqHalf = this.sqSize/2;
        this.history = [];
        this.mx = -1;
        this.my = -1;
        this.message = "";
    }

    // draw the foreground, is called every 'frame'
    draw() {

        // clear the foreground to white
        this.fg_ctx.clearRect(0, 0, this.bg.width, this.bg.height);

        // draw the background color
        this.fg_ctx.fillStyle = this.state.winner() == PLAYER_NONE ? this.bgColor : '#777777';
        this.fg_ctx.fillRect(0, 0, this.state.width * this.sqSize, this.state.height * this.sqSize);


        // draw the pieces on the board
        for (let x = 0; x < this.state.width; x++) {
            for (let y = 0; y < this.state.height; y++) {
                this.drawCircle(x*this.sqSize + this.sqHalf, (this.state.height-y-1)*this.sqSize + this.sqHalf, 0.4*this.sqSize, this.colors[this.state.get(x,y)], '#00acee', 2);
            }
        }

        // draw the mouseover tile (where human piece will go)
        if (this.players[this.state.player] == null && this.state.winner() == PLAYER_NONE) {
            this.drawCircle(this.mx*this.sqSize + this.sqHalf,
                this.my*this.sqSize + this.sqHalf,
                0.3*this.sqSize, this.colors[this.state.player], '#000000', 0);
        }

        // draw the grid overlay
        this.fg_ctx.fillStyle = "#00acee";
        for (let y = 0; y <= this.state.height; y++) { this.fg_ctx.fillRect(0, y * this.sqSize-this.sqHalf, this.state.width * this.sqSize, 1); }
        for (let x = 0; x <= this.state.width; x++)  { this.fg_ctx.fillRect(x * this.sqSize-this.sqHalf, 0, 1, this.state.height*this.sqSize); }
    }

    drawCircle(x, y, radius, fillColor, borderColor, borderWidth) {
        this.fg_ctx.fillStyle = fillColor;
        this.fg_ctx.strokeStyle = borderColor;
        this.fg_ctx.beginPath();
        this.fg_ctx.arc(x, y, radius, 0, 2*Math.PI, false);
        this.fg_ctx.fill();
        this.fg_ctx.lineWidth = borderWidth;
        this.fg_ctx.stroke();
    }

    addEventListeners() {
        this.fg.gui = this;
        this.fg.addEventListener('mousemove',
            function (evt) {
                let mousePos = this.gui.getMousePos(this, evt);
                this.gui.mx = Math.floor(mousePos.x / this.gui.sqSize);
                this.gui.my = Math.floor(mousePos.y / this.gui.sqSize);
            }, false);

        this.fg.addEventListener('mousedown',
            function (evt) {
                let mousePos = this.gui.getMousePos(this, evt);
                this.gui.mouse = evt.which;

                // 检测到了左键点击
                if (this.gui.mouse == 1) {
                    this.gui.prevMouseClickX = Math.floor(mousePos.x / this.gui.sqSize);
                    this.gui.prevMouseClickY = Math.floor(mousePos.y / this.gui.sqSize);
                    // this.gui.humanAction鼠标点击的位置
                    this.gui.humanAction = [this.gui.prevMouseClickX, this.gui.prevMouseClickY];
                    this.humanAction = this.gui.humanAction;
                }
            }, false);
    }



    setAlgorithm() {
        let prefix = ['p1', 'p2'];
        this.mx = -1;
        this.my = -1;

        // 暂时让玩家2也是人类
        this.players[0] = null;
        // this.players[1] = null;

        let player = 1;
        let config = {};

        config.timeLimit = 1000;
        config.maxDepth = 6;
        this.players[player] = new Player_Student(config);

    }

    setHTML() {
        let top = 0, skip = 35, c2left = 150, c3left = 300;
        this.createCanvas(this.pixelWidth + 1, this.pixelHeight + 1);
        this.bannerDiv  = this.create('div', 'BannerContainer',  this.fg.width + 100,   0, 600,  40);
        this.controlDiv = this.create('div', 'ControlContainer', this.fg.width + 100,  60, 600, 350);
        this.textDiv    = this.create('div', 'TextContainer',    this.fg.width + 100, 530, 450, 350);

        // Banner HTML
        // this.bannerDiv.innerHTML  = "<b>HTML5 Connect 4</b>";

        // Player 1 Algorithm Selection
        this.addText(this.controlDiv, 'labelp1', 0, top, 250, 25, "Player 1 (Black):");
        this.addText(this.controlDiv, 'human', c2left, top + 0*skip, 250, 25, "Human");


        // Player 2 Selection
        this.addText(this.controlDiv, 'labelp2', 0, top + 1*skip, 250, 25, "Player 2 (White):");
        this.addText(this.controlDiv, 'playerSAB', c2left, top + 1*skip, 250, 25, "Autoplay"); //, BetaGo

        // Board Size Selection
        this.addText(this.controlDiv, 'labelbw',  0, top + 2*skip, 250, 25, "Board Width:  19");
        // this.addSlider(this.controlDiv, 'sliderwidth', c2left, top + 7*skip, 250, 25, 7, 4, 15,
        //     function() { this.gui.resetGame(); document.getElementById('labelbw').innerHTML = "Board Width: " + this.value; });
        this.addText(this.controlDiv, 'labelbh',  0, top + 3*skip, 250, 25, "Board Height: 19");
        // this.addSlider(this.controlDiv, 'sliderheight', c2left, top + 8*skip, 250, 25, 6, 4, 15,
        //     function() { this.gui.resetGame(); document.getElementById('labelbh').innerHTML = "Board Height: " + this.value; });

        this.addButton(this.controlDiv, 'resetButton', 0, top + 5*skip, 140, 25, "Restart Game",
            function() { this.gui.resetGame(); });

    }

}


// Copyright (C) David Churchill - All Rights Reserved
// COMP3200 - 2021FALL - Assignment 3
// Written by David Churchill (dave.churchill@gmail.com)
// Unauthorized copying of these files are strictly prohibited
// Distributed only for course work at Memorial University
// If you see this file online please contact email above
