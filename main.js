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

// create a Matter.js engine
var engine = Engine.create(document.body, { render: RenderPixi2.create({element: document.body, options: {debug: false}}) })

var queue = new createjs.LoadQueue(true)

var loadingText = new PIXI.Text('Loading...', {font: '24px Arial', fill: 0xff1010, align: 'center'})
engine.render.textContainer.addChild(loadingText)

function loadFiles () {
  for (var organ in organs) {
    queue.loadFile(organs[organ].collision, false)
    queue.loadFile(organs[organ].image, false)
  }

  queue.loadFile('img/bone_end_collision.svg', false)
  queue.loadFile('img/bone_end.png', false)
  queue.loadFile('img/bone.png', false)

  queue.on('complete', function () {
    engine.render.textContainer.removeChild(loadingText)
    buildPaths()
    createLevel()
  })

  queue.load()
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

var level = {
  organs: [],
  targetZones: [{
    min: {
      x: 50,
      y: 500
    },
    max: {
      x: 200,
      y: 560
    }
  }, {
    min: {
      x: 500,
      y: 60
    },
    max: {
      x: 700,
      y: 150
    }
  }],
  score: 0
}

function createLevel () {
  createBone(30, 30, 780, 30, 20)
  createBone(30, 85, 30, 515, 20)
  createBone(50, 570, 750, 570, 20)
  createBone(770, 85, 770, 515, 20)

  var lung = createOrgan('lungs', 300, 300, 0.1)

  var heart = createOrgan('heart', 600, 350, 0.2)

  attachWithRope(engine.world, {
    fromPoint: {x:200,y:100},
    to: lung
  })
  attachWithRope(engine.world, {
    fromPoint: {x:400, y:100},
    to: lung
  })
  
  attachWithRope(engine.world, {
    fromPoint: {x:600, y:170},
    to: heart
  })
  
  putExplodeChakra(engine, {
    x: 200,
    y: 370
  })
  
  putExplodeChakra(engine, {
    x: 600,
    y: 450
  })

  Events.on(engine, 'tick', function (event) {
    for (var i = 0; i < level.targetZones.length; i++) {
      var zone = level.targetZones[i]
      var result = Matter.Query.region(level.organs, zone)
      for (var j = 0; j < result.length; j++) {
        var center = Vertices.centre(result[j].vertices)
        if (Bounds.contains(zone, center)) {
          World.remove(engine.world, result[j])
          level.organs.splice(level.organs.indexOf(result[j]), 1)
          level.score++
          refreshScore()
          break
        }
      }
    }
  })

  World.add(engine.world, [MouseConstraint.create(engine)])

  for (var i = 0; i < level.targetZones.length; i++) {
    var zone = level.targetZones[i]
    var graphics = new PIXI.Graphics()

    graphics.beginFill(0x0088FF, 0.2)
    graphics.drawRect(zone.min.x, zone.min.y, zone.max.x - zone.min.x, zone.max.y - zone.min.y)

    engine.render.textContainer.addChild(graphics)
  }
  
  refreshScore()
}

var scoreText
function refreshScore () {
  if (!scoreText) {
    scoreText = new PIXI.Text('Score: 0', {font: '24px Arial', fill: 0xff1010, align: 'center'})
    engine.render.textContainer.addChild(scoreText)
  }

  scoreText.setText('Score: ' + level.score)
}

loadFiles()

var renderOptions = engine.render.options
renderOptions.showAngleIndicator = false
renderOptions.wireframes = false
renderOptions.showConvexHull = true
engine.enableSleeping = true

// DEBUG
var mouseConstraint = MouseConstraint.create(engine)
Matter.Events.on(mouseConstraint, 'mousemove', function (event) {
  console.log(JSON.stringify(event.mouse.position))
})

waitForSword(engine)

// run the engine
Engine.run(engine)
