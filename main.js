import Server from './server';

class Board {
    constructor(response, server) {
        this.setup(response, server).then(this.enterLoop());
        //this.enterLoop();
    }

    async setup(response, server) {
        console.log(response);
        this.constants = response.constants;
        this.server = server;
        this.response = response;

        this.binOrganicContents = 0;
        this.binRecycleContents = 0;
        this.binGarbageContents = 0;

        this.holdingOrganic = 0;
        this.holdingRecycle = 0;
        this.holdingGarbage = 0;

        this.depositedOrganic = 0;
        this.depositedRecycle = 0;
        this.depositedGarbage = 0;

        this.totalPickup = this.constants.TOTAL_COUNT.ORGANIC + this.constants.TOTAL_COUNT.RECYCLE + this.constants.TOTAL_COUNT.GARBAGE;

        this.createSections();
        await this.pickCorner();
    }

    async enterLoop() {
        // Search and Pickup
        while ((this.response.itemsCollected.length + this.response.itemsHeld.length + this.response.itemsBin.length) < this.totalPickup) {

            let binStatus = this.shouldVisitBins();

            if (binStatus.garbage) {
                this.goToBin("GARBAGE");
            }
            if (binStatus.recycle) {
                this.goToBin("RECYCLE");

            }
            if (binStatus.organic) {
                this.goToBin("ORGANIC");
            }

            // Next Rect to search
            let dest = this.nextRect();
            if (dest === null) {
                this.response = await this.server.getInstance();
                break;
            }
            let rectClear = false;
            await this.move(dest.x, dest.y);

            this.response = await this.server.getInstance();

            // Scan Rect
            await this.server.scanArea();
            this.response = await this.server.getInstance();

            while (!rectClear) {
                // Pick up all items
                await this.collectRect(dest);


                //Move back to center
                await this.move(dest.x, dest.y);
                this.response = await this.server.getInstance();

                // Scan Rect to see if there was any overlap
                await this.server.scanArea();
                this.response = await this.server.getInstance();

                rectClear = this.checkClear();
            }

        }
        console.log("EXIT WHILE");
        await this.finalDropOff();
    }

    async finalDropOff() {
        let organicsDone = false;
        let garbageDone = false;
        let recycleDone = false;
        while (!organicsDone && !garbageDone && !recycleDone) {
            organicsDone = true;
            garbageDone = true;
            recycleDone = true;
            for (let i = 0; i < this.response.itemsHeld.length; i++) {
                if (this.response.itemsHeld[i].type == "ORGANIC") {
                    organicsDone = false;
                } else if (this.response.itemsHeld[i].type == "GARBAGE") {
                    garbageDone = false;
                } else if (this.response.itemsHeld[i].type == "RECYCLE") {
                    recycleDone = false;
                }
            }
            let organicsDist = 0;
            let garbageDist = 0;
            let recycleDist = 0;
            if (!organicsDone) {
                organicsDist = Math.abs(this.response.location.x - this.constants.BIN_LOCATION.ORGANIC.x) + Math.abs(this.response.location.y - this.constants.BIN_LOCATION.ORGANIC.y);
            } else { organicsDist = Infinity }
            if (!garbageDone) {
                garbageDist = Math.abs(this.response.location.x - this.constants.BIN_LOCATION.GARBAGE.x) + Math.abs(this.response.location.y - this.constants.BIN_LOCATION.GARBAGE.y);
            } else { garbageDist = Infinity }
            if (!recycleDone) {
                recycleDist = Math.abs(this.response.location.x - this.constants.BIN_LOCATION.RECYCLE.x) + Math.abs(this.response.location.y - this.constants.BIN_LOCATION.RECYCLE.y);
            } else { recycleDist = Infinity }
            let min = Math.min(organicsDist, garbageDist, recycleDist)
            if (!organicsDone && organicsDist === min) {
                await this.goToBin("ORGANIC");
                organicsDone = true;
            } else if (!garbageDone && garbageDist === min) {
                await this.goToBin("GARBAGE");
                garbageDone = true;
            } else if (!recycleDone && recycleDist === min) {
                await this.goToBin("RECYCLE");
                recycleDone = true;
            }
            this.response = await this.server.getInstance();
        }
        console.log(this.response);
        await this.server.finish();
    }

    async goToBin(type) {
        if (type == "ORGANIC") {
            await this.move(this.constants.BIN_LOCATION.ORGANIC.x, this.constants.BIN_LOCATION.ORGANIC.y);
        } else if (type == "RECYCLE") {
            await this.move(this.constants.BIN_LOCATION.RECYCLE.x, this.constants.BIN_LOCATION.RECYCLE.y);
        } else if (type == "GARBAGE") {
            await this.move(this.constants.BIN_LOCATION.GARBAGE.x, this.constants.BIN_LOCATION.GARBAGE.y);
        }
        this.response = await this.server.getInstance();
        await this.unloadItems();
        this.response = await this.server.getInstance();
    }

    async unloadItems() {
        let binOrganics = 0;
        let binGarbage = 0;
        let binRecycle = 0;
        for (let i = 0; i < this.response.itemsBin.length; i++) {
            if (this.response.itemsBin[i].type === "ORGANIC") {
                binOrganics++;
            } else if (this.response.itemsBin[i].type === "GARBAGE") {
                binGarbage++;
            } else if (this.response.itemsBin[i].type === "RECYCLE") {
                binRecycle++;
            }
        }
        if (this.constants.BIN_LOCATION.ORGANIC.x == this.response.location.x && this.constants.BIN_LOCATION.ORGANIC.y == this.response.location.y) {
            for (let i = 0; i < this.response.itemsHeld.length; i++) {
                if (binOrganics >= this.constants.BIN_CAPACITY.ORGANIC) {
                    break;
                }
                if (this.response.itemsHeld[i].type == "ORGANIC") {
                    binOrganics++;
                    await this.server.unloadItem(this.response.itemsHeld[i].id);
                }
            }
            this.response = await this.server.getInstance();
            // this.response.itemsHeld.forEach(async (item) => {
            //     if (item.type == "ORGANIC") {
            //         await this.server.unloadItem(item.id);
            //     }
            // });
        }
        else if (this.constants.BIN_LOCATION.GARBAGE.x == this.response.location.x && this.constants.BIN_LOCATION.GARBAGE.y == this.response.location.y) {
            for (let i = 0; i < this.response.itemsHeld.length; i++) {
                if (binGarbage >= this.constants.BIN_CAPACITY.GARBAGE) {
                    break;
                }
                if (this.response.itemsHeld[i].type == "ORGANIC") {
                    binGarbage++;
                    await this.server.unloadItem(this.response.itemsHeld[i].id);
                }
            }
            this.response = await this.server.getInstance();
            // this.response.itemsHeld.forEach(async (item) => {
            //     if (item.type == "GARBAGE") {
            //         await this.server.unloadItem(item.id);
            //     }
            // });
        } else if (this.constants.BIN_LOCATION.RECYCLE.x == this.response.location.x && this.constants.BIN_LOCATION.RECYCLE.y == this.response.location.y) {
            for (let i = 0; i < this.response.itemsHeld.length; i++) {
                if (binRecycle >= this.constants.BIN_CAPACITY.RECYCLE) {
                    break;
                }
                if (this.response.itemsHeld[i].type == "RECYCLE") {
                    binRecycle++;
                    await this.server.unloadItem(this.response.itemsHeld[i].id);
                }
            }
            this.response = await this.server.getInstance();
            // this.response.itemsHeld.forEach(async (item) => {
            //     if (item.type == "RECYCLE") {
            //         await this.server.unloadItem(item.id);
            //     }
            // });
        }
    }

    async collectItems() {
        // PLEASE NOTE
        // PLEASE NOTE
        // itemsLocated may change after every scan, may want array of known item
        // PLEASE NOTE
        // PLEASE NOTE
        for (const item of this.response.itemsLocated) {
            if (item.x == this.response.location.x && item.y == this.response.location.y) {
                if (item.coveredBy === undefined) {
                    await this.server.collectItem(item.id);
                }
            }
        }
        this.response = await this.server.getInstance();
        for (const item of this.response.itemsLocated) {
            if (item.x == this.response.location.x && item.y == this.response.location.y) {
                await this.collectItems();
                break;
            }
        }
        this.response = await this.server.getInstance();
    }

    updateBoard(response) {
        this.response = response;
    }

    createSections() {
        let rectangles = [];
        const X_MIN = this.constants.ROOM_DIMENSIONS.X_MIN;
        const X_MAX = this.constants.ROOM_DIMENSIONS.X_MAX;
        const Y_MIN = this.constants.ROOM_DIMENSIONS.Y_MIN;
        const Y_MAX = this.constants.ROOM_DIMENSIONS.Y_MAX;
        const SCAN_RADIUS = this.constants.SCAN_RADIUS;
        for (let i = Y_MIN + 1; i < Y_MAX + 3; i += 3) {
            for (let j = X_MIN + SCAN_RADIUS; j < X_MAX + 2 * SCAN_RADIUS + 1; j += 2 * SCAN_RADIUS + 1) {
                const x = Math.min(j, X_MAX);
                const y = Math.min(i, Y_MAX);
                rectangles.push({
                    center: { x: x, y: y },
                    done: false
                });
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

    async pickCorner() {

        let destY = 0;
        let destX = 0;

        //Top
        if (this.response.location.y >= (this.constants.ROOM_DIMENSIONS.Y_MAX - this.constants.ROOM_DIMENSIONS.Y_MIN) / 2) {
            for (let i = 0; i < this.rectangles.length; i++) {
                destY = Math.max(destY, this.rectangles[i].center.y);
            }
            //Bottom
        } else {
            destY = this.constants.ROOM_DIMENSIONS.Y_MIN +1;
        }

        //Right
        if (this.response.location.x >= (this.constants.ROOM_DIMENSIONS.X_MAX - this.constants.ROOM_DIMENSIONS.X_MIN) / 2) {
            for (let i = 0; i < this.rectangles.length; i++) {
                destX = Math.max(destX, this.rectangles[i].center.x);
            }
            //Left
        } else {
            destX = this.constants.ROOM_DIMENSIONS.X_MIN + this.constants.SCAN_RADIUS;
        }

        await this.move(destX, destY);

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
        return { "x": x, "y": y };
    }


    /**
     * Collects all items inside a rectangle.
     */
    async collectRect(rectCenter) {
        while (true) {
            if (this.response.itemsLocated.length === 0) {
                return;
            }
            // Pickup all items in rect
            let shortestDistance = null;
            let x;
            let y;
            this.response.itemsLocated.forEach((item) => {
                let distance = Math.abs(this.response.location.x - item.x) + Math.abs(this.response.location.y = item.y);
                if (this.insideRect(rectCenter, item.x, item.y) && (shortestDistance === null || distance < shortestDistance)) {
                    shortestDistance = distance;
                    x = item.x;
                    y = item.y;
                }
            });
            if (shortestDistance != null) {
                // All items in rectangle collected
                return;

            // Move to the closest item and collect all possible items there
            await this.move(x, y);
            await this.collectItems();s
            this.response = await server.getInstance();
        }

    }
}

    insideRect(rectCenter, x, y) {
        return (y <= rectCenter.y + 1) && (y <= rectCenter.y - 1)
            && (x <= rectCenter.x + this.response.SCAN_RADIUS - 1)
            && (x >= rectCenter.x - this.response.SCAN_RADIUS + 1);
    }

    /**
     * Checks if the current rectangle has no more items remaining.
     * @returns True if clear, false otherwise.
     */
    checkClear() {
        const x = this.response.location.x;
        const y = this.response.location.y;
        const height = 3;
        const width = 2 * this.response.constants.SCAN_RADIUS - 1;
        const dimensions = this.response.constants.ROOM_DIMENSIONS;
        const minX = Math.max(x - Math.floor(height / 2), dimensions.X_MIN);
        const maxX = Math.min(x + Math.floor(height / 2), dimensions.X_MAX);
        const minY = Math.max(y - Math.floor(width / 2), dimensions.Y_MIN);
        const maxY = Math.min(y + Math.floor(width / 2), dimensions.Y_MAX);
        for (const item of this.response.itemsLocated) {
            if (item.x >= minX && item.x <= maxX && item.y >= minY && item.y <= maxY) {
                return false;
            }
        }
        return true;
    }

    shouldVisitBins() {
        let destBin = { recycle: false, organic: false, garbage: false };
        let organicHeld = 0;
        let garbageHeld = 0;
        let recycleHeld = 0;

        let organicBin = 0;
        let recycleBin = 0;
        let garbageBin = 0;

        for (const item of this.response.itemsHeld) {
            if (item.type == "ORGANIC") {
                organicHeld++;
            } else if (item.type == "GARBAGE") {
                garbageHeld++;
            } else if (item.type == "RECYCLE") {
                recycleHeld++;
            }
        }

        for (const item of this.response.itemsBin) {
            if (item.type == "ORGANIC") {
                organicBin++;
            } else if (item.type == "GARBAGE") {
                garbageBin++;
            } else if (item.type == "RECYCLE") {
                recycleBin++;
            }
        }

        if (organicHeld + organicBin >= this.response.constants.BIN_CAPACITY.ORGANIC && organicBin / this.response.constants.BIN_CAPACITY.ORGANIC < 0.75) {
            destBin.organic = true;
        } else if (garbageHeld + garbageBin >= this.response.constants.BIN_CAPACITY.GARBAGE && garbageBin / this.response.constants.BIN_CAPACITY.GARBAGE < 0.75) {
            destBin.garbage = true;
        } else if (recycleHeld + recycleBin >= this.response.constants.BIN_CAPACITY.RECYCLE && recycleBin / this.response.constants.BIN_CAPACITY.RECYCLE < 0.75) {
            destBin.recycle = true;
        }

        return destBin;
    }
}

async function main() {
    try {
        const server = new Server();
        await server.deleteInstance();
        const response = await server.init();
        new Board(response, server);
    } catch (err) {
        console.log(err);
    }
}

main();
