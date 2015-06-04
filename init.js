var renderer, scene, camera, light, ambient, canvas, controls, clock;

function init() {
  var container = document.getElementById('milkyway');

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor('#000038', 1);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 100, 8000);
  camera.position = new THREE.Vector3(0, 0, 70);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  //controls = new THREE.TrackballControls(camera, renderer.domElement);
  //controls.maxDistance = 4000;
  //controls.staticMoving = false;
  //controls.dynamicDumpingFactor = 0.2;
  // カメラの設定
  controls = new THREE.FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 8;
  controls.lookSpeed = 0.05;
  controls.verticalMin = Math.PI / 4;
  clock = new THREE.Clock();
}

function main() {
  controls.update(clock.getDelta());
  renderer.render(scene, camera);
  requestAnimationFrame(main);
}

function drawStars(stars) {
  // ジオメトリ
  var geometryS = new THREE.Geometry();
  var geometryM = new THREE.Geometry();
  var geometryL = new THREE.Geometry();

  // 暗い星のマテリアル
  var materialS = new THREE.ParticleBasicMaterial({
    vertexColors: true,
    size: 1.0,
    sizeAttenuation: false
  });
  // 中位の星のマテリアル
  var materialM = new THREE.ParticleBasicMaterial({
    vertexColors: true,
    size: 2.0,
    sizeAttenuation: false
  });
  // 明るい星のマテリアル
  var materialL = new THREE.ParticleBasicMaterial({
    vertexColors: true,
    size: 3.0,
    sizeAttenuation: false
  });

  var colors = [], brightStars = [];
  for (var i in stars) {
    var star = stars[i];
    var ra = star.RA * Math.PI / 180;
    var dec = star.Dec * Math.PI / 180;
    var dist = 1000;
    var x = dist * Math.cos(ra) * Math.cos(dec);
    var y = dist * Math.sin(ra) * Math.cos(dec);
    var z = dist * Math.sin(dec);
    star.position = new THREE.Vector3(x, z, -y);
 
    var alpha = 1;
    star.color = new THREE.Color(parseInt(star.color));
    star.color.r *= alpha;
    star.color.g *= alpha;
    star.color.b *= alpha;
 
    // 星の明るさによってジオメトリを切り替える
    if (star.Vmag < 4.0) {
      geometryL.vertices.push(star.position);
      geometryL.colors.push(star.color);
    } else if (star.Vmag < 6.0) {
      geometryM.vertices.push(star.position);
      geometryM.colors.push(star.color);
    } else {
      geometryS.vertices.push(star.position);
      geometryS.colors.push(star.color);
    }
  }
  //geometry.colors = colors;
  var particleSystemS = new THREE.ParticleSystem(geometryS, materialS);
  var particleSystemM = new THREE.ParticleSystem(geometryM, materialM);
  var particleSystemL = new THREE.ParticleSystem(geometryL, materialL);
  scene.add(particleSystemS);
  scene.add(particleSystemM);
  scene.add(particleSystemL);
 
  for (var i in brightStars) {
    var star = brightStars[i];
    var r = 3 - star.Vmag * 0.6;
    var c = star.color;
    var material = new THREE.MeshBasicMaterial({ color: c, blending: THREE.AdditiveBlending });
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 4, 4), material);
    mesh.position = star.position;
    scene.add(mesh);
  }
}

var loadObj = {
  'position': 'materials/hip.json',
  //'line': 'materials/hip_link.csv'
};
window.onload = function(e) {
  init();


  for(var key in loadObj) {
    onload = function(e) {
      if (xhr.readyState === 4) {

        if (xhr.responseURL.indexOf(loadObj.position) != -1) {
          drawStars(JSON.parse(xhr.responseText));
        }

        if (xhr.responseURL.indexOf(loadObj.line) != -1) {

        }
      }
    }
    // memo: one request one instance
    var xhr = new XMLHttpRequest();
    // for NOT IE
    if (xhr.onload !== undefined) {
      xhr.onload = onload;
    } else {
      // for IE
      xhr.onreadystatechange = onload;
    }
    xhr.open('GET', loadObj[key], true);
    var h = xhr.send();
  }

  main();
}
