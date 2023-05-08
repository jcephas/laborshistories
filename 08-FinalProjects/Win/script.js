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

  // show intro
  document.querySelector("#map").style.display = "block";
  menuItems[1].classList.add("activemenu");
});




// map
document.addEventListener("DOMContentLoaded", function () {
    
    // canvas
    var width = 800,
        height = 800;

    var svg = d3
      .select("#mapbox")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("stroke", "black")
        .style("fill", "none")
        .style("stroke-width", 2);

    // sf projection
    var projection = d3.geoMercator()
        .center([-122.404,37.778])
        .scale(1000000)
        .translate([width / 2, height / 2]);
    var path = d3.geoPath().projection(projection);
    
    // import data
    d3.csv("img/SanFran.csv")
        .then(function (data) {
        data.forEach(function (d) {
            d.lat = +d.lat;
            d.long = +d.long;
            d.traffic = + d.traffic;
            var coords = projection([d.long, d.lat]);
            d.x = coords[0];
            d.y = coords[1];
            d.radius = 10;
            d.isChanged = false;
            d.influenceRadius = 20 * d.traffic;
        });   
        
        // street background
        d3.json("img/SanFran.geojson")
            .then(function (geojson){
            svg.selectAll(".streetbg")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("stroke", colorPink)
                .attr("fill", "none")
                .attr("stroke-width", 1.5)
                .classed("streetbg", true);

        // influence circles
        var influenceCircles = svg
            .selectAll(".influenceCircle")
            .data(data)
            .enter()
            .append("circle")
            .classed("influenceCircle", true)
            .attr("r", function (d) {
                return d.influenceRadius;
            })
            .style("fill", colorDawn)
            .style("opacity", 0.3)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });    
            
        // circles from data
            var circles = svg
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
            var labels = svg
                .selectAll(null)
                .data(data)
                .enter()
                .append("text")
                .attr("text-anchor", "left")
                .attr("font-size", "1em")
                .attr("fill", function (d) { return d.isChanged ? colorTeal : colorDawn; })
                .attr("x", function(d) { return d.x + d.radius * 1.25; })
                .attr("y", function(d) { return d.y + 16; })
                .text(function (d) {
                    return d.name;
                });

        // launch arrow
        var arrow = svg.append("line")
            .attr("stroke", colorPink)
            .attr("stroke-width", 3)
            .attr("marker-end", "url(#arrowhead)")
            .style("visibility", "hidden");
        svg.append("defs")
            .append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("fill", colorPink)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");
            
        function updateArrow(mouseX,mouseY) {
            var influencerBall = d3.select("circle.influencerBall").datum();
            var arrowLength = 5;
            var shootingData = getShootingData(mouseX, mouseY, influencerBall);
            var arrowEndX = influencerBall.x + shootingData.unitVectorX * -shootingData.shootingSpeed * arrowLength;
            var arrowEndY = influencerBall.y + shootingData.unitVectorY * -shootingData.shootingSpeed * arrowLength;

            arrow
                .attr("x1", influencerBall.x)
                .attr("y1", influencerBall.y)
                .attr("x2", arrowEndX)
                .attr("y2", arrowEndY)
                .style("visibility", "visible")
                .classed("arrow", true);
        }
        
        // user ball
        var influencer = svg.append("circle")
            .attr("r", 20)
            .style("fill", colorTeal)
            .classed("influencerBall", true)
            .attr("cx", Math.random() * width)
            .attr("cy", Math.random() * height)
            .datum({vx: 0, vy: 0});
        
        // counters
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
        var counterText = svg.append("text")
          .attr("x", width - 20)
          .attr("y", height - 20)
          .attr("text-anchor", "end")
          .style("fill", colorTeal)
          .style("font-size", "20px");
        function updateCounter() {
            var ratio = Math.round(collisionCount / clickCount * 100) / 100;
            counterText.text(collisionCount + " collisions / " + clickCount + " clicks = " + ratio + " engagement score");
        }
            
        // tooltip   
        function generateTooltipText(d) {
            let textLines = [];

            if (d.traffic) {
                textLines.push(`${d.name} has ${d.traffic} billion users a day.`);
            }
            if (d.pages_visited) {
                textLines.push(`Users visit an average of ${d.pages_visited} pages.`);
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
        const speedLimitValue = 20;
        const speedThreshold = 2
        function speedLimit(d) {
            if (Math.abs(d.vx) > speedLimitValue) {
                d.vx = (d.vx > 0 ? speedLimitValue : -speedLimitValue);
            }
            if (Math.abs(d.vy) > speedLimitValue) {
                d.vy = (d.vy > 0 ? speedLimitValue : -speedLimitValue);
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

            var maxSpeed = speedLimitValue;
            var minSpeed = .5;
            var diagonal = Math.sqrt(width * width + height * height);
        var distanceRatio = 1 - (length / diagonal);
        var shootingSpeed = minSpeed + (maxSpeed - minSpeed) * distanceRatio;

            return {
                shootingSpeed: shootingSpeed,
                unitVectorX: unitVectorX,
                unitVectorY: unitVectorY
            };
        };

        // time
        d3.interval(ticktock, 20);
        let arrowTimeout;
        function ticktock() {
            var influencerBall = d3.select("circle.influencerBall").datum();
                speedLimit(influencerBall);
                influencerBall.x = +influencer.attr("cx");
                influencerBall.y = +influencer.attr("cy");
                influencerBall.vx *= 0.99;
                influencerBall.vy *= 0.99;
                influencerBall.x += influencerBall.vx;
                influencerBall.y += influencerBall.vy;

                if (influencerBall.x - 10 <= 0 || influencerBall.x + 10 >= width) {
                    influencerBall.vx = -influencerBall.vx;
                    influencerBall.x += influencerBall.vx * 2;
                }
                if (influencerBall.y - 10 <= 0 || influencerBall.y + 10 >= height) {
                    influencerBall.vy = -influencerBall.vy;
                    influencerBall.y += influencerBall.vy * 2;
                };
            
                // toggle arrow
                var arrow = d3.select("line.arrow");
                if (ballMoving(influencerBall, speedThreshold)) {
                    clearTimeout(arrowTimeout);
                    arrow.style("opacity", 0);
                } else {
                    arrowTimeout = setTimeout(() => {
                        arrow.style("opacity", 1);
                    }, 200);
                };
                updateArrow(currentMouseCoords.x, currentMouseCoords.y);

                // collisions
                circles.each(function (d) {
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
                        incrementCollision();
                        d.isChanged = true;
                        updateLabels();
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
            
                influencer
                    .attr("cx", influencerBall.x)
                    .attr("cy", influencerBall.y);
                if (arrow.style("opacity") == 1) {
                    updateArrow(currentMouseCoords.x, currentMouseCoords.y);
                }
        };
            
        // label color    
        function updateLabels() {
            labels
                .attr("fill", function (d) {
                    return d.isChanged ? colorTeal : colorDawn;
                });
        };
        function resetLabels() {
            labels.each(function (d) {
                d.isChanged = false;
                d3.select(this).attr("fill", colorDawn);
            });
        };
            
        // shoot function
        function shoot(event) {
            var influencerBall = d3.select("circle.influencerBall").datum();

            if (event.defaultPrevented) return;
            var rect = svg.node().getBoundingClientRect();
            var mouseX = (event.clientX - rect.left) * (width / rect.width);
            var mouseY = (event.clientY - rect.top) * (height / rect.height);
            var shootingData = getShootingData(mouseX, mouseY, influencerBall);

            influencerBall.vx = shootingData.unitVectorX * -shootingData.shootingSpeed;
            influencerBall.vy = shootingData.unitVectorY * -shootingData.shootingSpeed;

            incrementClick();
        };

        // event listeners
        var currentMouseCoords = { x: 0, y: 0 };
        svg.on("click", function (event) {
            var influencerBall = d3.select("circle.influencerBall").datum();
            if (ballMoving(influencerBall, speedThreshold)) {
                return;
            };
            resetLabels();
            shoot(event);
        });
        svg.on("mousemove", function (event) {
            var rect = svg.node().getBoundingClientRect();
            var viewBox = svg.attr("viewBox").split(" ");
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
        circles.on("mouseover", function (event, d) {
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
});