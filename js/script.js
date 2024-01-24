// import './style.css';
// import './models/pillar_02.gltf';
// import * as BABYLON from 'babylonjs';
// import 'babylonjs-loaders';

// Get the canvas element
const canvas = document.getElementById('renderCanvas');

const engine = new BABYLON.Engine(canvas, true);

let blocks = [];

const createScene = () => {
  var scene = new BABYLON.Scene(engine);

  // This creates and positions a free camera (non-mesh)
  var camera = new BABYLON.FreeCamera(
    'camera1',
    new BABYLON.Vector3(0, 5, -10),
    scene
  );

  camera.position.set(80, 80, 80);
  camera.rotation.y = -Math.PI / 4;
  camera.rotation.x = Math.atan(-1 / Math.sqrt(2));

  // camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

  // This targets the camera to scene origin
  camera.setTarget(new BABYLON.Vector3(0, 30, 0));

  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);

  let dirLight = new BABYLON.DirectionalLight(
    'mainDirLight',
    new BABYLON.Vector3(0, -0.5, -1),
    scene
  );
  dirLight.intensity = 1;
  dirLight.position = new BABYLON.Vector3(0, 50, 30);

  const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);

  const blockMat = new BABYLON.StandardMaterial('blockMat', scene);
  blockMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
  blockMat.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
  blockMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
  blockMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
  blockMat.backFaceCulling = true;
  // blockMat.flipNormal = new FlipNormalMaterial(material);
  // blockMat.flipNormal.isEnabled = true;

  // blockMat.wireframe = true;

  BABYLON.SceneLoader.ImportMesh(
    '',
    '../models/',
    'pillar_hollow_05.gltf',
    scene,
    (meshes) => {
      meshes.forEach((m) => {
        m.material = blockMat;
        m.enableEdgesRendering();
        m.edgesColor = BABYLON.Color4.FromColor3(BABYLON.Color3.Black());
        m.edgesWidth = 7;
        // m.renderOutline = true;
        // m.outlineColor = BABYLON.Color3.Black();
        // m.outlineWidth = 0.1;
        if (m.name.includes('Block')) {
          blocks.push(m);
          shadowGenerator.addShadowCaster(m);
          m.receiveShadows = true;
        } else if (m.name.includes('root')) {
          m.addRotation(-Math.PI / 2, -Math.PI / 8, 0);
          m.position.addInPlace(new BABYLON.Vector3(0, 20, -30));
        }
      });

      camera.orthoLeft = 35;
      camera.orthoRight = -35;
      camera.orthoTop = 35;
      camera.orthoBottom = -35;

      let [min, max] = computeSceneBounds(camera);
      min.scaleInPlace(1.2);
      max.scaleInPlace(1.2);
      console.log(min, max);
      setCameraFrustum(camera, min, max);

      console.log(meshes);
    }
  );

  let ground = BABYLON.MeshBuilder.CreateGround(
    'ground',
    { width: 500, height: 500 },
    scene
  );
  ground.rotate(BABYLON.Axis.Y, Math.PI / 4, BABYLON.Space.LOCAL);
  ground.position.y = 10;
  ground.receiveShadows = true;

  // camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

  new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0));

  const setCameraFrustum = (camera, min, max) => {
    const aspect = engine.getRenderHeight() / engine.getRenderWidth();
    const aspectW = (max.y - min.y) / (max.x - min.x);

    const a = aspect / aspectW;

    camera.orthoLeft = a > 1 ? min.x : min.x / a;
    camera.orthoRight = a > 1 ? max.x : max.x / a;
    camera.orthoTop = a > 1 ? max.y * a : max.y;
    camera.orthoBottom = a > 1 ? min.y * a : min.y;
  };

  const computeSceneBounds = (camera) => {
    const min = new BABYLON.Vector3(Infinity, Infinity, Infinity);
    const max = new BABYLON.Vector3(-Infinity, -Infinity, -Infinity);

    const viewMatrix = camera.getViewMatrix(true);
    console.log('viewMatrix', viewMatrix);

    const tmp1 = new BABYLON.Vector3();
    const tmp2 = new BABYLON.Vector3();

    scene.meshes.forEach((m) => {
      m.refreshBoundingInfo();

      const bmin = m.getBoundingInfo().boundingBox.minimumWorld;
      const bmax = m.getBoundingInfo().boundingBox.maximumWorld;

      BABYLON.Vector3.TransformCoordinatesToRef(bmin, viewMatrix, tmp1);
      BABYLON.Vector3.TransformCoordinatesToRef(bmax, viewMatrix, tmp2);

      min.minimizeInPlace(tmp1);
      max.maximizeInPlace(tmp2);
    });

    return [min, max];
  };

  return scene;
};

const scene = createScene();

const spinForward = (delay) => {
  console.log('spinning Blocks');
  blocks.forEach((b, i) => {
    // console.log('spinning Block', i, b.rotationQuaternion);
    setTimeout(() => {
      BABYLON.Animation.CreateAndStartAnimation(
        'block_' + String(i) + '_anim',
        b,
        'rotationQuaternion',
        24,
        24,
        b.rotationQuaternion,
        new BABYLON.Quaternion(0, 0, 0.7071068, -0.7071068),
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
    }, i * delay);
  });
};

const spinBack = (delay) => {
  console.log('spinning Blocks Back');
  blocks.forEach((b, i) => {
    // console.log('spinning Block', i, b.rotationQuaternion);
    setTimeout(() => {
      BABYLON.Animation.CreateAndStartAnimation(
        'block_' + String(i) + '_anim',
        b,
        'rotationQuaternion',
        24,
        24,
        b.rotationQuaternion,
        new BABYLON.Quaternion(0.5, -0.5, -0.5, 0.5),
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
      );
    }, i * delay);
  });
};

console.log(scene);

engine.runRenderLoop(function () {
  scene.render();
});

window.addEventListener('resize', function () {
  engine.resize();
});

document.querySelector('#startAnimationBack')?.addEventListener('click', () => {
  spinForward(100);
});

document.querySelector('#startAnimationBack')?.addEventListener('click', () => {
  spinBack(100);
});

let position = 0;

document.querySelector('#startAnimation')?.addEventListener('click', () => {
  if (position === 0) {
    spinForward(100);
    position = 1;
  } else {
    spinBack(100);
    position = 0;
  }
});
