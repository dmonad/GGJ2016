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