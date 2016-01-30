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
    Body = Matter.Body;

// create a Matter.js engine
var engine = Engine.create(document.body, {render: RenderPixi2.create({element: document.body, options: {debug: true}}) });

// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

var circle = Bodies.circle(100, 100, 5, { isStatic: true });

function randomProperty (obj) {
    var keys = Object.keys(obj)
    return keys[ keys.length * Math.random() << 0];
};

var organs = {
    liver: {
        w: 150,
        h: 150/585*370
    },
    heart: {
        w: 150,
        h: 150/500*503
    },
    kidney: {
        w: 150,
        h: 150/234*365
    },
    lungs: {
        w: 150,
        h: 150/650*652
    },
    stomach: {
        w: 150,
        h: 150/642*579
    },
};
var organ = randomProperty(organs);
var targetWidth = organs[organ].w;
var targetHeight = organs[organ].h;

$.get('./img/'+organ+'.svg').done(function(data) {
                    var path = $(data).find('path')[0];
                    var points = Svg.pathToVertices(path, 10);
                    var center = Vertices.centre(points);
                    var bds = Bounds.create(points);
                    var cx = (bds.min.x + bds.max.x) / 2;
                    var cy = (bds.min.y + bds.max.y) / 2;
                    var pathWidth = bds.max.x - bds.min.x;
                    var pathHeight = bds.max.y - bds.min.y;
                    var imgWidth = 585, imgHeight = 370;
                    var vertices = Vertices.scale(points, targetWidth / pathWidth*0.98, targetHeight / pathHeight*0.98);
                    var offx = (cx - center.x) / pathWidth;
                    var offy = (cy - center.y) / pathHeight;
                    
                    var liver = Bodies.fromVertices(350, 10, [vertices], {
                        render: {
                            fillStyle: 'none',
                            strokeStyle: '#FF0000',
                            sprite: {
                                texture: './img/'+organ+'.png',
                                xScale: targetWidth / imgWidth,
                                yScale: targetHeight / imgHeight,
                                //xOffset: -offx,
                                //yOffset: -offy,
                            }
                        }
                    }, true);
                
                    var liverConstraint = Constraint.create({ 
                                // bodyB: liver,
                                pointB: { x: 0, y: 0 },
                                bodyA: circle,
                                pointA: { x: 0, y: 0 },
                                stiffness: 0.8,
                                length: 100,
                                render: {
                                    lineWidth: 10,
                                    strokeStyle: '#880000'
                                }
                            });

                    World.add(engine.world, [liver, liverConstraint]);
                });
                
var mouseConstraint = MouseConstraint.create(engine);

/*

var mouseConstraint = MouseConstraint.create(engine, {
    collisionFilter: {
                category: 0x0001,
                mask: 0x00000000,
                group: 0
            }});
            
            
            Events.on(mouseConstraint, 'mousedown', function(event) {
                console.log(event.mouse.position)
                Body.setPosition(circle, { x: event.mouse.position.x, y: event.mouse.position.y });
            })
            */

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground, mouseConstraint, circle]);

        var renderOptions = engine.render.options;
        renderOptions.showAngleIndicator = false;
        renderOptions.wireframes = false;
        renderOptions.showConvexHull = true;

// run the engine
Engine.run(engine);