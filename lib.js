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
  Body = Matter.Body

var noncolliding = Matter.Body.nextGroup(true)
var chainStyle = {
  lineWidth: 3,
  strokeStyle: '#F00'
}

// chakras!!
var explodeChakraIsActivated = false

var emitters = []
function startParticles (engine) {
  Matter.Events.on(engine, 'tick', function addEmitter () {
    for (var i = 0; i < emitters.length; i++) {
      var emitter = emitters[i]
      if (emitter._body) {
        emitter.updateSpawnPos(emitter._body.position.x, emitter._body.position.y)
      }

      if (emitter._remove) {
        emitters.splice(i, 1)
        i--
      } else {
        emitter.update(1 / 60)
      }
    }
  })
}

/*
  opts = {
    fromPoint: {x:0,y:0},
    to: body,
    toPoint: {x:0,y:0}, // optional
    length: 20 // optional
  }
*/
function attachWithRope (world, opts) { // from, body, bodyPoint, length) {
  var body = opts.to
  var bodyPoint = opts.toPoint || {x: 0, y: 0}
  var length = opts.length || Math.abs(Matter.Vector.magnitude(Matter.Vector.sub(body.position, opts.fromPoint)))
  function removeRope () {
    var self = this
    window.setTimeout(function () {
      var i = ropeB.bodies.indexOf(self)
      Matter.Composite.removeConstraintAt(ropeB, i)
    }, 0)
    console.log(self)
    var emitSettings = {
      'alpha': {
        'start': 0.77,
        'end': 0
      },
      'scale': {
        'start': 0.25,
        'end': 0.01,
        'minimumScaleMultiplier': 1
      },
      'color': {
        'start': '#c20017',
        'end': '#8a1111'
      },
      'speed': {
        'start': 100,
        'end': 50
      },
      'acceleration': {
        'x': 0,
        'y': 300
      },
      'startRotation': {
        'min': 30,
        'max': 180
      },
      'rotationSpeed': {
        'min': 1,
        'max': 2
      },
      'lifetime': {
        'min': 0.2,
        'max': 0.8
      },
      'blendMode': 'normal',
      'frequency': 0.001,
      'emitterLifetime': 2,
      'maxParticles': 500
    }

    var emitter, body, e

    var j = ropeB.bodies.indexOf(self)
    if (j < ropeB.bodies.length - 1) {
      body = ropeB.bodies[j + 1]
      e = $.extend({}, emitSettings)
      e.pos = { x: body.position.x, y: body.position.y }

      emitter = new cloudkid.Emitter(engine.render.textContainer, [PIXI.Texture.fromImage('img/particle.png')], e)
      emitter._body = body
      emitter.emit = true
      emitters.push(emitter)
      window.setTimeout(function () {
        emitter._remove = true
      }, 4000)
    }
    body = ropeB.bodies[j]
    e = $.extend({}, emitSettings)
    e.pos = { x: body.position.x, y: body.position.y }
    sounds.splash.play()

    emitter = new cloudkid.Emitter(engine.render.textContainer, [PIXI.Texture.fromImage('img/particle.png')], e)
    emitter._body = body
    emitter.emit = true
    emitters.push(emitter)
    window.setTimeout(function () {
      emitter._remove = true
    }, 4000)

    e = $.extend({}, emitSettings)
    e.pos = { x: self.position.x, y: self.position.y }
    e.startRotation = { min: 0, max: 360 }
    e.emitterLifetime = 0.2

    emitter = new cloudkid.Emitter(engine.render.textContainer, [PIXI.Texture.fromImage('img/particle.png')], e)
    emitter.emit = true
    emitters.push(emitter)
    window.setTimeout(function () {
      emitter._remove = true
    }, 4000)

  }
  var ropeB = Matter.Composites.stack(opts.fromPoint.x, opts.fromPoint.y, 1, Math.ceil(length / 40), 20, 25, function (x, y) {
    var c = Matter.Bodies.circle(x, y, 5, {
      label: 'rope',
      collisionFilter: { group: noncolliding },
      render: {
        visible: false
      }
    })
    c.label = 'rope'
    c.removeRope = removeRope
    return c
  })

  Matter.Composites.chain(ropeB, 0, 0, 0, 0, {
    stiffness: 1,
    length: 40,
    render: chainStyle
  })

  Matter.Composite.add(ropeB, Matter.Constraint.create({
    bodyB: ropeB.bodies[0],
    pointA: opts.fromPoint,
    stiffness: 1,
    render: chainStyle
  }))
  Matter.Composite.add(ropeB, Matter.Constraint.create({
    bodyA: ropeB.bodies[ropeB.bodies.length - 1],
    bodyB: body,
    pointB: bodyPoint,
    stiffness: 1,
    length: 10,
    render: chainStyle
  }))
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
        texture: 'img/sword.png',
        xScale: 0.1,
        yScale: 0.1
      }
    }
  })
  sword.label = 'sword'
  World.add(engine.world, [sword])

  var bloodLayer = new PIXI.Graphics()
  engine.render.backgroundContainer.addChild(bloodLayer)

  function swordContraint (sword) {
    var moveswordto = pos
    var oldpos = pos
    var sworddirection = 0
    var mouseConstraint = MouseConstraint.create(engine)

    function drawCircle (x, y) {
      bloodLayer.lineStyle(0)
      bloodLayer.beginFill(0x880000, 1)
      bloodLayer.drawCircle(x, y, 5)
      bloodLayer.endFill()
    }

    Matter.Events.on(mouseConstraint, 'mousedown', function (event) {
      moveswordto = Vector.clone(event.mouse.position)
    })
    Matter.Events.on(mouseConstraint, 'mousemove', function (event) {
      sworddirection = Vector.angle(event.mouse.position, sword.position)
    })

    Matter.Events.on(engine, 'tick', function movemyball () {
      if (oldpos.x !== sword.position.x && oldpos.y !== sword.position.y) {
        bloodLayer.beginFill(0, 0)
        bloodLayer.lineStyle(10, 0x880000)
        bloodLayer.moveTo(oldpos.x, oldpos.y)
        bloodLayer.lineTo(sword.position.x, sword.position.y)
        bloodLayer.endFill()
        drawCircle(sword.position.x, sword.position.y)
        oldpos = Vector.clone(sword.position)
      }
      if (moveswordto != null) {
        Matter.Sleeping.set(sword, false)
        var dir = Vector.sub(moveswordto, sword.position)
        var len = Vector.magnitude(dir)
        if (len < 10) {
          // don't intesify velocity.
          // very near to the destination position
          Body.setVelocity(sword, dir)

          // check Chakras
          if (explodeChakraIsActivated) {
            explodeChakraIsActivated = false
            activateExplodeChakra(engine, sword.position)
          }
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
    if (pair.bodyA.label === 'sword' || pair.bodyB.label === 'sword') {
      if (pair.bodyA.label === 'rope' || pair.bodyB.label === 'rope') {
        (pair.bodyA.label === 'rope' ? pair.bodyA : pair.bodyB).removeRope()
      }
      if (pair.bodyA.label === 'explodechakra' || pair.bodyB.label === 'explodechakra') {
        window.setTimeout(function () {
          (pair.bodyA.label === 'explodechakra' ? pair.bodyA : pair.bodyB).activate()
        }, 0)
      }
    }
  })
}

function waitForSword (engine) {
  var mouseConstraint = MouseConstraint.create(engine)
  function listener (event) {
    Matter.Events.off(mouseConstraint, 'mouseup', listener)
    addSword(engine, Vector.clone(event.mouse.position))
  }
  Matter.Events.on(mouseConstraint, 'mouseup', listener)
}

var explosion = PIXI.Sprite.fromImage('img/explode.png')
explosion.scale.x = 0.5
explosion.scale.y = 0.5

function activateExplodeChakra (engine, pos) {
  explosion.position = {
    x: pos.x - explosion.width / 2,
    y: pos.y - explosion.height / 2
  }
  engine.render.container.addChild(explosion)
  setTimeout(function () {
    engine.render.container.removeChild(explosion)
  }, 400)
  Bodies.circle(pos.x, pos.y, 5, {
    isStatic: true,
    render: {
      sprite: {
        texture: 'img/explode.png',
        xScale: 0.1,
        yScale: 0.1
      }
    }
  })
  engine.world.bodies.forEach(function (body) {
    if (!['sword'].some(function (s) {
        return body.label === s
      })) {
      var force = Vector.sub(body.position, pos)
      var dist = Vector.magnitude(force)
      if (dist < 600) {
        // var power = 0.01 * Math.min(Math.sqrt((600 - dist) / 600), 0.1)
        var power = 0.03 * Math.pow((600 - dist) / 600, 4)
        console.log(power)
        force = Vector.mult(force, power)
        Body.applyForce(body, pos, force)
      }
    }
  })
}

function putExplodeChakra (engine, pos) {
  var chakra = Bodies.circle(pos.x, pos.y, 20, {
    collisionFilter: {group: noncolliding},
    restitution: 0,
    frictionAir: 0,
    isStatic: true,
    render: {
      sprite: {
        texture: 'img/yinyang.png',
        xScale: 0.1,
        yScale: 0.1
      }
    }
  })
  chakra.label = 'explodechakra'
  chakra.activate = function () {
    Matter.Composite.removeBody(engine.world, this)
    explodeChakraIsActivated = true
  }
  World.add(engine.world, [chakra])
}

var boneWidth = 116
var boneHeadWidth = 209
var boneHeadHeight = 146
var boneGroup = Body.nextGroup(true)

var _boneHeadCache = {}

function createBone (x1, y1, x2, y2, w) {
  var vertices

  var h = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
  var cx = (x1 + x2) / 2
  var cy = (y1 + y2) / 2
  var scale = w / boneWidth

  if (_boneHeadCache[w]) {
    vertices = _boneHeadCache[w]
  } else {
    var pathWidth = boneEndBounds.max.x - boneEndBounds.min.x
    var pathHeight = boneEndBounds.max.y - boneEndBounds.min.y
    var headScaleX = scale * boneHeadWidth / pathWidth * 0.95
    var headScaleY = scale * boneHeadHeight / pathHeight * 0.95

    vertices = Vertices.scale(Vertices.create(boneEndPath), headScaleX, headScaleY)
  }

  var end1 = Bodies.fromVertices(cx, cy - h / 2, [vertices], {
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
  }, true)
  var end2 = Bodies.fromVertices(cx, cy + h / 2, [vertices], {
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
  }, true)

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
  })

  var angle = -Math.atan((x1 - x2) / (y1 - y2))

  var bone = Composite.create({bodies: [shaft, end1, end2] })
  Composite.rotate(bone, angle, {x: cx, y: cy})

  World.add(engine.world, bone)

  return bone
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
}

function createOrgan (organ, x, y, scale, level) {
  scale = scale || 1
  organ = organs[organ]
  var bds = organ._bounds
  var pathWidth = bds.max.x - bds.min.x
  var pathHeight = bds.max.y - bds.min.y
  var vertices = Vertices.scale(organ._path, organ._width * scale / pathWidth, organ._height * scale / pathHeight)

  var o = Bodies.fromVertices(x, y, [vertices], {
    collisionFilter: {group: noncolliding},
    render: {
      fillStyle: 'none',
      strokeStyle: '#FF0000',
      sprite: {
        texture: organ.image,
        xScale: scale,
        yScale: scale
      }
    }
  }, true)

  World.add(engine.world, [o])

  level.organs.push(o)

  return o
}

var sounds = {
  splash: new Howl({
    urls: ['sounds/splash.ogg']
  })
}