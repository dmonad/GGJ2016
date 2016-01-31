var emitters = []
function startParticles (engine) {
  Matter.Events.on(engine, 'tick', function () {
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

function addEmitter (settings, img, x, y, time, body) {
  var emitter, body, e

  e = $.extend({}, settings)
  e.pos = { x: x, y: y }

  emitter = new cloudkid.Emitter(engine.render.textContainer, [img], e)
  emitter.emit = true
  emitter._body = body
  emitters.push(emitter)

  window.setTimeout(function () {
    emitter._remove = true
  }, time)
}

var particleSettings = {
  blood: {
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
      'start': 400,
      'end': 200
    },
    'acceleration': {
      'x': 0,
      'y': 800
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
    'maxParticles': 500,
    'spawnType ': 'burst'
  },
  explosion2: {
    'alpha': {
      'start': 0.8,
      'end': 0.1
    },
    'scale': {
      'start': 1.5,
      'end': 0.5,
      'minimumScaleMultiplier': 1
    },
    'color': {
      'start': '#fd1111',
      'end': '#f7a134'
    },
    'speed': {
      'start': 200,
      'end': 200
    },
    'acceleration': {
      'x': 0,
      'y': 0
    },
    'startRotation': {
      'min': 0,
      'max': 0
    },
    'rotationSpeed': {
      'min': 0,
      'max': 0
    },
    'lifetime': {
      'min': 0.5,
      'max': 0.5
    },
    'blendMode': 'normal',
    'frequency': 0.1,
    'emitterLifetime': 0.31,
    'maxParticles': 1000,
    'pos': {
      'x': 0,
      'y': 0
    },
    'addAtBack': false,
    'spawnType': 'burst',
    'particlesPerWave': 10,
    'particleSpacing': 0,
    'angleStart': 0
  },
  explosion3: {
    'alpha': {
      'start': 0.74,
      'end': 0
    },
    'scale': {
      'start': 5,
      'end': 1.2,
      'minimumScaleMultiplier': 1
    },
    'color': {
      'start': '#ffdfa0',
      'end': '#100f0c'
    },
    'speed': {
      'start': 700,
      'end': 0
    },
    'acceleration': {
      'x': 0,
      'y': 0
    },
    'startRotation': {
      'min': 0,
      'max': 360
    },
    'rotationSpeed': {
      'min': 0,
      'max': 200
    },
    'lifetime': {
      'min': 0.5,
      'max': 1
    },
    'blendMode': 'normal',
    'ease': [
      {
        's': 0,
        'cp': 0.329,
        'e': 0.548
      },
      {
        's': 0.548,
        'cp': 0.767,
        'e': 0.876
      },
      {
        's': 0.876,
        'cp': 0.985,
        'e': 1
      }
    ],
    'frequency': 0.001,
    'emitterLifetime': 0.1,
    'maxParticles': 100,
    'pos': {
      'x': 0,
      'y': 0
    },
    'addAtBack': true,
    'spawnType': 'point'
  },
  smokeRing: {
    'alpha': {
      'start': 0.74,
      'end': 0
    },
    'scale': {
      'start': 0.1,
      'end': 1.2,
      'minimumScaleMultiplier': 1
    },
    'color': {
      'start': '#eb8b58',
      'end': '#575757'
    },
    'speed': {
      'start': 700,
      'end': 50
    },
    'acceleration': {
      'x': 0,
      'y': 0
    },
    'startRotation': {
      'min': 0,
      'max': 360
    },
    'rotationSpeed': {
      'min': 0,
      'max': 200
    },
    'lifetime': {
      'min': 0.4,
      'max': 0.7
    },
    'blendMode': 'normal',
    'frequency': 0.001,
    'emitterLifetime': 0.2,
    'maxParticles': 100,
    'pos': {
      'x': 0,
      'y': 0
    },
    'addAtBack': true,
    'spawnType': 'point'
  }
}
