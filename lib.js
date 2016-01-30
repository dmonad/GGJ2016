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

/* 
  opts = {
    fromPoint: {x:0,y:0},
    to: body,
    toPoint: {x:0,y:0}, // optional
    length: 20 // optional
  }
*/
function attachWithRope(world, opts) { //from, body, bodyPoint, length) {
  var body = opts.to
  var bodyPoint = opts.toPoint || {x:0, y:0}
  var length = opts.length || Math.abs(Matter.Vector.magnitude(Matter.Vector.sub(body.position, opts.fromPoint)))
  function removeRope () {
    var self = this
    window.setTimeout(function () {
      var i = ropeB.bodies.indexOf(self)
      Matter.Composite.removeConstraintAt(ropeB, i)
    }, 0)
  }
  var ropeB = Matter.Composites.stack(opts.fromPoint.x, opts.fromPoint.y, 1, Math.ceil(length / 40), 20, 25, function(x, y) {
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
    pointA: opts.fromPoint,
    stiffness: 0.7,
    render: chainStyle
  }));
  Matter.Composite.add(ropeB, Matter.Constraint.create({ 
    bodyA: ropeB.bodies[ropeB.bodies.length - 1],
    bodyB: body,
    pointB: bodyPoint,
    stiffness: 0.7,
    length: 10,
    render: chainStyle
  }));
  World.add(world, [ropeB])
}

/*
  addSword (engine, {x:0,y:0})
*/

function addSword (engine, pos) {
  var sword = Bodies.circle(pos.x, pos.y, 20, {
    label: 'sword',
    restitution: 0,
    frictionAir: 0,
    render: {
      sprite: {
        texture: '/img/sword.png',
        xScale: 0.1,
        yScale: 0.1
      }
    }
  })
  sword.label = 'sword'
  World.add(engine.world, [sword])

  function swordContraint (sword) {
    var moveswordto = pos
    var sworddirection = 0
    var mouseConstraint = MouseConstraint.create(engine);
    Matter.Events.on(mouseConstraint, 'mousedown', function (event){
      moveswordto = Vector.clone(event.mouse.position)
    })
    Matter.Events.on(mouseConstraint, 'mousemove', function (event) {
      sworddirection = Vector.angle(event.mouse.position, sword.position)
    })

    Matter.Events.on(engine, 'tick', function movemyball () {
      if (moveswordto != null) {
        var dir = Vector.sub(moveswordto, sword.position)
        var len = Vector.magnitude(dir)
        if (len < 10) {
          Body.setVelocity(sword, dir)
        } else {
          var vel = Vector.mult(dir, 20 / len)
          // var mm = Math.pow(Math.max((400 - len)*10 / 400, 1), 1.3)
          // console.log(mm)
          // Vector.mult(dir, mm, vel)
          Body.setVelocity(sword, vel)
        }
      }
      Body.setAngle(sword, sworddirection)
    })
  }

  swordContraint(sword)

  // Collision detection Sword <-> rope
  Matter.Events.on(engine, 'collisionStart', function (event) {
    var pair = event.pairs[0]
    if (pair.bodyA.label === 'rope' || pair.bodyB.label === 'rope') {
      if (pair.bodyA.label === 'sword' || pair.bodyB.label === 'sword') {
        (pair.bodyA.label === 'rope' ? pair.bodyA : pair.bodyB).removeRope()
      }
    }
  })
}

function waitForSword (engine) {
  var mouseConstraint = MouseConstraint.create(engine);
  function listener (event){
    Matter.Events.off(mouseConstraint, 'mouseup', listener)
    addSword(engine, Vector.clone(event.mouse.position))
  }
  Matter.Events.on(mouseConstraint, 'mouseup', listener)
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