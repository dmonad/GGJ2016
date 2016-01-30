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

function createBone(x1, y1, x2, y2, w) {
        var h = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
        var cx = (x1 + x2) / 2;
        var cy = (y1 + y2) / 2;
        var w2 = w * boneHeadWidth / boneWidth;
        var shaftScale = w / boneWidth;
                    var pathWidth = boneEndBounds.max.x - boneEndBounds.min.x;
        var headScale = w2 / pathWidth*0.95;
                    var vertices = Vertices.scale(boneEndPath, headScale, headScale);
                    
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
                    
                    var bone = Composite.create({bodies: [shaft, end1, end2] });
                    Composite.rotate(bone, angle, {x: cx, y: cy});
                    
                    World.add(engine.world, bone);
                    
                    return bone;
}

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

function createOrgan(organ, x, y) {
                    var bds = organs[organ]._bounds;
                    var pathWidth = bds.max.x - bds.min.x;
                    var pathHeight = bds.max.y - bds.min.y;
                    var vertices = Vertices.scale(organs[organ]._path, targetWidth / pathWidth*0.95, targetHeight / pathHeight*0.95);
                    
                    var o = Bodies.fromVertices(x, y, [vertices], {
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

                    World.add(engine.world, [o]);
                    
                    return o;
                }
                
var mouseConstraint = MouseConstraint.create(engine);
            
            var queue = new createjs.LoadQueue(true);
            
            function loadFiles() {
                for (organ in organs)
                {
                    queue.loadFile('img/'+organ+'.svg', false); 
                    // queue.loadFile('img/'+organ+'.png', false);               
                }
                
                queue.loadFile('img/bone_end_collision.svg', false); 
                // queue.loadFile('img/bone_end.png', false);  
                // queue.loadFile('img/bone.png', false);  
                
                 queue.on("complete", function() {
                     engine.render.textContainer.removeChild(loadingText);
                     buildPaths();
                     createLevel();
                 });
                 
                 queue.load();
            }
            
            var boneEndPath, boneEndBounds;
            
            function buildPath(file) {
                var data = queue.getResult(file);
                var path = $(data).find('path')[0];
                return Svg.pathToVertices(path, 10);                
            }
            
            function buildPaths() {
                boneEndPath = buildPath('img/bone_end_collision.svg');
                boneEndBounds = Bounds.create(boneEndPath);
                
                for (organ in organs)
                {
                    var p = organs[organ]._path = buildPath('img/'+organ+'.svg', false);  
                    organs[organ]._bounds = Bounds.create(p);           
                }              
            }
            
            function createLevel() {
                var circle = Bodies.circle(500, 100, 5, { isStatic: true });
                
                createBone(30, 30, 780, 30, 40);
                createBone(30, 85, 30, 515, 40);
                createBone(50, 570, 750, 570, 40);
                createBone(770, 85, 770, 515, 40);
                
                createOrgan('lungs', 400, 400);
                
                World.add(engine.world, [mouseConstraint, circle]);
            }
            
            loadFiles();
            
            
var loadingText = new PIXI.Text('Loading...',{font : '24px Arial', fill : 0xff1010, align : 'center'});
engine.render.textContainer.addChild(loadingText);

        var renderOptions = engine.render.options;
        renderOptions.showAngleIndicator = false;
        renderOptions.wireframes = false;
        renderOptions.showConvexHull = true;

// run the engine
Engine.run(engine);