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