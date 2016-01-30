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
    Body = Matter.Body;

// create a Matter.js engine
var engine = Engine.create(document.body, {render: RenderPixi2.create({element: document.body, options: {debug: false}}) });
            
            var queue = new createjs.LoadQueue(true);            
            
var loadingText = new PIXI.Text('Loading...',{font : '24px Arial', fill : 0xff1010, align : 'center'});
engine.render.textContainer.addChild(loadingText);
            
            function loadFiles() {
                for (var organ in organs)
                {
                    queue.loadFile(organs[organ].collision, false); 
                    queue.loadFile(organs[organ].image, false);               
                }
                
                queue.loadFile('img/bone_end_collision.svg', false); 
                queue.loadFile('img/bone_end.png', false);  
                queue.loadFile('img/bone.png', false);  
                
                 queue.on("complete", function() {
                     engine.render.textContainer.removeChild(loadingText);
                     buildPaths();
                     createLevel();
                 });
                 
                 queue.load();
            }
            
            var boneEndPath, boneEndBounds;
            
            function buildPath(file) {
                var data = queue.getResult(file);
                var path = $(data).find('path')[0];
                return Svg.pathToVertices(path, 10);                
            }
            
            function buildPaths() {
                boneEndPath = buildPath('img/bone_end_collision.svg');
                boneEndBounds = Bounds.create(boneEndPath);
                
                for (var organ in organs)
                {
                    organ = organs[organ];
                    var p = organ._path = buildPath(organ.collision, false);  
                    organ._bounds = Bounds.create(p);
                    var img = queue.getResult(organ.image);
                    organ._width = img.width;     
                    organ._height = img.height;       
                }              
            }
            
            function createLevel() {                
                createBone(30, 30, 780, 30, 40);
                createBone(30, 85, 30, 515, 40);
                createBone(50, 570, 750, 570, 40);
                createBone(770, 85, 770, 515, 40);
                
                createOrgan('lungs', 400, 400, 0.2);
                
                World.add(engine.world, [MouseConstraint.create(engine)]);
            }
            
            loadFiles();

        var renderOptions = engine.render.options;
        renderOptions.showAngleIndicator = false;
        renderOptions.wireframes = false;
        renderOptions.showConvexHull = true;

// run the engine
Engine.run(engine);