import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'
import { OBJLoader } from '../libs/OBJLoader.js'
import { MTLLoader } from '../libs/MTLLoader.js'
import { CSG } from '../libs/CSG-v2.js' 
 
class Decoracion extends THREE.Object3D {

  // ---------------------------------------------------------------

  constructor() {
    super();

    // Creamos el material de las siluetas de los objetos.
    this.materialSilueta = new THREE.MeshBasicMaterial({color: '#505050', side: THREE.BackSide});
    
    // Creamos las variables para cargar los materiales y objetos:
    this.materialLoader = new MTLLoader();
    this.objetoLoader = new OBJLoader();
    this.texturaLoader = new THREE.TextureLoader();
  }

  // ---------------------------------------------------------------

  createEstanteria(largo){
    // --------- TEXTURAS ---------
    var textura_madera = this.texturaLoader.load ('../imgs/textura_madera1.jpg');

    // Primero voy a declarar el material de la estantería:
    var material = new THREE.MeshLambertMaterial({color: 0x745E45, map: textura_madera});

    // Ahora creo la geometría de lo que van a ser las tablas de madera:
    var geometriaHorizontal = new THREE.BoxGeometry(0.04, 0.8, 0.3);
    var tablaIZQ = new THREE.Mesh(geometriaHorizontal, material);
    tablaIZQ.position.y = 0.4;

    var tablaDER = tablaIZQ.clone();
    tablaDER.position.x = largo/2 - 0.02;
    tablaIZQ.position.x = -largo/2 + 0.02;

    var geometriaVertical = new THREE.BoxGeometry(largo, 0.03, 0.3);
    var tabla1 = new THREE.Mesh(geometriaVertical, material);
    tabla1.position.y = 0.05;

    var tabla2 = tabla1.clone();
    var tabla3 = tabla1.clone();

    tabla2.position.y = 0.25;
    tabla3.position.y = 0.55;

    var estanteria = new THREE.Object3D();
    estanteria.add(tablaDER, tablaIZQ, tabla1, tabla2, tabla3);

    estanteria.scale.y = 1.5;

    // --------------------- DECORACION DE LA ESTANTERÍA ---------------------
    var estanteria_final = new THREE.Object3D().add(estanteria);

    // -------------------------------------------------------------------------
    // Creamos y posicionamos las pociones en la primera balda de la estantería.
    var cantidadPociones = 8; // Número de pociones.
    var espacioEntrePociones = (largo - 0.05) / cantidadPociones; // Espacio entre cada poción.

    for (var i = 0; i < cantidadPociones; i++) {
      var colorLiquido = Math.random() * 0xFFFFFF; // Genera un número aleatorio entre 0 y 0xffffff para que las pociones tengan diferentes colores.
      var pocion = this.createPocion(0xD6DCDE, colorLiquido, 0.3);
      pocion.position.x = (i - cantidadPociones / 2 + 0.5) * espacioEntrePociones; // Posiciona las pociones en toda la estantería.
      pocion.position.y = 0.55 + 0.3; 

      estanteria_final.add(pocion);
    }

    // -------------------------------------------------------------------------
    // Creamos y posicionamos los libros en la segunda balda de la estantería.

    var cantidadLibros = 27; // Número de libros.
    var espacioEntreLibros = (largo - 0.05) / cantidadLibros; // Espacio entre cada libro.

    var libro = this.createLibroEspecial();
    libro.scale.set(0.35, 1, 0.35);
    libro.rotateY(Math.PI/2);

    for (var i = 0; i < cantidadLibros; i++) {
      var l = libro.clone();
      var alt = Math.random() * (0.35 - 0.25) + 0.25; // Genera un número aleatorio entre 0.25 y 0.35 para que los libros tengan diferentes alturas.
      
      l.scale.y = alt;
      l.position.x = (i - cantidadLibros / 2 + 0.5) * espacioEntreLibros; // Posiciona las pociones en toda la estantería.
      l.position.y = 0.4;

      estanteria_final.add(l); 
    }

    // -------------------------------------------------------------------------
    // Creamos y posicionamos los frascos en la última balda de la estantería.
    var cantidadFrascos = 8; // Número de pociones.
    var espacioEntreFrascos = (largo - 0.05) / cantidadFrascos; // Espacio entre cada poción.

    for (var i = 0; i < cantidadPociones; i++) {
      var colorLiquido = Math.random() * 0xFFFFFF; // Genera un número aleatorio entre 0 y 0xFFFFFF para que las pociones tengan diferentes colores.
      var frasco = this.createFrasco(0xD6DCDE, colorLiquido);

      frasco.scale.set(0.6, 0.6, 0.6);
      frasco.rotateY(Math.PI);
      frasco.position.x = (i - cantidadFrascos / 2 + 0.5) * espacioEntreFrascos; // Posiciona las pociones en toda la estantería.
      frasco.position.y = 0.05;

      estanteria_final.add(frasco);
    }

    // ----------------------------
  
    return estanteria_final;
  }

  // ---------------------------------------------------------------

  createLibroEspecial(){
    var t = this.texturaLoader.load('../imgs/libro/textura_costado_aa.jpg');
    var t2 = t.clone();
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI;

    // -----------------------------
    // Cargamos todos los materiales que vamos a necesitar : las texturas de cada parte del libro
    var materials = [
      new THREE.MeshPhongMaterial({ map: this.texturaLoader.load('../imgs/libro/textura_portada_delantera.jpg') }),   // Cara frontal : portada
      new THREE.MeshLambertMaterial({ map: this.texturaLoader.load('../imgs/libro/textura_portada_trasera.jpg') }),   // Cara trasera : contraportada
      new THREE.MeshLambertMaterial({ map: t }), // Cara superior
      new THREE.MeshLambertMaterial({ map: t2 }), // Cara inferior
      new THREE.MeshPhongMaterial({ map: this.texturaLoader.load('../imgs/libro/textura_portada_canto.jpg') }),       // Cara izquierda : lomo
      new THREE.MeshPhongMaterial({ map: this.texturaLoader.load('../imgs/libro/textura_costado_l.jpg') })            // Cara derecha : páginas
    ];

    // Creamos la geometría del libro, así como su mesh final:
    var geometriaLibro = new THREE.BoxGeometry(0.15, 1, 0.75);
    geometriaLibro.materials = materials;

    var libro = new THREE.Mesh( geometriaLibro, materials);

    // Posicionamos y añadimos al object3D final:
    libro.rotation.y = -Math.PI/2;
    libro.position.y = 0.5;

    libro = new THREE.Object3D().add(libro);

    return libro;
  }

  // ---------------------------------------------------------------
  
  createMesa(ancho, largo, altura){
    // ------------- TEXTURAS -------------
    var textura_madera = this.texturaLoader.load("../imgs/textura_madera1.jpg");
    var material = new THREE.MeshLambertMaterial({color: 0x745E45, map: textura_madera});

    // ------------- TABLA -------------
    var tabla_geom = new THREE.BoxGeometry(ancho, 0.08, largo);
    var tabla = new THREE.Mesh(tabla_geom, material);

    tabla.position.y = 0.04;

    // ------------- PATAS -------------
    var pata_geom = new THREE.BoxGeometry(0.08, altura, 0.08);
    var pata = new THREE.Mesh(pata_geom, material);

    pata.position.y = -altura/2;

    var pata2 = pata.clone();
    var pata3 = pata.clone();
    var pata4 = pata.clone();

    // Posicionamos cada una de las patas:
    pata.position.x = -ancho/2.5;
    pata.position.z = largo/2.5;

    pata2.position.x = ancho/2.5;
    pata2.position.z = largo/2.5;

    pata3.position.x = -ancho/2.5;
    pata3.position.z = -largo/2.5;

    pata4.position.x = ancho/2.5;
    pata4.position.z = -largo/2.5;

    var mesa = new THREE.Object3D().add(tabla, pata, pata2, pata3, pata4);
    mesa.position.y = altura;

    // ----------------- TABURETES -----------------
    // Creamos los taburetes, uno a cada lado de la mesa.
    var taburete = this.createTaburete();
    var taburete2 = this.createTaburete();

    taburete.position.z = largo/2;
    taburete2.position.z = -largo/2;

    var taburetes = new THREE.Object3D().add(taburete, taburete2);

    // ----------------- DECORACION -----------------

    // ----- CALDERO -----
    var caldero = this.createCaldero(false);
    caldero.rotateY(Math.PI/2);
    caldero.position.y = altura + 0.08;

    // ----- POCIONES -----
    var pocion = this.createPocion(0xD6DCDE, 0xCD8125, 0.3);
    pocion.position.x = 0.5;
    pocion.position.y = altura + 0.08;
    pocion.position.z = 0.3;

    // ----- CARTEL -----
    var cartel_geom = new THREE.PlaneGeometry(0.4, 0.5);
    var textura_cartel = this.texturaLoader.load("../imgs/cuadros/textura_papel_1.jpg");
    var material2 = new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: textura_cartel});
    var cartel = new THREE.Mesh(cartel_geom, material2);

    cartel.rotateX(-Math.PI/2);
    cartel.rotateZ((120*Math.PI)/180);

    cartel.position.x = 0.5;
    cartel.position.y = altura + 0.08 + 0.0001;
    cartel.position.z = -0.5;

    // ----- VELAS -----
    var velas = this.createVela();

    velas.position.x = -0.5;
    velas.position.y = altura + 0.08 + 0.0001;
    velas.position.z = -0.6;

    // ----- FIGURA -----
    var figura = this.createFigura();

    figura.position.x = -0.5;
    figura.position.y = altura + 0.08 + 0.23 + 0.0001;
    figura.position.z = 0.8;

    // ----- TAZA -----
    var taza = this.createCalderoMesa();
    taza.rotateY(Math.random() * 2*Math.PI);
    taza.position.y = altura + 0.08 + 0.0001;
    taza.position.z = -0.8;

    // -------------------------------

    var decoracion = new THREE.Object3D().add(caldero, pocion, cartel, velas, figura, taza);

    // ----------------- RESULTADO -----------------

    var mesasysillas = new THREE.Object3D().add(mesa, taburetes, decoracion);

    return mesasysillas;
  }

  // ---------------------------------------------------------------

  createAlfombra(ancho, largo){
    // Vamos a crear una alfombra para situarla debajo de cada mesa:
    var alfombra_geom = new THREE.PlaneGeometry(ancho, largo);
    var textura_alfombra = this.texturaLoader.load("../imgs/textura_alfombra_2.png");

    var material = new THREE.MeshLambertMaterial({color: 0x8290D5, map: textura_alfombra});
    var alfombra = new THREE.Mesh(alfombra_geom, material);

    // Posicionamos correctamente la alfombra:
    alfombra.rotateX(-Math.PI/2);
    alfombra.rotateZ((90*Math.PI)/180);
    alfombra.position.y = 0.001;

    // -----------------------------
    var alfombra_final = new THREE.Object3D().add(alfombra);

    return alfombra_final;
  }

  // ---------------------------------------------------------------

  createTaburete(){
    // Creamos un objeto 3D para el taburete.
    var taburete = new THREE.Object3D();
    var textura_madera = this.texturaLoader.load("../imgs/textura_madera1.jpg");
    var material = new THREE.MeshLambertMaterial({color: 0x745E45, map: textura_madera});

    // Cargamos la figura OBJ:
    new OBJLoader().load('../modelos/taburete/tab.obj',
    (tab) => {
        tab.children.forEach((child) => {
          child.material = material;
        });
        
        taburete.add(tab); // Lo añadimos al taburete.
    }, null, null);

    // Escalamos la figura para que se adecue a lo que queremos:
    taburete.scale.x = 0.0013;
    taburete.scale.y = 0.0013;
    taburete.scale.z = 0.0013;

    // ------------------ RESULTADO ----------------
    var taburete_final = new THREE.Object3D().add(taburete);

    return taburete_final;
  }

  // ---------------------------------------------------------------

  createFigura(){
    // Creamos un object3D para la figura:
    var figura = new THREE.Object3D();
    var textura_figura = this.texturaLoader.load("../imgs/textura_marmol.jpg");
    var material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, map: textura_figura});

    // ------------------ BASE ------------------
    this.objetoLoader.load('../modelos/figura/base.obj',
    (base) => {
      base.children[0].material = material;
      figura.add(base); // Lo añadimos a la figura.
    }, null, null);

    // ------------------ CUERPO ------------------
    this.objetoLoader.load('../modelos/figura/bust_solo.obj',
    (cuerpo) => {
      cuerpo.children[0].material = material;
      cuerpo.position.y = 2;
      figura.add(cuerpo); // Lo añadimos a la figura.
    }, null, null);

    // Escalamos y posicionamos la figura para que se adecue a lo que queremos:
    figura.scale.x = 0.01;
    figura.scale.y = 0.01;
    figura.scale.z = 0.01;

    figura.rotateY(Math.PI/2);

    // ------------------------

    var figura_final = new THREE.Object3D().add(figura);

    return figura_final;
  }

  // ---------------------------------------------------------------

  createAtril(){
    // Creamos un objeto 3D para el atril.
    var atril = new THREE.Object3D();
    var textura_madera = this.texturaLoader.load("../imgs/textura_madera.jpg");
    var material = new THREE.MeshLambertMaterial({color: 0x745E45, map: textura_madera});

    // Cargamos la figura OBJ:
    this.objetoLoader.load('../modelos/atril/Podium.obj',
    (a) => {
        a.children.forEach((child) => {
          child.material = material;
        });
        
        atril.add(a); // Lo añadimos al taburete.
    }, null, null);

    // Escalamos la figura para que se adecue a lo que queremos:
    atril.scale.x = 0.02;
    atril.scale.y = 0.02;
    atril.scale.z = 0.02;

    atril.rotateY(Math.PI/2);

    return atril;
  }

  // ---------------------------------------------------------------

  createVela(){
    // Creamos un objeto 3D para la vela.
    var vela = new THREE.Object3D();
    var textura_madera = this.texturaLoader.load("../imgs/textura_madera.jpg");
    var material = new THREE.MeshLambertMaterial({color: 0x745E45, map: textura_madera});

    // Cargamos la figura OBJ:
    this.materialLoader.load('../modelos/vela/Candles.mtl',
    (materiales) => {
      this.objetoLoader.setMaterials(materiales);
      this.objetoLoader.load('../modelos/vela/Candles.obj',
        (aux) => {
          vela.add(aux); // Añadimos la base del caldero.
        }, null, null);
    });

    // Escalamos la figura para que se adecue a lo que queremos:
    vela.scale.x = 0.09;
    vela.scale.y = 0.09;
    vela.scale.z = 0.09;

    vela.rotateY(Math.PI/2);

    // ------------------------------------

    var vela_final = new THREE.Object3D().add(vela);

    return vela_final;
  }

  // ---------------------------------------------------------------

  createCaldero(booleano = true){
    // --------- TEXTURAS ---------
    var textura_caldero = this.texturaLoader.load ('../imgs/textura_caldero_2.jpg');
    var textura_liquido = this.texturaLoader.load('../imgs/textura_liquido.jpg');
    var textura_metal = this.texturaLoader.load('../imgs/textura_metal.jpg');

    // Primero voy a hacer el cuerpo del caldero:
    var shape = new THREE.Shape();
    var puntos = [];

    // Definimos el cuerpo de la frasco.
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0, 0.2, 0.25, 0.13, 0.25);
    shape.quadraticCurveTo(0.17, 0.30, 0.11, 0.25);
    puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución : geometría y material
    var geometria1 = new THREE.LatheGeometry(puntos, 20, 0, Math.PI*2);
    var material1 = new THREE.MeshPhongMaterial({map: textura_caldero});

    var cuerpo = new THREE.Mesh(geometria1, material1);

    // ------------ CONTENIDO  ------------

      var liquido_geom = new THREE.CircleGeometry(0.12, 20);
      var burbujas_geom = new THREE.SphereGeometry(0.01, 20, 20);
      var material2 = new THREE.MeshPhongMaterial({color: 0x8FC269, map: textura_liquido});

      var liquido = new THREE.Mesh(liquido_geom, material2);
      liquido.rotateX(-Math.PI/2);
      liquido.position.y = 0.25;

    if (booleano) {
      var burbuja = new THREE.Mesh(burbujas_geom, material2);
      burbuja.position.y = 0.25;

      var burbuja2 = burbuja.clone();
      var burbuja3 = burbuja.clone();
      var burbuja4 = burbuja.clone();

      // Posiciones de las burbujas.

      burbuja.position.x = 0.08;
      burbuja.position.z = 0.02;

      burbuja2.scale.set(1.4, 1.4, 1.4);
      burbuja2.position.x = -0.02;
      burbuja2.position.z = -0.05;

      burbuja3.position.x = -0.06;

      burbuja4.scale.set(1.4, 1.4, 1.4);
      burbuja4.position.x = 0.03;
      burbuja4.position.z = 0.05;

      // ------------------------------------
      // Vamos a animar las burbujas para que suban y bajen, para simular que el líquido está hirviendo.
      var splineBurbuja1 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.08, 0.256, 0.02),
        new THREE.Vector3(0.08, 0.22, 0.02),
        new THREE.Vector3(0.08, 0.19, 0.02),
        new THREE.Vector3(0.08, 0.15, 0.02)
      ]);

      var splineBurbuja2 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.02, 0.256, -0.05),
        new THREE.Vector3(-0.02, 0.22, -0.05),
        new THREE.Vector3(-0.02, 0.19, -0.05),
        new THREE.Vector3(-0.02, 0.15, -0.05)
      ]);

      var splineBurbuja3 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.06, 0.256, 0.0),
        new THREE.Vector3(-0.06, 0.22, 0.0),
        new THREE.Vector3(-0.06, 0.19, 0.0),
        new THREE.Vector3(-0.06, 0.15, 0.0)
      ]);

      var splineBurbuja4 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.03, 0.265, 0.05),
        new THREE.Vector3(0.03, 0.22, 0.05),
        new THREE.Vector3(0.03, 0.19, 0.05),
        new THREE.Vector3(0.03, 0.15, 0.05)
      ]);

      // --------------------
      
      var origen = { p : 0 } ; // 0 representa el principio.
      var destino = { p : 1 } ; // representa el final.
      var duracion = 2500;

      var animacion1 = new TWEEN.Tween(origen).to(destino, duracion)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        burbuja.position.copy(splineBurbuja1.getPoint(animacion1._object.p));
      })
      .repeat(Infinity)
      .onComplete(function(){
        origen.p = 0;
      })
      .delay(Math.random() * duracion)
      .start();

      // -----------

      var animacion2 = new TWEEN.Tween(origen).to(destino, duracion)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        burbuja2.position.copy(splineBurbuja2.getPoint(animacion2._object.p));
      })
      .repeat(Infinity)
      .onComplete(function(){
        origen.p = 0; 
      })
      .delay(Math.random() * duracion)
      .start();

      // -----------

      var animacion3 = new TWEEN.Tween(origen).to(destino, duracion)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        burbuja3.position.copy(splineBurbuja3.getPoint(animacion3._object.p));
      })
      .repeat(Infinity)
      .onComplete(function(){
        origen.p = 0; 
      })
      .delay(Math.random() * duracion)
      .start();

      // -----------

      var animacion4 = new TWEEN.Tween(origen).to(destino, duracion)
      .easing(TWEEN.Easing.Sinusoidal.InOut)
      .onUpdate(() => {
        burbuja4.position.copy(splineBurbuja4.getPoint(animacion4._object.p));
      })
      .repeat(Infinity)
      .onComplete(function(){
        origen.p = 0; 
      })
      .delay(Math.random() * duracion)
      .start();

      // Agregamos un retardo aleatorio a cada animación para que las burbujas no suban y bajen al mismo tiempo.
    }

    // ----------------

    var contenido = new THREE.Object3D();
    contenido.add(liquido);
    if (booleano) contenido.add(burbuja, burbuja2, burbuja3, burbuja4);

    // ------------ LAS ASAS ------------
    var asas_geom = new THREE.TorusGeometry(0.025, 0.007, 16, 100);
    var sujeccion_geom = new THREE.SphereGeometry(0.015, 20, 20);
    var material3 = new THREE.MeshLambertMaterial({color: 0xE3E3E3, map: textura_metal});

    var asa = new THREE.Mesh(asas_geom, material1);
    asa.rotateY(Math.PI/2);
    asa.position.y = 0.15;

    var asa2 = asa.clone();
    asa2.position.x = -0.18;
    asa.position.x = 0.18;

    var sujeccion = new THREE.Mesh(sujeccion_geom, material3);
    sujeccion.position.y = 0.175;

    var sujeccion2 = sujeccion.clone();
    sujeccion2.position.x = -0.18;
    sujeccion.position.x = 0.18;

    var asas = new THREE.Object3D();
    asas.add(asa, asa2, sujeccion, sujeccion2);

    // ------------ BASE ------------
    var base = new THREE.Object3D();

    this.materialLoader.load('../modelos/baseCaldero/Blank.mtl',
    (materiales) => {
      this.objetoLoader.setMaterials(materiales);
      this.objetoLoader.load('../modelos/baseCaldero/20841_Copper_Fire_Pit_v1.obj',
        (aux) => {
            base.add(aux); // Añadimos la base del caldero.
        }, null, null);
    });

    // Escalamos la figura para que se adecue a lo que queremos:
    base.scale.x = 0.04;
    base.scale.y = 0.04;
    base.scale.z = 0.04;

    base.rotateX(-Math.PI/2);
    base.position.y = -0.05;

    // ------------ CALDERO FINAL ------------

    var caldero = new THREE.Object3D();
    caldero.add(cuerpo, contenido, asas, base);

    caldero.scale.x = 1.5;
    caldero.scale.z = 1.5;
    caldero.rotateY(Math.PI);
    caldero.position.y = 0.045;

    var caldero_resultado = new THREE.Object3D();
    caldero_resultado.add(caldero);

    return caldero_resultado;
  }

  // ---------------------------------------------------------------

  createFrasco(colorFrasco, colorLiquido){
    // --------- TEXTURAS ---------
    var textura_frasco = this.texturaLoader.load ('../imgs/textura_frasco.jpg');
    var textura_corcho = this.texturaLoader.load ('../imgs/textura_corcho.jpg');

    // ------------ CUERPO ------------
    // Para crear una geometría por revolución tenemos que crear un array de puntos:
    var puntos = [];
    var shape = new THREE.Shape();

    // Definimos el cuerpo de la frasco.
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.2, 0, 0.2, 0.25, 0.065, 0.25);
    shape.quadraticCurveTo(0.01, 0.25, 0.020, 0.34)
    shape.bezierCurveTo(0.04, 0.35, 0.04, 0.37, 0.015, 0.38);
    puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución.
    var geometria = new THREE.LatheGeometry(puntos, 12, 0, Math.PI*2);
    var material = new THREE.MeshLambertMaterial({color: colorFrasco, map: textura_frasco, transparent: true, opacity: 0.8, side: THREE.DoubleSide});
    
    var frasco_base = new THREE.Mesh(geometria, material);

    // ------------ CONTENIDO ------------
    var cubo_CSG = new THREE.Mesh(new THREE.BoxGeometry(0.25,0.25,0.25), material);
    var esfera_CSG = new THREE.Mesh(new THREE.SphereGeometry(0.12), new THREE.MeshLambertMaterial({color: colorLiquido}));
    esfera_CSG.position.y = 0.14;
    cubo_CSG.position.y = 0.29;

    var liquido = new CSG().subtract([esfera_CSG, cubo_CSG]).toMesh();
    liquido.scale.x = 1.1;
    liquido.scale.z = 1.1;

    // ------------ TAPÓN ------------
    var material2 = new THREE.MeshLambertMaterial({color: 0xC2A36D, map: textura_corcho});
    var tapon = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.025), material2);
    tapon.position.y = 0.38;

    // --------------
    this.frasco = new THREE.Object3D;
    this.frasco.add(frasco_base, liquido, tapon);

    return this.frasco;
  }

  // ---------------------------------------------------------------

  createPocion(colorFrasco, colorLiquido, altura){
    // --------- TEXTURAS ---------
    var textura_cristal = this.texturaLoader.load ('../imgs/textura_cristal.jpg');
    var textura_corcho = this.texturaLoader.load ('../imgs/textura_corcho.jpg');

    // ------------ CUERPO ------------
    // Para crear una geometría por revolución tenemos que crear un array de puntos:
    var puntos = [];
    var shape = new THREE.Shape();

    // Definimos el cuerpo de la frasco.
    shape.moveTo(0.1, 0);
    shape.lineTo(0.1, altura);
    puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución.
    var geometria = new THREE.LatheGeometry(puntos, 12, 0, Math.PI*2);
    var material = new THREE.MeshLambertMaterial({color: colorFrasco, map: textura_cristal, transparent: true, opacity: 0.8, side: THREE.DoubleSide});
    
    var pocion_base = new THREE.Mesh(geometria, material);

    // ------------ CONTENIDO ------------
    var liquido_geom = new THREE.CylinderGeometry(0.09, 0.09, altura/2 + 0.1, 20);
    var material2 = new THREE.MeshLambertMaterial({color: colorLiquido});

    var liquido = new THREE.Mesh(liquido_geom, material2);
    liquido.position.y = 0.12;

    // ------------ TAPÓN ------------
    var material3 = new THREE.MeshLambertMaterial({color: 0xC2A36D, map: textura_corcho});
    var tapon = new THREE.Mesh(new THREE.CylinderGeometry(0.096,0.096,0.03, 20), material3);
    tapon.position.y = altura;

    // ----------------------------------------
    var pocion = new THREE.Object3D();
    pocion.add(pocion_base, liquido, tapon);
    pocion.rotateY(Math.PI);

    return pocion;
  }

  // ---------------------------------------------------------------

  createCuadro(imagen, ancho, largo) {
    
    // Dimensiones del marco
    var marco_ancho = ancho + 0.1; // Ancho del marco (mayor que la imagen)
    var marcho_alto = largo + 0.1; // Alto del marco (mayor que la imagen)
    var profundidad = 0.05; // Profundidad del marco

    // --------------------------------------
    // Crear geometría del marco
    var marcoGeom = new THREE.BoxGeometry(marco_ancho, marcho_alto, profundidad);
    var marcoTexture = this.texturaLoader.load('../imgs/cuadros/textura_marco_cuadro.png');
    var marcoMaterial = new THREE.MeshLambertMaterial({ color: 0xD3BC64, map: marcoTexture });
    var marco = new THREE.Mesh(marcoGeom, marcoMaterial);
    
    // --------------------------------------
    // Crear geometría de la imagen
    var imagenGeom = new THREE.PlaneGeometry(ancho, largo);
    var textura_imagen = this.texturaLoader.load(imagen);

    var material_imagen = new THREE.MeshLambertMaterial({ map: textura_imagen });
    var imagen_cuadro = new THREE.Mesh(imagenGeom, material_imagen);
  
    // Asegurarse de que la imagen esté delante del marco
    imagen_cuadro.position.z = profundidad / 2 + 0.001;
    
    // --------------------------------------
    var cuadro_aux = new THREE.Object3D();

    var silueta = marco.clone();
    silueta.material = this.materialSilueta;
    silueta.scale.set(1.025, 1.025, 1.025);
    silueta.name = 'silueta';
    silueta.visible = false;

    cuadro_aux.add(marco, imagen_cuadro, silueta);
    cuadro_aux.position.y = marcho_alto / 2;
    cuadro_aux.position.z = 0.025;

    cuadro_aux.position.x = -ancho/2;

    var cuadro_aux2 = new THREE.Object3D().add(cuadro_aux);
    
    // Esto se hace para poder aplicar la rotación sin que los valores de posición cambien.
    var cuadro_aux3 = new THREE.Object3D().add(cuadro_aux2);
    cuadro_aux3.position.x = ancho/2;

    // ------------------------------------------
    // Creamos la luz que queremos que enfoque al cuadro para ver qué hay detrás:
    var luz = new THREE.SpotLight(0xffffff, 1, 25, Math.PI/12, 0.325, 2);
    luz.position.set(0,largo+largo*0.5,3);
    var target = new THREE.Object3D();
    target.position.set(0,largo*0.625,0);

    luz.target = target;
    luz.visible = false;

    var cuadro = new THREE.Object3D().add(cuadro_aux3,luz,target);

    marco.userData = cuadro;
    imagen_cuadro.userData = cuadro;
    silueta.userData = cuadro;

    // -------------------------------------------
    // Le colocamos una silueta a los cuadros:
    function setSilueta(booleano) {
      silueta.visible = booleano;
    }

    cuadro.setSilueta = setSilueta;
    cuadro.name = 'cuadro';
  
    // -----------------------

    return cuadro;
  }

  // ---------------------------------------------------------------

  createPensadero(){
    // --------- TEXTURAS ---------
    var textura_piedra = this.texturaLoader.load ('../imgs/textura_caliza.jpg');
    var textura_liquido = this.texturaLoader.load('../imgs/textura_liquido.jpg')

    // ---------- CUERPO ----------
    var cuerpo_geom = new THREE.CapsuleGeometry(0.5, 0.6, 9, 7);
    var cubo_geom = new THREE.BoxGeometry(1.1,1.1,1.1);
    var cilindro_geom = new THREE.CylinderGeometry(0.43, 0.3, 0.6, 20);
    var circulo_geom = new THREE.CircleGeometry(0.43, 20);
    var torus_geom = new THREE.TorusGeometry(0.49, 0.036, 20, 20);

    var piedra = new THREE.MeshLambertMaterial({color: 0xF1ECDA, map: textura_piedra});
    var agua = new THREE.MeshPhongMaterial({color: 0x6CC5DE, map: textura_liquido});
    
    var cilindro_CSG = new THREE.Mesh(cilindro_geom, piedra);
    var cubo_CSG = new THREE.Mesh(cubo_geom, piedra);
    var anillo_CSG = new THREE.Mesh(torus_geom, piedra);

    cubo_CSG.position.y = 0.55;
    cilindro_CSG.position.y = 0.5;

    anillo_CSG.rotateX(Math.PI/2);
    anillo_CSG.position.y = 0.4;

    var liquido = new THREE.Mesh(circulo_geom, agua);
    liquido.rotateX(-Math.PI/2);
    liquido.position.y = 0.6;
    liquido.name = "liquido_pensadero";

    liquido.receiveShadow = true;

    // ---------------------------------------------
    // Creamos el objeto CSG y operamos con él:
    var cuerpo_base = new THREE.Mesh(cuerpo_geom, piedra);
    cuerpo_base = new CSG().subtract([cuerpo_base, cubo_CSG]).toMesh();
    cuerpo_base.position.y = 0.7;

    cuerpo_base = new CSG().subtract([cuerpo_base, cilindro_CSG]).toMesh();
    cuerpo_base = new CSG().union([cuerpo_base, anillo_CSG]).toMesh();

    cuerpo_base.castShadow = true;

    // Creamos la silueta del cuerpo del pensadero:
    var silueta_cuerpo = cuerpo_base.clone();
    silueta_cuerpo.material = this.materialSilueta;
    silueta_cuerpo.scale.set(1.025, 1.025, 1.025);
    silueta_cuerpo.visible = false;

    var cuerpo = new THREE.Object3D();
    cuerpo.add(cuerpo_base, liquido, silueta_cuerpo);

    cuerpo.position.y = 0.6;
    cuerpo.name = "cuerpo_pensadero";

    // ---------- BASE ----------
    var shape = new THREE.Shape();
    var puntos = [];

    shape.moveTo(0.5, 0);
    shape.lineTo(0.5, 0.1);
    shape.quadraticCurveTo(0.1, 0.2, 0.16, 0.6);
    puntos = shape.extractPoints(10).shape;

    // Para crear la figura por revolución.
    var base_geom = new THREE.LatheGeometry(puntos, 7, 0, Math.PI*2);
    var base = new THREE.Mesh(base_geom, piedra);

    base.castShadow = true;

    // Creamos la silueta de la base del pensadero:
    var silueta_base = base.clone();
    silueta_base.material = this.materialSilueta;
    silueta_base.scale.set(1.025, 1.025, 1.025);
    silueta_base.visible = false;

    // ------------------
    this.pensadero = new THREE.Object3D();
    this.pensadero.add(cuerpo, base, silueta_base);
    this.pensadero.name = "pensadero";

    // Añadimos sonido al pensadero:
    var listener = new THREE.AudioListener();
    this.pensadero.add(listener);

    var sound = new THREE.Audio(listener);

    new THREE.AudioLoader().load('../sonidos/HP_movida_comedor.mp3', function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(0.5);
    });

    sound.name = "sonido";
    this.pensadero.add(sound);

    // ---------------------------------------
    function setSilueta(booleano) {
      silueta_base.visible = booleano;
      silueta_cuerpo.visible = booleano;
    }

    this.pensadero.setSilueta = setSilueta;
    liquido.userData = this.pensadero;

    // ---------------------------------
    return this.pensadero;
  }

  // ---------------------------------------------------------------

  createAntorcha(especial,color_llama,color_luz,intensity,distance,decay){
    // Creamos un object3D para la antorcha:
    var antorcha_OBJ = new THREE.Object3D();

    var T_metal = this.texturaLoader.load('../imgs/textura_pomo.png');
    var T_madera = this.texturaLoader.load('../imgs/textura_madera_vieja.jpg');

    // ----------------------------------------------
    // Creamos el shape que queremos que tenga nuestra antorcha:
    var antorcha = new THREE.Shape();
    antorcha.moveTo(0, 0);
    antorcha.quadraticCurveTo( 0.025, 0, 0.025, 0.05 );
    antorcha.lineTo(0.04, 0.6);
    antorcha.lineTo(0, 0.6);

    var points = antorcha.extractPoints(5).shape;
    antorcha = new THREE.Mesh( new THREE.LatheGeometry(points, 6), new THREE.MeshLambertMaterial({color: '#B5B5B5', map: T_madera}) );

    // ----------------------------------------------
    // Creamos el metal que sujeta la antorcha:
    var metal = new THREE.Mesh( new THREE.CylinderGeometry(0.08,0.08,0.1,8), new THREE.MeshLambertMaterial({color: '#FFFFFF', map: T_metal}) );
    metal.position.y = 0.65;

    var cil_interno = metal.clone();
    cil_interno.scale.y = 1 - 0.005/0.1;
    cil_interno.scale.x = 1 - 0.005/0.08;
    cil_interno.scale.z = 1 - 0.005/0.08;
    cil_interno.position.y += 0.005;

    // Creamos un CSG y operamos con él:
    var csg = new CSG();
    csg.subtract([metal, cil_interno]);

    // ----------------------------------------------
    // Creamos el palo que sujeta la antorcha:
    var cilindro = new THREE.Mesh( new THREE.CylinderGeometry(0.06, 0.05, 0.06, 6), new THREE.MeshLambertMaterial({color: '#FFFFFF', map: T_metal}) );
    var base = cilindro.clone();
    cilindro.position.y = 0.57;

    csg.union([cilindro]);

    var cubo = new THREE.Mesh( new THREE.BoxGeometry(0.5, 0.1, 0.04) );
    cubo.position.y = 0.69;
    cubo.rotation.y = 22.5 * Math.PI/180;

    for (let i=0; i<4; i++) {
      cubo.rotation.y += 45 * Math.PI/180;
      csg.subtract([cubo]);
    }

    metal = csg.toMesh();

    // ----------------------------------------------
    // Creamos la llama de la antorcha:
    var llama = new THREE.Shape();
    llama.moveTo(0.001, 0);
    llama.bezierCurveTo( 0.07, 0, /**/ 0.07, 0.06, /**/ 0.055, 0.08 );
    llama.quadraticCurveTo( 0.02, 0.12, /**/ 0.001, 0.2 );

    points = llama.extractPoints(8).shape;

    var fuego = this.texturaLoader.load('../imgs/textura_fuego_gris.jpg');
    llama = new THREE.Mesh( new THREE.LatheGeometry(points, 16), new THREE.MeshLambertMaterial({emissive: color_llama, emissiveMap: fuego, emissiveIntensity: 2}) );

    // Clonamos la llama grande para crear otras de menos tamaño y simular fuego:
    var llama1 = llama.clone();
    llama1.scale.x = 0.5;
    llama1.scale.z = 0.5;
    llama1.scale.y = 0.7;
    llama1.position.y += 0.05;
    llama1.position.x -= 0.02;

    var llama2 = llama1.clone();
    llama2.position.x += 0.04;
    llama2.position.z += 0.03;
    llama2.position.y -= 0.025;

    var llama3 = llama2.clone();
    llama3.rotation.z = -15 * Math.PI/180;
    llama3.position.z = -0.03;
    llama3.position.y += 0.005;
    llama3.position.x = 0.005;

    // ------------------------

    llama = new CSG().union([llama,llama1,llama2,llama3]).toMesh();

    llama.rotation.y = Math.PI;

    cilindro.position.y = 0.425;
    cilindro.scale.x = 0.75;
    cilindro.scale.z = 0.75;

    llama.rotation.z = -20 * Math.PI/180;
    llama.position.y = 0.6;
    llama.position.x = (20 * 0.025) / 20;


    // ----------------------------------------------
    // Creamos la luz de la antorcha:
    var luzFuego = new THREE.PointLight(color_luz, intensity, distance, decay);
    luzFuego.position.set(0,0.7,0);
    luzFuego.name = "luzFuego";

    antorcha_OBJ.add(antorcha,metal,llama,cilindro,luzFuego);

    antorcha_OBJ.position.y -= 0.425;
    antorcha_OBJ.name = "antorcha_OBJ";

    var obj_aux = new THREE.Object3D();
    obj_aux.add(antorcha_OBJ);
    obj_aux.name = "antorcha";

    obj_aux.rotation.z = -20 * Math.PI/180;
    obj_aux.position.x = 0.02;
    obj_aux.position.x += Math.sin(20*Math.PI/180)*0.425;

    // --------------------------------------

    var cil = new THREE.Mesh( new THREE.CylinderGeometry(0.025, 0.025, Math.sin(20*Math.PI/180)*0.425, 8), new THREE.MeshLambertMaterial({color: '#FFFFFF', map: T_metal}) );
    cil.rotation.z = Math.PI/2;
    cil.position.x = Math.sin(20*Math.PI/180)*0.425/2;

    base.scale.x = 0.7;
    base.scale.z = 0.7;
    base.scale.y = 1.2;
    base.rotation.z = Math.PI/2;

    cil = new CSG().union([cil,base]).toMesh();


    var antorcha_final = new THREE.Object3D();
    antorcha_final.add(obj_aux, cil);

    return antorcha_final;
  }

  // ---------------------------------------------------------------

  // -------------------------- OBJETO MÁGICO --------------------------

  createObjetoRaro1(radio, altura) {
    // ------------------- VIDEO -------------------
    this.videoElement = document.getElementById('video');
    this.videoElement.src = '../videos/video2.mp4';
    this.videoElement.loop = true;

    var videoTexture = new THREE.VideoTexture(this.videoElement);

    videoTexture.wrapS = THREE.MirroredRepeatWrapping;
    videoTexture.wrapT = THREE.MirroredRepeatWrapping;

    videoTexture.repeat.set( 2, 2 );

    // ---------------------------------------------------------------

    var material_alpha = new THREE.MeshPhongMaterial({color: '#D3BF52', shininess: 100});
    material_alpha.alphaMap = this.texturaLoader.load('../imgs/alphas/textura_alpha1.jpg');
    material_alpha.transparent = true;
    material_alpha.side = THREE.DoubleSide;

    var cono = new THREE.Mesh( new THREE.ConeGeometry(1.25*radio, 1.25*altura, 96), material_alpha );
    cono.position.y = altura*1.25/2;

    var material_alpha2 = new THREE.MeshToonMaterial({color: '#D3BF52'/*, shininess: 100*/});
    material_alpha2.alphaMap = this.texturaLoader.load('../imgs/alphas/textura_alpha2.jpg');
    material_alpha2.transparent = true;
    material_alpha2.side = THREE.DoubleSide;

    var toro = new THREE.Mesh( new THREE.TorusGeometry(radio+radio/2, radio*0.05/0.3, 32, 32), material_alpha2 );
    toro.rotation.x = Math.PI/2;

    toro = new THREE.Object3D().add(toro);

    // ----------------------------------------
    // Creamos las diferentes animaciones que tiene el objeto mágico:

    var origen = {a: 0};
    var destino = {a: Math.PI*2};

    new TWEEN.Tween(origen).to(destino,8000)
    .onUpdate(() => {
      toro.rotation.y = origen.a;
    })
    .onComplete(() => {
      origen.a = 0;
    })
    .repeat(Infinity)
    .start();

    // ---------------------------

    var origen2 = {a: -Math.PI/8};
    var destino2 = {a: Math.PI/8};

    new TWEEN.Tween(origen2).to(destino2,2000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
      toro.rotation.z = origen2.a;
    })
    .onComplete(() => {
      origen2.a = -Math.PI/6;
    })
    .yoyo(true)
    .repeat(Infinity)
    .start();

    toro.position.y = 1.25*altura;

    // ---------------------------------------------------------------------
    // Creamos el material para la esfera que va a contener un video:

    var material_reflexion = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: videoTexture
    });

    var esfera = new THREE.Mesh( new THREE.SphereGeometry(2*(radio+radio*0.1), 32, 32), material_reflexion );
    esfera.scale.y = 0.75;
    esfera.position.y = 1.25*altura + (2*(radio+radio*0.1)) * 0.75 + radio;
    esfera.name = 'esfera';

    var objeto_raro = new THREE.Object3D().add(cono, toro, esfera);
    objeto_raro.name = 'objeto_raro';

    // ----------------------------------------------------------
    var objeto_raro_final = new THREE.Object3D();

    this.materialLoader.load('../modelos/pedestal/pedestal.mtl', (materials) => {
      materials.preload();
      
      this.objetoLoader.setMaterials(materials);
      this.objetoLoader.load('../modelos/pedestal/pedestal.obj', (object) => {
        object.scale.set(0.03,0.03,1.124/new THREE.Box3().setFromObject(object.children[0]).getSize(new THREE.Vector3()).z);
        object.rotation.x = -Math.PI/2;
        object.children[0].material = new THREE.MeshPhongMaterial({map: this.texturaLoader.load('../imgs/textura_marmol_negro.jpg'), shininess: 100});
        objeto_raro_final.add(object);
      });
    });

    objeto_raro.position.y = 1.125;

    objeto_raro_final.add(objeto_raro);
    objeto_raro_final.name = "cono_raro";

    // ---------------------------------------

    return objeto_raro_final;
  }

  // ---------------------------------------------------------------

  createLlave(){
    // Creamos un object3D para la llave:
    var llave = new THREE.Object3D();
    var objLoader = this.objetoLoader;

    // -------------------------------
    // Cargamos el OBJ junto con sus texturas MTL
    this.materialLoader.load('../modelos/llave/Key_01.mtl', function(materials) {
      materials.preload();
  
      objLoader.setMaterials(materials);
      objLoader.load('../modelos/llave/Key_01.obj', function(key) {
        llave.add(key);
  
        // Recorremos los materiales y les aplicamos la textura manualmente
        key.traverse(function(child) {
          if (child instanceof THREE.Mesh) {
            child.material.map = materials.materials.Key_Material;
          }
        });
      });
    });
    
    // Rotamos y posicionamos correctamente la llave:
    llave.rotation.x = Math.PI / 2;
    llave.position.y = 0.009;
    llave.name = 'Key_01_polySurface1';
  
    // --------------------------

    return llave;
  }

  // ---------------------------------------------------------------

  createCalderoMesa(){
    // Vamos a crear la taza de la mesa, que va a tener una luz emisiva propia:
    var caldero = new THREE.Object3D();

    // -----------------------------
    var t_color = this.texturaLoader.load('../modelos/caldero/textura/jug_Material_BaseColor.png');
    var t_normal = this.texturaLoader.load('../modelos/caldero/textura/jug_Material_Normal.png');
    var t_emmisive = this.texturaLoader.load('../modelos/caldero/textura/jug_Material_Emissive.png');

    // ----------------------------
    // Cargamos el OBJ con los correspondientes materiales:
    this.objetoLoader.load('../modelos/caldero/caldero.obj',
    (c) => {
        c.children[0].material = new THREE.MeshPhongMaterial({
          map: t_color,
          emissiveMap: t_emmisive,
          emissiveIntensity: 3,
          normalMap: t_normal,
          normalScale: new THREE.Vector2(1.5,1.5)
        });

        c.scale.set(0.1,0.1,0.1);

        caldero.add(c);
    }, null, null);

    // -------------------------------------
    
    return caldero;
  }
}

export { Decoracion };