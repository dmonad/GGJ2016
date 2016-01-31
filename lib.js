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
      var partners = []
      for (var i = 0; i < ropeB.constraints.length;) {
        var constraint = ropeB.constraints[i]
        if (constraint.bodyA === self) {
          Matter.Composite.removeConstraintAt(ropeB, i)
          if (constraint.bodyB) partners.push(constraint.bodyB)
        } else if (constraint.bodyB === self) {
          Matter.Composite.removeConstraintAt(ropeB, i)
          if (constraint.bodyA) partners.push(constraint.bodyA)
        } else {
          i++
        }
      }
      Matter.Composite.removeBody(ropeB, self)

      for (i = 0; i < partners.length; i++) {
        var body = partners[i]
        addEmitter(particleSettings.blood, 'img/particle.png', body.position.x, body.position.y, 4000, body)
      }

      var settings = Common.clone(particleSettings.blood)
      settings.startRotation = { min: 0, max: 360 }
      settings.acceleration = { x: 0, y: 200 }
      settings.emitterLifetime = 0.2
      addEmitter(settings, 'img/particle.png', self.position.x, self.position.y, 4000)
    }, 0)
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

function addSword (engine, pos, level) {
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
  sword._onStop = []
  sword.label = 'sword'
  sword.explodeIntensity = 0
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
      if (level.attempts < level.maxAttempts) {
        level.attempts++
        refreshScore(level)
        moveswordto = Vector.clone(event.mouse.position)
      }
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

          while (sword._onStop.length > 0) {
            var handler = sword._onStop.shift()
            handler(engine, sword)
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
    var other
    if (pair.bodyA.label === 'sword' || pair.bodyA.label === 'bone') {
      other = pair.bodyB
    } else if (pair.bodyB.label === 'sword' || pair.bodyB.label === 'bone') {
      other = pair.bodyA
    }
    if (other) {
      if (other.label === 'rope') {
        other.removeRope()
      } else if (other.label === 'chakra') {
        window.setTimeout(function () {
          other.activate(sword)
        }, 0)
      }
    }
  })
}

function waitForSword (engine, level) {
  var mouseConstraint = MouseConstraint.create(engine)
  function listener (event) {
    Matter.Events.off(mouseConstraint, 'mouseup', listener)
    addSword(engine, Vector.clone(event.mouse.position), level)
  }
  Matter.Events.on(mouseConstraint, 'mouseup', listener)
}

function activateExplodeChakra (engine, sword) {
  var pos = sword.position
  sword.render.sprite.tint = 0xFFFFFF
  playSoundeffect('explode')
  addEmitter(particleSettings.explosion2, 'img/particle.png', pos.x, pos.y, 3000)
  addEmitter(particleSettings.smokeRing, 'img/CartoonSmoke.png', pos.x, pos.y, 3000)

  engine.world.bodies.forEach(function (body) {
    if (!['sword'].some(function (s) {
        return body.label === s
      })) {
      var force = Vector.sub(body.position, pos)
      var dist = Vector.magnitude(force)
      if (dist < 600) {
        // var power = 0.01 * Math.min(Math.sqrt((600 - dist) / 600), 0.1)
        var power = sword.explodeIntensity * 0.03 * Math.pow((600 - dist) / 600, 4)
        force = Vector.mult(force, power)
        Body.applyForce(body, pos, force)
      }
    }
  })
  sword.explodeIntensity = 1
}

function putChakra (engine, pos, name, activate, value) {
  var chakra = Bodies.circle(pos.x, pos.y, 20, {
    collisionFilter: {group: noncolliding},
    restitution: 0,
    frictionAir: 0,
    isStatic: true,
    render: {
      sprite: {
        texture: 'img/' + name + '_chakra.png',
        xScale: 0.1,
        yScale: 0.1
      }
    }
  })
  chakra.label = 'chakra'
  chakra.activate = function (sword) {
    playSoundeffect('chakra')
    Matter.Composite.removeBody(engine.world, this)
    activate(pos, sword)
  }
  World.add(engine.world, [chakra])

  return chakra
}

function putFireChakra (engine, pos, intensity) {
  return putChakra(engine, pos, 'fire', function (pos, sword) {
    sword.explodeIntensity += intensity || 1
    sword._onStop.push(activateExplodeChakra)
    sword.render.sprite.tint = 0xFF0000
  })
}

function putWaterChakra (engine, pos, strength, limit) {
  strength = strength || 200
  limit = limit || 15
  return putChakra(engine, pos, 'water', function (pos, sword) {
    var handler = function (event) {
      engine.world.bodies.forEach(function (body) {
        if (!['sword'].some(function (s) {
            return body.label === s
          })) {
          var force = Vector.sub(body.position, sword.position)
          var dist = Vector.magnitude(force)
          var factor = strength / (dist * dist)
          var resultForce = Vector.mult(Vector.normalise(force), -factor)
          Body.applyForce(body, body.position, resultForce)
          if (Vector.magnitude(body.velocity) > limit) {
            body.velocity = Vector.mult(Vector.normalise(body.velocity), limit)
          }
        }
      })
    }

    Events.on(engine, 'beforeUpdate', handler)

    window.setTimeout(function () {
      Events.off(engine, 'beforeUpdate', handler)
      sword.render.sprite.tint = 0xFFFFFF
    }, 2000)

    sword.render.sprite.tint = 0x0000FF
  })
}

function destroyBone (world, bone) {
  playSoundeffect('bone-crush')
  var settings = Common.clone(particleSettings.bone)
  var verts = []
  for (var i = 0; i < bone.bodies.length; i++) {
    verts = verts.concat(bone.bodies[i].vertices)
  }
  var bb = Bounds.create(verts)
  settings.spawnRect = {
    'x': bb.min.x,
    'y': bb.min.y,
    'w': bb.max.x - bb.min.x,
    'h': bb.max.y - bb.min.y
  }
  addEmitter(settings, 'img/particle.png', 0, 0, 4000)
  window.setTimeout(function () {
    Composite.remove(world, bone)
  }, 0)
}

function putMetalChakra (engine, pos) {
  return putChakra(engine, pos, 'metal', function (pos, sword) {
    var handler = function (event) {
      var pair = event.pairs[0]
      var bone = pair.bodyA._bone || pair.bodyA._bone
      if (bone !== undefined) {
        destroyBone(engine.world, bone)
      }
    }

    Matter.Events.on(engine, 'collisionStart', handler)

    sword._onStop.push(function () {
      Events.off(engine, 'collisionStart', handler)
      sword.render.sprite.tint = 0xFFFFFF
    })

    sword.render.sprite.tint = 0xFFFF00
  })
}

function putWoodChakra (engine, pos, bone) {
  bone.bodies.forEach(function (part) {
    part.render.sprite.tint = 0x6C2424
  })

  return putChakra(engine, pos, 'wood', function (pos, sword) {
    destroyBone(engine.world, bone)
  })
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
  shaft.label = 'boneBody'
  end1.label = 'bone'
  end2.label = 'bone'
  shaft._bone = bone
  end1._bone = bone
  end2._bone = bone
  Composite.rotate(bone, angle, {x: cx, y: cy})

  World.add(engine.world, bone)

  return bone
}

var organs = {
  liver: {
    image: 'img/liver.png',
    collision: 'img/liver.svg',
    value: 5
  },
  heart: {
    image: 'img/heart.png',
    collision: 'img/heart.svg',
    value: 10
  },
  kidney: {
    image: 'img/kidney.png',
    collision: 'img/kidney.svg',
    value: 8
  },
  lungs: {
    image: 'img/lungs.png',
    collision: 'img/lungs.svg',
    value: 6
  },
  stomach: {
    image: 'img/stomach.png',
    collision: 'img/stomach.svg',
    value: 3
  }
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
    frictionAir: 0.1,
    render: {
      fillStyle: 'none',
      strokeStyle: '#FF0000',
      sprite: {
        texture: organ.image,
        xScale: scale,
        yScale: scale
      },
      emotion: Math.random() > 0.5 ? 'smile' : 'frown'
    }
  }, true)

  World.add(engine.world, [o])
  
  o.scoreValue = organ.value

  level.organs.push(o)

  return o
}

var sounds = {
  splash: [
    new Howl({urls: ['sounds/splash.ogg']}),
    new Howl({urls: ['sounds/splash2.ogg']}),
    new Howl({urls: ['sounds/splash3.ogg']})
  ],
  chakra: [
    new Howl({urls: ['sounds/splash.ogg']})
  ],
  explode: [
    new Howl({urls: ['sounds/splash.ogg']})
  ],
  'bone-crush': [
    new Howl({urls: ['sounds/splash.ogg']})
  ]
}

function playSoundeffect (name) {
  var effects = sounds[name]
  var choose = Math.floor(Math.random() * effects.length)
  effects[choose].play()
}
