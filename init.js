var renderer, scene, camera, light, ambient, canvas, controls, clock, controlsEnabled;
var prevTime = performance.now();

function init() {
  var container = document.getElementById('milkyway');

  renderer = new THREE.WebGLRenderer({ antialias: true });
  var w = document.body.clientWidth;
  var h = document.body.clientHeight;
  renderer.setSize(w, h);
  renderer.setClearColor('#000038', 1);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, w/h, 100, 8000);
  camera.position = new THREE.Vector3(0, 0, 70);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  scene.add(camera);

  //controls = new THREE.FirstPersonControls(camera, renderer.domElement);
  //controls.movementSpeed = 8;
  //controls.lookSpeed = 0.05;
  controls = new THREE.PointerLockControls(camera, renderer.domElement);
  controls.enabled = true;

}

function main() {
  //controls.update(clock.getDelta());
  renderer.render(scene, camera);
  requestAnimationFrame(main);
}

function drawStars(stars, lines) {
  var geometry = new THREE.Geometry();
  var geometryM = new THREE.Geometry();
  var geometryL = new THREE.Geometry();
  var material = new THREE.PointCloudMaterial({
    vertexColors: true,
    size: 0.7,
    sizeAttenuation: false
  });
  var materialM = new THREE.PointCloudMaterial({
    vertexColors: true,
    size: 2.0,
    sizeAttenuation: false
  });
  var materialL = new THREE.PointCloudMaterial({
    vertexColors: true,
    size: 5.0,
    sizeAttenuation: false
  });

  var colors = [], brightStars = [];
  for (var i in stars) {
    var star = stars[i];
    star.position = getStarVector(star);
 
    //var alpha = 1 - star.Vmag / 5;
    //alpha = (alpha < 0.1) ? 0.1 : (alpha > 1 ? 1 : alpha);
    var alpha = 0.7;
    star.color = new THREE.Color(parseInt(star.color));
    star.color.r *= alpha;
    star.color.g *= alpha;
    star.color.b *= alpha;
 
    if (star.Vmag < 4.0) {
      //brightStars.push(star);
      geometryL.vertices.push(star.position);
      geometryL.colors.push(star.color);
      continue;
    } 
    if (star.Vmag < 6.0) {
      geometryM.vertices.push(star.position);
      geometryM.colors.push(star.color);
      continue;
    }
    geometry.vertices.push(star.position);
    geometry.colors.push(star.color);
  }

  for (var i in lines) {
    // draw star line
    var line = lines[i];

    var lineGeo = new THREE.Geometry();
    var lineMaterial = new THREE.LineBasicMaterial({ linewidth: 1, color: 0xdfdfdf});
    if (!line.start || !line.end) { 
      continue; 
    }
    var start = Enumerable.from(stars).first(function(x) { return x.ID == line.start});
    var end = Enumerable.from(stars).first(function(x) { return x.ID == line.end});

    lineGeo.vertices.push(start.position);
    lineGeo.vertices.push(end.position);
    scene.add(new THREE.Line(lineGeo, lineMaterial));
  }
  scene.add(new THREE.PointCloud(geometry, material));
  scene.add(new THREE.PointCloud(geometryM, materialM));
  scene.add(new THREE.PointCloud(geometryL, materialL));

  controlsEnabled = true;
}

var loadObj = {
  'position': 'materials/hip.json',
  'line': 'materials/hip_link.csv'
};
window.onload = function(e) {
  var source, lines;
  init();
  loadFile(loadObj.line, function(res) {
    lines = parseCsv(res); 
  });
  loadFile(loadObj.position, function(res) {
    drawStars(JSON.parse(res), lines);
  });

  main();
}

function loadFile(fileName, callback) {
    var xhr = new XMLHttpRequest();
    onload = function(e) {
      if (xhr.readyState === 4) {
        callback(xhr.responseText);
      }
    }
    // memo: one request one instance
    xhr.open('GET', fileName, true);

    if (xhr.onload !== undefined) {
      xhr.onload = onload;
    } else {
      // for IE
      xhr.onreadystatechange = onload;
    }
    xhr.send(null);
}


function parseCsv(file) {
  var lines = file.split('\n');
  var objs = [];
  for(var i = 0; i < lines.length; i++) {
    var obj = lines[i].split(',');
    obj[obj.length - 1] = obj[obj.length - 1].trim('\n');
    objs.push({
      start: obj[1],
      end: obj[2],
      name: obj[0]
    });
  }
  return objs;
}

function getStarVector(data) {
  var ra = data.RA * Math.PI / 180;
  var dec = data.Dec * Math.PI / 180;
  var dist = 1000;
  var x = dist * Math.cos(ra) * Math.cos(dec);
  var y = dist * Math.sin(ra) * Math.cos(dec);
  var z = dist * Math.sin(dec);
  return new THREE.Vector3(x, z, -y);
}
