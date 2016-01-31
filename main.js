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
  Body = Matter.Body

var canvasHeight = 800
var canvasWidth = 1000
var margin = 20
var marginTop = 40

// create a Matter.js engine
var engine = Engine.create(document.body, {
  render: RenderPixi2.create({
    element: document.body,
    options: {
      debug: false,
      width: canvasWidth,
      height: canvasHeight
    }
  })
})

var queue = new createjs.LoadQueue(true)

var loadingText = new PIXI.Text('Loading...', {font: '24px Arial', fill: 0xff1010, align: 'center'})
engine.render.textContainer.addChild(loadingText)

function loadFiles () {
  engine.render.textContainer.removeChild(loadingText)
  var foreground = new PIXI.Sprite.fromImage('img/foreground.png')
  engine.render.textContainer.addChild(foreground)
  var background = new PIXI.Sprite.fromImage('img/background.png')
  engine.render.backgroundContainer.addChild(background)
  var promises = [buildBone()]
  for (var n in organs) {
    promises.push(buildPathLoadFile(organs[n]))
  }
  Promise.all(promises).then(function (){
    createLevel()
  })
}

function buildPathLoadFile (organ) {
  return new Promise(function (resolve){
    var queue = new createjs.LoadQueue(true)
    queue.loadFile(organ.collision)
    queue.loadFile(organ.image)
    queue.on('complete', function (){
      var p = organ._path = buildPath(queue.getResult(organ.collision), false)
      organ._bounds = Bounds.create(p)
      var img = queue.getResult(organ.image)
      organ._width = img.width
      organ._height = img.height
      resolve()
    })
  })
}

var boneEndPath, boneEndBounds

function buildPath (data) {
  var path = $(data).find('path')[0]
  return Svg.pathToVertices(path, 10)
}

function buildBone () {
  var queue = new createjs.LoadQueue(true)
  queue.loadFile('img/bone_end_collision.svg')
  queue.on('complete', function () {
    boneEndPath = buildPath(queue.getResult('img/bone_end_collision.svg'))
    boneEndBounds = Bounds.create(boneEndPath)
  })
}

function createBox () {
  var boxTop = Bodies.rectangle(canvasWidth / 2, margin / 2, canvasWidth, margin, {
    render: { visible: false },
    isStatic: true
  })
  var boxLeft = Bodies.rectangle(margin / 2, canvasHeight / 2, margin, canvasHeight, {
    render: { visible: false },
    isStatic: true
  })
  var boxRight = Bodies.rectangle(canvasWidth - margin / 2, canvasHeight / 2, margin, canvasHeight, {
    render: { visible: false },
    isStatic: true
  })
  var boxBottom = Bodies.rectangle(canvasWidth / 2, canvasHeight - margin / 2, canvasWidth * 2, margin, {
    render: { visible: false },
    isStatic: true
  })

  World.add(engine.world, [boxTop, boxLeft, boxRight, boxBottom])
}

var level
function createLevel () {
  createBox()
  var levelname = location.hash.length > 1 ? location.hash : '#1'
  var levelnumber = Number(levelname.slice(1))
  var level = window.levels[levelnumber - 1](engine)

  Events.on(engine, 'tick', function (event) {
    for (var i = 0; i < level.targetZones.length; i++) {
      var zone = level.targetZones[i]
      var result = Matter.Query.region(level.organs, zone)
      for (var j = 0; j < result.length; j++) {
        var center = Vertices.centre(result[j].vertices)
        if (Bounds.contains(zone, center)) {
          var organ = result[j]
          score += organ.scoreValue
          var sprite = engine.render.sprites['b-' + organ.id]
          level.organs.splice(level.organs.indexOf(organ), 1)
          var interval = setInterval(function () {
            sprite.alpha -= 0.1
            if (sprite.alpha <= 0) {
              window.clearInterval(interval)
              World.remove(engine.world, organ)
            }
          }, 40)
          refreshScore(level)
        }
      }
    }
  })

  for (var i = 0; i < level.targetZones.length; i++) {
    var zone = level.targetZones[i]

    var w = zone.max.x - zone.min.x
    var h = zone.max.y - zone.min.y

    var cut = new PIXI.Sprite.fromImage('img/cut.png')
    cut.x = zone.min.x - w / 3
    cut.y = zone.min.y - h / 2
    cut.width = w * 1.6
    engine.render.backgroundContainer.addChild(cut)

  /*
    var graphics = new PIXI.Graphics()
    graphics.beginFill(0x0088FF, 0.2)
    graphics.drawRect(zone.min.x, zone.min.y, zone.max.x - zone.min.x, zone.max.y - zone.min.y)

    engine.render.backgroundContainer.addChild(graphics)
   */
  }

  startParticles(engine)
  refreshScore(level)
}

var score = 0
var currentScore = 0
var currentMult = 1
var attemptsText
var scoreText
var lastScore
var lastMult
var killTimeout
function refreshScore (x, y) {
  if (!attemptsText) {
    attemptsText = new PIXI.Text('Cuts: 0/' + level.maxAttempts, {font: '24px bloodfont', fill: 0xFFFFFF, align: 'center'})
    engine.render.textContainer.addChild(attemptsText)
  }
  if (!scoreText) {
    scoreText = new PIXI.Text('Score: 0', {font: '24px bloodfont', fill: 0xFFFFFF, align: 'center'})
    scoreText.x = 400
    engine.render.textContainer.addChild(scoreText)
  }

  if (lastScore !== currentScore || lastMult !== currentMult) {
    if (killTimeout) {
      window.clearTimeout(killTimeout)
      killTimeout = null
    }
  }
  if (lastMult !== currentMult && x !== undefined) {
    var multText = new PIXI.Text('x' + currentMult, {font: '80px bloodfont', fill: 0xAA0000, align: 'center'})
    multText.x = x
    multText.y = y
    multText.alpha = 0.7
    engine.render.textContainer.addChild(multText)
    window.setTimeout(function () {
      var interval = window.setInterval(function () {
        multText.alpha -= 0.07
      }, 50)
      window.setTimeout(function () {
        engine.render.textContainer.removeChild(multText)
        window.clearInterval(interval)
      }, 500)
    }, 1000)
  }

  lastScore = currentScore
  lastMult = currentMult

  killTimeout = window.setTimeout(function () {
    score += currentScore * currentMult
    currentScore = 0
    currentMult = 1
    killTimeout = null
    refreshScore()
  }, 2000)


  attemptsText.text = 'Attempts: ' + level.attempts + '/' + level.maxAttempts
  var sign = currentScore > 0 ? ' + ' : (currentScore < 0 ? ' - ' : '')
  scoreText.text = 'Score: ' + score + (currentScore !== 0 ? sign + Math.abs(currentScore) + (currentMult > 1 ? 'x' + currentMult : '') : '')
  if (level.organs.length === 0) {
    popupMessage('You Won!!')
  }
  if (level.attempts === level.maxAttempts) {
    setTimeout(function () {
      if (level.organs.length > 0) {
        popupMessage('You Loose :(')
      }
    }, 3000)
  }
}

loadFiles()

var renderOptions = engine.render.options
renderOptions.showAngleIndicator = false
renderOptions.wireframes = false
renderOptions.showConvexHull = true
engine.enableSleeping = true

// run the engine
Engine.run(engine)

function clearGame () {
  while (engine.render.backgroundContainer.children[1]) {
    engine.render.backgroundContainer.removeChild(engine.render.backgroundContainer.children[1])
  }
  Matter.World.clear(engine.world, false, true)
}

$(window).on('hashchange', function () {
  if (location.hash.slice(1, 6) === 'level') {
    location.hash = '#' + location.hash.slice(6)
  }
  location.reload()
})

// Don't fucking delete my awesome mouse listener!
// There are comments you know ?
Matter.Events.on(MouseConstraint.create(engine), 'mousemove', function (event) {
  console.log(JSON.stringify(event.mouse.position))
})
