Go-AI-player-with-checerboard
Coding in JavaScript using machine learning algorithm to design a Go checkerboard and play Go as an AI player.


Abstract:
Go is played using a rectangular checkerboard (a square) and round black and white stones. The board is divided into 361 intersecting points with 19 horizontal and horizontal lines. A machine learning approach as an AI player to computer Go combining Monte-Carlo tree search with Alpha-beta search algorithm that has been proposed. In our implementation we optimize the searching time and depth for processing steps. The reliability of our method has been proved to be considerably effective by experimental results.

Experiments:
To show the performance of AI player, we let AI player play head-to-head with PhoenixGo. PhoenixGo is a Go AI program which implements the AlphaGo Zero [1]. It is also known as ”BensonDarr” in FoxGo, ”cronus” in CGOS, and the champion of World AI Go Tournament 2018 held in Fuzhou China [6]. The PhoenixGo engine supports GTP (Go Text Protocol), which means it can be used with a GUI with GTP capability, such as Sabaki. We download Sabaki and run PhoenixGo engine on Sabaki as show in below:

<img width="807" alt="fig5" src="https://user-images.githubusercontent.com/60961564/171294734-004d22d4-156b-4dcb-ace9-255933de5cf1.png">

The left side of the Sabaki interface gives information about the running Go game, including the predicted winning rate and the position of the move, etc. The following will show the detailed experiments of the AI players playing with Alpha Go player. The below is the screenshot of AI player with black pieces played Go on the left with AlphaGo with white pieces on the right. At the beginning, AI player plays first as shown in below:

![fig6](https://user-images.githubusercontent.com/60961564/171298323-fbd0d15b-4645-4da3-86f7-95910df50544.png)

The below diagram shows AI player trying to escape from white surrounds and expanding the number:

![fig7](https://user-images.githubusercontent.com/60961564/171298401-74d50ed3-8e18-415b-a010-ed190b5280f0.png)

The stones are required to be removed from the board if the stone is surrounded totally by opposing stones as the rule of Go game. The below image shows that the white player is just one move away from capturing the encircling black stones.

![fig8](https://user-images.githubusercontent.com/60961564/171299228-8d518ad2-ee0d-4a23-9d55-d6ace6a4b8db.png)

Thus, when the white stone is put on the position, the black stones that are surrounded are captured as shown below"

![fig9](https://user-images.githubusercontent.com/60961564/171299396-21f1cf2b-a990-418f-8061-18a2f6b8fe58.png)

At the same time, the interface of our program also gives the same remove result, indicating that our program is running correctly. Also we can see that the black player is actually very unintelligent to fall inside the envelope on the next move. Our algorithm still needs a lot of improvement. At the end of the match, our AI player lost without a doubt, but it was still
evident that our AI player had a relatively long and steady fight with Alpha Go. The final result is showed below:

![fig10](https://user-images.githubusercontent.com/60961564/171299529-e1dcfbf6-794e-4e4f-96cb-efa59c268406.png)

Finally, the test of the algorithm to evaluate the winner is necessary. There are 19*19 positions in Go game. We calculate the area of the board covered by two players’ pieces separately and use this area value to determine who is winner. For example, black player will win if his stones cover more than 150 positions, and the white stones need to cover 140 positions to win. At the same time, the number of pieces on the board is compared of two players, and only if one player has more pieces than the other by a certain amount, the game can be ended as shown below, the white player win.

![fig11](https://user-images.githubusercontent.com/60961564/171301211-3233f00a-65e2-4641-bb80-169b3cd8a177.jpg)



running: run index.html
