import Server from './server';


class Board{

    constructor(constants){
        this.constants = constants;

        this.binOrganicContents =0;
        this.binRecycleContents = 0;
        this.binTrashContents =0;
        board.createSections();
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
}


async function main(){

    const server = new Server();
    // Connect
    try{
        let response = await server.init();
        let board;

        if (response.Response.type === "FAILURE"){
            console.log("Failed Init");
        }else {
            console.log("Init Success")

            // Board Setup
            board = new Board(response.constants);
        }
    } catch (err){
        console.log(err);
    }



    // Go to corner

}

main();