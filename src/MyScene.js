
// Clases de la biblioteca

import * as THREE from '../libs/three.module.js'
import * as TWEEN from '../libs/tween.esm.js'
import { PointerLockControls } from '../libs/PointerLockControls.js'

import * as KeyCode from '../libs/keycode.esm.js'

import { H_estructura } from './H_estructura.js'
import { Decoracion  } from './decoracion.js'
import { Maniqui } from './maniqui.js'

import { CSG } from '../libs/CSG-v2.js'


const PI = Math.PI;

class MyScene extends THREE.Scene {
  constructor (myCanvas) {
    super();

    // Con esta variable controlamos si están las colisiones activadas o desactivadas.
    this.colisiones = true;
    this.sombras = true;
    
    this.distancia_seleccion = 5;


    // ------------------ BOOLEANOS CONDICIONALES ------------------

    this.hechizo_lanzado = false;
    this.papel_obtenido = false;
    this.llave_obtenida = false;
    this.puerta_abierta = false;
    this.juego_ganado = false;
    this.movimiento_bloqueado = false;

    this.animacionPuerta = new TWEEN.Tween();

    
    // ------------------ SELECCIONES ------------------

    //this.mouse = new THREE.Vector2();
    this.rayo_mouse = new THREE.Raycaster();

    this.objetosSeleccionables = [];

    this.objetoSeleccionado = null;

    this.rayo_siluetas = new THREE.Raycaster();
    this.objetos_apuntados_siluetas = [];
    this.todos_objetos = [];
    this.anterior_apuntado_siluetas = null;


    // ------------------ COLISIONES ------------------

    this.rayo = new THREE.Raycaster();
    this.intersectados = [];

    
    // ------------------ CONTROLES ------------------

    // 0: adelante, 1: atrás, 2: izquierda, 3: derecha
    this.movimiento = [false, false, false, false];

    this.velocidad = 0.075;

    this.altura = 2;
    this.agachado = false;


    // ------------------ LUZ ------------------

    //this.colorFondo = new THREE.Color(0xEEEEEE);
    this.colorFondo = new THREE.Color(0x000000);

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);

    this.renderer.shadowMap.enable = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights ();

    this.h_estructura = new H_estructura( {grosor: 0.1, alto: 3, largo: 20, profundidad: 16, techo_visible: true, radio_mayor: 3, radio_menor: 3.5, porcentaje_pared: 3.5/20});
    this.add(this.h_estructura);

    this.objetosSeleccionables.push(this.h_estructura.getObjectByName('estructura_puerta_OBJ').getObjectByName('puerta').getObjectByName('pomo'));

    this.dim = this.h_estructura.getDimensiones();


    // ------------------ CÁMARA ------------------

    // Tendremos una cámara con un control de movimiento con el ratónVector2( arrayAux[i][0], arrayAux[i][1] );
    this.createCamera ();


    // ------------------ LUZ ------------------

    this.decoracion = new Decoracion();
    this.decoracion.name = 'decoracion';


    // ------------------ EXTERIOR ------------------

    var textura_cielo = new THREE.TextureLoader().load("../imgs/paisaje/textura_paisaje_2.jpg");
    var material_cielo= new THREE.MeshBasicMaterial({map: textura_cielo});

    var cielo_geom = new THREE.PlaneGeometry(25, 20);
    var cielo = new THREE.Mesh(cielo_geom, material_cielo);

    cielo.rotateY(-90*Math.PI / 180);
    cielo.position.x = this.dim.largo + 3;

    this.add(cielo);


    // ------------------- PAPEL DETRÁS DEL CUADRO -------------------
    var material_papel_antiguo = new THREE.MeshLambertMaterial({color: '#FFFFFF', map: new THREE.TextureLoader().load('../imgs/textura_papel_antiguo.jpg')});
    material_papel_antiguo.alphaMap = new THREE.TextureLoader().load('../imgs/alphas/textura_alpha_papel.jpg');
    material_papel_antiguo.transparent = true;
    var papel = new THREE.Mesh( new THREE.PlaneGeometry(0.75,0.5), material_papel_antiguo );

    var silueta_papel = papel.clone();
    silueta_papel.material = new THREE.MeshBasicMaterial({color: '#505050'});
    silueta_papel.material.alphaMap = new THREE.TextureLoader().load('../imgs/alphas/textura_alpha_papel.jpg');
    silueta_papel.material.transparent = true;
    silueta_papel.scale.set(1.1,1.1);
    silueta_papel.visible = false;

    papel.position.y = 0.25 + 3.5;

    var num_cuadro = Math.floor(Math.random() * 6);
    papel.position.x = this.dim.posX_centroArcos_array[num_cuadro%3];
    if (num_cuadro > 2) {
      papel.position.z = this.dim.profundidad/2 - this.dim.rad_base_pilarPrisma - 0.01;
      papel.rotation.y = PI;
    }
    else papel.position.z = -this.dim.profundidad/2 + this.dim.rad_base_pilarPrisma + 0.01;

    silueta_papel.position.copy(papel.position);
    if (num_cuadro > 2) silueta_papel.position.z += 0.001;
    else silueta_papel.position.z -= 0.001;
    silueta_papel.rotation.copy(papel.rotation);
    silueta_papel.name = 'silueta_papel';

    this.add(silueta_papel);

    function setSilueta(booleano) {
      silueta_papel.visible = booleano;
    }

    papel.setSilueta = setSilueta;
    papel.name = 'papel';

    this.objetosSeleccionables.push(papel);

    this.posicion_original_papel = new THREE.Vector3().copy(papel.position);

    this.add(papel);


    // ------------------- PAPEL CARTEL -------------------
    var material_papel_antiguo2 = new THREE.MeshLambertMaterial({color: '#FFFFFF', map: new THREE.TextureLoader().load('../imgs/textura_papel_antiguo2.png'), transparent: true, opacity: 0});
    material_papel_antiguo2.alphaMap = new THREE.TextureLoader().load('../imgs/alphas/textura_alpha_papel.jpg');
    
    this.papel2 = new THREE.Mesh( new THREE.PlaneGeometry(0.75,0.5), material_papel_antiguo2 );
    this.papel2.name = 'papel2';

    this.papel2.position.x = -this.dim.largo/2 + this.dim.radio_lateral + 0.7;
    this.papel2.position.y = 1.8;

    // Hacemos esto porque queremos que el papel SÓLO cuando se completa el primer puzzle. 
    this.papel2.visible = false;

    this.add(this.papel2);


    // ------------------- OBJECTO RARO CONO (1) -------------------

    this.cono_raro = this.decoracion.createObjetoRaro1(0.2,0.5);

    this.cono_raro.position.x = -this.dim.largo/2 + this.dim.radio_lateral;

    this.add(this.cono_raro);


    // ------------------- ANTORCHAS -------------------

    // primera varible por ahora nada, 1º color: color llama, 2º color: color de luz proyectada
    var antorcha_roja = this.decoracion.createAntorcha(false,'#9E4F27','#EAC77F', 1.75, 8, 2);

    for (let i in this.dim.posV2xz_columnas_array) {
      let t = antorcha_roja.clone();
      t.position.x = this.dim.posV2xz_columnas_array[i].x + this.dim.rad_pilar;
      t.position.z = this.dim.posV2xz_columnas_array[i].y;
      t.position.y = 2*this.dim.alto/3;

      this.add(t);
    }


    var antorcha_azul = this.decoracion.createAntorcha(false,'#3360B4','#AED6F1', 1, 6, 2);
    antorcha_azul.getObjectByName('antorcha').getObjectByName('antorcha_OBJ').getObjectByName('luzFuego').castShadow = true;
    antorcha_azul.getObjectByName('antorcha').getObjectByName('antorcha_OBJ').getObjectByName('luzFuego').shadow.mapSize.width = 512;
    antorcha_azul.getObjectByName('antorcha').getObjectByName('antorcha_OBJ').getObjectByName('luzFuego').shadow.mapSize.height = 512;
    antorcha_azul.getObjectByName('antorcha').getObjectByName('antorcha_OBJ').getObjectByName('luzFuego').shadow.camera.near = 0.5;
    antorcha_azul.getObjectByName('antorcha').getObjectByName('antorcha_OBJ').getObjectByName('luzFuego').shadow.camera.far = 500;

    var t = antorcha_azul.clone();
    t.rotation.y = PI/2;
    t.position.x = -this.dim.largo/2;
    t.position.z = this.dim.radio_central - this.dim.rad_pilar;
    t.position.y = 2*this.dim.alto/3;
    this.add(t);

    t = t.clone();
    t.rotation.y += PI;
    t.position.z -= 2*this.dim.radio_central - 2*this.dim.rad_pilar;
    this.add(t);


    var antorcha_verde = this.decoracion.createAntorcha(false,'#127817','#AED581', 2, 7.5, 2);
    var t = antorcha_verde.clone();
    t.position.x = -this.dim.largo/2 + this.dim.rad_pilar;
    t.position.z = -this.dim.profundidad/2;
    t.position.y = 2*this.dim.alto/3;
    this.add(t);

    t = t.clone();
    t.rotation.y += PI;
    t.position.x += 2*this.dim.radio_lateral - 2*this.dim.rad_pilar;
    this.add(t);


    var antorcha_morada = this.decoracion.createAntorcha(false,'#6109CA','#864FDA', 1.25, 7.5, 2);
    var t = antorcha_morada.clone();
    t.position.x = -this.dim.largo/2 + this.dim.rad_pilar;
    t.position.z = this.dim.profundidad/2;
    t.position.y = 2*this.dim.alto/3;
    this.add(t);

    t = t.clone();
    t.rotation.y += PI;
    t.position.x += 2*this.dim.radio_lateral - 2*this.dim.rad_pilar;
    this.add(t);


    // ------------------- ESTANTERÍAS -------------------

    for (let i in this.dim.posX_centroArcos_array) {
      var estanteriaIzq = this.decoracion.createEstanteria(this.dim.dist_anchoArcos_estanteria/2);//estanteria.clone();
      var estanteriaDer = this.decoracion.createEstanteria(this.dim.dist_anchoArcos_estanteria/2);//estanteria.clone();
      estanteriaIzq.position.x = this.dim.posX_centroArcos_array[i] + this.dim.dist_anchoArcos_estanteria/4;
      estanteriaDer.position.x = this.dim.posX_centroArcos_array[i] - this.dim.dist_anchoArcos_estanteria/4;

      estanteriaIzq.position.z = -this.dim.posZ_centroArcos_positiva + 0.3/2;
      estanteriaDer.position.z = -this.dim.posZ_centroArcos_positiva + 0.3/2;
    
      this.add(estanteriaDer, estanteriaIzq);
    }

    for (let i in this.dim.posX_centroArcos_array) {
      var estanteriaIzq = this.decoracion.createEstanteria(this.dim.dist_anchoArcos_estanteria/2);//estanteria.clone();
      var estanteriaDer = this.decoracion.createEstanteria(this.dim.dist_anchoArcos_estanteria/2);//estanteria.clone();

      estanteriaIzq.rotation.y = PI;
      estanteriaDer.rotation.y = PI;

      estanteriaIzq.position.x = this.dim.posX_centroArcos_array[i] + this.dim.dist_anchoArcos_estanteria/4;
      estanteriaDer.position.x = this.dim.posX_centroArcos_array[i] - this.dim.dist_anchoArcos_estanteria/4;

      estanteriaIzq.position.z = this.dim.posZ_centroArcos_positiva - 0.3/2;
      estanteriaDer.position.z = this.dim.posZ_centroArcos_positiva - 0.3/2;

      this.add(estanteriaIzq, estanteriaDer);
    }


    // ------------------- MESAS, TABURETES Y ALFOMRBAS -------------------

    var ancho = 2;
    var largo = 2.5;
    var altura = 1;

    var mesa = this.decoracion.createMesa(ancho, largo, altura);
    var alfombra = this.decoracion.createAlfombra(4, 3);

    mesa.position.x = this.dim.posX_centroArcos_array[0];
    mesa.position.z = this.dim.posV2xz_columnas_array[0].y;
    alfombra.position.x = this.dim.posX_centroArcos_array[0];
    alfombra.position.z = this.dim.posV2xz_columnas_array[0].y;

    // -----------------

    var mesa2 = this.decoracion.createMesa(ancho, largo, altura);
    var alfombra2 = this.decoracion.createAlfombra(4, 3);

    mesa2.position.x = this.dim.posX_centroArcos_array[0];
    mesa2.position.z = -this.dim.posV2xz_columnas_array[0].y;

    alfombra2.position.x = this.dim.posX_centroArcos_array[0];
    alfombra2.position.z = -this.dim.posV2xz_columnas_array[0].y;

    // -----------------

    var mesa3 = this.decoracion.createMesa(ancho, largo, altura);
    var alfombra3 = this.decoracion.createAlfombra(4, 3);

    mesa3.position.x = this.dim.posX_centroArcos_array[1];
    mesa3.position.z = this.dim.posV2xz_columnas_array[1].y;

    alfombra3.position.x = this.dim.posX_centroArcos_array[1];
    alfombra3.position.z = this.dim.posV2xz_columnas_array[1].y;

    // -----------------

    var mesa4 = this.decoracion.createMesa(ancho, largo, altura);
    var alfombra4 = this.decoracion.createAlfombra(4, 3);
    
    mesa4.position.x = this.dim.posX_centroArcos_array[1];
    mesa4.position.z = -this.dim.posV2xz_columnas_array[1].y;

    alfombra4.position.x = this.dim.posX_centroArcos_array[1];
    alfombra4.position.z = -this.dim.posV2xz_columnas_array[1].y;

    // -----------------

    this.add(mesa, mesa2, mesa3, mesa4);
    this.add(alfombra, alfombra2, alfombra3, alfombra4);


    // ------------------- CALDERO -------------------

    var caldero = this.decoracion.createCaldero();
    caldero.position.x = this.dim.posV2xz_centro_HabCircular_Lateral.x;
    caldero.position.z = -this.dim.posV2xz_centro_HabCircular_Lateral.y;
    
    caldero.scale.set(4.5, 4.5, 4.5);
    this.add(caldero);


    // ------------------- ATRILES y LIBROS-------------------

    // Para el atril de la parte izquierda, con el libro mostrando la portada:
    var atril = this.decoracion.createAtril();
    atril.position.x = this.dim.largo/2 - 0.8;
    atril.position.z = -5;
    this.add(atril);

    var libro = this.decoracion.createLibroEspecial();
    libro.rotateY(-Math.PI/2);
    libro.rotateX((-30*Math.PI)/180);

    libro.position.x = this.dim.largo/2 - 0.75;
    libro.position.y = 1.4;
    libro.position.z = -5;


    // ---------------------------------- ANIMACIÓN ----------------------------------

    // Hemos hecho una animación para simular que el libro está flotando mágicamente.
    var inicio = 1.4;
    var alturaMax = inicio + 0.3; // Altura máxima a la que queremos que el libro flote.

    var animacionFlotante = new TWEEN.Tween({ p : inicio }).to({ p : alturaMax }, 3000) 
    .easing(TWEEN.Easing.Sinusoidal.InOut) 
    .onUpdate(() => {
      libro.position.y = animacionFlotante._object.p;
    })
    .repeat(Infinity) // Repetimos la animación infinitamente.
    .yoyo(true) // Invertimos la animación al llegar al final.
    .start();

    // Para el atril de la parte derecha, con el libro mostrando la contraportada:
    var atril2 = this.decoracion.createAtril();
    atril2.position.x = this.dim.largo/2 - 0.8;
    atril2.position.z = 5;
    this.add(atril2);

    var libro2 = this.decoracion.createLibroEspecial();
    libro2.rotateY(Math.PI/2);
    libro2.rotateX((30*Math.PI)/180);

    libro2.position.x = this.dim.largo/2 - 0.75;
    libro2.position.y = 1.4;
    libro2.position.z = 5;


    // ---------------------------------- ANIMACIÓN ----------------------------------

    var animacionFlotante = new TWEEN.Tween({ p : inicio }).to({ p : alturaMax }, 3000) 
    .easing(TWEEN.Easing.Sinusoidal.InOut) 
    .onUpdate(() => {
      libro2.position.y = animacionFlotante._object.p;
    })
    .repeat(Infinity) // Repetimos la animación infinitamente.
    .yoyo(true) // Invertimos la animación al llegar al final.
    .start();

    this.add(libro, libro2);


    // ------------------- MANIQUI -------------------

    this.maniqui = new Maniqui(this.dim.radio_lateral);
    this.maniqui.position.x = this.dim.posV2xz_centro_HabCircular_Lateral.x;
    this.maniqui.position.y = 0.8;
    this.maniqui.position.z = this.dim.posV2xz_centro_HabCircular_Lateral.y;

    this.objetosSeleccionables.push(this.maniqui);

    this.add(this.maniqui);


    // ------------------- PEDESTAL MANIQUÍ -------------------

    var textura_pedestal = new THREE.TextureLoader().load("../imgs/textura_pedestal.jpg")
    var cubo = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshLambertMaterial({color: '#FFFFFF', map: textura_pedestal}));
    var cubo2 = cubo.clone();

    cubo.scale.set(this.dim.radio_lateral*2,0.8,this.dim.radio_lateral);
    cubo.position.z = this.dim.radio_lateral/2;

    cubo2.scale.set(1.5,0.8,this.dim.radio_lateral);
    cubo2.position.z = -this.dim.radio_lateral/2;

    cubo = new CSG().union([cubo,cubo2]).toMesh();

    cubo.position.x = this.dim.posV2xz_centro_HabCircular_Lateral.x;
    cubo.position.z = this.dim.posV2xz_centro_HabCircular_Lateral.y;
    cubo.position.y = 0.4;

    this.add(cubo);


    // ------------------- PENSADERO -------------------

    var pensadero = this.decoracion.createPensadero();
    pensadero.position.x = this.dim.posV2xz_centro_HabCircular_Principal.x - this.dim.rad_HabCircular_Principal/3;
    pensadero.position.z = this.dim.posV2xz_centro_HabCircular_Principal.y;

    this.add(pensadero);
    this.objetosSeleccionables.push(this.getObjectByName('pensadero').getObjectByName('cuerpo_pensadero').getObjectByName('liquido_pensadero'));
    
    var origenAnimacionPensadero = {pos: 0, esc: 0};
    var destinoAnimacionPensadero = {pos: 0.09, esc: 0.02};

    var posicion = this.getObjectByName('pensadero').getObjectByName('cuerpo_pensadero').getObjectByName('liquido_pensadero').position.y;
    var escalado = this.getObjectByName('pensadero').getObjectByName('cuerpo_pensadero').getObjectByName('liquido_pensadero').scale.x;

    this.animacionPensadero = new TWEEN.Tween(origenAnimacionPensadero).to(destinoAnimacionPensadero, 1000)
      .onUpdate(() => {
        this.getObjectByName('pensadero').getObjectByName('cuerpo_pensadero').getObjectByName('liquido_pensadero').position.y = posicion - origenAnimacionPensadero.pos;
        this.getObjectByName('pensadero').getObjectByName('cuerpo_pensadero').getObjectByName('liquido_pensadero').scale.set(escalado-origenAnimacionPensadero.esc, escalado-origenAnimacionPensadero.esc);
      })
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        origenAnimacionPensadero.pos = 0;
        posicion = this.getObjectByName('pensadero').getObjectByName('cuerpo_pensadero').getObjectByName('liquido_pensadero').position.y;
        escalado = this.getObjectByName('pensadero').getObjectByName('cuerpo_pensadero').getObjectByName('liquido_pensadero').scale.x;
      });


    // ------------------- LLAVE -------------------

    var llave = this.decoracion.createLlave();
    llave.position.set(this.getObjectByName('pensadero').position.x,0.8,this.getObjectByName('pensadero').position.z);
    this.objetosSeleccionables.push(llave);

    this.add(llave);


    // ------------------- FRASCOS -------------------

    var colorFrasco1 = 0xD6DCDE;
    var colorFrasco2 = 0xE7EBEC;

    var colorLiquido1 = 0x871B1B;
    var colorLiquido2 = 0x1B8760;
    var colorLiquido3 = 0xCD8125;

    var frasco1 = this.decoracion.createFrasco(colorFrasco1, colorLiquido1);
    var frasco2 = this.decoracion.createFrasco(colorFrasco2, colorLiquido2);
    var frasco3 = this.decoracion.createFrasco(colorFrasco1, colorLiquido3);
    var frasco4 = this.decoracion.createFrasco(colorFrasco2, colorLiquido3);

    for (let i = 0; i < 5; i++) {
      var t = i/4; // Valor normalizado entre 0 y 1
      var angulo = 13/12*PI + t * (23/12*PI - 13/12*PI); // Ángulo para cada objeto
      
      // Cálculo de la posición x/z en función del centro de la habitación, el ángulo y el radio de la misma.
      var x = this.dim.posV2xz_centro_HabCircular_Lateral.x + (this.dim.rad_HabCircular_Laterales-0.35) * Math.cos(angulo);
      var z = -this.dim.posV2xz_centro_HabCircular_Lateral.y + (this.dim.rad_HabCircular_Laterales-0.35) * Math.sin(angulo);
      
      if( i % 2 == 0){
        var frasco = this.decoracion.createFrasco(colorFrasco1, colorLiquido1);
        frasco.scale.set(2.2, 2.2, 2.2);
      }
      else{
        var frasco = this.decoracion.createFrasco(colorFrasco2, colorLiquido3);
        frasco.scale.set(2.6, 2.6, 2.6);
      }
      
      frasco.rotation.y = PI;
      frasco.position.set(x, 0, z);
      this.add(frasco);
    }

    frasco1.scale.set(2.6,2.6,2.6);
    frasco1.position.x = -this.dim.largo/2 - 1;
    frasco1.position.z = 2.5;

    frasco1.scale.set(2,2,2);
    frasco2.position.x = -this.dim.largo/2 - 0.5;
    frasco2.position.z = 2.7;

    this.add(frasco1, frasco2);


    // ------------------- CUADROS -------------------

    var cuadro = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_1.jpg', 1.4, 1);
    var cuadro2 = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_2.jpg', 1.2, 1.3);
    var cuadro3 = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_3.jpg', 1, 1.1);
    var cuadro4 = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_4.jpg', 1.3,1);
    var cuadro5 = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_5.jpg', 1.1,1.3);
    var cuadro6 = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_6.jpg', 1,1);
    
    cuadro.position.x = this.dim.posX_centroArcos_array[0];
    cuadro.position.y = 3.25;
    cuadro.position.z = -this.dim.posZ_centroArcos_positiva + 3*this.dim.grosor;

    cuadro2.position.x = this.dim.posX_centroArcos_array[1];
    cuadro2.position.y = 3.125;
    cuadro2.position.z = -this.dim.posZ_centroArcos_positiva + 3*this.dim.grosor;

    cuadro3.position.x = this.dim.posX_centroArcos_array[2];
    cuadro3.position.y = 3.25;
    cuadro3.position.z = -this.dim.posZ_centroArcos_positiva + 3*this.dim.grosor;

    cuadro4.rotation.y = PI;
    cuadro4.position.x = this.dim.posX_centroArcos_array[0];
    cuadro4.position.y = 3.25;
    cuadro4.position.z = this.dim.posZ_centroArcos_positiva - 3*this.dim.grosor;

    cuadro5.rotation.y = PI;
    cuadro5.position.x = this.dim.posX_centroArcos_array[1];
    cuadro5.position.y = 3.125;
    cuadro5.position.z = this.dim.posZ_centroArcos_positiva - 3*this.dim.grosor;

    cuadro6.rotation.y = PI;
    cuadro6.position.x = this.dim.posX_centroArcos_array[2];
    cuadro6.position.y = 3.25;
    cuadro6.position.z = this.dim.posZ_centroArcos_positiva - 3*this.dim.grosor;

    this.add(cuadro, cuadro2, cuadro3, cuadro4, cuadro5, cuadro6);
    
    this.objetosSeleccionables.push(cuadro, cuadro2, cuadro3, cuadro4, cuadro5, cuadro6);

    // ------------

    var cuadro7 = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_7.jpg', 1.4, 1.4);
    var cuadro8 = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_8.jpg', 1.4, 1.4);
    var cuadro9 = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_9.jpg', 1.4, 1.4);
    var cuadro10 = this.decoracion.createCuadro('../imgs/cuadros/textura_cuadro_10.jpg', 1.4, 1.4);

    cuadro7.rotation.y = (PI/2);
    cuadro7.position.x = -this.dim.largo/2;
    cuadro7.position.y = 0.8;
    cuadro7.position.z = 6.5;

    cuadro8.rotation.y = (PI/2);
    cuadro8.position.x = -this.dim.largo/2;
    cuadro8.position.y = 0.8;
    cuadro8.position.z = 4.5;

    cuadro9.rotation.y = (PI/2);
    cuadro9.position.x = -this.dim.largo/2;
    cuadro9.position.y = 0.8;
    cuadro9.position.z = -6.5;

    cuadro10.rotation.y = (PI/2);
    cuadro10.position.x = -this.dim.largo/2;
    cuadro10.position.y = 0.8;
    cuadro10.position.z = -4.5;

    this.add(cuadro7, cuadro8, cuadro9, cuadro10);


    // ------------------- SOMBRAS -------------------

    this.renderer.shadowMap.enabled = this.sombras;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  
  // ---------------------------------------------------------------------


  createCamera () {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.camera.position.set (/*0,this.altura,0*/ 4,this.altura,0);

    this.camera.lookAt(new THREE.Vector3 (/*10,this.altura,0*/this.dim.largo/2,this.altura,0));

    this.add (this.camera);
    
    
    this.cameraControl = new PointerLockControls(this.camera, this.renderer.domElement);

    var listener = new THREE.AudioListener();
    this.camera.add(listener);

    var sound = new THREE.Audio(listener);

    var audioLoader = new THREE.AudioLoader();
    audioLoader.load('../sonidos/Ambiente.mp3', function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.2);
      sound.play();
    });
  }

  
  createLights () {
    var luzAmbiente = new THREE.AmbientLight(/*'#828282'*/'#646464', 0.4);
    this.add(luzAmbiente);
  }

  
  createRenderer (myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.
    
    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();
    
    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(this.colorFondo, 1.0);
    
    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);
    
    return renderer;  
  }

  
  setCameraAspect (ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }
  

  onWindowResize () {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect (window.innerWidth / window.innerHeight);
    
    // Y también el tamaño del renderizador
    this.renderer.setSize (window.innerWidth, window.innerHeight);
  }


  update () {
    // ------------------------- SILUETAS -------------------------

    this.rayo_siluetas.setFromCamera(new THREE.Vector2(0,0), this.camera);
    this.objetos_apuntados_siluetas = this.rayo_siluetas.intersectObjects(this.objetosSeleccionables, true);

    if (this.objetos_apuntados_siluetas.length > 0) {
      this.todos_objetos = this.rayo_siluetas.intersectObjects(this.children, true);

      if (this.todos_objetos[0].distance >= this.objetos_apuntados_siluetas[0].distance && this.objetos_apuntados_siluetas[0].distance <= this.distancia_seleccion) {
        var seleccionado = null;

        if (this.objetos_apuntados_siluetas[0].object.userData instanceof THREE.Object3D)
          seleccionado = this.objetos_apuntados_siluetas[0].object.userData;

        else if (this.objetos_apuntados_siluetas[0] instanceof THREE.Mesh)
          seleccionado = this.objetos_apuntados_siluetas[0];

        else
          seleccionado = this.objetos_apuntados_siluetas[0].object;

        var continuar = true;
        
        switch (seleccionado.name) {
          case 'cuadro':
            if (!this.hechizo_lanzado) continuar = false;
            break;

          case 'pensadero':
            if (!this.papel_obtenido) continuar = false;
            break;
        }

        if (seleccionado.setSilueta && continuar)
          if (this.anterior_apuntado_siluetas == null) {
            seleccionado.setSilueta(true);
            this.anterior_apuntado_siluetas = seleccionado;
          }
      }
      else if (this.anterior_apuntado_siluetas != null) {
        this.anterior_apuntado_siluetas.setSilueta(false);
        this.anterior_apuntado_siluetas = null;
      }
    }
    else if (this.anterior_apuntado_siluetas != null) {
      this.anterior_apuntado_siluetas.setSilueta(false);
      this.anterior_apuntado_siluetas = null;
    }


    // --------------------------- PUERTA ---------------------------

    if (this.puerta_abierta && !this.juego_ganado && !this.animacionPuerta.isPlaying()) {
      this.juego_ganado = true;
      window.alert('La puerta se ha abierto!\n¡Has escapado!');
    }

    // --------------------------- TWEEN ---------------------------
    
    // Actualizamos cada animación de TWEEN
    TWEEN.update();


    // --------------------------- ALTURA ---------------------------

    if (!this.movimiento_bloqueado) {
      var alto_cam, velocidad_cam;

      if (this.agachado) {
        alto_cam = this.altura * 0.7;
        velocidad_cam = this.velocidad * 0.5;
      }
      else {
        alto_cam = this.altura;
        velocidad_cam = this.velocidad;
      }

      this.camera.position.y = alto_cam;
    }
      
    // --------------------------- RENDERIZADO ---------------------------

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render (this, this.camera);


    // ------------------ MOVIMIENTO ------------------

    // Si no estamos bloqueados, comprobamos si se ha pulsado alguna tecla para movernos
    if (!this.movimiento_bloqueado) {

      if ( this.movimiento.some((valor) => valor === true) ) {

        var donde_estoy = new THREE.Vector3();
        var a_donde_miro = new THREE.Vector3();

        donde_estoy.copy(this.camera.position);
        this.cameraControl.getDirection(a_donde_miro);

        a_donde_miro.y = 0;
        a_donde_miro.normalize();

        if (this.movimiento[0])
          if (!this.testColisiona(donde_estoy,a_donde_miro))
            this.cameraControl.moveForward(velocidad_cam);

        if (this.movimiento[1])
          if (!this.testColisiona(donde_estoy,new THREE.Vector3().copy(a_donde_miro).negate().normalize()))
            this.cameraControl.moveForward(-velocidad_cam);

        if (this.movimiento[2])
          if (!this.testColisiona(donde_estoy, new THREE.Vector3(0,1,0).cross(new THREE.Vector3().copy(a_donde_miro)).normalize()))
            this.cameraControl.moveRight(-velocidad_cam);

        if (this.movimiento[3])
          if (!this.testColisiona(donde_estoy, new THREE.Vector3().copy(a_donde_miro).cross(new THREE.Vector3(0,1,0)).normalize()))
            this.cameraControl.moveRight(velocidad_cam);
      }
    }


    // ----------------------------------- PAPEL -----------------------------------

    // Hacemos esto para que el papel esté continuamente mirando al personaje (nosotros).
    this.papel2.lookAt(this.camera.getWorldPosition(new THREE.Vector3()));


    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.
    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update())
  }


  // ------------------ COLISIONES ------------------

  testColisiona(donde_estoy,a_donde_miro) {
    if (this.colisiones) {
      var porcentaje = 0.3;
      var altura = this.altura;
      if (this.agachado) altura *= 0.7;

      var colision_H = false, colision_V = false;

      this.rayo.set(donde_estoy,a_donde_miro);
      this.intersectados = this.rayo.intersectObjects(this.children, true);
      
      // Tener en cuenta que el vector a_donde_miro es horizontal (y = 0), lo que significa que se usará la altura
      // que da "donde_estoy" para saber desde donde sale el rayo (además de también la x y la z de donde_estoy):

      if (this.intersectados.length > 0 && this.intersectados[0].distance < 0.8)
        colision_H = true;

      // Se crea otro rayo desde las posición de la cámara + "pequeña distancia (decidir) (en la dirección a_donde_miro)",
      // pero este rayo parte desde la altura de la cámara y con posición x y z relacionadas al vector dirección a_donde_miro (decidir cantidad)
      // recordamos que este rayo tiene que estar un poco por delante en la dirección a la que apunta la cámara (a_donde_miro)
      a_donde_miro.multiplyScalar(porcentaje);
      var punto = donde_estoy.add(a_donde_miro);

      this.rayo.set(punto, new THREE.Vector3(0,-1,0));
      this.intersectados = this.rayo.intersectObjects(this.children, true);

      if ((this.intersectados.length > 0 && this.intersectados[0].distance < altura-0.1) || this.intersectados.length == 0)
        colision_V = true;


      // El método devolverá un booleano según:
      // 1 - el la distancia del primer objeto del rayo 1 es menor que la altura (this.altura) de la cámara - 0.1 (para evitar posibles problemas)
      // Ó
      // 2 - el rayo 2 choca con un objeto que está a una distancia menor que la decidida

      // por defecto, devuelve false (no hay colisiones) --> quitar cuando hagas el método
      return colision_H || colision_V;
    }
  }


  // ------------------ EVENTOS ------------------

  abrirCuadro(id) {
    var cuadro_origen = this.getObjectById(id);
    cuadro_origen.children[1].visible = true;

    var apagar = false;

    var cuadro = cuadro_origen.children[0].children[0];

    var origen = {p: 0};
    var destino = {p: Math.PI/2 - Math.PI/8};

    if (cuadro.rotation.y != 0) {
      origen.p = cuadro.rotation.y;
      destino.p = 0;
      apagar = true;
    }

    new TWEEN.Tween(origen).to(destino, 2000)
      .onUpdate(() => {
        cuadro.rotation.y = origen.p;
      })
      .onComplete(() => {
        origen.p = 0;
        if (apagar) cuadro_origen.children[1].visible = false;
      }).start();
  }

  cogerPapel(papel) {
    if (!this.papel_obtenido) this.papel_obtenido = true;
    this.movimiento_bloqueado = true;

    if (this.cameraControl.lock) this.cameraControl.unlock();

    var direccion = new THREE.Vector3();

    this.cameraControl.getDirection(direccion);
    
    var punto = new THREE.Vector3().copy(this.camera.position).add(direccion.normalize().multiplyScalar(0.5));
    papel.position.copy(punto);

    papel.lookAt(this.camera.position);
  }

  soltarPapel(papel) {
    this.movimiento_bloqueado = false;

    this.cameraControl.lock();

    papel.position.set(this.posicion_original_papel.x, this.posicion_original_papel.y, this.posicion_original_papel.z);
    var direccion = new THREE.Vector3().copy(this.posicion_original_papel);
    direccion.z = 0;

    papel.lookAt(direccion);
  }

  beberAgua() {
    if (!this.animacionPensadero.isPlaying() && this.getObjectByName('pensadero').getObjectByName('cuerpo_pensadero').getObjectByName('liquido_pensadero').position.y > 0.2)
      this.animacionPensadero.start();
  }


  // ------------------ TECLAS O BOTONES PULSADOS ------------------

  onMouseDown() {
    this.rayo_mouse.setFromCamera(new THREE.Vector2(0,0), this.camera);

    var pickedObjects = this.rayo_mouse.intersectObjects(this.objetosSeleccionables, true);

    var seleccionado = null;

    if (pickedObjects.length > 0) {

      this.todos_objetos = this.rayo_mouse.intersectObjects(this.children, true);

      if (this.todos_objetos[0].distance >= pickedObjects[0].distance && pickedObjects[0].distance <= this.distancia_seleccion) {
      
        if (pickedObjects[0].object.userData instanceof THREE.Object3D)
          seleccionado = pickedObjects[0].object.userData;
        else if (pickedObjects[0] instanceof THREE.Mesh)
          seleccionado = pickedObjects[0];
        else
          seleccionado = pickedObjects[0].object;


        switch (seleccionado.name) {
          case 'maniqui':
            this.maniqui.lanzarHechizo(this);
            this.hechizo_lanzado = true;
            break;

          case 'pomo':
            if (this.llave_obtenida) {
              this.animacionPuerta = this.h_estructura.updatePuerta();
              this.puerta_abierta = true;
            }
            else window.alert('La puerta está cerrada!\nNecesitas una llave para abrirla.');
            break;
          
          case 'cuadro':
            if (this.hechizo_lanzado) this.abrirCuadro(seleccionado.id);
            break;

          case 'papel':
            if (!this.movimiento_bloqueado) this.cogerPapel(seleccionado);
            else this.soltarPapel(seleccionado);
            break;

          case 'pensadero':
            if (this.papel_obtenido) this.beberAgua();
            break;

          case 'Key_01_polySurface1':
            seleccionado.visible = false;
            this.llave_obtenida = true;
            this.getObjectByName('pensadero').getObjectByName('sonido').play();
            break;
        }
      }
    }

  }

  onKeyDown(event) {

    switch (event.which || event.key) {

      case KeyCode.KEY_CONTROL:
        if (this.cameraControl.isLocked) this.cameraControl.unlock();
        else if (!this.movimiento_bloqueado) this.cameraControl.lock();
        break;

      case KeyCode.KEY_SHIFT:
        if (!this.movimiento_bloqueado) this.agachado = true;
        break;
    }

    switch ( String.fromCharCode (event.which || event.key) ) {
      case 'W':
        this.movimiento[0] = true;
        break;
      case 'S':
        this.movimiento[1] = true;
        break;
      case 'A':
        this.movimiento[2] = true;
        break;
      case 'D':
        this.movimiento[3] = true;
        break;
    }
  }
  
  onKeyUp(event) {

    switch (event.which || event.key) {

      case KeyCode.KEY_SHIFT:
        this.agachado = false;
        break;
    }

    switch ( String.fromCharCode (event.which || event.key) ) {
      case 'W':
        this.movimiento[0] = false;
        break;
      case 'S':
        this.movimiento[1] = false;
        break;
      case 'A':
        this.movimiento[2] = false;
        break;
      case 'D':
        this.movimiento[3] = false;
        break;
    }
  }

}

/// La función   main
$(function () {
  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // --------------------------------------------
  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener ("resize", () => scene.onWindowResize());

  window.addEventListener ("keydown", (event) => scene.onKeyDown(event));
  window.addEventListener ("keyup", (event) => scene.onKeyUp(event));

  window.addEventListener ("mousedown", () => scene.onMouseDown());
  
  // Que no se nos olvide, la primera visualización.
  scene.update();
});
