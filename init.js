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
  var geometry = new THREE.Geometry();
  var material = new THREE.ParticleBasicMaterial({
    vertexColors: true,
    size: 1.0,
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
 
    //var alpha = 1 - star.Vmag / 10;
    //alpha = (alpha < 0.1) ? 0.1 : (alpha > 1 ? 1 : alpha);
    var alpha = 1;
    star.color = new THREE.Color(parseInt(star.color));
    star.color.r *= alpha;
    star.color.g *= alpha;
    star.color.b *= alpha;
 
    if (star.Vmag < 4.0) {
      brightStars.push(star);
    } else {
      geometry.vertices.push(star.position);
      colors.push(star.color);
    }
  }
  geometry.colors = colors;
  var particleSystem = new THREE.ParticleSystem(geometry, material);
  scene.add(particleSystem);
 
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
