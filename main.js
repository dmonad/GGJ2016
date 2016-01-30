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
var engine = Engine.create(document.body, {render: RenderPixi2.create({element: document.body, options: {debug: false}}) });

var boneWidth = 116;
var boneHeadWidth = 209;
var boneHeadHeight = 146;
var boneGroup = Body.nextGroup(true);

function createBone(x1, y1, x2, y2, w, cb) {
    $.get('./img/bone_end_collision.svg').done(function(data) {
        var h = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
        var cx = (x1 + x2) / 2;
        var cy = (y1 + y2) / 2;
        var w2 = w * boneHeadWidth / boneWidth;
        var shaftScale = w / boneWidth;
                    var path = $(data).find('path')[0];
                    var points = Svg.pathToVertices(path, 10);
                    var bds = Bounds.create(points);
                    var pathWidth = bds.max.x - bds.min.x;
        var headScale = w2 / pathWidth*0.95;
                    var vertices = Vertices.scale(points, headScale, headScale);
                    
                    var end1 = Bodies.fromVertices(cx, cy - h/2, [vertices], {
                        render: {
                            fillStyle: 'none',
                            strokeStyle: '#FF0000',
                            sprite: {
                                texture: 'img/bone_end.png',
                                xScale: w2 / boneHeadWidth,
                                yScale: w2 / boneHeadWidth,
                            }
                        },
                        collisionFilter: { group: boneGroup },
                        isStatic: true
                    }, true);
                    var end2 = Bodies.fromVertices(cx, cy + h/2, [vertices], {
                        render: {
                            fillStyle: 'none',
                            strokeStyle: '#FF0000',
                            sprite: {
                                texture: 'img/bone_end.png',
                                xScale: w2 / boneHeadWidth,
                                yScale: w2 / boneHeadWidth,
                            }
                        },
                        angle: Math.PI,
                        collisionFilter: { group: boneGroup },
                        isStatic: true
                    }, true);
                    
                    console.log(cx, cy, w, h);
                    
                    var shaft = Bodies.rectangle(cx, cy, w, h, { 
                        render: {
                            sprite: {
                                texture: 'img/bone.png',
                                xScale: shaftScale,
                                yScale: h
                            }
                        },
                        collisionFilter: { group: boneGroup },
                        isStatic: true
                    });
                    
                    var angle = -Math.atan((x1-x2)/(y1-y2));
                    
                    console.log(angle/(2*Math.PI)*360);
                    
                    var bone = Composite.create({bodies: [shaft, end1, end2] });
                    Composite.rotate(bone, angle, {x: cx, y: cy});
                    
                    World.add(engine.world, bone);
                    
                    if (typeof cb === 'function') {
                        cb(bone);
                    }
                });
}

createBone(200, 200, 300, 300, 50);
createBone(100, 100, 300, 500, 20);


var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
var circle = Bodies.circle(700, 100, 5, { isStatic: true });

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
                    
                    var liver = Bodies.fromVertices(350, 10, [vertices], {
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
                
                    var liverConstraint = Constraint.create({ 
                                bodyB: liver,
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
World.add(engine.world, [ground, mouseConstraint, circle]);

        var renderOptions = engine.render.options;
        renderOptions.showAngleIndicator = false;
        renderOptions.wireframes = false;
        renderOptions.showConvexHull = true;

// run the engine
Engine.run(engine);