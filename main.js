import Server from './server';


class Board{

    constructor(response, server){
	this.setup(response, server);
	this.enterLoop();
    }

    setup(response, server) {
        console.log(this.response);
        this.constants = response.constants;
        this.server = server;
        this.response = response;

        this.binOrganicContents =0;
        this.binRecycleContents = 0;
        this.binGarbageContents =0;

        this.holdingOrganic = 0;
        this.holdingRecycle = 0;
        this.holdingGarbage = 0;

        this.depositedOrganic = 0;
        this.depositedRecycle = 0;
        this.depositedGarbage = 0;

        this.totalPickup = this.constants.TOTAL_COUNT.ORGANIC + this.constants.TOTAL_COUNT.RECYCLE + this.constants.TOTAL_COUNT.TRASH;

        this.createSections();
        this.pickCorner();
    }

    async enterLoop() {
        // Search and Pickup
        while((this.depositedGarbage + this.depositedOrganic + this.depositedRecycle)< this.totalPickup){

            // Next Rect to search
            let dest = this.nextRect();
            let rectClear = false;
            this.move(dest.x,dest.y);

            this.response = await this.server.getInstance();

            // Scan Rect
            this.server.scanArea();
            this.response = await this.server.getInstance();

            while(!rectClear){
                // Pick up all items
                this.collectRect();


                //Move back to center
                this.move(dest.x,dest.y);
                this.response = await this.server.getInstance();

                // Scan Rect to see if there was any overlap
                this.server.scanArea();
                this.response = await this.server.getInstance();

                rectClear = this.checkClear();
            }

        }
    }

    async goToBin(type) {
        if (type == "ORGANIC") {
            await this.move(this.constants.BIN_LOCATION.ORGANIC.x, this.constants.BIN_LOCATION.ORGANIC.y);
        } else if (type == "RECYCLE") {
            await this.move(this.constants.BIN_LOCATION.RECYCLE.x, this.constants.BIN_LOCATION.RECYCLE.y);
        } else if (type == "GARBAGE") {
            await this.move(this.constants.BIN_LOCATION.GARBAGE.x, this.constants.BIN_LOCATION.GARBAGE.y);
        }
        await this.unloadItems();
    }

    async unloadItems() {
        if (this.constants.BIN_LOCATION.ORGANIC.x == this.response.location.x && this.constants.BIN_LOCATION.ORGANIC.y == this.response.location.y) {
            this.response.itemsHeld.forEach(async (item) => {
                if (item.type == "ORGANIC") {
                    await this.server.unloadItem(item.id);
                }
            });
        }
        else if (this.constants.BIN_LOCATION.GARBAGE.x == this.response.location.x && this.constants.BIN_LOCATION.GARBAGE.y == this.response.location.y) {
            this.response.itemsHeld.forEach(async (item) => {
                if (item.type == "GARBAGE") {
                    await this.server.unloadItem(item.id);
                }
            });
        } else if (this.constants.BIN_LOCATION.RECYCLE.x == this.response.location.x && this.constants.BIN_LOCATION.RECYCLE.y == this.response.location.y) {
            this.response.itemsHeld.forEach(async (item) => {
                if (item.type == "RECYCLE") {
                    await this.server.unloadItem(item.id);
                }
            });
        }
    }

    async collectItems() {
    // PLEASE NOTE
    // PLEASE NOTE
    // itemsLocated may change after every scan, may want array of known item
    // PLEASE NOTE
    // PLEASE NOTE
        this.response.itemsLocated.forEach(async (item) => {
            if (item.x == this.response.location.x && item.y == this.response.location.y) {
                await this.server.collectItem(item.id);
            }
        });
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

    async move(destX, destY) {
      // move north optimized for current direction
      if (this.response.direction == "N") {
        if (this.response.location.y < destY) {
          for (let i = 0; i < destY - this.response.location.y; i++) {
            await this.server.move();
          }
        }
      }
      // move east optimized for current direction
      else if (this.response.direction == "E") {
        if (this.response.location.x < destX) {
          for (let i = 0; i < destX - this.this.response.location.x; i++) {
            await this.server.move();
          }
        }
      }
      // move west optimized for current direction
      else if (this.response.direction == "W") {
        if (this.response.location.x > destX) {
          for (let i = 0; i < this.response.location.x - destX; i++) {
            await this.server.move();
          }
        }
      }
      // move south optimized for current direction
      else if (this.response.direction == "S") {
        if (this.response.location.y > destY) {
          for (let i = 0; i < this.response.location.y - destY; i++) {
            await this.server.move();
          }
        }
      }
      // move North if still required
      if (this.response.location.y < destY) {
        await this.server.turn('N');
        for (let i = 0; i < destY - this.response.location.y; i++) {
          await this.server.move();
        }
      }
      // move South if still required
      if (this.response.location.y > destY) {
        await this.server.turn('S');
        for (let i = 0; i < this.response.location.y - destY; i++) {
          await this.server.move();
        }
      }
      // move East if still required
      if (this.response.location.x < destX) {
        await this.server.turn('E');
        for (let i = 0; i < destX - this.response.location.x; i++) {
          await this.server.move();
        }
      }
      // move West if still required
      if (this.response.location.x > destX) {
        await this.server.turn('W');
        for (let i = 0; i < this.response.location.x - destX; i++) {
          await this.server.move();
        }
      }

      // Update board state
      this.response = await this.server.getInstance();
	console.log("After move:");
      console.log(this.response);
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

        this.move(destX,destY);

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


    collectRect(){
        // Pickup all items in rect
    }

    checkClear(){
        // Check if a rectanlge has had all items picked up

    }

}


async function main(){

    const server = new Server();
    let response = await server.deleteInstance();
    let board;

    // Connect
    try{
        response = await server.init();


        // Board setup
        board = new Board(response, server);
    } catch (err){
        console.log(err);
    }

    // Go to corner

}

main();
