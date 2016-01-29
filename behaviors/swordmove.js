Physics.behavior('swordmove', function( parent ){

    var defaults = {
      pos: {x: 0, y: 0}
    };

    return {

        // extended
        init: function( options ){
            parent.init.call( this );
            this.options.defaults( defaults );
            this.options( options );

            // extend options
            this._pos = new Physics.vector();
            this._start = new Physics.vector();
            this.setPosition( this.options.pos);
            delete this.options.pos;
        },

        /**
         * ConstantAccelerationBehavior#setAcceleration( acc ) -> this
         * - acc (Vectorish): The acceleration vector
         * 
         * Set the acceleration of the behavior.
         **/
        setPosition: function( pos ){
            this._pos.clone( pos );
            //this._start.clone(this.getTargets()[0].state.pos)
            return this;
        },

        // extended
        behave: function( data ){

            var bodies = this.getTargets();

            for ( var i = 0, l = bodies.length; i < l; ++i ){
                var curPos = bodies[i].state.pos
                if (curPos.dist(this._pos) > 5) {
                  var direction = new Physics.vector()
                  direction = this._pos.clone()
                  direction.vsub(curPos)
                  var dirLength = direction.norm()
                  if (dirLength > 10) {
                    direction.mult(1 / dirLength)
                    direction.mult(Math.max(0.7, Math.min(2, (400-dirLength)/200, 1.1)))
                    bodies[ i ].state.vel = direction;
                  } else {
                    bodies[i].state.vel = new Physics.vector(0,0)
                  }
                }
            }
        }
    };
});