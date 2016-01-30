/* global Matter */

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

var noncolliding = Matter.Body.nextGroup(true);
var chainStyle = {
  lineWidth: 3,
  strokeStyle: '#F00'
}
function attachWithRope(world, from, body, length) {
  length = length || Math.abs(Matter.Vector.magnitude(Matter.Vector.sub(body.position, from)))
  function removeRope () {
    var self = this
    window.setTimeout(function () {
      var i = ropeB.bodies.indexOf(self)
      Matter.Composite.removeConstraintAt(ropeB, i)
    }, 0)
  }
  var ropeB = Matter.Composites.stack(from.x, from.y, 1, Math.ceil(length / 40), 20, 25, function(x, y) {
    var c = Matter.Bodies.circle(x, y, 5, {
      label: 'rope',
      collisionFilter: { group: noncolliding },
      render: {
        visible: false
      }
    });
    c.label = 'rope'
    c.removeRope = removeRope
    return c
  });

  Matter.Composites.chain(ropeB, 0, 0, 0, 0, {
    stiffness: 0.7,
    length: 40,
    render: chainStyle
  });

  Matter.Composite.add(ropeB, Matter.Constraint.create({ 
    bodyB: ropeB.bodies[0],
    pointA: from,
    stiffness: 0.7,
    render: chainStyle
  }));
  Matter.Composite.add(ropeB, Matter.Constraint.create({ 
    bodyA: ropeB.bodies[ropeB.bodies.length - 1],
    bodyB: body,
    stiffness: 0.7,
    length: 10,
    render: chainStyle
  }));
  World.add(world, [ropeB])
}

var boneWidth = 116;
var boneHeadWidth = 209;
var boneHeadHeight = 146;
var boneGroup = Body.nextGroup(true);

var _boneHeadCache = {}

function createBone(x1, y1, x2, y2, w) {
    var vertices;
    
        var h = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
        var cx = (x1 + x2) / 2;
        var cy = (y1 + y2) / 2;
        var scale = w / boneWidth;
        
        if (_boneHeadCache[w]) {
            vertices = _boneHeadCache[w];
        } else {        
            var pathWidth = boneEndBounds.max.x - boneEndBounds.min.x;
            var pathHeight = boneEndBounds.max.y - boneEndBounds.min.y;
            var headScaleX = scale * boneHeadWidth / pathWidth*0.95;
            var headScaleY = scale * boneHeadHeight / pathHeight*0.95;
        
            vertices = Vertices.scale(Vertices.create(boneEndPath), headScaleX, headScaleY);            
        }
                    
                    var end1 = Bodies.fromVertices(cx, cy - h/2, [vertices], {
                        render: {
                            fillStyle: 'none',
                            strokeStyle: '#FF0000',
                            sprite: {
                                texture: 'img/bone_end.png',
                                xScale: scale,
                                yScale: scale,
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
                                xScale: scale,
                                yScale: scale,
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
                                xScale: scale,
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

var organs = {
    liver: {
        image: 'img/liver.png',
        collision: 'img/liver.svg',
    },
    heart: {
        image: 'img/heart.png',
        collision: 'img/heart.svg',
    },
    kidney: {
        image: 'img/kidney.png',
        collision: 'img/kidney.svg',
    },
    lungs: {
        image: 'img/lungs.png',
        collision: 'img/lungs.svg',
    },
    stomach: {
        image: 'img/stomach.png',
        collision: 'img/stomach.svg',
    },
};

function createOrgan(organ, x, y, scale) {
    scale = scale || 1;
    organ = organs[organ];
                    var bds = organ._bounds;
                    var pathWidth = bds.max.x - bds.min.x;
                    var pathHeight = bds.max.y - bds.min.y;
                    var vertices = Vertices.scale(organ._path, organ._width * scale / pathWidth, organ._height * scale / pathHeight);
                    
                    var o = Bodies.fromVertices(x, y, [vertices], {
                        render: {
                            fillStyle: 'none',
                            strokeStyle: '#FF0000',
                            sprite: {
                                texture: organ.image,
                                xScale: scale,
                                yScale: scale
                            }
                        }
                    }, true);

                    World.add(engine.world, [o]);
                    
                    return o;
                }