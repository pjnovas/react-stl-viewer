import THREE from './Three';
import ReactDOM  from 'react-dom';
let OrbitControls = require('three-orbit-controls')(THREE);

class Paint {
  constructor(context) {
    this.component = context;
    this.url = context.props.url;
    this.width = context.props.width;
    this.height = context.props.height;
    this.modelColor = context.props.modelColor;
    this.backgroundColor = context.props.backgroundColor;
    this.orbitControls = context.props.orbitControls;
    this.rotate = context.props.rotate;
    this.cameraX = context.props.cameraX;
    this.cameraY = context.props.cameraY;
    this.cameraZ = context.props.cameraZ;
    this.rotationSpeeds = context.props.rotationSpeeds;
    this.lightX = context.props.lightX;
    this.lightY = context.props.lightY;
    this.lightZ = context.props.lightZ;
    this.lightColor = context.props.lightColor;
  }

  init() {
    //Detector.addGetWebGLMessage();
    this.scene = new THREE.Scene();
    this.distance = 10000;
    
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(this.lightX, this.lightY, this.lightZ);
    this.scene.add(hemiLight);
    
    let directionalLight = new THREE.DirectionalLight(this.lightColor);
    directionalLight.position.x = this.lightX;
    directionalLight.position.y = this.lightY;
    directionalLight.position.z = this.lightZ;
    directionalLight.position.normalize();
    this.scene.add(directionalLight);

    this.addSTLToScene();
  }

  addSTLToScene() {
    let loader = new THREE.STLLoader();
    loader.crossOrigin = '';

    loader.load(this.url, (geometry) => {

      // Calculate mesh noramls for MeshLambertMaterial.
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      // Center the object
      geometry.center();

      this.mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({
            overdraw:true,
            color: this.modelColor,
          }
        ));
      // Set the object's dimensions
      geometry.computeBoundingBox();
      this.xDims = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      this.yDims = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
      this.zDims = geometry.boundingBox.max.z - geometry.boundingBox.min.z;

      if (this.rotate) {
        this.mesh.rotation.x = this.rotationSpeeds[0];
        this.mesh.rotation.y = this.rotationSpeeds[1];
        this.mesh.rotation.z = this.rotationSpeeds[2];
      }

      this.scene.add(this.mesh);

      this.addCamera();
      this.addInteractionControls();
      this.addToReactComponent();

      // Start the animation
      this.animate();
    });
  }

  addCamera() {
    // Add the camera
    this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, this.distance);

    if (this.cameraZ === null) {
      this.cameraZ = Math.max(this.xDims * 3, this.yDims * 3, this.zDims * 3);
    }

    this.camera.position.set(this.cameraX, this.cameraY, this.cameraZ);

    this.scene.add(this.camera);

    this.camera.lookAt(this.mesh);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    }); //new THREE.CanvasRenderer();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(this.backgroundColor, 1);
  }

  addInteractionControls() {
    // Add controls for mouse interaction
    if (this.orbitControls) {
      this.controls = new OrbitControls(this.camera, ReactDOM.findDOMNode(this.component));
      this.controls.enableKeys = false;
      this.controls.addEventListener('change', this.orbitRender.bind(this));
    }
  }

  addToReactComponent() {
    // Add to the React Component
    ReactDOM.findDOMNode(this.component).replaceChild(this.renderer.domElement,
      ReactDOM.findDOMNode(this.component).firstChild);
  }

  /**
   * Animate the scene
   * @returns {void}
   */
  animate() {
    // note: three.js includes requestAnimationFrame shim
    if (this.rotate) {
      requestAnimationFrame(this.animate.bind(this));
    }
    if (this.orbitControls) {
      this.controls.update();
    }
    this.render();
  }

  /**
   * Render the scene after turning off the rotation
   * @returns {void}
   */
  orbitRender() {
    if (this.rotate) {
      this.rotate = false;
    }

    this.render();
  }

  /**
   * Render the scene
   * @returns {void}
   */
  render() {
    if (this.mesh && this.rotate) {
      this.mesh.rotation.x += this.rotationSpeeds[0];
      this.mesh.rotation.y += this.rotationSpeeds[1];
      this.mesh.rotation.z += this.rotationSpeeds[2];
    }

    this.renderer.render(this.scene, this.camera);
  }
}

export default Paint;
