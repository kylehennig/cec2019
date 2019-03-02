import (Server) from 'server';


class Board{

    constructor(constants)){
        let this.constants = constants;

        let binOrganicContents =0;
        let binRecycleContents = 0;
        let binTrashContents =0;
        board.createSections();
    }

    createSections(){
        let rectangles = [];
        for(let i =this.Y_MIN+2; i < this.Y_MAX+3; i += 3) {
            for (let j = this.X_MIN+this.SCAN_RADIUS+1; j < this.X_MAX+2*this.SCAN_RADIUS+1){
                let center = [];
                if (i > this.Y_MAX) {
                    center[0] = this.Y_MAX;
                }
                if (j > this.X_MAX) {
                    center[1] = this.X_MAX;
                }
                rectangles.push({center: {x: center[1], y: center[0]},
                                 done: false});
            }
        }
        let this.rectangles = rectangles;
    }
}


function main(){
    // Connect
    await response = Server.init();
    let board;

    if (response.type=== "FAILURE"){
        console.log("Failed Init");
    }else {
        console.log("Init Success")

        // Board Setup
        board = class Board(response.constants);
    }



    // Go to corner

}

main();