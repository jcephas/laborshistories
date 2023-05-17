// css colors
const rootStyles = getComputedStyle(document.documentElement);
const colorTeal = rootStyles.getPropertyValue('--color-teal').trim();
const colorPink = rootStyles.getPropertyValue('--color-pink').trim();
const colorDawn = rootStyles.getPropertyValue('--color-dawn').trim();
const colorGray = rootStyles.getPropertyValue('--color-gray').trim();


// tab switcher
document.addEventListener("DOMContentLoaded", function () {
    
    // tabs
    const menuItems = document.querySelectorAll(".navmenu");
    const mapMenuItems = document.querySelectorAll(".mapmenu");

    // click listener
    menuItems.forEach((button) => {
        button.addEventListener("click", function () {
            const targetDiv = button.getAttribute("data-target");

            // hide all divs
            const allDivs = document.querySelectorAll(".section");
            allDivs.forEach((div) => {
                div.style.display = "none";
            });

            // show target div
            document.querySelector(targetDiv).style.display = "block";
            menuItems.forEach((button) => {
                button.classList.remove("activemenu");
            });
        button.classList.add("activemenu");
        });
    });
    
    // click listener for map menu
    mapMenuItems.forEach((button) => {
        button.addEventListener("click", function () {
            mapMenuItems.forEach((button) => {
                button.classList.remove("activemenu");
            });
        button.classList.add("activemenu");
        });
    });

    // show intro
    document.querySelector("#intro").style.display = "block";
    menuItems[0].classList.add("activemenu");
    mapMenuItems[0].classList.add("activemenu");
});




// bouncing balls
    // canvas
    var ballDiv = d3.select("#introcontainer"),
        ballDivNode = ballDiv.node();
    var ballWidth = ballDivNode.getBoundingClientRect().width,
        ballHeight = ballDivNode.getBoundingClientRect().height;
    var ballsvg = d3
        .select("#introcontainer")
        .append("svg")
        .attr("width", ballWidth)
        .attr("height", ballHeight)
        .attr("id", "introballs")
        .attr("viewBox", `0 0 ${ballWidth} ${ballHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    // import data
    Promise
        .all([
        d3.csv("img/SanFran.csv"), 
        d3.csv("img/SiliconValley.csv"), 
        d3.csv("img/NewYork.csv")
        ])
        .then(function (datasets) {
            var data = [];
            var idCounter = 0;
            var multi = 1;

        // place balls    
            datasets.forEach(function (dataset, index) {
                dataset.forEach(function (d) {
                    d.x = Math.random() * ballWidth;
                    d.vx = Math.random() * 2;
                    d.y = Math.random() * ballHeight;
                    d.vy = Math.random() * 2;
                    d.radius = index === 0 ? d.traffic * multi * 10 : index === 1 ? d.traffic * multi : index === 2 ? d.traffic * multi * 100 : 0;
                    d.id = idCounter++;
                    d.color = index === 0 ? colorTeal : index === 1 ? colorPink : index === 2 ? colorDawn : colorGray;
                    data.push(d);
                });
            });

        // circles from data
        var ballCircles = ballsvg
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .classed("dataBall", true)
            .attr("r", function(d) {
                return d.radius;
            })
            .style("fill", function(d) {
                return d.color;
            })
            .call(d3.drag()
                  .on("start", dragStart)
                  .on("drag", dragged)
                  .on("end", dragEnd));

        // labels from data
        var ballLabels = ballsvg
            .selectAll(null)
            .data(data)
            .enter()
            .append("text")
            .attr("text-anchor", "middle")
            .attr("font-size", "1em")
            .append("tspan")
            .text(function(d) {
            return d.name;
        });

        // bigger click area for small circles
        var circlesClick = ballsvg
            .selectAll(null)
            .data(data)
            .enter()
            .append("circle")
            .classed("clickBall", true)
            .attr("r", 25)
            .style("opacity",0)
            .call(d3.drag()
              .on("start", dragStart)
              .on("drag", dragged)
              .on("end", dragEnd));

        // ball movement simulation definition
        var simulation = d3
            .forceSimulation(data)
            .alphaMin(0)
            .velocityDecay(0)
            .force("ambient", d3.forceManyBody().strength(.1))
            .force("collision", d3.forceCollide().radius(function(d) {
              return d.radius;
            }))
            .force("attract", attractForce(""))
            .on("tick", ticktockBall);    

        // movement rules    
        const ballSpeedLimitValue = 2;    
        function speedLimit(d) {
          if (Math.abs(d.vx) > ballSpeedLimitValue) {
            d.vx = (d.vx > 0 ? ballSpeedLimitValue : -ballSpeedLimitValue);
          }
          if (Math.abs(d.vy) > ballSpeedLimitValue) {
            d.vy = (d.vy > 0 ? ballSpeedLimitValue : -ballSpeedLimitValue);
          }
        }  

        // time    
        function ticktockBall() {
        ballCircles
            .attr("cx", function(d) {
              if (d !== dragging) {
                if (d.x - d.radius <= 0 || d.x + d.radius >= ballWidth) {
                  d.vx = -d.vx;
                }
                speedLimit(d);
                d.x += d.vx;
                d.x = Math.max(d.radius, Math.min(ballWidth - d.radius, d.x));
              }
            return d.x;
            })
            .attr("cy", function(d) {
              if (d !== dragging) {
                if (d.y - d.radius <= 0 || d.y + d.radius >= ballHeight) {
                  d.vy = -d.vy;
                }
               speedLimit(d);
                d.y += d.vy;
                d.y = Math.max(d.radius, Math.min(ballHeight - d.radius, d.y));
              }
                return d.y;
            })

        ballLabels
            .classed("label", true)
            .attr("x", function(d) {
              return d.x;
            })
            .attr("y", function(d) {
              return d.y;
            });

        circlesClick
            .attr("cx", function(d) {
              return d.x;
            })
            .attr("cy", function(d) {
              return d.y;
            });
        }

        //drag interact
        var dragging = null;
        function dragStart(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
            d.lastX = d.x;
            d.lastY = d.y;
            dragging = d;
        }
        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
          d.vx = event.x - d.lastX;
          d.vy = event.y - d.lastY;
          d.lastX = event.x;
          d.lastY = event.y;
        }
        function dragEnd(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          dragging = null;
        }    

        //attract
        function attractForce(tag) {
            let strength = 1;
            let minDistance = 1;
            function force(alpha) {
                if (dragging) {
                  for (const d of nodes) {
                    if (d.tag !== "" && d.tag === dragging.tag && d !== dragging) {
                      const dx = dragging.x - d.x;
                      const dy = dragging.y - d.y;
                      const distance = Math.sqrt(dx * dx + dy * dy);
                      if (distance > minDistance) {
                        d.vx += (dx / distance) * strength * alpha;
                        d.vy += (dy / distance) * strength * alpha;
                      }
                    }
                  }
                }
            }
            force.initialize = function(_nodes) {
                nodes = _nodes;
            };
                let nodes;
                return force;
        }
    });
    // toggles
    function toggleText() {
        var textVisDiv = d3.selectAll("#introtext, #intronotes");
        var currentDisplay = textVisDiv.style("display");
        if (currentDisplay == "none") {
            textVisDiv.style("display", "block");
        } else {
            textVisDiv.style("display", "none");
        }
    };

    function toggleBalls() {
        var ballsVisDiv = d3.select("#introballs");
        var currentDisplay = ballsVisDiv.style("display");
        if (currentDisplay == "none") {
            ballsVisDiv.style("display", "block");
        } else {
            ballsVisDiv.style("display", "none");
        }
    };




// map
    var mapWidth = 800,
        mapHeight = 800;
    let ticktockInterval;

// projections
    var sfProjection = d3.geoMercator()
        .center([-122.404,37.778])
        .scale(1000000)
        .translate([mapWidth / 2, mapHeight / 2]);
    var nyProjection = d3.geoMercator()
        .center([-73.993,40.732])
        .scale(400000)
        .translate([mapWidth / 2, mapHeight / 2]);
    var svProjection = d3.geoMercator()
        .center([-122.176,37.481])
        .scale(65000)
        .translate([mapWidth / 2, mapHeight / 2]);

// draw map
function drawMap(csvFile, geojsonFile, projection, trafficMultiplier, bgLineWeight, yLabelLocation) {
    
    // remove old map
    d3.selectAll("#mapbox").selectAll("*").remove();
    d3.select("div.mapElement").remove();
    if(ticktockInterval) clearInterval(ticktockInterval);

    // canvas
    var mapsvg = d3
      .select("#mapbox")
      .append("svg")
      .attr("viewBox", `0 0 ${mapWidth} ${mapHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    var path = d3.geoPath().projection(projection);
    
    // import data
    d3.csv(csvFile)
        .then(function (data) {
        data.forEach(function (d) {
            d.lat = +d.lat;
            d.long = +d.long;
            d.traffic = + d.traffic;
            var coords = projection([d.long, d.lat]);
            d.x = coords[0];
            d.y = coords[1];
            d.radius = 10;
            d.isChanged = false; // for label colors
            d.influenceRadius = trafficMultiplier * d.traffic;
        });   
        
        // street background
        d3.json(geojsonFile)
            .then(function (geojson){
            mapsvg.selectAll(".streetbg")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("stroke", colorPink)
                .attr("fill", "none")
                .attr("stroke-width", bgLineWeight)
                .classed("streetbg", true);


        // influence circles (gravity effect)
        var influenceCircles = mapsvg
            .selectAll(".influenceCircle")
            .data(data)
            .enter()
            .append("circle")
            .classed("influenceCircle", true)
            .attr("r", function (d) {
                return d.influenceRadius;
            })
            .style("fill", colorDawn)
            .style("opacity", 0.2)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });    
            
        // circles from data
            var mapCircles = mapsvg
                .selectAll(".dataBall")
                .data(data)
                .enter()
                .append("circle")
                .classed("dataBall", true)
                .attr("r", function (d) {
                    return d.radius;
                })
                .style("fill", colorDawn)
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

        // labels from data
            var mapLabels = mapsvg
                .selectAll(null)
                .data(data)
                .enter()
                .append("text")
                .attr("text-anchor", "left")
                .attr("font-size", "1em")
                .attr("fill", function (d) { return d.isChanged ? colorTeal : colorDawn; })
                .attr("x", function(d) { return d.x + d.radius * 1.25; })
                .attr("y", function(d) { return d.y + yLabelLocation; })
                .text(function (d) {
                    return d.name;
                });

        // launch arrow definition
        var arrow = mapsvg
            .append("line")
            .attr("stroke", colorTeal)
            .attr("stroke-width", 3)
            .attr("marker-end", "url(#arrowhead)")
            .classed("arrow", true);
            
        mapsvg
            .append("defs")
            .append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("fill", colorTeal)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");
        
        // launch arrow updater    
        function updateArrow(mouseX,mouseY) {
            var arrowLength = 5;
            var shootingData = getShootingData(mouseX, mouseY, influencerBall);
            var arrowEndX = influencerBall.x + shootingData.unitVectorX * -shootingData.shootingSpeed * arrowLength;
            var arrowEndY = influencerBall.y + shootingData.unitVectorY * -shootingData.shootingSpeed * arrowLength;

            arrow
                .attr("x1", influencerBall.x)
                .attr("y1", influencerBall.y)
                .attr("x2", arrowEndX)
                .attr("y2", arrowEndY)
                .style("opacity", .5);
        }
        
        // interactive 'influencer' cue ball
        let influencer = d3.select("circle.influencerBall")    

        if (influencer.empty()) {
            influencer = mapsvg
                .append("circle")
                .attr("r", 20)
                .style("fill", colorTeal)
                .classed("influencerBall", true)
                .attr("cx", Math.random() * mapWidth)
                .attr("cy", Math.random() * mapHeight)
                .datum({vx: 0, vy: 0});
            var influencerBall = d3.select("circle.influencerBall").datum();
        };
        
        // collision & click counter
        var clickCount = 0;
        var collisionCount = 0;
        function incrementClick() {
          clickCount++;
          updateCounter();
        }
        function incrementCollision() {
          collisionCount++;
          updateCounter();
        }
        var counterText = mapsvg
            .append("text")
            .attr("x", mapWidth - 20)
            .attr("y", mapHeight - 20)
            .attr("text-anchor", "end")
            .style("fill", colorTeal)
            .style("font-size", "20px");
        function updateCounter() {
            var ratio = Math.round(collisionCount / clickCount * 100) / 100;
            counterText.text(collisionCount + " collisions / " + clickCount + " clicks = " + ratio + " engagement score");
        }
           
        // boundary box
        mapsvg.append("rect")
            .attr("width", mapWidth)
            .attr("height", mapHeight)
            .style("stroke", colorPink)
            .style("fill", "none")
            .style("stroke-width", 5);    
            
        // tooltips   
        function generateTooltipText(d) {
            let textLines = [];

            if (d.info) {
                textLines.push(`${d.name} is ${d.info}`);
            }
            if (d.traffic) {
                if (d.traffic < 1) {
                    textLines.push(`Its website has ${Math.round(d.traffic * 1000) / 10} million visits a day with users visting about ${Math.round(d.pages_visited * 10) / 10} pages.`);
                } else {
                textLines.push(`Its website has ${Math.round(d.traffic * 10) / 10} billion visits a day with users visting about ${Math.round(d.pages_visited * 10) / 10} pages.`);
                }
            }
            if (d.play_downloads) {
                if (d.play_downloads >= 1000) {
                textLines.push(`The ${d.name} app has over ${d.play_downloads / 1000} billion downloads on Google Play with ${Math.round(d.play_reviews * 10) / 10} million reviews.`);
                } else {
                textLines.push(`The ${d.name} app has over ${d.play_downloads} million downloads on Google Play with ${Math.round(d.play_reviews * 10) / 10} million reviews.`);    
                }
            }

            return textLines.join('<br/>');
        }    

        var tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("color", colorTeal)
            .style("background", colorDawn)
            .style("padding", "10px")
            .style("border-color", colorDawn)
            .style("border-radius", "10px")
            .style("pointer-events", "none")
            .style("visibility", "hidden")
            .classed("mapElement", true);    

    // simulation        
            
        // movement rules
        const mapSpeedLimitValue = 20;
        const speedThreshold = 2
        function speedLimit(d) {
            if (Math.abs(d.vx) > mapSpeedLimitValue) {
                d.vx = (d.vx > 0 ? mapSpeedLimitValue : -mapSpeedLimitValue);
            }
            if (Math.abs(d.vy) > mapSpeedLimitValue) {
                d.vy = (d.vy > 0 ? mapSpeedLimitValue : -mapSpeedLimitValue);
            }
        }
        function ballMoving(ball, threshold) {
            var velocity = Math.sqrt(Math.pow(ball.vx, 2) + Math.pow(ball.vy, 2));
            return velocity > threshold;
        }    

        // movement calculations
        function getShootingData(mouseX, mouseY, influencerBall) {
            var dx = mouseX - influencerBall.x;
            var dy = mouseY - influencerBall.y;
            var length = Math.sqrt(dx * dx + dy * dy);
            var unitVectorX = dx / length;
            var unitVectorY = dy / length;

            var maxSpeed = mapSpeedLimitValue;
            var minSpeed = .5;
            var diagonal = Math.sqrt(mapWidth * mapWidth + mapHeight * mapHeight);
        var distanceRatio = 1 - (length / diagonal);
        var shootingSpeed = minSpeed + (maxSpeed - minSpeed) * distanceRatio;

            return {
                shootingSpeed: shootingSpeed,
                unitVectorX: unitVectorX,
                unitVectorY: unitVectorY
            };
        };

        // time
        ticktockInterval = d3.interval(ticktock, 20);
        let arrowTimeout;
        let collisionLast = 0;
        let collisionTimeout = 100;
            
        function ticktock() {
                speedLimit(influencerBall);
            
            // move ball
                influencerBall.x = +influencer.attr("cx");
                influencerBall.y = +influencer.attr("cy");
                influencerBall.vx *= 0.99;
                influencerBall.vy *= 0.99;
                influencerBall.x += influencerBall.vx;
                influencerBall.y += influencerBall.vy;

            // bounce ball of walls
                if (influencerBall.x - 10 <= 0 || influencerBall.x + 10 >= mapWidth) {
                    influencerBall.vx = -influencerBall.vx;
                    influencerBall.x += influencerBall.vx * 2;
                }
                if (influencerBall.y - 10 <= 0 || influencerBall.y + 10 >= mapHeight) {
                    influencerBall.vy = -influencerBall.vy;
                    influencerBall.y += influencerBall.vy * 2;
                };
            
            // toggle arrow
                if (ballMoving(influencerBall, speedThreshold)) {
                    clearTimeout(arrowTimeout);
                    arrow.style("display", "none");
                } else {
                    arrowTimeout = setTimeout(() => {
                    arrow.style("display", "block");
                    }, 200);
                }
                updateArrow(currentMouseCoords.x, currentMouseCoords.y);

            // collisions with other balls
                mapCircles.each(function (d) {
                    var dx = d.x - influencerBall.x;
                    var dy = d.y - influencerBall.y;
                    var distance = Math.sqrt(dx * dx + dy * dy);
                    var minDistance = d.radius + 10;

                    if (distance < minDistance) {
                        var angle = Math.atan2(dy, dx);
                        var targetX = influencerBall.x + Math.cos(angle) * minDistance;
                        var targetY = influencerBall.y + Math.sin(angle) * minDistance;
                        var ax = (targetX - d.x) + 5;
                        var ay = (targetY - d.y) + 5;
                        influencerBall.vx -= ax;
                        influencerBall.vy -= ay;
                        d.isChanged = true;
                        updateLabels();
                        var currentTime = Date.now();
                        if (currentTime - collisionLast > collisionTimeout) {
                            incrementCollision();
                            collisionLast = currentTime;
                        }
                    };

                    
            // gravity effect
                var gravityDistance = d.influenceRadius + 10;
                if (distance < gravityDistance) {
                    var force = -.2;
                    var ax = (dx / distance) * force;
                    var ay = (dy / distance) * force;
                    influencerBall.vx -= ax;
                    influencerBall.vy -= ay;
                };
                });
            
            // update svg
            influencer
                .attr("cx", function(d) { return d.x = influencerBall.x; })
                .attr("cy", function(d) { return d.y = influencerBall.y; });
 
        };
            
        // label color changer   
        function updateLabels() {
            mapLabels
                .attr("fill", function (d) {
                    return d.isChanged ? colorTeal : colorDawn;
                });
        };
        function resetLabels() {
            mapLabels.each(function (d) {
                d.isChanged = false;
                d3.select(this).attr("fill", colorDawn);
            });
        };
            
        // shoot function
        function shoot(event) {
            
            if (event.defaultPrevented) return;
            var rect = mapsvg.node().getBoundingClientRect();
            var mouseX = (event.clientX - rect.left) * (mapWidth / rect.width);
            var mouseY = (event.clientY - rect.top) * (mapHeight / rect.height);
            var shootingData = getShootingData(mouseX, mouseY, influencerBall);

            influencerBall.vx = shootingData.unitVectorX * -shootingData.shootingSpeed;
            influencerBall.vy = shootingData.unitVectorY * -shootingData.shootingSpeed;

            incrementClick();
        };

        // event listeners for shoot and arrow
        var currentMouseCoords = { x: 0, y: 0 };
        mapsvg.on("click", function (event) {
            
            if (ballMoving(influencerBall, speedThreshold)) {
                return;
            };
            resetLabels();
            shoot(event);
        });
        mapsvg.on("mousemove", function (event) {
            var rect = mapsvg.node().getBoundingClientRect();
            var viewBox = mapsvg.attr("viewBox").split(" ");
            var viewBoxX = parseFloat(viewBox[0]);
            var viewBoxY = parseFloat(viewBox[1]);
            var viewBoxWidth = parseFloat(viewBox[2]);
            var viewBoxHeight = parseFloat(viewBox[3]);
            var scaleX = viewBoxWidth / rect.width;
            var scaleY = viewBoxHeight / rect.height;
            currentMouseCoords.x = (event.clientX - rect.left) * scaleX + viewBoxX;
            currentMouseCoords.y = (event.clientY - rect.top) * scaleY + viewBoxY;

            updateArrow(currentMouseCoords.x, currentMouseCoords.y);
        });
            
        // tooltip listeners    
        mapCircles.on("mouseover", function (event, d) {
            tooltip.html(generateTooltipText(d))
                .style("visibility", "visible");
        })
        .on("mousemove", function (event) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden");
        })
        .on("touchstart", function (event, d) {
            event.preventDefault();
            tooltip.html(generateTooltipText(d))
                .style("visibility", "visible");
        })
        .on("touchmove", function (event) {
            tooltip.style("top", (event.touches[0].pageY - 10) + "px")
                .style("left", (event.touches[0].pageX + 10) + "px");
        })
        .on("touchend", function () {
            tooltip.style("visibility", "hidden");
        });    
    
            
        });
    });
};