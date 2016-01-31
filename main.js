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

var queue = new createjs.LoadQueue()

var loadingText = new PIXI.Text('Loading...', {font: '24px Arial', fill: 0xff1010, align: 'center'})
engine.render.textContainer.addChild(loadingText)

function loadFiles () {
  for (var organ in organs) {
    queue.loadFile(organs[organ].collision)
    queue.loadFile(organs[organ].image)
  }

  queue.loadFile('img/bone_end_collision.svg')

  // queue.on('complete', function () {
    engine.render.textContainer.removeChild(loadingText)
    var foreground = new PIXI.Sprite.fromImage('img/foreground.png')
    engine.render.textContainer.addChild(foreground)
    var background = new PIXI.Sprite.fromImage('img/background.png')
    engine.render.backgroundContainer.addChild(background)
    queue.on('complete', function () {
      buildPaths()
      createLevel()
    })
  //})

}

var boneEndPath, boneEndBounds

function buildPath (file) {
  var data = queue.getResult(file)
  var path = $(data).find('path')[0]
  return Svg.pathToVertices(path, 10)
}

function buildPaths () {
  boneEndPath = buildPath('img/bone_end_collision.svg')
  boneEndBounds = Bounds.create(boneEndPath)

  for (var organ in organs) {
    organ = organs[organ]
    var p = organ._path = buildPath(organ.collision, false)
    organ._bounds = Bounds.create(p)
    var img = queue.getResult(organ.image)
    organ._width = img.width
    organ._height = img.height
  }
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

function createLevel () {
  createBox()
  var levelname = location.hash.length > 1 ? location.hash : '#1'
  var level = window.levels[levelname](engine)

  Events.on(engine, 'tick', function (event) {
    for (var i = 0; i < level.targetZones.length; i++) {
      var zone = level.targetZones[i]
      var result = Matter.Query.region(level.organs, zone)
      for (var j = 0; j < result.length; j++) {
        var center = Vertices.centre(result[j].vertices)
        if (Bounds.contains(zone, center)) {
          var organ = result[j]
          level.score += organ.scoreValue
          var sprite = engine.render.sprites['b-' + organ.id]
          level.organs.splice(level.organs.indexOf(organ), 1)
          var interval = setInterval(function () {
            sprite.alpha -= 0.1
            if (sprite.alpha <= 0) {
              window.clearInterval(interval)
              World.remove(engine.world, organ)
            }
          }, 40)
          level.score++
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

var attemptsText
var scoreText
function refreshScore (level) {
  if (!attemptsText) {
    attemptsText = new PIXI.Text('Cuts: 0/' + level.maxAttempts, {font: '24px Arial', fill: 0xFFFFFF, align: 'center'})
    engine.render.textContainer.addChild(attemptsText)
  }
  if (!scoreText) {
    scoreText = new PIXI.Text('Score: ' + level.score, {font: '24px Arial', fill: 0xFFFFFF, align: 'center'})
    scoreText.x = 400
    engine.render.textContainer.addChild(scoreText)
  }

  attemptsText.text = 'Attempts: ' + level.attempts + '/' + level.maxAttempts
  scoreText.text = 'Score: ' + level.score
  if (level.organs.length === 0) {
    popupMessage('You Won!!')
  }
  if (level.attempts === level.maxAttempts) {
    setTimeout(function (){
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

$(window).on('hashchange', function() {
  if (location.hash.slice(1,6) === 'level') {
    location.hash = '#' + location.hash.slice(6)
  }
  location.reload()
})


// Don't fucking delete my awesome mouse listener!
// There are comments you know ?
Matter.Events.on(MouseConstraint.create(engine), 'mousemove', function (event) {
  console.log(JSON.stringify(event.mouse.position))
})

