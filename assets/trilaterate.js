const SCALE = 36;
const dispSize = window.innerHeight - 100;
const root = document.querySelector(':root');
const message = document.getElementById('message');
const satHeight = 10;

const sat1 = { x: 0, y: 18 };
const sat2 = { x: 36, y: 0 };
const sat3 = { x: 36, y: 36 };

function trilaterate(d1h, d2h, d3h) {
    const d1 = Math.sqrt((d1h * d1h) - (satHeight * satHeight));
    const d2 = Math.sqrt((d2h * d2h) - (satHeight * satHeight));
    const d3 = Math.sqrt((d3h * d3h) - (satHeight * satHeight));

    // Reference points

    // Squared distances
    const d1sq = d1 * d1;
    const d2sq = d2 * d2;
    const d3sq = d3 * d3;

    // Pre-compute constants
    const A = 2 * (sat2.x - sat1.x);
    const B = 2 * (sat2.y - sat1.y);
    const C = d1sq - d2sq - sat1.x * sat1.x + sat2.x * sat2.x - sat1.y * sat1.y + sat2.y * sat2.y;

    const D = 2 * (sat3.x - sat1.x);
    const E = 2 * (sat3.y - sat1.y);
    const F = d1sq - d3sq - sat1.x * sat1.x + sat3.x * sat3.x - sat1.y * sat1.y + sat3.y * sat3.y;

    // Solving for x and y using the method of linear combinations
    const denominator = A * E - B * D;

    if (denominator === 0) {
        throw new Error("The given points do not form a solvable trilateration problem.");
    }

    const x = (C * E - F * B) / denominator;
    const y = (A * F - D * C) / denominator;

    return { x: x, y: y };
}

function setLine(satPos, position, id){
    var line=document.getElementById(id);
    
    let rise=satPos.y-position.y;
    let run=satPos.x-position.x;
    let slope=rise/run;
    const DEGREES=57.2957795;
    let width = dispSize / SCALE * Math.sqrt((rise*rise)+(run*run));
    let top

    if(id == 'line1') {
        top = dispSize / SCALE * satPos.y;
        left = dispSize / SCALE * satPos.x;
    } else {
        top = dispSize / SCALE * position.y;
        left = dispSize / SCALE * position.x;
    }

    line.style.top=top+'px';
    line.style.left=left+'px';
    line.style.width=width+"px";
    line.style.transform= "rotate("+(Math.atan(slope)*DEGREES)+"deg)";
    line.style.transformOrigin= "0 0";
}

// // Example usage:
// // Distances from the point to the reference points
// const d1 = 13; // Distance to (0, 18)
// const d2 = 18; // Distance to (0, 36)
// const d3 = 23; // Distance to (36, 36)

root.style.setProperty('--scale', SCALE);
root.style.setProperty('--dispSize', dispSize+'px');
root.style.setProperty('--sat1x', sat1.x);
root.style.setProperty('--sat1y', sat1.y);
root.style.setProperty('--sat2x', sat2.x);
root.style.setProperty('--sat2y', sat2.y);
root.style.setProperty('--sat3x', sat3.x);
root.style.setProperty('--sat3y', sat3.y);

function update() {
    try {
        let d1 = document.getElementById('dist1').value;
        let d2 = document.getElementById('dist2').value;
        let d3 = document.getElementById('dist3').value;

        const maxDist = Math.sqrt(SCALE * SCALE + SCALE * SCALE);
        const maxDistH = Math.sqrt((maxDist * maxDist) + (satHeight * satHeight));

        if (!d1 || !d2 || !d3) {
            message.innerHTML = 'One or more of the distances is blank!'
            root.style.setProperty('--disp','none');
        } else if (d1 < satHeight || d1 > maxDistH || d2 < satHeight || d2 > maxDistH || d3 < satHeight || d3 > maxDistH) {
            message.innerHTML = `Uh oh! One or more of the values is invalid! Values must be between ${satHeight} and ${Math.round(maxDistH * 10) / 10} inches.`
            root.style.setProperty('--disp','none');
        } else {
            message.innerHTML = 'Success!'
            console.log(d1 + ' ' + d2 + ' ' + d3)

            const position = trilaterate(d1, d2, d3);
            if(position.x < 0 || position.x > SCALE || position.y < 0 || position.y > SCALE) {
                message.innerHTML = `Uh oh! Result is not on the table!`
                root.style.setProperty('--disp','none');
            } else {
                root.style.setProperty('--disp','block');
                root.style.setProperty('--posX', position.x);
                root.style.setProperty('--posY', position.y);
                root.style.setProperty('--distA', `'${d1}'`);
                root.style.setProperty('--distB', `'${d2}'`);
                root.style.setProperty('--distC', `'${d3}'`);

                setLine({x: 0, y: 18}, position, 'line1');
                setLine({x: 36, y: 0}, position, 'line2');
                setLine({x: 36, y: 36}, position, 'line3');
            }
        }


    } catch (error) {
        console.error(error.message);
    }
}