import Server from './server';


class Board{

    constructor(response){
        this.constants = response.constants;

        this.binOrganicContents =0;
        this.binRecycleContents = 0;
        this.binTrashContents =0;

        this.updateBoard(response);
        this.createSections();
        this.pickCorner();
    }

    updateBoard(response){
        this.response = response;
    }

    createSections(){
        let rectangles = [];
        for(let i =this.Y_MIN+2; i < this.Y_MAX+3; i += 3) {
            for (let j = this.X_MIN+this.SCAN_RADIUS+1; j < this.X_MAX+2*this.SCAN_RADIUS+1;j+= 2*this.SCAN_RADIUS +1){
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
        this.rectangles = rectangles;
    }

    pickCorner(){
        let top = false;
        let right= false;
        let destY = 2;
        let destX = this.constants.SCAN_RADIUS + 1;

        //IMPLEMENT CLOSEST CORNER
        // if(this.response.location.y >= (this.constants.Y_MAX-this.constants.Y_MIN)/2){
        //     top = true;
        // }
        // if(this.response.location.x >= (this.constants.X_MAX-this.constants.X_MIN)/2){
        //     right = true;
        // }

        // if(right && top){
        //
        // }else if (!right && top) {
        //
        // }else if (right && !top) {
        //
        // } else{
        //      destY = 2;
        //      destX = this.constants.SCAN_RADIUS + 1;
        // }

        //Bottom

    }
}


async function main(){

    const server = new Server();
    let board;

    // Connect
    try{
        let response = await server.init();

        if (response.type === "FAILURE"){
            console.log("Failed Init");
        }else {
            console.log("Init Success")

            // Board setup
            board = new Board(response);
        }
    } catch (err){
        console.log(err);
    }

    // Go to corner

}

main();