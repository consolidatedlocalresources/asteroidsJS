const FPS = 30; // frames per second
        const FRICTION = 0.7; // friction coefficient of space (0 = no frictiom, 1 = lots of friction)
        const LASER_DIST = 0.6; // max distance laser can travel as fraction of screen width
        const LASER_MAX = 10; // maximum number of lasers on screen at once
        const LASER_SPD = 500; // speed of lasers in pixels per second
        const ROIDS_NUM = 3; // starting number of asteroids
        const ROIDS_JAG = .4; // jaggedness of the asteroids(0 = none, 1 = lots)
        const ROIDS_SIZE = 100; // starting size of asteroids in pixels
        const ROIDS_SPD = 50; // max starting speed of asteroids in pixels per second
        const ROIDS_VERT = 10; // the average number of vertices on each asteroid
        const SHIP_SIZE = 30; //ship height in pixels
        const SHIP_BLINK_DUR = 0.1; // duration of the ship's blink during invisibility in seconds
        const SHIP_EXPLODE_DUR = 0.3; // duration of the ship explosion
        const SHIP_INV_DUR = 3; // duration of the ship's invisibility in seconds
        const SHIP_THRUST = 5; // accelerating of the ship in pixels per second per second
        const TURN_SPEED = 360; // turn speed in degrees per second
        const SHOW_BOUNDING = false; // show or hide collision bounding

        /** @type {HTMLCanvasElement} */
        let canv = document.getElementById("gameCanvas"); // create the canvas in JavaScript
        let ctx = canv.getContext("2d"); // Create a controller for the entire context of the changing canvas
        
        // set up our space ship object
        let ship = newShip();

        // set up asteroids
        let roids = [];
        createAsteroidBelt();

        // set up event handlers
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp)

        // set up the game loop
        setInterval(update, 1000 / FPS);

        function createAsteroidBelt() {
            roids = [];
            let x, y;
            for (let i = 0; i < ROIDS_NUM; i++) {
                do {
                x = Math.floor(Math.random() * canv.width);
                y = Math.floor(Math.random() * canv.height);
                } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
                roids.push(newAsteroid(x, y));
            }
        }

        function distBetweenPoints(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        function explodeShip() {
                ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
            }

                /*ctx.fillStyle = "lime"; STYLE USED TO DEMONSTRATE DETECTION CAPABILITIES
                ctx.strokeStyle = "lime";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.stroke();*/

        function keyDown(/** @type {KeyboardEvent} */ ev) {
            switch(ev.keyCode) {
                case 32: // space bar (shoot laser)
                    shootLaser();
                    break;
                case 37: // left arrow (rotate ship left)
                    ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
                    break;
                case 38: // up arrow (thrust the ship forward)
                    ship.thrusting = true;
                    break;
                case 39: // right arrow (rotate ship right)
                    ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
                    break;
                }
        }

        function keyUp(/** @type {KeyboardEvent} */ ev) {
            switch(ev.keyCode) {
                case 32: // space bar (allow shooting again)
                    ship.canShoot = true; 
                    break;
                case 37: // left arrow (stop rotating left)
                    ship.rot = 0;
                    break;
                case 38: // up arrow (stop thrusting)
                    ship.thrusting = false;
                    break;
                case 39: // right arrow (stop rotating right)
                    ship.rot = 0;
                    break;
                }
        }

        function newAsteroid(x, y) {
            let roid = {
                x: x,
                y: y,
                xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
                yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
                r: ROIDS_SIZE / 2,
                a: Math.random() * Math.PI * 2, // in radians
                vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
                offs: []
            }

            // create the vertex offset array
            for (let i = 0; i < roid.vert; i++) {
                roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
            }

            return roid;
        }

        function newShip() {
            return {
                x: canv.width / 2,
                y: canv.height / 2,
                r: SHIP_SIZE / 2,
                a: 90 / 180 * Math.PI,
                blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
                blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
                canShoot: true,
                explodeTime: 0,
                lasers: [],
                rot: 0, // convert to radians
                thrusting: false,
                thrust: {
                    x: 0,
                    y: 0
                }
            }
        }

        function shootLaser() {
            // create laser object
            if (ship.canShoot && ship.lasers.length < LASER_MAX) { // from the nose of the ship
                ship.lasers.push({
                    x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                    y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
                    xv: LASER_SPD * Math.cos(ship.a) / FPS,
                    yv: -LASER_SPD * Math.sin(ship.a) / FPS,
                    dist: 0
                });
            }

            // prevent further shooting
            ship.canShoot = false;
        }

        function update() {
            let blinkOn = ship.blinkNum  % 2 == 0;
            let exploding = ship.explodeTime > 0;

            // draw space background
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canv.width, canv.height);

            // thrust the ship
            if (ship.thrusting) {
                ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
                ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

                // draw the thruster
                if (!exploding && blinkOn) {
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = SHIP_SIZE / 10;
                    ctx.beginPath();
                    ctx.moveTo( // rear left
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
                    );
                    ctx.lineTo( // rear center behind the ship
                        ship.x - ship.r * 7 / 3 * Math.cos(ship.a),
                        ship.y + ship.r * 7 / 3 * Math.sin(ship.a)
                    );
                    ctx.lineTo( // rear right
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
                    );
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            } else {
                ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
                ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
            }

            // draw triangular ship
            if (!exploding) {
                if (blinkOn) {
                    ctx.strokeStyle = "white";
                    ctx.lineWidth = SHIP_SIZE / 20;
                    ctx.beginPath();
                    ctx.moveTo( // nose of the ship
                        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
                    );
                    ctx.lineTo( // rear left
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
                    );
                    ctx.lineTo( // rear right
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
                    );
                    ctx.closePath();
                    ctx.stroke();
                }

                // handle blinking
                if (ship.blinkNum > 0) {
                    // reduce the blink time
                    ship.blinkTime--;

                    // reduce the blinkNum
                    if (ship.blinkTime == 0) {
                        ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                        ship.blinkNum--;
                    }
                }
            } else {
                // draw the explosion
                ctx.fillStyle = "darkred";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "orange";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 1, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "yellow";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 0.7, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(ship.x, ship.y, ship.r * 0.4, 0, Math.PI * 2, false);
                ctx.fill();
            }

            if (SHOW_BOUNDING) {
                    ctx.strokeStyle = "lime";
                    ctx.beginPath();
                    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
                    ctx.stroke();
                }

            // draw the asteroids
            let x, y, r, a, vert, offs;
            for (let i = 0; i < roids.length; i++) {
                ctx.lineWidth = SHIP_SIZE / 20;
                ctx.strokeStyles = "slategrey";
                
                // get the asteroids properties
                x = roids[i].x;
                y = roids[i].y;
                r = roids[i].r;
                a = roids[i].a;
                vert = roids[i].vert;
                offs = roids[i].offs;

                // draw a path
                ctx.beginPath();
                ctx.moveTo(
                    x + r * offs[0] * Math.cos(a),
                    y + r * offs[0] * Math.sin(a),
                );

                // draw the polygon
                for (let j = 1; j < vert; j++) {
                    ctx.lineTo(
                        x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                        y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
                    );
                }
                ctx.closePath();
                ctx.stroke();

                if (SHOW_BOUNDING) {
                    ctx.strokeStyle = "lime";
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2, false);
                    ctx.stroke();
                }
            }

            // move the asteroid 
            for (let i = 0; i < roids.length; i++) {
                roids[i].x += roids[i].xv;
                roids[i].y += roids[i].yv;

                // handle edge of screen
                if (roids[i].x < 0 - roids[i].r) {
                    roids[i].x = canv.width + roids[i].r;
                } else if (roids[i].x > canv.width + roids[i].r) {
                    roids[i].x = 0 - roids[i].r;
                }
                if (roids[i].y < 0 - roids[i].r) {
                    roids[i].y = canv.height + roids[i].r;
                } else if (roids[i].y > canv.height + roids[i].r) {
                    roids[i].y = 0 - roids[i].r;
                }
            }

            // draw the lasers 
            for (let i = 0; i < ship.lasers.length; i++) {
                ctx.fillStyle = "salmon";
                ctx.beginPath();
                ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
                ctx.fill();
            }

            // detect laser hits on asteroids
            let ax, ay, ar, lx, ly;
            for (let i = roids.length - 1; i >= 0; i--) {

                // grab the asteroid properties
                ax = roids[i].x;
                ay = roids[i].y;
                ar = roids[i].r;

                // loop over the lasers 
                for (let j = ship.lasers.length - 1; j >= 0; j--) {

                    // grab the lasers properties
                    lx = ship.lasers[j].x;
                    ly = ship.lasers[j].y;

                    // detect hits
                    if (distBetweenPoints(ax, ay, lx, ly) < ar) {

                        // remove laser
                        ship.lasers.splice(j, 1);

                        // remove the asteroid
                        destroyAsteroid();

                        break;
                    }
                }
            }

            // check for asteroid collisions
            if (!exploding) {
                if (ship.blinkNum == 0) {
                    for (let i = 0; i < roids.length; i++) {
                        if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                            explodeShip();
                        }
                    }
                }

                // rotate ship
                ship.a += ship.rot;

                // move ship
                ship.x += ship.thrust.x;
                ship.y += ship.thrust.y;
            } else {
                ship.explodeTime--;

                if (ship.explodeTime == 0) {
                    ship = newShip();
                }
            }

            // move the lasers
            for (let i = ship.lasers.length - 1; i >= 0; i--) {

                // check distance traveled
                if (ship.lasers[i].dist > LASER_DIST * canv.width) {
                    ship.lasers.splice(i, 1);
                    continue;
                }

                // move the laser
                ship.lasers[i].x += ship.lasers[i].xv;
                ship.lasers[i].y += ship.lasers[i].yv;

                // calculate distance traveled
                ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));

                // handle edge of screen
                if (ship.lasers[i].x < 0) {
                    ship.lasers[i].x = canv.width;
                } else if (ship.lasers[i].x > canv.width) {
                    ship.lasers[i].x = 0;
                }
                if (ship.lasers[i].y < 0) {
                    ship.lasers[i].y = canv.height;
                } else if (ship.lasers[i].y > canv.height) {
                    ship.lasers[i].y = 0;
                }
            }

            // handle edge of screen
            if (ship.x < 0 - ship.r) {
                ship.x = canv.width + ship.r;
            } else if (ship.x > canv.width + ship.r) {
                ship.x = 0 - ship.r;
            }
            if (ship.y < 0 - ship.r) {
                ship.y = canv.height + ship.r;
            } else if (ship.y > canv.height + ship.r) {
                ship.y = 0 - ship.r;
            }

            // center dot
            ctx.fillStyle = "red";
            // ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
        }