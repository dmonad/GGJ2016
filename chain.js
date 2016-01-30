// Matter.js module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Common = Matter.Common,
    Vertices = Matter.Vertices,
    Vector = Matter.Vector,
    Svg = Matter.Svg,
    Bounds = Matter.Bounds,
    MouseConstraint = Matter.MouseConstraint,
    Constraint = Matter.Constraint,
    Events = Matter.Events,
    Body = Matter.Body,
    Composites = Matter.Composites,
    Composite = Matter.Composite

// create a Matter.js engine
var engine = Engine.create(document.body, {render: RenderPixi2.create({element: document.body, options: {debug: false}}) });

function randomProperty (obj) {
    var keys = Object.keys(obj)
    return keys[ keys.length * Math.random() << 0];
};

var organs = {
    liver: {
        width: 585,
        height: 370,
        scale: 150/585
    },
    heart: {
        width: 500,
        height: 503,
        scale: 150/500
    },
    kidney: {
        width: 234,
        height: 365,
        scale: 150/234
    },
    lungs: {
        width: 650,
        height: 652,
        scale: 150/650
    },
    stomach: {
        width: 642,
        height: 579,
        scale: 150/642
    },
};
var organ = randomProperty(organs);
var imgWidth = organs[organ].width;
var imgHeight = organs[organ].height;
var targetWidth = imgWidth * organs[organ].scale;
var targetHeight = imgHeight * organs[organ].scale;

$.get('./img/'+organ+'.svg').done(function(data) {
                    var path = $(data).find('path')[0];
                    var points = Svg.pathToVertices(path, 10);
                    var center = Vertices.centre(points);
                    var bds = Bounds.create(points);
                    var cx = (bds.min.x + bds.max.x) / 2;
                    var cy = (bds.min.y + bds.max.y) / 2;
                    var pathWidth = bds.max.x - bds.min.x;
                    var pathHeight = bds.max.y - bds.min.y;
                    var vertices = Vertices.scale(points, targetWidth / pathWidth*0.95, targetHeight / pathHeight*0.95);

                    var isRopeMask = Body.nextCategory()
                    var liver = Bodies.fromVertices(400, 200, [vertices], {
                        collisionFilter: {group: noncolliding},
                        render: {
                            fillStyle: 'none',
                            strokeStyle: '#FF0000',
                            sprite: {
                                texture: './img/'+organ+'.png',
                                xScale: targetWidth / imgWidth,
                                yScale: targetHeight / imgHeight,
                            }
                        }
                    }, true);
                    World.add(engine.world, [liver]);
                    
                    attachWithRope(engine.world, {
                      fromPoint: {x:500, y:100},
                      to: liver
                    })
                    attachWithRope(engine.world, {
                      fromPoint: {x:300, y:100},
                      to: liver
                      //toPoint: {x: 50, y:50}
                    })
                    attachWithRope(engine.world, {
                      fromPoint: {x:400, y:300},
                      to: liver
                      //toPoint: {x: 50, y:50}
                    })
                });


waitForSword(engine)

var renderOptions = engine.render.options;
renderOptions.showAngleIndicator = false;
renderOptions.wireframes = false;
renderOptions.showConvexHull = true;

putExplodeChakra(engine, {x:100, y:100})

// run the engine
Engine.run(engine);