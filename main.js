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

        let destY = 0;
        let destX = 0;

        //Top
        if(this.response.location.y >= (this.constants.Y_MAX-this.constants.Y_MIN)/2){
            for(let i =0; i < this.rectangles.length; i++){
                destY = Math.max(destY, this.rectangles[i].center.y);
            }
        //Bottom
        } else {
            destY = 2;
        }

        //Right
        if(this.response.location.x >= (this.constants.X_MAX-this.constants.X_MIN)/2){
            for(let i =0; i < this.rectangles.length; i++){
                destY = Math.max(destX, this.rectangles[i].center.x);
            }
        //Left
        }else {
            destX = this.constants.SCAN_RADIUS + 1;
        }
    }

    async move(destX, destY, response) {
      // move north optimized for current direction
      if (response.direction == "N") {
        if (response.location.y < destY) {
          for (let i = 0; i < destY - response.location.y; i++) {
            await server.move();
          }
        }
      }
      // move east optimized for current direction
      else if (response.direction == "E") {
        if (response.location.x < destX) {
          for (let i = 0; i < destX - response.location.x; i++) {
            await server.move();
          }
        }
      }
      // move west optimized for current direction
      else if (response.direction == "W") {
        if (response.location.x > destX) {
          for (let i = 0; i < response.location.x - destX; i++) {
            await server.move();
          }
        }
      }
      // move south optimized for current direction
      else if (response.direction == "S") {
        if (response.location.y > destY) {
          for (let i = 0; i < response.location.y - destY; i++) {
            await server.move();
          }
        }
      }
      // move North if still required
      if (response.location.y < destY) {
        await server.rotate('N');
        for (let i = 0; i < destY - response.location.y; i++) {
          await server.move();
        }
      }
      // move South if still required
      if (response.location.y > destY) {
        await server.rotate('S');
        for (let i = 0; i < response.location.y - destY; i++) {
          await server.move();
        }
      }
      // move East if still required
      if (response.location.x < destx) {
        await server.rotate('E');
        for (let i = 0; i < destx - response.location.x; i++) {
          await server.move();
        }
      }
      // move West if still required
      if (response.location.x > destx) {
        await server.rotate('W');
        for (let i = 0; i < response.location.x - destx; i++) {
          await server.move();
        }
      }
    }

    /**
     * Returns x, y of next rectangle center to go to.
     * Returns null if all rectangles done.
     */
    nextRect() {
	let shortestDistance = null;
	let x;
	let y;
	for (let i = 0; i < this.rectangles.length; i++) {
	    let distance = Math.abs(this.response.location.x - this.rectangles[i].center.x) + Math.abs(this.response.location.y = this.rectangles[i].center.y);
	    if (!this.rectangles[i].done && (shortestDistance === null || distance < shortestDistance)) {
		shortestDistance = distance;
		x = this.rectangles[i].center.x;
		y = this.rectangles[i].center.y;
	    }
	}
	if (shortestDistance === null) {
	    return null;
	}
	return {"x": x, "y": y};
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
