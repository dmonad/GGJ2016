
window.levels = {
  '#1': function level1 (engine) {
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
    var lung = createOrgan('lungs', 300, 300, 0.1, level)

    var heart = createOrgan('heart', 600, 350, 0.2, level)

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
    return level
  },
  '#2': function level2 (engine) {
    var level = {
      organs: [],
      targetZones: [{
        min: {
          x: 100,
          y: 100
        },
        max: {
          x: 200,
          y: 260
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
    var lung = createOrgan('lungs', 200, 300, 0.1, level)

    var heart = createOrgan('heart', 200, 350, 0.2, level)

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
    return level
  }
}
