// Matter.js module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Body = Matter.Body,
    Vector = Matter.Vector

// create a Matter.js engine
var engine = Engine.create(document.body);

// create two boxes and a ground
boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground]);
        
var scale = 0.9;
World.add(engine.world, Composites.car(150, 100, 100 * scale, 40 * scale, 30 * scale));

scale = 0.8;
World.add(engine.world, Composites.car(350, 300, 100 * scale, 40 * scale, 30 * scale));

World.add(engine.world, [
    Bodies.rectangle(200, 150, 650, 20, { isStatic: true, angle: Math.PI * 0.06 }),
    Bodies.rectangle(500, 350, 650, 20, { isStatic: true, angle: -Math.PI * 0.06 }),
    Bodies.rectangle(340, 580, 700, 20, { isStatic: true, angle: Math.PI * 0.04 })
]);

var mouseConstraint = MouseConstraint.create(engine);
// World.add(engine.world, mouseConstraint);

var sword = Bodies.circle(100, 100, 20, {
  render: {
    sprite: {
      texture: '/img/sword.png',
      xScale: 0.1,
      yScale: 0.1 
    }
  }
})
World.add(engine.world, [sword])

function swordContraint (sword) {
  var moveswordto
  var sworddirection = 0
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
        //var mm = Math.pow(Math.max((400 - len)*10 / 400, 1), 1.3)
        //console.log(mm)
        //Vector.mult(dir, mm, vel)
        Body.setVelocity(sword, vel)
      }
    }
    Body.setAngle(sword, sworddirection)
  })
}

swordContraint(sword)

renderOptions = engine.render.options;
renderOptions.showAngleIndicator = true;
renderOptions.showCollisions = true;
renderOptions.wireframes = false


// run the engine
Engine.run(engine);