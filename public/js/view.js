import * as THREE from './lib/three.module.js';
import { OrbitControls } from './lib/OrbitControls.js';
import { OrthographicTrackballControls } from './lib/OrthographicTrackballControls.js';
import { TransformControls } from './lib/TransformControls.js';



function ViewManager(main_ui_container, webgl_scene, render, on_box_changed, cfg){

    let subviewWidth = 0.2;

    if (cfg && cfg.subviewWidth){        
        subviewWidth = cfg.subviewWidth;
    }

    let viewCfg = [
        {
            left: 0,
            bottom: 0,
            width: 1.0,
            height: 1.0,
            background: new THREE.Color( 0.0, 0.0, 0.0 ),
            
        },
        {
            left: 0,
            bottom: 0.7,
            width: subviewWidth,
            height: 0.3,
            background: new THREE.Color( 0.1, 0.1, 0.2 ),
            
        },
        {
            left: 0,
            bottom: 0.5,
            width: subviewWidth,
            height: 0.2,
            background: new THREE.Color( 0.1, 0.2, 0.1 ),
            
        },
        {
            left: 0,
            bottom: 0.3,
            width: subviewWidth,
            height: 0.2,
            background: new THREE.Color( 0.2, 0.1, 0.1 ),
            
        }
    ];

    var container = main_ui_container;

    this.container = main_ui_container;
    this.views= [
        cfg.disableMainView?null:create_main_view(viewCfg[0], webgl_scene,  this.container, render, on_box_changed),
        create_top_view(viewCfg[1], webgl_scene),
        create_rear_view(viewCfg[2], webgl_scene),
        create_side_view(viewCfg[3], webgl_scene),   
    ];

    this.updateViewPort= function(){
        this.views.slice(1).forEach((view)=>{
            view.viewport={
                left: this.container.scrollWidth * view.viewCfg.left,
                bottom: this.container.scrollHeight-this.container.scrollHeight * view.viewCfg.bottom,
                width:this.container.scrollWidth * view.viewCfg.width,
                height:this.container.scrollHeight * view.viewCfg.height,
                zoom_ratio:view.zoom_ratio,
            };
        })
    };


    // no code after this line
        
    function create_main_view(viewCfg, scene, dom, render, on_box_changed){
        var view ={};
        view.viewCfg=viewCfg;
        view.zoom_ratio = 1.0; //useless for mainview
            
        var camera = new THREE.PerspectiveCamera( 65, container.clientWidth / container.clientHeight, 1, 800 );
        camera.position.x = 0;
        camera.position.z = 50;
        camera.position.y = 0;
        camera.up.set( 0, 0, 1);
        camera.lookAt( 0, 0, 0 );
        view.camera_perspective = camera;

        view.viewport={
            left: container.clientWidth * viewCfg.left,
            bottom: container.clientHeight-container.clientHeight * viewCfg.bottom,
            width:container.clientWidth * viewCfg.width,
            height:container.clientHeight * viewCfg.height,
            zoom_ratio:view.zoom_ratio,
        };

        //var cameraOrthoHelper = new THREE.CameraHelper( camera );
        //cameraOrthoHelper.visible=true;
        //scene.add( cameraOrthoHelper );

        var orbit_perspective = new OrbitControls( view.camera_perspective, dom );
        orbit_perspective.update();
        orbit_perspective.addEventListener( 'change', render );
        orbit_perspective.enabled = false;
        view.orbit_perspective = orbit_perspective;

        var transform_control = new TransformControls(camera, dom );
        transform_control.setSpace("local");
        transform_control.addEventListener( 'change', render );
        transform_control.addEventListener( 'objectChange', function(e){on_box_changed(e.target.object);});
        
        transform_control.addEventListener( 'dragging-changed', function ( event ) {
            view.orbit_perspective.enabled = ! event.value;
        } );
        transform_control.visible = false;
        //transform_control.enabled = false;
        scene.add( transform_control );
        view.transform_control_perspective = transform_control;




        var width = container.clientWidth;
        var height = container.clientHeight;
        var asp = width/height;

        //camera = new THREE.OrthographicCamera(-800*asp, 800*asp, 800, -800, -800, 800);       
        // camera.position.x = 0;
        // camera.position.z = 0;
        // camera.position.y = 0;
        // camera.up.set( 1, 0, 0);
        // camera.lookAt( 0, 0, -3 );

        //camera = new THREE.OrthographicCamera( container.clientWidth / - 2, container.clientWidth / 2, container.clientHeight / 2, container.clientHeight / - 2, -400, 400 );
        
        camera = new THREE.OrthographicCamera(-asp*200, asp*200, 200, -200, -200, 200 );
        camera.position.z = 50;
        

        // var cameraOrthoHelper = new THREE.CameraHelper( camera );
        // cameraOrthoHelper.visible=true;
        // scene.add( cameraOrthoHelper );

        
        view.camera_orth = camera;

        // var orbit_orth = new OrbitControls( view.camera_orth, dom );
        // orbit_orth.update();
        // orbit_orth.addEventListener( 'change', render );
        // orbit_orth.enabled = false;
        // view.orbit_orth = orbit_orth;

        var orbit_orth = new OrthographicTrackballControls( view.camera_orth, dom );
        orbit_orth.rotateSpeed = 1.0;
        orbit_orth.zoomSpeed = 1.2;
        orbit_orth.noZoom = false;
        orbit_orth.noPan = false;
        orbit_orth.noRotate = false;
        orbit_orth.staticMoving = true;
        
        orbit_orth.dynamicDampingFactor = 0.3;
        orbit_orth.keys = [ 65, 83, 68 ];
        orbit_orth.addEventListener( 'change', render );
        orbit_orth.enabled=true;
        view.orbit_orth = orbit_orth;
        
        transform_control = new TransformControls(view.camera_orth, dom );
        transform_control.setSpace("local");
        transform_control.addEventListener( 'change', render );
        transform_control.addEventListener( 'objectChange', function(e){on_box_changed(e.target.object);} );
        
        
        transform_control.addEventListener( 'dragging-changed', function ( event ) {
            view.orbit_orth.enabled = ! event.value;
        } );


        transform_control.visible = false;
        //transform_control.enabled = true;
        scene.add( transform_control );
        view.transform_control_orth = transform_control;



        view.camera = view.camera_orth;
        view.orbit = view.orbit_orth;
        view.transform_control = view.transform_control_orth;


        view.switch_camera = function(birdseye)        
        {
            
            if (!birdseye && (this.camera === this.camera_orth)){
                this.camera = this.camera_perspective;
                this.orbit_orth.enabled=false;
                this.orbit_perspective.enabled=true;
                this.orbit = this.orbit_perspective;

                
                this.transform_control_perspective.detach();
                this.transform_control_orth.detach();

                this.transform_control_orth.enabled=false;
                this.transform_control_perspective.enabled=true;
                //this.transform_control_perspective.visible = false;
                //this.transform_control_orth.visible = false;
                this.transform_control = this.transform_control_perspective;
            }
            else if (birdseye && (this.camera === this.camera_perspective))
            {
                this.camera = this.camera_orth;
                this.orbit_orth.enabled=true;
                this.orbit_perspective.enabled=false;
                this.orbit = this.orbit_orth;

                this.transform_control_perspective.detach();
                this.transform_control_orth.detach();
                this.transform_control_orth.enabled=true;
                this.transform_control_perspective.enabled=false;
                this.transform_control = this.transform_control_orth;
            }

            this.camera.updateProjectionMatrix();
        };

        view.reset_camera = function(){
            var camera = this.camera_perspective;
            camera.position.x = 0;
            camera.position.z = 50;
            camera.position.y = 0;
            camera.up.set( 0, 0, 1);
            camera.lookAt( 0, 0, 0 );
            camera.updateProjectionMatrix();

            this.orbit_perspective.reset();   // this func will call render()
        };

        view.look_at = function(p){
            if (this.orbit === this.orbit_perspective){
                this.orbit.target.x=p.x;
                this.orbit.target.y=p.y;
                this.orbit.target.z=p.z;
                this.orbit.update();
            }
        };

        view.onWindowResize = function(){

            

            var asp = container.clientWidth/container.clientHeight;
            this.camera_orth.left = -asp*200;
            this.camera_orth.right = asp*200;
            this.camera_orth.top = 200;
            this.camera_orth.bottom = -200
            this.camera_orth.updateProjectionMatrix();

            this.orbit_orth.handleResize();
            this.orbit_orth.update();
            
            this.camera_perspective.aspect = container.clientWidth / container.clientHeight;
            this.camera_perspective.updateProjectionMatrix();
            
        };

        view.reset_birdseye = function(){
            this.orbit_orth.reset(); // 
        };
        view.rotate_birdseye = function(){
            this.camera_orth.up.set( 1, 0, 0);
            this.orbit_orth.update();
        }
        view.detach_control = function(){
            this.transform_control.detach();
        }

        view.target0 = view.orbit.target.clone();
        view.position0 = view.camera.position.clone();
        view.zoom0 = view.camera.zoom;
        view.scale0 = null;
        
        view.save_orbit_state = function(highlight_obj_scale){
            this.target0.copy( this.orbit.target );
            this.position0.copy( this.camera.position );
            this.zoom0 = this.camera.zoom;
            this.scale0 = {x: highlight_obj_scale.x, y: highlight_obj_scale.y, z: highlight_obj_scale.z};
        }

        view.restore_relative_orbit_state = function(highlight_obj_scale){

            if (view.scale0){
                
                var obj_size = Math.sqrt(view.scale0.x*view.scale0.x + view.scale0.y*view.scale0.y + view.scale0.z*view.scale0.z);
                var target_obj_size = Math.sqrt(highlight_obj_scale.x*highlight_obj_scale.x + highlight_obj_scale.y*highlight_obj_scale.y + highlight_obj_scale.z*highlight_obj_scale.z);
                var ratio  = target_obj_size/obj_size;


                this.camera.position.x = this.orbit.target.x + (this.position0.x - this.target0.x)*ratio;
                this.camera.position.y = this.orbit.target.y + (this.position0.y - this.target0.y)*ratio;
                this.camera.position.z = this.orbit.target.z + (this.position0.z - this.target0.z)*ratio;

                this.camera.zoom = this.zoom0;
            } else {
                this.camera.position.set(
                    this.orbit.target.x + highlight_obj_scale.x*3, 
                    this.orbit.target.y + highlight_obj_scale.y*3, 
                    this.orbit.target.z + highlight_obj_scale.z*3);
            }
            // target is set 
        }

        return view;
    }


    function create_top_view(viewCfg, scene){
        var view = {};
        view.viewCfg=viewCfg;
        view.zoom_ratio = 1.0;
        //var camera = new THREE.PerspectiveCamera( 65, container.clientWidth / container.clientHeight, 1, 800 );
        var width = container.clientWidth;
        var height = container.clientHeight;
        var asp = width/height;

        var camera = new THREE.OrthographicCamera( -3*asp, 3*asp, 3, -3, -3, 3 );

        var cameraOrthoHelper = new THREE.CameraHelper( camera );
        cameraOrthoHelper.visible=false;
        scene.add( cameraOrthoHelper );
        view["cameraHelper"] = cameraOrthoHelper;

        camera.position.x = 0;
        camera.position.z = 0;
        camera.position.y = 0;
        //camera.up.set( 0, 1, 0);
        //camera.lookAt( 0, 0, -3 );

        camera.rotation.x=0;
        camera.rotation.y=0;
        camera.rotation.z=-Math.PI/2;;

        view.camera = camera;

        view.viewport={
            left: container.clientWidth * viewCfg.left,
            bottom: container.clientHeight-container.clientHeight * viewCfg.bottom,
            width:container.clientWidth * viewCfg.width,
            height:container.clientHeight * viewCfg.height,
            zoom_ratio:view.zoom_ratio,
        };
        return view;
    }

    function create_rear_view(viewCfg, scene){
        var view = {};
        view.zoom_ratio = 1.0;
        view.viewCfg=viewCfg;
        //var camera = new THREE.PerspectiveCamera( 65, container.clientWidth / container.clientHeight, 1, 800 );
        var width = container.clientWidth;
        var height = container.clientHeight;
        var asp = width/height;

        var camera = new THREE.OrthographicCamera( -3*asp, 3*asp, 3, -3, -3, 3 );

        var cameraOrthoHelper = new THREE.CameraHelper( camera );
        cameraOrthoHelper.visible=false;
        scene.add( cameraOrthoHelper );
        view["cameraHelper"] = cameraOrthoHelper;
                
        camera.position.x = 0;
        camera.position.z = 0;
        camera.position.y = 0;
        //camera.up.set( 0, 0, 1);
        //camera.lookAt( 0, 3, 0 );

        //camera.up.set( 0, 1, 0);
        //camera.lookAt( 0, 0, -3 );

        camera.rotation.x=Math.PI/2;
        camera.rotation.y=0;
        camera.rotation.z=0;

        view.camera = camera;

        view.viewport={
            left: container.clientWidth * viewCfg.left,
            bottom: container.clientHeight-container.clientHeight * viewCfg.bottom,
            width:container.clientWidth * viewCfg.width,
            height:container.clientHeight * viewCfg.height,
            zoom_ratio:view.zoom_ratio,
        };

        return view;
    }

    function create_side_view(viewCfg, scene){
        var view = {};
        view.zoom_ratio = 1.0;
        view.viewCfg=viewCfg;
        //var camera = new THREE.PerspectiveCamera( 65, container.clientWidth / container.clientHeight, 1, 800 );
        var width = container.clientWidth;
        var height = container.clientHeight;
        var asp = width/height;

        var camera = new THREE.OrthographicCamera( -3*asp, 3*asp, 3, -3, -3, 3 );

        var cameraOrthoHelper = new THREE.CameraHelper( camera );
        cameraOrthoHelper.visible=false;
        scene.add( cameraOrthoHelper );
        view["cameraHelper"] = cameraOrthoHelper;
                
        camera.position.x = 0;
        camera.position.z = 0;
        camera.position.y = 0;
        camera.up.set( 0, 0, 1);
        camera.lookAt( -3, 0, 0 );

        camera.rotation.x=Math.PI/2;
        camera.rotation.y=Math.PI/2;
        camera.rotation.z=0;

        view.camera = camera;


        view.viewport={
            left: container.clientWidth * viewCfg.left,
            bottom: container.clientHeight-container.clientHeight * viewCfg.bottom,
            width:container.clientWidth * viewCfg.width,
            height:container.clientHeight * viewCfg.height,
            zoom_ratio:view.zoom_ratio,
        };

        return view;
    }

}


export {ViewManager}