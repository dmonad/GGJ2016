window.levels = {
  '#1': function level1 (engine) {
    var level = {
      attempts: 0,
      maxAttempts: 2,
      organs: [],
      targetZones: [{
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
      fromPoint: {x: 200,y: 100},
      to: lung
    })
    attachWithRope(engine.world, {
      fromPoint: {x: 400, y: 100},
      to: lung
    })

    attachWithRope(engine.world, {
      fromPoint: {x: 600, y: 170},
      to: heart
    })

    putFireChakra(engine, {
      x: 200,
      y: 370
    })

    putFireChakra(engine, {
      x: 600,
      y: 450
    })
    waitForSword(engine, level)

    return level
  },
  '#2': function level2 (engine) {
    var level = {
      attempts: 0,
      maxAttempts: 2,
      organs: [],
      targetZones: [{
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
      fromPoint: {x: 200,y: 100},
      to: lung
    })
    attachWithRope(engine.world, {
      fromPoint: {x: 400, y: 100},
      to: lung
    })

    attachWithRope(engine.world, {
      fromPoint: {x: 600, y: 170},
      to: heart
    })

    putFireChakra(engine, {
      x: 200,
      y: 370
    })

    putFireChakra(engine, {
      x: 600,
      y: 450
    })
    waitForSword(engine, level)

    return level
  }
}
